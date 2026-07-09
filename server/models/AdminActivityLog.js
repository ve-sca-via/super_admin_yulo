import mongoose from 'mongoose';

const adminActivityLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    targetType: {
      type: String,
      enum: ['restaurant', 'user', 'delivery_partner', 'ticket'],
      required: true,
    },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

adminActivityLogSchema.index({ targetType: 1, targetId: 1 });

export default mongoose.model('AdminActivityLog', adminActivityLogSchema);
