import Product from '../models/Product.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { logSearch, logView } from '../services/personalizationService.js';

/**
 * @desc    Get all products with filtering, search, sorting and pagination
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Keyword text search or regex matching
    if (keyword) {
      if (req.user) {
        logSearch(req.user._id, keyword).catch(err => console.error('Error logging search:', err.message));
      }
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { brand: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Brand filter
    if (brand) {
      query.brand = brand;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Availability filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Determine Sort options
    let sortOptions = {};
    if (sort === 'priceAsc') {
      sortOptions = { price: 1 };
    } else if (sort === 'priceDesc') {
      sortOptions = { price: -1 };
    } else if (sort === 'rating' || sort === 'bestRated') {
      sortOptions = { rating: -1 };
    } else if (sort === 'mostPopular') {
      sortOptions = { rating: -1, createdAt: -1 };
    } else {
      sortOptions = { createdAt: -1 }; // default: newest first
    }

    // Pagination calculations
    const skipCount = (Number(page) - 1) * Number(limit);
    const totalProducts = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skipCount)
      .limit(Number(limit));

    res.json({
      success: true,
      count: products.length,
      total: totalProducts,
      pages: Math.ceil(totalProducts / Number(limit)),
      currentPage: Number(page),
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      if (req.user) {
        logView(req.user._id, product._id).catch(err => console.error('Error logging view:', err.message));
      }
      res.json({ success: true, data: product });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a product
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = async (req, res, next) => {
  try {
    const { name, brand, category, description, price, discountPrice, stock, specifications } = req.body;

    let imageUrls = [];

    // Check for uploaded files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadToCloudinary(file.path, 'products');
        imageUrls.push(uploadResult.secure_url);
      }
    } else if (req.body.images && req.body.images.length > 0) {
      imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    } else {
      // Provide standard placeholder image if none uploaded
      imageUrls = ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'];
    }

    // Parse specifications if sent as JSON string
    let specs = [];
    if (specifications) {
      specs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
    }

    const product = await Product.create({
      name,
      brand,
      category,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      stock: Number(stock),
      images: imageUrls,
      specifications: specs,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = req.body.name || product.name;
      product.brand = req.body.brand || product.brand;
      product.category = req.body.category || product.category;
      product.description = req.body.description || product.description;
      product.price = req.body.price !== undefined ? Number(req.body.price) : product.price;
      product.discountPrice = req.body.discountPrice !== undefined ? Number(req.body.discountPrice) : product.discountPrice;
      product.stock = req.body.stock !== undefined ? Number(req.body.stock) : product.stock;

      // Update specifications
      if (req.body.specifications) {
        product.specifications = typeof req.body.specifications === 'string'
          ? JSON.parse(req.body.specifications)
          : req.body.specifications;
      }

      // Update images if files are uploaded
      if (req.files && req.files.length > 0) {
        let newImageUrls = [];
        for (const file of req.files) {
          const uploadResult = await uploadToCloudinary(file.path, 'products');
          newImageUrls.push(uploadResult.secure_url);
        }
        product.images = newImageUrls;
      } else if (req.body.images) {
        product.images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      }

      const updatedProduct = await product.save();
      res.json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct,
      });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Try to delete images from Cloudinary
      if (product.images && product.images.length > 0) {
        for (const imgUrl of product.images) {
          if (imgUrl.includes('cloudinary')) {
            const parts = imgUrl.split('/');
            const fileName = parts[parts.length - 1];
            const publicId = `products/${fileName.split('.')[0]}`;
            await deleteFromCloudinary(publicId);
          }
        }
      }

      await Product.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Product removed successfully' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};
