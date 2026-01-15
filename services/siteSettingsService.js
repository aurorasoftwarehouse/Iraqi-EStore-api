import SiteSettings from '../models/SiteSettings.js';

export const getSiteSettings = async () => {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = new SiteSettings({});
    await settings.save();
  }
  return settings;
};

export const updateSiteSettings = async (footerText, contactEmail, phone, facebookLink, instagramLink, whatsappLink, tiktokLink, telegramChatId, requirePurchaseForReview, reviewReportReasons) => {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = new SiteSettings({});
  }
  settings.footerText = footerText || settings.footerText;
  settings.contactEmail = contactEmail || settings.contactEmail;
  settings.phone = phone || settings.phone;
  settings.facebookLink = facebookLink || settings.facebookLink;
  settings.instagramLink = instagramLink || settings.instagramLink;
  settings.whatsappLink = whatsappLink || settings.whatsappLink;
  settings.tiktokLink = tiktokLink || settings.tiktokLink;
  settings.telegramChatId = telegramChatId || settings.telegramChatId;
  if (typeof requirePurchaseForReview === 'boolean') {
    settings.requirePurchaseForReview = requirePurchaseForReview;
  }
  if (Array.isArray(reviewReportReasons) && reviewReportReasons.length > 0) {
    settings.reviewReportReasons = reviewReportReasons;
  }
  await settings.save();
  return settings;
};
