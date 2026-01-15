import mongoose from 'mongoose';

const SiteSettingsSchema = new mongoose.Schema({
  footerText: {
    type: String,
    required: false
  },
  contactEmail: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: false
  },
  facebookLink: {
    type: String,
    required: false
  },
  instagramLink: {
    type: String,
    required: false
  },
  whatsappLink: {
    type: String,
    required: false
  },
  tiktokLink: {
    type: String,
    required: false
  },
  telegramChatId: {
    type: String,
    required: false
  },
  requirePurchaseForReview: {
    type: Boolean,
    default: false
  },
  reviewReportReasons: {
    type: [String],
    default: ['spam', 'offensive', 'fake', 'privacy', 'other']
  }
}, {
  timestamps: true
});

export default mongoose.model('SiteSettings', SiteSettingsSchema);
