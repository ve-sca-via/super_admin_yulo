import mongoose from 'mongoose';

// Push-token storage only — no FCM/APNs send logic exists anywhere in this codebase yet.
// This is the seam a future push-notification service reads from once one is built.
const userDeviceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deviceToken: { type: String, required: true, unique: true },
    platform: { type: String, enum: ['ios', 'android', 'web'], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

userDeviceSchema.index({ userId: 1 });

export default mongoose.model('UserDevice', userDeviceSchema);
