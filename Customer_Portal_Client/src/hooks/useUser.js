import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "@/api/client";

export function useUser() {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: () => client.get("/users/me"),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => client.patch("/users/me", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function usePreferences() {
  return useQuery({
    queryKey: ["userPreferences"],
    queryFn: () => client.get("/users/me/preferences"),
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => client.patch("/users/me/preferences", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
    },
  });
}

export function useAddAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => client.post("/users/me/addresses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => client.patch(`/users/me/addresses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => client.patch(`/users/me/addresses/${id}/default`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => client.delete(`/users/me/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const response = await client.get("/users/me/favorites/restaurants");
      return response.data?.savedAddresses || response.data || []; // Depending on API shape
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isFavoriting }) => {
      if (isFavoriting) {
        return client.post(`/users/me/favorites/restaurants/${id}`);
      } else {
        return client.delete(`/users/me/favorites/restaurants/${id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      // Invalidate feeds and restaurants so isFavorited updates
      queryClient.invalidateQueries({ queryKey: ["homeFeed"] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["restaurant"] });
    },
  });
}

export function useToggleItemFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isFavoriting }) => {
      if (isFavoriting) {
        return client.post(`/users/me/favorites/items/${id}`);
      } else {
        return client.delete(`/users/me/favorites/items/${id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homeFeed"] });
      queryClient.invalidateQueries({ queryKey: ["restaurant"] });
    },
  });
}
