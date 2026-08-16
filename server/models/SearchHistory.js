import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    query: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

searchHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('SearchHistory', searchHistorySchema);
