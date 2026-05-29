import Review from '../models/Review.js';
import Product from '../models/Product.js';

/**
 * @desc    Get reviews for a product
 * @route   GET /api/reviews/:productId
 * @access  Public
 */
export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create or update a product review
 * @route   POST /api/reviews
 * @access  Private
 */
export const createProductReview = async (req, res, next) => {
  const { productId, rating, comment } = req.body;

  try {
    const numericRating = Number(rating);

    // Validate product existence
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Check if review already exists
    let review = await Review.findOne({
      userId: req.user._id,
      productId: productId,
    });

    if (review) {
      // Update existing review
      review.rating = numericRating;
      review.comment = comment;
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        userId: req.user._id,
        productId,
        rating: numericRating,
        comment,
      });
    }

    // Recalculate average rating for the product
    const reviewsForProduct = await Review.find({ productId });
    const totalRating = reviewsForProduct.reduce((acc, item) => item.rating + acc, 0);
    const avgRating = reviewsForProduct.length > 0 ? (totalRating / reviewsForProduct.length) : 0;

    // Save updated rating back to product
    product.rating = Math.round(avgRating * 10) / 10; // Round to 1 decimal place
    await product.save();

    // Fetch review populated for immediate UI response
    const populatedReview = await Review.findById(review._id).populate('userId', 'name profileImage');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get reviews written by logged-in user
 * @route   GET /api/reviews/myreviews
 * @access  Private
 */
export const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .populate('productId', 'name brand images category')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews in platform (Admin only)
 * @route   GET /api/reviews
 * @access  Private/Admin
 */
export const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({})
      .populate('userId', 'name email')
      .populate('productId', 'name brand')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete review (Admin moderator or owner)
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    // Authorization check
    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this review');
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate average rating for the product
    const reviewsForProduct = await Review.find({ productId });
    const totalRating = reviewsForProduct.reduce((acc, item) => item.rating + acc, 0);
    const avgRating = reviewsForProduct.length > 0 ? (totalRating / reviewsForProduct.length) : 0;

    const product = await Product.findById(productId);
    if (product) {
      product.rating = Math.round(avgRating * 10) / 10;
      await product.save();
    }

    res.json({ success: true, message: 'Review removed successfully' });
  } catch (error) {
    next(error);
  }
};
