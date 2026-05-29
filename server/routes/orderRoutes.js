import express from 'express';
import {
  createOrder,
  verifyRazorpayPayment,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

const router = express.Router();

router.use(protect); // Secure all order routes

router.route('/')
  .get(adminOnly, getAllOrders)
  .post(createOrder);

router.post('/verify', verifyRazorpayPayment);
router.get('/myorders', getMyOrders);
router.put('/:id/status', adminOnly, updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

export default router;
