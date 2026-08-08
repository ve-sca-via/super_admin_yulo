import { useQuery } from "@tanstack/react-query";
import client from "@/api/client";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useFeed } from "@/context/FeedContext";

// Ensure fallback coordinates are used if the user hasn't set an address
const DEFAULT_LAT = 12.9716;
const DEFAULT_LNG = 77.5946;

export function useHomeFeed() {
  const { deliveryLocation } = useCustomerAuth();
  const { vegOnly, vegScope } = useFeed();

  const lat = deliveryLocation?.location?.coordinates?.[1] ?? DEFAULT_LAT;
  const lng = deliveryLocation?.location?.coordinates?.[0] ?? DEFAULT_LNG;

  return useQuery({
    queryKey: ["homeFeed", lat, lng, vegOnly, vegScope],
    queryFn: async () => {
      // client automatically handles the envelope unwrap (res.data.data)
      return client.get("/home/feed", {
        params: {
          lat,
          lng,
          radius: 10,
          vegMode: vegOnly,
          vegScope,
        },
      });
    },
    // The location is crucial for a geo-feed, but since we fallback to default, 
    // it will always be defined. 
    enabled: true,
  });
}
