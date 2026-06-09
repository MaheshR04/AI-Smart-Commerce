import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import { logPurchase } from '../services/personalizationService.js';
import { getRazorpayInstance } from '../config/razorpay.js';
import crypto from 'crypto';
import {
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendShippingUpdateEmail,
  sendDeliveryUpdateEmail
} from '../services/emailService.js';

/**
 * @desc    Create a new order (COD or initialize Razorpay session)
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
  const { products, shippingAddress, paymentMethod, couponCode } = req.body;

  try {
    if (!products || products.length === 0) {
      res.status(400);
      throw new Error('No items provided for order');
    }

    // Verify stock and calculate total price
    let calculatedTotal = 0;
    const verifiedProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.productId}`);
      }

      if (product.stock < item.quantity) {
        res.status(400);
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
      }

      // Calculate price (using discount price if available)
      const activePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
      calculatedTotal += activePrice * item.quantity;

      verifiedProducts.push({
        productId: product._id,
        name: product.name,
        image: product.images[0] || '',
        quantity: item.quantity,
        price: activePrice,
      });
    }

    // Calculate Coupon Discount
    let discountAmount = 0;
    let finalPayable = calculatedTotal;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        if (new Date(coupon.expiryDate) < new Date()) {
          res.status(400);
          throw new Error('The applied coupon has expired.');
        }

        if (calculatedTotal < coupon.minPurchase) {
          res.status(400);
          throw new Error(`Minimum purchase of ₹${coupon.minPurchase} is required for coupon ${coupon.code}.`);
        }

        if (coupon.discountType === 'Percentage') {
          discountAmount = (calculatedTotal * coupon.discountValue) / 100;
        } else {
          discountAmount = coupon.discountValue;
        }

        if (discountAmount > calculatedTotal) {
          discountAmount = calculatedTotal;
        }

        finalPayable = calculatedTotal - discountAmount;
      }
    }

    // Add Shipping Charges (₹99 for orders below ₹1000)
    const shippingCharges = finalPayable > 0 && finalPayable < 1000 ? 99 : 0;
    finalPayable += shippingCharges;

    // Initialize Order
    const orderData = {
      userId: req.user._id,
      products: verifiedProducts,
      shippingAddress,
      paymentMethod,
      couponCode: couponCode ? couponCode.toUpperCase() : undefined,
      discountAmount: Math.round(discountAmount * 100) / 100,
      totalAmount: Math.round(finalPayable * 100) / 100,
    };

    // Handle payment method specific flows
    if (paymentMethod === 'Razorpay') {
      const razorpay = getRazorpayInstance();

      if (razorpay) {
        // Active key configuration
        const options = {
          amount: Math.round(finalPayable * 100), // Razorpay accepts in paise
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        orderData.paymentDetails = {
          razorpayOrderId: razorpayOrder.id,
          paymentStatus: 'Pending',
        };
      } else {
        // Sandbox mock mode fallback
        console.warn('Razorpay client not active. Creating simulated Razorpay order ID.');
        orderData.paymentDetails = {
          razorpayOrderId: `order_mock_${Date.now()}`,
          paymentStatus: 'Pending',
        };
      }
    } else {
      // COD Flow
      orderData.paymentDetails = {
        paymentStatus: 'Pending',
      };
    }

    // Create the order in the database
    const order = await Order.create(orderData);

    // Log purchased products behavior
    const purchasedIds = order.products.map(p => p.productId);
    logPurchase(req.user._id, purchasedIds).catch(err => console.error('Error logging purchase behavior:', err.message));

    // Decrement stock levels for both COD and Razorpay initially (we'll re-adjust if Razorpay fails or cancels)
    for (const item of products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear user cart upon successful checkout creation
    await Cart.findOneAndUpdate({ userId: req.user._id }, { products: [] });

    // Send order confirmation email asynchronously
    sendOrderConfirmationEmail(req.user.email, req.user.name, order).catch((err) =>
      console.error('Order confirmation email dispatch failed:', err.message)
    );

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Razorpay payment signature
 * @route   POST /api/orders/verify
 * @access  Private
 */
export const verifyRazorpayPayment = async (req, res, next) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Handle verification for mock orders
    if (razorpayOrderId && razorpayOrderId.startsWith('order_mock_')) {
      order.paymentDetails.razorpayPaymentId = razorpayPaymentId || `pay_mock_${Date.now()}`;
      order.paymentDetails.razorpaySignature = razorpaySignature || 'mock_signature_verified';
      order.paymentDetails.paymentStatus = 'Completed';
      order.orderStatus = 'Processing';

      await order.save();

      // Dispatch Payment Confirmation email asynchronously
      sendPaymentConfirmationEmail(req.user.email, req.user.name, order).catch((err) =>
        console.error('Payment confirmation email dispatch failed:', err.message)
      );

      return res.json({
        success: true,
        message: 'Mock payment verified successfully (Sandbox Mode)',
        data: order,
      });
    }

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      res.status(400);
      throw new Error('Razorpay is not configured on this server');
    }

    // Perform signature check
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpaySignature) {
      // Signature matches, update payment state
      order.paymentDetails.razorpayPaymentId = razorpayPaymentId;
      order.paymentDetails.razorpaySignature = razorpaySignature;
      order.paymentDetails.paymentStatus = 'Completed';
      order.orderStatus = 'Processing';

      await order.save();

      // Dispatch Payment Confirmation email asynchronously
      sendPaymentConfirmationEmail(req.user.email, req.user.name, order).catch((err) =>
        console.error('Payment confirmation email dispatch failed:', err.message)
      );

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: order,
      });
    } else {
      // Verification failed
      order.paymentDetails.paymentStatus = 'Failed';
      await order.save();

      res.status(400);
      throw new Error('Invalid signature. Payment verification failed.');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/myorders
 * @access  Private
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status (Admin only)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = async (req, res, next) => {
  const { orderStatus } = req.body;

  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email');

    if (order) {
      order.orderStatus = orderStatus;
      
      // If status is updated to Delivered, check if COD payment was completed
      if (orderStatus === 'Delivered' && order.paymentMethod === 'COD') {
        order.paymentDetails.paymentStatus = 'Completed';
      }

      // If status is Cancelled, restock the product items
      if (orderStatus === 'Cancelled') {
        for (const item of order.products) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity },
          });
        }
      }

      const updatedOrder = await order.save();

      // Trigger shipping or delivery emails asynchronously if user exists
      if (order.userId) {
        if (orderStatus === 'Shipped') {
          sendShippingUpdateEmail(order.userId.email, order.userId.name, updatedOrder).catch((err) =>
            console.error('Shipping email dispatch failed:', err.message)
          );
        } else if (orderStatus === 'Delivered') {
          sendDeliveryUpdateEmail(order.userId.email, order.userId.name, updatedOrder).catch((err) =>
            console.error('Delivery email dispatch failed:', err.message)
          );
        }
      }

      res.json({
        success: true,
        message: `Order status updated to ${orderStatus}`,
        data: updatedOrder,
      });
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel order (Customer self-service cancellation)
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Ensure the order belongs to the logged-in user
    if (order.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to cancel this order');
    }

    // Only allow cancellation if order is not Shipped or Delivered
    if (['Shipped', 'Delivered', 'Cancelled'].includes(order.orderStatus)) {
      res.status(400);
      throw new Error(`Cannot cancel order once it is ${order.orderStatus}`);
    }

    order.orderStatus = 'Cancelled';
    
    // Set paymentDetails status failed or refunded if it was paid
    if (order.paymentMethod === 'Razorpay' && order.paymentDetails.paymentStatus === 'Completed') {
      order.paymentDetails.paymentStatus = 'Refunded'; // simulate refund
    }

    // Restock the product items
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    const updatedOrder = await order.save();
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};
