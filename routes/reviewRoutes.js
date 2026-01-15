import express from 'express';
import { authMiddleware as protect } from '../middleware/authMiddleware.js';
import { adminAuthMiddleware as authorize } from '../middleware/adminAuthMiddleware.js';
import {
  addReview,
  getReviews,
  vote,
  report,
  adminDelete,
  adminEdit,
  adminToggle,
  adminReply,
  adminFilter,
  statsAvg,
  statsDist,
  statsTop,
  statsAct
} from '../controllers/reviewController.js';

const router = express.Router();

router.route('/').post(protect, addReview).get(getReviews);
router.post('/:id/vote', protect, vote);
router.post('/:id/report', protect, report);

router.delete('/:id', protect, authorize, adminDelete);
router.put('/:id', protect, authorize, adminEdit);
router.put('/:id/toggle', protect, authorize, adminToggle);
router.post('/:id/reply', protect, authorize, adminReply);
router.get('/admin', protect, authorize, adminFilter);

router.get('/stats/average', statsAvg);
router.get('/stats/distribution', statsDist);
router.get('/stats/top-products', statsTop);
router.get('/stats/activity', statsAct);

export default router;
