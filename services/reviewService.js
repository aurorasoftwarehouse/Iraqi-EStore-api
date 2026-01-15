import Review from '../models/Review.js';
import ReviewVote from '../models/ReviewVote.js';
import ReviewReport from '../models/ReviewReport.js';
import ReviewAudit from '../models/ReviewAudit.js';
import Order from '../models/Order.js';
import SiteSettings from '../models/SiteSettings.js';
import Product from '../models/Product.js';

export const createReview = async (userId, productId, rating, comment) => {
  const settings = await SiteSettings.findOne();
  if (settings?.requirePurchaseForReview) {
    const purchased = await Order.exists({
      userId,
      items: { $elemMatch: { productId } },
      status: { $in: ['confirmed', 'delivered'] }
    });
    if (!purchased) {
      throw new Error('Purchase required');
    }
  }
  const productExists = await Product.exists({ _id: productId });
  if (!productExists) {
    throw new Error('Product not found');
  }
  const review = new Review({
    productId,
    userId,
    rating,
    comment,
    purchaseVerified: Boolean(settings?.requirePurchaseForReview)
  });
  await review.save();
  return review;
};

export const listReviews = async ({ productId, ratingFilter, page = 1, limit = 10, sort = 'date_desc' }) => {
  const query = { status: 'enabled' };
  if (productId) query.productId = productId;
  if (ratingFilter) query.rating = ratingFilter;
  let sortObj = { createdAt: -1 };
  if (sort === 'rating_desc') sortObj = { rating: -1, createdAt: -1 };
  if (sort === 'helpful_desc') sortObj = { helpfulCount: -1, notHelpfulCount: 1, createdAt: -1 };
  const reviews = await Review.find(query)
    .populate('userId', 'username avatar')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort(sortObj)
    .lean();
  const count = await Review.countDocuments(query);
  return { reviews, totalPages: Math.ceil(count / limit), currentPage: page };
};

export const voteReview = async (userId, reviewId, value) => {
  if (!['helpful', 'not_helpful'].includes(value)) throw new Error('Invalid vote');
  const review = await Review.findById(reviewId);
  if (!review || review.status !== 'enabled') throw new Error('Review not available');
  const existing = await ReviewVote.findOne({ reviewId, userId });
  if (!existing) {
    await ReviewVote.create({ reviewId, userId, value });
    if (value === 'helpful') review.helpfulCount += 1;
    else review.notHelpfulCount += 1;
  } else {
    if (existing.value !== value) {
      if (existing.value === 'helpful') review.helpfulCount -= 1;
      else review.notHelpfulCount -= 1;
      existing.value = value;
      await existing.save();
      if (value === 'helpful') review.helpfulCount += 1;
      else review.notHelpfulCount += 1;
    }
  }
  await review.save();
  return review;
};

export const reportReview = async (userId, reviewId, reason, details) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new Error('Review not found');
  const settings = await SiteSettings.findOne();
  const allowed = settings?.reviewReportReasons || ['spam', 'offensive', 'fake', 'privacy', 'other'];
  if (!allowed.includes(reason)) throw new Error('Invalid report reason');
  const report = await ReviewReport.create({ reviewId, userId, reason, details });
  return report;
};

export const adminDeleteReview = async (adminId, reviewId, reason) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new Error('Review not found');
  const previous = review.comment || '';
  await ReviewAudit.create({ reviewId, adminId, action: 'delete', reason, previous, next: '' });
  await review.deleteOne();
  return { status: 'deleted' };
};

export const adminEditReview = async (adminId, reviewId, newComment) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new Error('Review not found');
  const previous = review.comment || '';
  review.comment = newComment;
  await review.save();
  await ReviewAudit.create({ reviewId, adminId, action: 'edit', reason: '', previous, next: newComment });
  return review;
};

export const adminToggleReview = async (adminId, reviewId, enable) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new Error('Review not found');
  const action = enable ? 'enable' : 'disable';
  const previous = review.status;
  review.status = enable ? 'enabled' : 'disabled';
  await review.save();
  await ReviewAudit.create({ reviewId, adminId, action, reason: '', previous, next: review.status });
  return review;
};

export const adminReplyReview = async (adminId, reviewId, content) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new Error('Review not found');
  review.adminReply = { adminId, content, createdAt: new Date() };
  await review.save();
  await ReviewAudit.create({ reviewId, adminId, action: 'reply', reason: '', previous: '', next: content });
  return review;
};

export const statsAverageRating = async (productId) => {
  const pipeline = [
    { $match: { status: 'enabled', ...(productId ? { productId } : {}) } },
    { $group: { _id: '$productId', average: { $avg: '$rating' }, count: { $sum: 1 } } }
  ];
  const result = await Review.aggregate(pipeline);
  return result;
};

export const statsDistribution = async (productId) => {
  const pipeline = [
    { $match: { status: 'enabled', ...(productId ? { productId } : {}) } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ];
  const result = await Review.aggregate(pipeline);
  return result;
};

export const statsTopReviewedProducts = async (limit = 10) => {
  const pipeline = [
    { $match: { status: 'enabled' } },
    { $group: { _id: '$productId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
    { $unwind: '$product' },
    { $project: { productId: '$_id', count: 1, name: '$product.name' } }
  ];
  const result = await Review.aggregate(pipeline);
  return result;
};

export const statsActivity = async (startDate, endDate, granularity = 'day') => {
  const match = { createdAt: {} };
  if (startDate) match.createdAt.$gte = new Date(startDate);
  if (endDate) match.createdAt.$lte = new Date(endDate);
  const pipeline = [{ $match: match }];
  const groupId =
    granularity === 'month'
      ? { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }
      : { y: { $year: '$createdAt' }, m: { $month: '$createdAt' }, d: { $dayOfMonth: '$createdAt' } };
  pipeline.push({ $group: { _id: groupId, count: { $sum: 1 } } });
  pipeline.push({ $sort: { '_id.y': 1, '_id.m': 1, ...(granularity === 'day' ? { '_id.d': 1 } : {}) } });
  const result = await Review.aggregate(pipeline);
  return result;
};
