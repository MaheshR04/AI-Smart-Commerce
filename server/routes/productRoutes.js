import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, optionalProtect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';
import upload from '../middleware/multer.js';

const router = express.Router();

router.route('/')
  .get(optionalProtect, getProducts)
  .post(protect, adminOnly, upload.array('images', 5), createProduct);

router.route('/:id')
  .get(optionalProtect, getProductById)
  .put(protect, adminOnly, upload.array('images', 5), updateProduct)
  .delete(protect, adminOnly, deleteProduct);

export default router;
