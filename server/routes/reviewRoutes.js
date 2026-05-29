import express from 'express';
import {
  getProductReviews,
  createProductReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createProductReview);

router.route('/:productId')
  .get(getProductReviews);

export default router;
