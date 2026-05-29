import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // Secure all cart routes

router.route('/')
  .get(getCart)
  .post(addToCart)
  .put(updateCartItemQuantity);

router.post('/clear', clearCart);
router.route('/:productId')
  .delete(removeFromCart);

export default router;
