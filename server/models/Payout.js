import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema(
  {
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner', required: true },
    periodType: { type: String, enum: ['weekly', 'monthly'], required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    deliveriesCount: { type: Number, default: 0 },
    perDeliveryRate: { type: Number, required: true },
    grossEarnings: { type: Number, default: 0 },
    incentives: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netPayable: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'processing', 'paid'], default: 'pending' },
    paidAt: { type: Date },
    notes: { type: String },
    adjustedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

payoutSchema.index({ partnerId: 1, periodStart: 1 }, { unique: true });
payoutSchema.index({ status: 1 });

export default mongoose.model('Payout', payoutSchema);
