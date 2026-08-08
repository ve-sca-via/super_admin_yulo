import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import client, { getAccessToken } from "@/api/client";
import { API_BASE } from "@/api/config";

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => client.get("/orders"),
  });
}

export function useOrderDetails(orderId) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => client.get(`/orders/${orderId}`),
    enabled: !!orderId,
  });
}

export function useReorder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId) => client.post(`/orders/${orderId}/reorder`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useOrderTracking(orderId) {
  return useQuery({
    queryKey: ["orderTracking", orderId],
    queryFn: () => client.get(`/orders/${orderId}/tracking`),
    enabled: !!orderId,
  });
}

export function useOrderSocket(orderId) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!orderId) return;

    const token = getAccessToken();
    if (!token) return;

    const socket = io(API_BASE, { auth: { token } });

    socket.on("connect", () => {
      socket.emit("join_order", { orderId, token });
    });

    socket.on("order_status_updated", (data) => {
      if (data.orderId === orderId) {
        // Optimistically update tracking status
        queryClient.setQueryData(["orderTracking", orderId], (old) => {
          if (!old) return old;
          const updatedTimeline = old.timeline.map((stage) => {
            if (stage.stage === data.status) return { ...stage, completed: true, timestamp: data.updatedAt };
            return stage;
          });
          return { ...old, status: data.status, timeline: updatedTimeline };
        });
        
        // Invalidate full details just in case
        queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      }
    });

    socket.on("partner_location_updated", (data) => {
      if (data.orderId === orderId) {
        // Update partner location in cache if needed, or trigger re-fetch of eta
        queryClient.setQueryData(["orderTracking", orderId], (old) => {
          if (!old) return old;
          return {
            ...old,
            deliveryPartner: { ...old.deliveryPartner, lat: data.lat, lng: data.lng }
          };
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, queryClient]);
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, rating, comment }) => 
      client.post(`/reviews/${orderId}/review`, { rating, comment }),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    }
  });
}
