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
    subject: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['billing', 'technical', 'account', 'delivery', 'other'],
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
