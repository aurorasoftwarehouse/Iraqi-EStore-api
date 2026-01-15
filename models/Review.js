import mongoose from 'mongoose';

const AdminReplySchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, maxlength: 500, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const ReviewSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: (v) => Number.isInteger(v * 2),
        message: 'rating must be in steps of 0.5'
      }
    },
    comment: { type: String, maxlength: 500 },
    status: { type: String, enum: ['enabled', 'disabled'], default: 'enabled', index: true },
    helpfulCount: { type: Number, default: 0 },
    notHelpfulCount: { type: Number, default: 0 },
    purchaseVerified: { type: Boolean, default: false },
    adminReply: { type: AdminReplySchema, required: false }
  },
  { timestamps: true }
);

ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Review', ReviewSchema);
