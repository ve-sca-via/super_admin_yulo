import mongoose from 'mongoose';

const supportTicketMessageSchema = new mongoose.Schema(
  {
    senderType: { type: String, enum: ['admin', 'user'] },
    sender: { type: mongoose.Schema.Types.ObjectId },
    text: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const supportTicketSchema = new mongoose.Schema(
  {
    raisedByType: {
      type: String,
      enum: ['owner', 'customer', 'delivery_partner'],
      required: true,
    },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    // Optional context for a customer ticket raised about a specific order (screen 26's
    // categories are largely order-scoped) — not used by the owner/delivery_partner flows.
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      // The original 4 (+'other') were owner/delivery_partner-facing; the last 4 are the
      // customer app's fixed Help & Support rows (screen 26) — a genuinely different set
      // of categories sharing the same field/model rather than a parallel schema, since
      // 'other' already covers what doesn't fit either list.
      enum: [
        'billing', 'technical', 'account', 'delivery', 'other',
        'order_delayed', 'wrong_missing_items', 'veg_fleet_issue', 'payment_refund',
      ],
      default: 'other',
    },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    messages: [supportTicketMessageSchema],
  },
  { timestamps: true }
);

supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ priority: 1 });

export default mongoose.model('SupportTicket', supportTicketSchema);
