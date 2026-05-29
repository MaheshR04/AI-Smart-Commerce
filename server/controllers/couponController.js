import Coupon from '../models/Coupon.js';

/**
 * @desc    Create a new coupon
 * @route   POST /api/coupons
 * @access  Private/Admin
 */
export const createCoupon = async (req, res, next) => {
  const { code, discountType, discountValue, minPurchase, expiryDate } = req.body;

  try {
    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      res.status(400);
      throw new Error('Coupon code already exists');
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minPurchase: Number(minPurchase || 0),
      expiryDate: new Date(expiryDate),
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all coupons (Admin only)
 * @route   GET /api/coupons
 * @access  Private/Admin
 */
export const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: coupons.length, data: coupons });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a coupon by ID
 * @route   DELETE /api/coupons/:id
 * @access  Private/Admin
 */
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      await Coupon.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Coupon removed successfully' });
    } else {
      res.status(404);
      throw new Error('Coupon not found');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Apply and validate a coupon code
 * @route   POST /api/coupons/apply
 * @access  Private
 */
export const applyCoupon = async (req, res, next) => {
  const { code, orderTotal } = req.body;

  try {
    if (!code) {
      res.status(400);
      throw new Error('Coupon code is required');
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      res.status(404);
      throw new Error('Invalid coupon code. Coupon does not exist.');
    }

    if (!coupon.isActive) {
      res.status(400);
      throw new Error('This coupon is no longer active.');
    }

    // Verify Expiration
    if (new Date(coupon.expiryDate) < new Date()) {
      res.status(400);
      throw new Error('This coupon has expired.');
    }

    // Verify Minimum Purchase Bounds
    if (orderTotal < coupon.minPurchase) {
      res.status(400);
      throw new Error(`Minimum purchase of ₹${coupon.minPurchase} is required to apply this coupon.`);
    }

    // Calculate Discount Value
    let discountAmount = 0;
    if (coupon.discountType === 'Percentage') {
      discountAmount = (orderTotal * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    // Protect against discount exceeding total order value
    if (discountAmount > orderTotal) {
      discountAmount = orderTotal;
    }

    res.json({
      success: true,
      message: `Coupon applied successfully. You saved ₹${discountAmount.toLocaleString('en-IN')}.`,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(discountAmount * 100) / 100,
        payableAmount: Math.round((orderTotal - discountAmount) * 100) / 100,
      },
    });
  } catch (error) {
    next(error);
  }
};
