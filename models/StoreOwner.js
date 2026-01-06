import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const StoreOwnerSchema = new mongoose.Schema({
  storeId: {
    type: String,
    required: false,
    unique: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  ownerChatId: {
    type: Number,
    required: false,
  }
  ,
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

StoreOwnerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

StoreOwnerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const StoreOwner = mongoose.model('StoreOwner', StoreOwnerSchema);

export default StoreOwner;