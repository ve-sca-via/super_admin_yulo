import client from "./client";

// All admin routes are scoped under /admin, role: admin

export const adminApi = {
  // ── Dashboard & Reports ──────────────────────────────────────────────
  getDashboard: () => client.get("/admin/dashboard"),
  getRevenueOverview: (range = "month") =>
    client.get("/admin/dashboard/revenue-overview", { params: { range } }),
  getTopStores: (limit = 10) =>
    client.get("/admin/reports/top-stores", { params: { limit } }),
  getTopDeliveryPartners: (limit = 10) =>
    client.get("/admin/reports/top-delivery-partners", { params: { limit } }),

  // ── Stores ───────────────────────────────────────────────────────────
  listStores: (params = {}) => client.get("/admin/stores", { params }),
  getStore: (id) => client.get(`/admin/stores/${id}`),
  approveStore: (id) => client.patch(`/admin/stores/${id}/approve`),
  rejectStore: (id, reason) =>
    client.patch(`/admin/stores/${id}/reject`, { reason }),
  suspendStore: (id) => client.patch(`/admin/stores/${id}/suspend`),
  reactivateStore: (id) => client.patch(`/admin/stores/${id}/reactivate`),
  updateStore: (id, body) => client.patch(`/admin/stores/${id}`, body),
  addStoreNote: (id, note) =>
    client.post(`/admin/stores/${id}/notes`, { note }),
  verifyDocument: (id, docId, status) =>
    client.patch(`/admin/stores/${id}/documents/${docId}`, { status }),
  removeStore: (id) => client.delete(`/admin/stores/${id}`),

  // ── Customers ────────────────────────────────────────────────────────
  listCustomers: (params = {}) => client.get("/admin/customers", { params }),
  getCustomer: (id) => client.get(`/admin/customers/${id}`),
  setCustomerStatus: (id, isActive) =>
    client.patch(`/admin/customers/${id}/status`, { isActive }),

  // ── Delivery Partners ────────────────────────────────────────────────
  listDeliveryPartners: (params = {}) =>
    client.get("/admin/delivery-partners", { params }),
  getDeliveryPartner: (id) => client.get(`/admin/delivery-partners/${id}`),
  createDeliveryPartner: (formData) =>
    client.post("/admin/delivery-partners", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateDeliveryPartner: (id, body) =>
    client.patch(`/admin/delivery-partners/${id}`, body),
  removeDeliveryPartner: (id) =>
    client.delete(`/admin/delivery-partners/${id}`),

  // ── Support Tickets ──────────────────────────────────────────────────
  listTickets: (params = {}) => client.get("/admin/tickets", { params }),
  getTicket: (id) => client.get(`/admin/tickets/${id}`),
  updateTicket: (id, body) => client.patch(`/admin/tickets/${id}`, body),
  addTicketMessage: (id, text) =>
    client.post(`/admin/tickets/${id}/messages`, { text }),
};
