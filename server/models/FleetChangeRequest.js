import mongoose from 'mongoose';

const fleetChangeRequestSchema = new mongoose.Schema(
  {
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner', required: true },
    currentFleetType: { type: String, enum: ['veg', 'standard'], required: true },
    requestedFleetType: { type: String, enum: ['veg', 'standard'], required: true },
    reason: { type: String, required: true },
    notes: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    // Set by the admin resolve action (controllers/admin/deliveryPartner.controller.js),
    // mirroring the verificationNotes/verifiedAt/verifiedBy pattern already used for KYC
    // verification — same need to record who decided, when, and why on rejection.
    resolvedAt: { type: Date },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolutionNotes: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

fleetChangeRequestSchema.index({ partnerId: 1, status: 1 });
fleetChangeRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('FleetChangeRequest', fleetChangeRequestSchema);
