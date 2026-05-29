import express from 'express';
import {
  getWishlist,
  toggleWishlistItem,
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // Secure all wishlist routes

router.route('/')
  .get(getWishlist);

router.post('/toggle', toggleWishlistItem);

export default router;
