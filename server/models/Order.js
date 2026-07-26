import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const deliveryAssignmentHistorySchema = new mongoose.Schema(
  {
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner' },
    assignedAt: { type: Date },
    assignedBy: { type: String, enum: ['auto', 'admin'] },
    unassignedAt: { type: Date },
    reason: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    tableSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'TableSession', default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'StaffMember', default: null },
    type: { type: String, enum: ['dine_in', 'delivery', 'takeaway'], required: true },
    tableNumber: { type: String, default: null },
    batchNumber: { type: Number, default: 1 },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    specialInstructions: { type: String, default: '' },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: { type: String, enum: ['cash', 'upi', 'card', 'online'], default: null },
    paymentIntentId: { type: String, default: null },
    deliveryAddress: {
      street: { type: String },
      city: { type: String },
      coordinates: { type: [Number], default: null },
    },
    estimatedDeliveryTime: { type: Date },
    deliveredAt: { type: Date, default: null },
    deliveryAssignment: {
      partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner', default: null },
      // Set only once a partner ACCEPTS an offer — stays 'unassigned' while an offer is
      // outstanding (offerStatus below tracks that in-flight state instead).
      status: {
        type: String,
        enum: ['unassigned', 'assigned', 'picked_up', 'delivered', 'failed'],
        default: 'unassigned',
      },
      assignedAt: { type: Date },
      assignedBy: { type: String, enum: ['auto', 'admin'] },
      // Pending-offer state (see services/deliveryAssignment.service.js) — a candidate is
      // "offered" the order in real time over Socket.IO and has offerExpiresAt to accept/reject
      // before it's treated as missed and re-offered to the next candidate.
      offeredTo: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner', default: null },
      offerExpiresAt: { type: Date, default: null },
      offerStatus: {
        type: String,
        enum: ['none', 'offered', 'accepted', 'rejected', 'expired'],
        default: 'none',
      },
      // Generated on accept (controllers/partner/order.controller.js). No SMS/push channel
      // exists in this codebase (notify.service.js is Socket.IO-only) — the customer's only
      // current way to see it is the customer-facing GET /api/orders/:id response, see the
      // comment on getOrder in controllers/order.controller.js.
      pickupOtp: { type: String, default: null },
      pickupOtpVerifiedAt: { type: Date, default: null },
      // Self-reported at delivery time (CodCollection.jsx has no real payment-gateway/QR
      // verification today) — codDiscrepancy is set instead of hard-failing the delivery when
      // it doesn't match `subtotal`; see the comment on deliverOrder for why.
      codCollected: { type: Number, default: null },
      codDiscrepancy: { type: Number, default: null },
      // Computed and frozen once at delivery time (controllers/partner/order.controller.js's
      // deliverOrder) — never recomputed afterward, so a partner's historical earnings don't
      // shift if rates change later. distanceKm is the actual haversine figure used for
      // distancePay, stored alongside it so the frozen breakdown is self-consistent rather than
      // relying on recomputing the same number again later. surgePay/tip/penalty are always 0
      // today — no surge-pricing engine, tipping mechanism, or penalty-rules engine exists
      // anywhere in this codebase; see services/earnings.service.js for the full picture of
      // which of these components are real (funded, reconciled with admin payouts) vs
      // informational placeholders.
      earningsBreakdown: {
        basePay: { type: Number, default: 0 },
        distanceKm: { type: Number, default: null },
        distancePay: { type: Number, default: 0 },
        surgePay: { type: Number, default: 0 },
        tip: { type: Number, default: 0 },
        penalty: { type: Number, default: 0 },
      },
      history: [deliveryAssignmentHistorySchema],
    },
  },
  { timestamps: true }
);

orderSchema.index({ 'deliveryAssignment.partnerId': 1, 'deliveryAssignment.status': 1 });

orderSchema.index({ restaurantId: 1, createdAt: -1 });
orderSchema.index({ tableSessionId: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, restaurantId: 1 });
orderSchema.index({ paymentIntentId: 1 }, { sparse: true });

export default mongoose.model('Order', orderSchema);
