import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "@/api/client";

export function useCheckoutSummary() {
  return useQuery({
    queryKey: ["checkoutSummary"],
    queryFn: () => client.get("/checkout/summary"),
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => client.post("/orders/checkout", payload),
    onSuccess: () => {
      // Invalidate cart and feed after placing order
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["homeFeed"] });
    },
  });
}
