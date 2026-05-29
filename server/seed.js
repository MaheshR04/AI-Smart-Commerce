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

const products = [
  {
    name: 'Wireless Noise Cancelling Headphones',
    brand: 'SonicSound',
    category: 'Electronics',
    description: 'Experience deep, immersive sound with active noise cancellation, smart ambient audio, 30-hour battery life, and crystal-clear voice calls.',
    price: 15999,
    discountPrice: 12999,
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.5,
    specifications: [
      { key: 'Connectivity', value: 'Bluetooth 5.2, NFC' },
      { key: 'Battery Life', value: '30 Hours' },
      { key: 'Noise Cancelling', value: 'Yes (Active)' },
      { key: 'Warranty', value: '1 Year Manufacturer' }
    ],
  },
  {
    name: 'Pro-Smart Watch Series X',
    brand: 'AuraTech',
    category: 'Electronics',
    description: 'Track your fitness, monitoring heart rate, sleep quality, oxygen saturation, built-in GPS, and standard notification sync in this elegant design.',
    price: 8999,
    discountPrice: 6499,
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.2,
    specifications: [
      { key: 'Display', value: '1.78 Inch AMOLED' },
      { key: 'Water Proof', value: 'IP68 Certified' },
      { key: 'Sensors', value: 'Heart Rate, SpO2, Accelerometer' },
      { key: 'Battery life', value: 'Up to 7 Days' }
    ],
  },
  {
    name: 'Minimalist Premium Cotton Hoodie',
    brand: 'ThreadCraft',
    category: 'Fashion',
    description: 'Stay warm and stylish with this ultra-soft, regular fit hoodie made of 100% sustainably-sourced premium cotton.',
    price: 2999,
    discountPrice: 1999,
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.6,
    specifications: [
      { key: 'Material', value: '100% Premium Cotton' },
      { key: 'Fit', value: 'Regular Fit' },
      { key: 'Pattern', value: 'Solid Minimal' },
      { key: 'Wash Care', value: 'Machine Wash Cold' }
    ],
  },
  {
    name: 'Automatic Multi-Brew Espresso Machine',
    brand: 'Cafeteria',
    category: 'Home & Kitchen',
    description: 'Bring the cafe experience to your kitchen. Multi-brew functionality for espresso, cappuccino, and latte with standard 15-bar pressure and milk frother.',
    price: 24999,
    discountPrice: 19999,
    stock: 10,
    images: [
      'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.8,
    specifications: [
      { key: 'Pump Pressure', value: '15 Bar' },
      { key: 'Water Tank Capacity', value: '1.5 Liters' },
      { key: 'Frother type', value: 'Manual Steam Wand' },
      { key: 'Power Consumption', value: '1200 Watts' }
    ],
  },
  {
    name: 'Atomic Habits (Paperback)',
    brand: 'Penguin Publishing',
    category: 'Books',
    description: 'An easy & proven way to build good habits and break bad ones. The definitive guide to breaking bad behaviors and adopting good ones in tiny steps.',
    price: 799,
    discountPrice: 599,
    stock: 100,
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.9,
    specifications: [
      { key: 'Author', value: 'James Clear' },
      { key: 'Publisher', value: 'Penguin Books' },
      { key: 'Language', value: 'English' },
      { key: 'Format', value: 'Paperback' }
    ],
  },
];

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

    console.log('Seeding process completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding process failed:', error);
    process.exit(1);
  }
};

seedDatabase();
