import crypto from 'crypto';
import mongoose from 'mongoose';

const generateReference = () => `DEP-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

const cashDepositSchema = new mongoose.Schema(
  {
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner', required: true },
    amount: { type: Number, required: true, min: 0 },
    // DepositConfirmed.jsx explicitly labels this "Store deposit" with a restaurant name as the
    // deposit point — not genuinely ambiguous from the frontend, so this isn't a guessed default;
    // it's the only method the mocked screens ever depict. The enum stays open for a future
    // bank/office method if one is ever added — none exists in this app today.
    depositMethod: { type: String, enum: ['store_deposit'], default: 'store_deposit' },
    // Optional: CashDeposit.jsx has no restaurant picker at all — the deposit point isn't
    // client-selected in the current UI, so this is populated only if/when a caller has it.
    depositPointRestaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', default: null },
    // Auto-generated receipt-style code (distinct from `notes`, which is free text the partner
    // enters) — shown on DepositConfirmed.jsx-equivalent screens once wired up.
    reference: { type: String, default: generateReference },
    notes: { type: String },
    status: { type: String, enum: ['submitted', 'confirmed', 'disputed'], default: 'submitted' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

cashDepositSchema.index({ partnerId: 1, createdAt: -1 });
cashDepositSchema.index({ partnerId: 1, status: 1 });

export default mongoose.model('CashDeposit', cashDepositSchema);
