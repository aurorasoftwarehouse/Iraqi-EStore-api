import mongoose from 'mongoose';

const ReviewVoteSchema = new mongoose.Schema(
  {
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    value: { type: String, enum: ['helpful', 'not_helpful'], required: true }
  },
  { timestamps: true }
);

ReviewVoteSchema.index({ reviewId: 1, userId: 1 }, { unique: true });

export default mongoose.model('ReviewVote', ReviewVoteSchema);
