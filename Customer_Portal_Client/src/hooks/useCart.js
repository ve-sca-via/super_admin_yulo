import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "@/api/client";

export function useCart() {
  const queryClient = useQueryClient();

  // Fetch Cart
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["cart"],
    queryFn: () => client.get("/cart"),
  });

  // Add Item to Cart
  const addItem = useMutation({
    mutationFn: (payload) => client.post("/cart/items", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // Update Item in Cart
  const updateItem = useMutation({
    mutationFn: ({ lineItemId, qty }) => {
      if (qty === 0) {
        return client.delete(`/cart/items/${lineItemId}`);
      }
      return client.patch(`/cart/items/${lineItemId}`, { qty });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // Clear / Discard Cart
  const discardCart = useMutation({
    mutationFn: () => client.delete("/cart"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // Adapt the shape so components expecting local `cart.itemCount` or `cart.restaurantName` don't break immediately
  const cartState = data?.cart?.items?.length
    ? {
        ...data.cart,
        itemCount: data.cart.items.reduce((acc, item) => acc + item.qty, 0),
        restaurantName: typeof data.cart.restaurantId === 'object' ? data.cart.restaurantId.name : "Restaurant", // Needs populated backend or cached lookup
        restaurantId: typeof data.cart.restaurantId === 'object' ? data.cart.restaurantId._id : data.cart.restaurantId,
        lines: data.cart.items.map(item => ({
            ...item,
            key: item._id, // use backend lineItemId as key
            quantity: item.qty,
            item: {
              id: item.menuItemId,
              name: item.name,
              price: item.unitPrice,
            },
            selectedOptions: item.selectedOptions || [],
        }))
      }
    : null;

  const billState = data?.bill
    ? {
        itemTotal: data.bill.itemTotal,
        discounts: data.bill.discountAmount 
          ? [{ id: "item", label: "Item discount", amount: data.bill.discountAmount }]
          : [],
        delivery: data.bill.deliveryFee,
        platform: data.bill.platformFee,
        taxes: data.bill.tax,
        toPay: data.bill.grandTotal,
      }
    : null;

  return {
    cart: cartState,
    bill: billState,
    isLoading,
    refetch,
    addItem,
    updateItem,
    discardCart,
  };
}
