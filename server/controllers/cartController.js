import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

/**
 * @desc    Get user cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate({
      path: 'products.productId',
      select: 'name price discountPrice images stock brand category',
    });

    // If cart doesn't exist, create an empty one
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, products: [] });
    }

    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add product to cart or increase quantity
 * @route   POST /api/cart
 * @access  Private
 */
export const addToCart = async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  try {
    // Validate product existence and stock
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    if (product.stock < quantity) {
      res.status(400);
      throw new Error(`Insufficient stock. Only ${product.stock} items available.`);
    }

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      // Create cart if none exists
      cart = new Cart({ userId: req.user._id, products: [] });
    }

    // Check if product already in cart
    const itemIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      // Product exists, update quantity
      const newQuantity = cart.products[itemIndex].quantity + Number(quantity);
      if (product.stock < newQuantity) {
        res.status(400);
        throw new Error(`Cannot add more. Insufficient stock (Available: ${product.stock}).`);
      }
      cart.products[itemIndex].quantity = newQuantity;
    } else {
      // Add new product
      cart.products.push({ productId, quantity: Number(quantity) });
    }

    await cart.save();
    
    // Return fully populated cart
    const populatedCart = await Cart.findOne({ userId: req.user._id }).populate({
      path: 'products.productId',
      select: 'name price discountPrice images stock brand category',
    });

    res.json({
      success: true,
      message: 'Product added to cart successfully',
      data: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update quantity of product in cart
 * @route   PUT /api/cart
 * @access  Private
 */
export const updateCartItemQuantity = async (req, res, next) => {
  const { productId, quantity } = req.body;

  try {
    if (quantity < 1) {
      res.status(400);
      throw new Error('Quantity must be at least 1');
    }

    // Validate product stock
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    if (product.stock < quantity) {
      res.status(400);
      throw new Error(`Insufficient stock. Only ${product.stock} items available.`);
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }

    const itemIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      cart.products[itemIndex].quantity = Number(quantity);
      await cart.save();

      const populatedCart = await Cart.findOne({ userId: req.user._id }).populate({
        path: 'products.productId',
        select: 'name price discountPrice images stock brand category',
      });

      res.json({
        success: true,
        message: 'Cart updated successfully',
        data: populatedCart,
      });
    } else {
      res.status(404);
      throw new Error('Product not found in cart');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove product from cart
 * @route   DELETE /api/cart/:productId
 * @access  Private
 */
export const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }

    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== req.params.productId
    );

    await cart.save();

    const populatedCart = await Cart.findOne({ userId: req.user._id }).populate({
      path: 'products.productId',
      select: 'name price discountPrice images stock brand category',
    });

    res.json({
      success: true,
      message: 'Product removed from cart successfully',
      data: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear entire cart
 * @route   POST /api/cart/clear
 * @access  Private
 */
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });

    if (cart) {
      cart.products = [];
      await cart.save();
    }

    res.json({ success: true, message: 'Cart cleared successfully', data: cart });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add multiple products to cart in one request
 * @route   POST /api/cart/bulk
 * @access  Private
 */
export const addBulkToCart = async (req, res, next) => {
  const { items } = req.body; // Array of { productId, quantity }

  try {
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400);
      throw new Error('Items array is required');
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, products: [] });
    }

    for (const item of items) {
      const { productId, quantity = 1 } = item;
      const product = await Product.findById(productId);
      if (!product) continue;

      const itemIndex = cart.products.findIndex(
        (p) => p.productId.toString() === productId.toString()
      );

      if (itemIndex > -1) {
        const newQuantity = cart.products[itemIndex].quantity + Number(quantity);
        cart.products[itemIndex].quantity = Math.min(product.stock, newQuantity);
      } else {
        cart.products.push({ productId, quantity: Math.min(product.stock, Number(quantity)) });
      }
    }

    await cart.save();

    const populatedCart = await Cart.findOne({ userId: req.user._id }).populate({
      path: 'products.productId',
      select: 'name price discountPrice images stock brand category',
    });

    res.json({
      success: true,
      message: 'Items added to cart successfully',
      data: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};
