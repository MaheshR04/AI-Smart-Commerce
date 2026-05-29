import express from 'express';
import {
  getProductReviews,
  createProductReview,
  getMyReviews,
  getAllReviews,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';
import { validateReviewInput } from '../middleware/security.js';

const router = express.Router();

// Secured Routes
router.route('/')
  .get(protect, adminOnly, getAllReviews)
  .post(protect, validateReviewInput, createProductReview);

router.route('/myreviews')
  .get(protect, getMyReviews);

router.route('/:id')
  .delete(protect, deleteReview);

// Public Routes (registered last to avoid routing parameter collisions)
router.route('/:productId')
  .get(getProductReviews);

export default router;
