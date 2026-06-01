import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import Review from './models/Review.js';
import Cart from './models/Cart.js';
import Wishlist from './models/Wishlist.js';
import Order from './models/Order.js';
import Coupon from './models/Coupon.js';
import { generateAllProducts } from './productGenerator.js';

dotenv.config();

// Seeding Data definitions
const categories = [
  {
    name: 'Electronics',
    image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&q=80&w=800',
  },
  {
    name: 'Fashion',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
  },
  {
    name: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800',
  },
  {
    name: 'Books',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
  },
  {
    name: 'Beauty',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800',
  },
];

const products = generateAllProducts();

const seedDatabase = async () => {
  try {
    console.log('Seeding process initiated...');
    await connectDB();

    // Clear existing data
    console.log('Clearing database collections...');
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Review.deleteMany();
    await Cart.deleteMany();
    await Wishlist.deleteMany();
    await Order.deleteMany();
    await Coupon.deleteMany();
    console.log('Database collections cleared.');

    // Seed Categories
    console.log('Seeding categories...');
    const insertedCategories = await Category.insertMany(categories);
    console.log(`${insertedCategories.length} categories seeded.`);

    // Seed Products
    console.log('Seeding products...');
    const insertedProducts = await Product.insertMany(products);
    console.log(`${insertedProducts.length} products seeded.`);

    // Seed Users
    console.log('Seeding default user accounts...');
    
    // Customer
    const customer = await User.create({
      name: 'John Customer',
      email: 'customer@example.com',
      password: 'password123',
      role: 'customer',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    });

    // Admin
    const admin = await User.create({
      name: 'Admin Boss',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      profileImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
    });

    console.log(`Default accounts successfully created:`);
    console.log(`  - Customer: customer@example.com / password123`);
    console.log(`  - Admin: admin@example.com / password123`);

    // Create a review on the headphones
    const headphones = insertedProducts[0];
    await Review.create({
      userId: customer._id,
      productId: headphones._id,
      rating: 5,
      comment: 'Excellent headphones. Clear acoustics and comfortable during long sessions.',
    });
    console.log('Mock product review created.');

    // Seed Coupons
    console.log('Seeding coupons...');
    await Coupon.insertMany([
      {
        code: 'WELCOME10',
        discountType: 'Percentage',
        discountValue: 10,
        minPurchase: 1000,
        expiryDate: new Date('2030-12-31'),
        isActive: true,
      },
      {
        code: 'FLAT500',
        discountType: 'Fixed',
        discountValue: 500,
        minPurchase: 5000,
        expiryDate: new Date('2030-12-31'),
        isActive: true,
      },
    ]);
    console.log('Mock coupons seeded.');

    console.log('Seeding process completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding process failed:', error);
    process.exit(1);
  }
};

seedDatabase();
