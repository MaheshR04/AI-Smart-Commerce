import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail } from '../services/emailService.js';


// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer', // Default role
    });

    if (user) {
      // Dispatch Welcome Email asynchronously to prevent network blocks
      sendWelcomeEmail(user.email, user.name).catch((err) =>
        console.error('Welcome email dispatch failed:', err.message)
      );

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data provided');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/users/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user profile details
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
        },
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile details
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        user.password = req.body.password;
      }
      
      if (req.body.profileImage) {
        user.profileImage = req.body.profileImage;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          profileImage: updatedUser.profileImage,
          token: generateToken(updatedUser._id),
          addresses: updatedUser.addresses, // return updated addresses list
        },
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add shipping address
 * @route   POST /api/users/address
 * @access  Private
 */
export const addAddress = async (req, res, next) => {
  const { street, city, state, postalCode, country, phone, isDefault } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // If setting as default, clear other default addresses
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      street,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault: isDefault || user.addresses.length === 0, // default if first address
    });

    const updatedUser = await user.save();
    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: updatedUser.addresses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete shipping address
 * @route   DELETE /api/users/address/:addressId
 * @access  Private
 */
export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const wasDefault = user.addresses.find((addr) => addr._id.toString() === req.params.addressId)?.isDefault;

    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== req.params.addressId
    );

    // If we deleted the default address, set another as default if list not empty
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    const updatedUser = await user.save();
    res.json({
      success: true,
      message: 'Address removed successfully',
      data: updatedUser.addresses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set shipping address as default
 * @route   PUT /api/users/address/:addressId/default
 * @access  Private
 */
export const setDefaultAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    let addressFound = false;
    user.addresses.forEach((addr) => {
      if (addr._id.toString() === req.params.addressId) {
        addr.isDefault = true;
        addressFound = true;
      } else {
        addr.isDefault = false;
      }
    });

    if (!addressFound) {
      res.status(404);
      throw new Error('Address not found');
    }

    const updatedUser = await user.save();
    res.json({
      success: true,
      message: 'Default address updated successfully',
      data: updatedUser.addresses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role (Admin only)
 * @route   PUT /api/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = async (req, res, next) => {
  const { role } = req.body;

  try {
    if (!['customer', 'admin'].includes(role)) {
      res.status(400);
      throw new Error('Invalid role specified');
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated successfully to ${role}`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user account (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Prevent administrators from self-deletion
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('Self-deletion is forbidden.');
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User account removed successfully' });
  } catch (error) {
    next(error);
  }
};
