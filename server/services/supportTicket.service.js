// Shared by the admin-facing "reply to ticket" endpoint
// (controllers/admin/ticket.controller.js) and the customer-facing one
// (controllers/support.controller.js) — the same append-a-message,
// reopen-if-currently-open behavior applies regardless of which side is replying, so it
// lives in exactly one place rather than being copied with a different senderType baked
// into each copy.
export const addTicketMessage = async (ticket, { senderType, sender, text }) => {
  ticket.messages.push({ senderType, sender, text, sentAt: new Date() });
  if (ticket.status === 'open') ticket.status = 'in_progress';
  await ticket.save();
  return ticket;
};
