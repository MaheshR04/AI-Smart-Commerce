import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

/**
 * @desc    Get user wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user._id }).populate({
      path: 'products',
      select: 'name price discountPrice images stock brand category',
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user._id, products: [] });
    }

    res.json({ success: true, data: wishlist });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle product in wishlist (Add if not present, remove if present)
 * @route   POST /api/wishlist/toggle
 * @access  Private
 */
export const toggleWishlistItem = async (req, res, next) => {
  const { productId } = req.body;

  try {
    // Validate product existence
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    let wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user._id, products: [] });
    }

    const itemExistsIndex = wishlist.products.findIndex(
      (item) => item.toString() === productId
    );

    let message = '';
    if (itemExistsIndex > -1) {
      // Remove product
      wishlist.products.splice(itemExistsIndex, 1);
      message = 'Product removed from wishlist';
    } else {
      // Add product
      wishlist.products.push(productId);
      message = 'Product added to wishlist';
    }

    await wishlist.save();

    const populatedWishlist = await Wishlist.findOne({ userId: req.user._id }).populate({
      path: 'products',
      select: 'name price discountPrice images stock brand category',
    });

    res.json({
      success: true,
      message,
      data: populatedWishlist,
    });
  } catch (error) {
    next(error);
  }
};
