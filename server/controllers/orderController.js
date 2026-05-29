import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { getRazorpayInstance } from '../config/razorpay.js';
import crypto from 'crypto';

/**
 * @desc    Create a new order (COD or initialize Razorpay session)
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
  const { products, shippingAddress, paymentMethod } = req.body;

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

    // Initialize Order
    const orderData = {
      userId: req.user._id,
      products: verifiedProducts,
      shippingAddress,
      paymentMethod,
      totalAmount: calculatedTotal,
    };

    // Handle payment method specific flows
    if (paymentMethod === 'Razorpay') {
      const razorpay = getRazorpayInstance();

      if (razorpay) {
        // Active key configuration
        const options = {
          amount: Math.round(calculatedTotal * 100), // Razorpay accepts in paise
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

    // Decrement stock levels for both COD and Razorpay initially (we'll re-adjust if Razorpay fails or cancels)
    for (const item of products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear user cart upon successful checkout creation
    await Cart.findOneAndUpdate({ userId: req.user._id }, { products: [] });

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
    const order = await Order.findById(req.params.id);

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
