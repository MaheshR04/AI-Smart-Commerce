import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Product from './models/Product.js';

dotenv.config();

const run = async () => {
  await connectDB();
  try {
    const product = await Product.findById('6a1936db0b6e87b074a1df77');
    console.log('PRODUCT IN MONGODB:', product);
  } catch (err) {
    console.error('ERROR FINDING:', err.message);
  }
  mongoose.connection.close();
};

run();
