import express from 'express';
import {
  createCoupon,
  getAllCoupons,
  deleteCoupon,
  applyCoupon,
} from '../controllers/couponController.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

const router = express.Router();

router.use(protect); // Secure all coupon routes

router.route('/')
  .get(adminOnly, getAllCoupons)
  .post(adminOnly, createCoupon);

router.route('/apply')
  .post(applyCoupon);

router.route('/:id')
  .delete(adminOnly, deleteCoupon);

export default router;
