import mongoose from 'mongoose';

const ReviewReportSchema = new mongoose.Schema(
  {
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reason: {
      type: String,
      enum: ['spam', 'offensive', 'fake', 'privacy', 'other'],
      required: true
    },
    details: { type: String, maxlength: 500 },
    status: { type: String, enum: ['open', 'resolved'], default: 'open', index: true }
  },
  { timestamps: true }
);

export default mongoose.model('ReviewReport', ReviewReportSchema);
