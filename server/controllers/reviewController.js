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
