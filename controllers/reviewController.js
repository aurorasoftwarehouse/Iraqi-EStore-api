import asyncHandler from 'express-async-handler';
import {
  createReview,
  listReviews,
  voteReview,
  reportReview,
  adminDeleteReview,
  adminEditReview,
  adminToggleReview,
  adminReplyReview,
  statsAverageRating,
  statsDistribution,
  statsTopReviewedProducts,
  statsActivity
} from '../services/reviewService.js';
import Product from '../models/Product.js';

export const addReview = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId, rating, comment } = req.body;
  const r = Number(rating);
  if (!productId || !rating) return res.status(422).json({ message: 'productId and rating are required' });
  if (r < 1 || r > 5 || !Number.isInteger(r * 2)) return res.status(422).json({ message: 'Invalid rating' });
  if (comment && comment.length > 500) return res.status(422).json({ message: 'Comment too long' });
  const review = await createReview(userId, productId, r, comment);
  res.status(201).json(review);
});

export const getReviews = asyncHandler(async (req, res) => {
  const { productId, rating, page = 1, limit = 10, sort } = req.query;
  const sortMap = { date: 'date_desc', rating: 'rating_desc', helpful: 'helpful_desc' };
  const result = await listReviews({
    productId,
    ratingFilter: rating ? Number(rating) : undefined,
    page: Number(page),
    limit: Number(limit),
    sort: sortMap[sort] || 'date_desc'
  });
  res.json(result);
});

export const vote = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { value } = req.body;
  const review = await voteReview(userId, id, value);
  res.json(review);
});

export const report = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { reason, details } = req.body;
  const reportObj = await reportReview(userId, id, reason, details);
  res.status(201).json(reportObj);
});

export const adminDelete = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  const { id } = req.params;
  const { reason } = req.body;
  const result = await adminDeleteReview(adminId, id, reason || '');
  res.json(result);
});

export const adminEdit = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  const { id } = req.params;
  const { comment } = req.body;
  if (comment && comment.length > 500) return res.status(422).json({ message: 'Comment too long' });
  const review = await adminEditReview(adminId, id, comment || '');
  res.json(review);
});

export const adminToggle = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  const { id } = req.params;
  const { enable } = req.body;
  const review = await adminToggleReview(adminId, id, Boolean(enable));
  res.json(review);
});

export const adminReply = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  const { id } = req.params;
  const { content } = req.body;
  if (!content || content.length > 500) return res.status(422).json({ message: 'Invalid content' });
  const review = await adminReplyReview(adminId, id, content);
  res.json(review);
});

export const adminFilter = asyncHandler(async (req, res) => {
  const { status, minRating, maxRating, product, page = 1, limit = 10 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (minRating || maxRating) {
    query.rating = {};
    if (minRating) query.rating.$gte = Number(minRating);
    if (maxRating) query.rating.$lte = Number(maxRating);
  }
  if (product) {
    const products = await Product.find({ name: { $regex: product, $options: 'i' } }).select('_id').lean();
    const ids = products.map((p) => p._id);
    query.productId = { $in: ids.length ? ids : [null] };
  }
  const reviews = await (await import('../models/Review.js')).default
    .find(query)
    .populate('userId', 'username')
    .populate('productId', 'name')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .sort({ createdAt: -1 })
    .lean();
  const count = await (await import('../models/Review.js')).default.countDocuments(query);
  res.json({ reviews, totalPages: Math.ceil(count / Number(limit)), currentPage: Number(page) });
});

export const statsAvg = asyncHandler(async (req, res) => {
  const { productId } = req.query;
  const result = await statsAverageRating(productId);
  res.json(result);
});

export const statsDist = asyncHandler(async (req, res) => {
  const { productId } = req.query;
  const result = await statsDistribution(productId);
  res.json(result);
});

export const statsTop = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const result = await statsTopReviewedProducts(Number(limit));
  res.json(result);
});

export const statsAct = asyncHandler(async (req, res) => {
  const { startDate, endDate, granularity } = req.query;
  const result = await statsActivity(startDate, endDate, granularity || 'day');
  res.json(result);
});
