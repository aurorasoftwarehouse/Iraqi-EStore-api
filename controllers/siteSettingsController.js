import asyncHandler from 'express-async-handler';
import { getSiteSettings, updateSiteSettings } from '../services/siteSettingsService.js';

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public
export const getSettings = asyncHandler(async (req, res) => {
  try {
    const settings = await getSiteSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update site settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = asyncHandler(async (req, res) => {
  const { footerText, contactEmail, phone, facebookLink, instagramLink, whatsappLink, tiktokLink, telegramChatId } = req.body;

  try {
    const settings = await updateSiteSettings(footerText, contactEmail, phone, facebookLink, instagramLink, whatsappLink, tiktokLink, telegramChatId);
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});