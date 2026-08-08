import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "@/api/client";

export function useSupportTickets() {
  return useQuery({
    queryKey: ["supportTickets"],
    queryFn: () => client.get("/support/tickets")
  });
}

export function useSupportTicket(ticketId) {
  return useQuery({
    queryKey: ["supportTicket", ticketId],
    queryFn: () => client.get(`/support/tickets/${ticketId}`),
    enabled: !!ticketId
  });
}

export function useCreateSupportTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ category, description, orderId }) => 
      client.post("/support/tickets", { category, description, orderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
    }
  });
}

export function useReplyToTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, text }) => 
      client.post(`/support/tickets/${ticketId}/messages`, { text }),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ["supportTicket", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
    }
  });
}
