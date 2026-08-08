import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "@/api/client";

export function useRecentSearches() {
  return useQuery({
    queryKey: ["recentSearches"],
    queryFn: () => client.get("/search/recent"),
  });
}

export function useAddRecentSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (query) => client.post("/search/recent", { query }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentSearches"] });
    },
  });
}

export function usePopularSearches(vegOnly = false) {
  return useQuery({
    queryKey: ["popularSearches", vegOnly],
    queryFn: () => client.get("/search/popular", { params: { vegOnly } }),
  });
}

export function useTypeahead(query) {
  return useQuery({
    queryKey: ["typeahead", query],
    queryFn: () => client.get("/search/typeahead", { params: { q: query } }),
    enabled: !!query,
  });
}

export function useSearchResults(query, filters = {}, vegOnly = false) {
  // Ideally, lat/lng should be pulled from auth/location context.
  // We'll hardcode fallback coords for now as we did in useHomeFeed.
  const lat = 12.9716;
  const lng = 77.5946;
  
  return useQuery({
    queryKey: ["searchResults", query, filters, vegOnly],
    queryFn: () => {
      const params = { q: query, lat, lng, vegOnly };
      if (filters["pure-veg"]) params.vegOnly = true;
      if (filters["great-offers"]) params.hasOffers = true;
      if (filters["rating-4"]) params.minRating = 4;
      
      return client.get("/restaurants", { params });
    },
    enabled: !!query,
  });
}

export function useMenuSearch(restaurantId, query) {
  return useQuery({
    queryKey: ["menuSearch", restaurantId, query],
    queryFn: () => client.get(`/restaurants/${restaurantId}/menu/search`, { params: { q: query } }),
    enabled: !!query && !!restaurantId,
  });
}
