import Category from '../models/Category.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({});
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
export const createCategory = async (req, res, next) => {
  const { name } = req.body;

  try {
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      res.status(400);
      throw new Error('Category already exists');
    }

    let imageUrl = '';

    // Check for uploaded file
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path, 'categories');
      imageUrl = uploadResult.secure_url;
    } else if (req.body.image) {
      imageUrl = req.body.image;
    } else {
      res.status(400);
      throw new Error('Please upload an image or provide an image URL');
    }

    const category = await Category.create({
      name,
      image: imageUrl,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      // Try to extract publicId from image url to delete from Cloudinary
      if (category.image && category.image.includes('cloudinary')) {
        const parts = category.image.split('/');
        const fileName = parts[parts.length - 1];
        const publicId = `categories/${fileName.split('.')[0]}`;
        await deleteFromCloudinary(publicId);
      }

      await Category.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Category removed successfully' });
    } else {
      res.status(404);
      throw new Error('Category not found');
    }
  } catch (error) {
    next(error);
  }
};
