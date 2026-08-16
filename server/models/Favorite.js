import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    entityType: { type: String, enum: ['restaurant', 'menu_item'], required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Also the index a favorite/unfavorite toggle relies on for idempotency (upsert on this
// exact triple) — a user can't favorite the same restaurant/item twice.
favoriteSchema.index({ userId: 1, entityType: 1, entityId: 1 }, { unique: true });

export default mongoose.model('Favorite', favoriteSchema);
