import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  addAddress,
  deleteAddress,
  setDefaultAddress,
  getAllUsers,
  updateUserRole,
  deleteUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Personal profile routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Saved addresses routes
router.route('/address')
  .post(protect, addAddress);
router.route('/address/:addressId')
  .delete(protect, deleteAddress);
router.route('/address/:addressId/default')
  .put(protect, setDefaultAddress);

// Admin user management routes
router.route('/')
  .get(protect, adminOnly, getAllUsers);
router.route('/:id')
  .delete(protect, adminOnly, deleteUser);
router.route('/:id/role')
  .put(protect, adminOnly, updateUserRole);

export default router;
