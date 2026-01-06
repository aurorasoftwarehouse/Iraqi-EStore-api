import express from 'express';
import { createStoreId, getStoreall, DELETEall, deleteStoreOwner } from '../controllers/storeController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware.js';

const router = express.Router();

router.post('/create-store-id', authMiddleware, adminAuthMiddleware, createStoreId);
router.get('/get-all', authMiddleware, adminAuthMiddleware, getStoreall);
router.delete('/delete-all', authMiddleware, adminAuthMiddleware, DELETEall);
router.delete('/delete-store-owner/:storeOwnerId', authMiddleware, adminAuthMiddleware, deleteStoreOwner);
export default router;