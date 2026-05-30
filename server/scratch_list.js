import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Product from './models/Product.js';

dotenv.config();

const run = async () => {
  await connectDB();
  const products = await Product.find({});
  console.log('PRODUCTS IN DB:');
  products.forEach(p => {
    console.log(`- ID: ${p._id}, Name: ${p.name}`);
  });
  mongoose.connection.close();
};

run();
