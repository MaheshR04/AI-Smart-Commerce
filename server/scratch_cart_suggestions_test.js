import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Product from './models/Product.js';
import { getCartSuggestions } from './controllers/aiController.js';

dotenv.config();

const runTest = async () => {
  try {
    await connectDB();

    console.log('--- FETCHING PRODUCTS FOR TEST ---');
    const macbook = await Product.findOne({ name: /macbook/i });
    const ps5 = await Product.findOne({ name: /playstation/i });
    const s24 = await Product.findOne({ name: /s24 ultra/i });
    const shoes = await Product.findOne({ name: /alpha trainer/i });
    const bedsheet = await Product.findOne({ name: /solimo/i });
    const carKit = await Product.findOne({ name: /3m auto/i });

    if (!macbook || !ps5 || !s24) {
      console.error('Missing key test products in DB. Make sure the database is seeded.');
      mongoose.connection.close();
      return;
    }

    const testCases = [
      {
        name: 'MacBook Pro (Laptop -> headphones/book)',
        ids: [macbook._id.toString()]
      },
      {
        name: 'Galaxy S24 (Phone -> neckband/earbuds)',
        ids: [s24._id.toString()]
      },
      {
        name: 'PS5 (Console -> gaming headphones/earbuds)',
        ids: [ps5._id.toString()]
      },
      {
        name: 'Sports Shoes (Shoes -> sports neckband)',
        ids: shoes ? [shoes._id.toString()] : []
      },
      {
        name: 'Bedsheet (Bedsheet -> Curtains)',
        ids: bedsheet ? [bedsheet._id.toString()] : []
      },
      {
        name: 'Car Kit (Car kit -> car vacuum)',
        ids: carKit ? [carKit._id.toString()] : []
      },
      {
        name: 'Multiple Items (MacBook Pro + Phone)',
        ids: [macbook._id.toString(), s24._id.toString()]
      }
    ];

    for (const testCase of testCases) {
      if (testCase.ids.length === 0) continue;
      console.log(`\n=========================================`);
      console.log(`Running Test Case: ${testCase.name}`);
      console.log(`Input Product IDs: ${JSON.stringify(testCase.ids)}`);

      // Mock req and res objects
      const req = {
        body: {
          productIds: testCase.ids
        }
      };

      let responseData = null;
      const res = {
        json: (data) => {
          responseData = data;
          return data;
        },
        status: (code) => {
          return {
            json: (data) => {
              responseData = { statusCode: code, ...data };
              return data;
            }
          };
        }
      };

      const next = (err) => {
        if (err) {
          console.error('Next error called:', err);
        }
      };

      await getCartSuggestions(req, res, next);

      console.log('Result Success:', responseData?.success);
      if (responseData?.success) {
        console.log(`Suggestions returned (${responseData.suggestions.length}):`);
        responseData.suggestions.forEach((item, idx) => {
          console.log(`  ${idx + 1}. Product: ${item.product.name} (Category: ${item.product.category}, Price: ₹${item.product.price})`);
          console.log(`     Reason: "${item.reason}"`);
        });
      } else {
        console.log('Failed:', responseData);
      }
    }

    mongoose.connection.close();
  } catch (err) {
    console.error('Test script crashed:', err);
    mongoose.connection.close();
  }
};

runTest();
