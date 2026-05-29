import express from 'express';
import {
  getCategories,
  createCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';
import upload from '../middleware/multer.js';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, adminOnly, upload.single('image'), createCategory);

router.route('/:id')
  .delete(protect, adminOnly, deleteCategory);

export default router;
