import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  },
  discountPercent: {
    type: Number,
    min: 0,
    max: 100
  },
  discountActive: {
    type: Boolean,
    default: false,
    index: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  },
  stock: {
    type: Number,
    min: 0
  },
  image: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

ProductSchema.index({ name: 'text' });


export default mongoose.model('Product', ProductSchema);