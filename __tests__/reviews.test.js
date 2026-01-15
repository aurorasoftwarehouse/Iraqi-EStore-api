import { jest, describe, test, expect, beforeAll } from '@jest/globals';

jest.unstable_mockModule('../services/reviewService.js', () => ({
  createReview: jest.fn(async (userId, productId, rating, comment) => ({ _id: 'r1', userId, productId, rating, comment })),
  listReviews: jest.fn(async () => ({ reviews: [{ _id: 'r1', rating: 4.5 }], totalPages: 1, currentPage: 1 })),
  voteReview: jest.fn(async () => ({ _id: 'r1', helpfulCount: 1, notHelpfulCount: 0 })),
  reportReview: jest.fn(async () => ({ _id: 'rep1', status: 'open' })),
  adminDeleteReview: jest.fn(async () => ({ status: 'deleted' })),
  adminEditReview: jest.fn(async () => ({ _id: 'r1', comment: 'edited' })),
  adminToggleReview: jest.fn(async () => ({ _id: 'r1', status: 'disabled' })),
  adminReplyReview: jest.fn(async () => ({ _id: 'r1', adminReply: { content: 'ok' } })),
  statsAverageRating: jest.fn(async () => [{ _id: 'p1', average: 4.5, count: 1 }]),
  statsDistribution: jest.fn(async () => [{ _id: 5, count: 1 }]),
  statsTopReviewedProducts: jest.fn(async () => [{ productId: 'p1', name: 'P1', count: 1 }]),
  statsActivity: jest.fn(async () => [{ _id: { y: 2026, m: 1, d: 1 }, count: 2 }])
}));

const controllerMod = await import('../controllers/reviewController.js');
const {
  addReview,
  getReviews,
  vote,
  report,
  adminDelete,
  adminEdit,
  adminToggle,
  adminReply,
  statsAvg,
  statsDist,
  statsTop,
  statsAct
} = controllerMod;

const makeRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
  return res;
};

describe('Review Controller', () => {
  test('addReview validates and returns created', async () => {
    const req = { user: { id: 'u1' }, body: { productId: 'p1', rating: 4.5, comment: 'good' } };
    const res = makeRes();
    await addReview(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.body.rating).toBe(4.5);
  });

  test('getReviews returns paginated list', async () => {
    const req = { query: { productId: 'p1', page: 1, limit: 10, sort: 'rating' } };
    const res = makeRes();
    await getReviews(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.currentPage).toBe(1);
  });

  test('vote increments helpful', async () => {
    const req = { user: { id: 'u2' }, params: { id: 'r1' }, body: { value: 'helpful' } };
    const res = makeRes();
    await vote(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.helpfulCount).toBe(1);
  });

  test('report creates report', async () => {
    const req = { user: { id: 'u1' }, params: { id: 'r1' }, body: { reason: 'spam', details: 'x' } };
    const res = makeRes();
    await report(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.body._id).toBe('rep1');
  });

  test('admin toggle disables', async () => {
    const req = { user: { id: 'a1' }, params: { id: 'r1' }, body: { enable: false } };
    const res = makeRes();
    await adminToggle(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('disabled');
  });

  test('stats average returns array', async () => {
    const req = { query: { productId: 'p1' } };
    const res = makeRes();
    await statsAvg(req, res);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
