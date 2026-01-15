import mongoose from 'mongoose';

const ReviewAuditSchema = new mongoose.Schema(
  {
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', required: true, index: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, enum: ['delete', 'edit', 'disable', 'enable', 'reply'], required: true },
    reason: { type: String, maxlength: 500 },
    previous: { type: String },
    next: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('ReviewAudit', ReviewAuditSchema);
