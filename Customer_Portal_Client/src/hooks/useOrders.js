import { useEffect, useMemo } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";

import client, { getAccessToken } from "@/api/client";
import { API_BASE } from "@/api/config";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

// `GET /orders` → { orders, total, page }. `select` unwraps it so callers get the
// array they actually render — passing the envelope through was crashing the
// history screen on `orders.map`.
export function useOrders() {
  const { isAuthenticated, sessionReady } = useCustomerAuth();

  return useQuery({
    queryKey: ["orders"],
    queryFn: () => client.get("/orders"),
    select: (data) => data?.orders ?? [],
    enabled: isAuthenticated && sessionReady,
  });
}

export function useOrderDetails(orderId) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => client.get(`/orders/${orderId}`),
    select: (data) => data?.order ?? null,
    enabled: !!orderId,
  });
}

// An Order stores only `restaurantId` — there's no denormalised name on it, and
// the list endpoint doesn't populate one. Every order surface is titled with the
// storefront, so the names are resolved here: one query per *unique* id, sharing
// the ["restaurant", id] cache with the menu screen, so a history of ten orders
// from one place is a single request.
export function useRestaurantNames(restaurantIds = []) {
  const uniqueIds = useMemo(
    () => [...new Set(restaurantIds.map(String).filter(Boolean))],
    [restaurantIds],
  );

  const results = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: ["restaurant", id],
      queryFn: () => client.get(`/restaurants/${id}`),
      staleTime: 10 * 60 * 1000,
    })),
  });

  return useMemo(() => {
    const byId = {};
    uniqueIds.forEach((id, index) => {
      byId[id] = results[index]?.data?.restaurant?.name ?? null;
    });
    return byId;
  }, [uniqueIds, results]);
}

export function useReorder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId) => client.post(`/orders/${orderId}/reorder`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["checkoutSummary"] });
    },
  });
}

// Tracking is returned unwrapped (sendSuccess(res, 200, ..., tracking)).
export function useOrderTracking(orderId) {
  return useQuery({
    queryKey: ["orderTracking", orderId],
    queryFn: () => client.get(`/orders/${orderId}/tracking`),
    enabled: !!orderId,
    // The socket below is the primary update channel; this is the safety net for a
    // dropped connection, and the reason a tracking screen left open still moves.
    refetchInterval: 60 * 1000,
    staleTime: 0,
  });
}

export function useVegFleetStatus(orderId, enabled = true) {
  return useQuery({
    queryKey: ["vegFleetStatus", orderId],
    queryFn: () => client.get(`/orders/${orderId}/veg-fleet/status`),
    enabled: !!orderId && enabled,
  });
}

export function useVegFleetActions(orderId) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["vegFleetStatus", orderId] });
    queryClient.invalidateQueries({ queryKey: ["orderTracking", orderId] });
  };

  const keepWaiting = useMutation({
    mutationFn: () => client.post(`/orders/${orderId}/veg-fleet/keep-waiting`),
    onSuccess: invalidate,
  });

  const fallback = useMutation({
    mutationFn: () => client.post(`/orders/${orderId}/veg-fleet/fallback`),
    onSuccess: invalidate,
  });

  return { keepWaiting, fallback };
}

// Joining the order's room is what makes tracking live. The token is validated at
// join time only, so the socket is rebuilt whenever the access token rotates —
// otherwise room membership ends up checked against a token the app no longer
// considers current (Gotcha #9).
export function useOrderSocket(orderId) {
  const queryClient = useQueryClient();
  const { sessionReady } = useCustomerAuth();

  useEffect(() => {
    if (!orderId || !sessionReady) return;

    const token = getAccessToken();
    if (!token) return;

    const socket = io(API_BASE, {
      auth: { token },
      transports: ["websocket"],
    });

    const join = () => socket.emit("join_order", { orderId, token: getAccessToken() });
    socket.on("connect", join);
    socket.on("reconnect", join);

    socket.on("order_status_updated", (payload) => {
      if (String(payload?.orderId) !== String(orderId)) return;

      queryClient.setQueryData(["orderTracking", orderId], (old) => {
        if (!old) return old;
        return {
          ...old,
          status: payload.status,
          timeline: (old.timeline ?? []).map((stage) =>
            stage.stage === payload.status
              ? { ...stage, completed: true, timestamp: payload.updatedAt ?? stage.timestamp }
              : stage,
          ),
        };
      });

      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    });

    socket.on("partner_location_updated", (payload) => {
      if (String(payload?.orderId) !== String(orderId)) return;

      queryClient.setQueryData(["orderTracking", orderId], (old) =>
        old
          ? {
              ...old,
              deliveryPartner: { ...old.deliveryPartner, lat: payload.lat, lng: payload.lng },
            }
          : old,
      );
    });

    socket.on("veg_fleet_status_updated", (payload) => {
      if (String(payload?.orderId) !== String(orderId)) return;
      queryClient.setQueryData(["vegFleetStatus", orderId], payload);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [orderId, queryClient, sessionReady]);
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, rating, comment }) =>
      client.post(`/reviews/${orderId}/review`, { rating, comment }),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },
  });
}
