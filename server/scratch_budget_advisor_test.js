import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { getBudgetAdvice } from './controllers/aiController.js';

dotenv.config();

const runTest = async () => {
  try {
    await connectDB();

    const testCases = [
      {
        name: 'Tight budget (₹1,300) in Electronics (headphones comparison)',
        budget: 1300,
        category: 'Electronics'
      },
      {
        name: 'Mid-range budget (₹15,000) in Electronics (smartphones comparison)',
        budget: 15000,
        category: 'Electronics'
      },
      {
        name: 'Higher budget (₹30,000) in Electronics (headphone/gaming level comparison)',
        budget: 30000,
        category: 'Electronics'
      },
      {
        name: 'General budget (₹3,000) - All Categories (curtains, car cleaners, books)',
        budget: 3000,
        category: 'All'
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n=========================================`);
      console.log(`Running Test Case: ${testCase.name}`);
      console.log(`Budget: ₹${testCase.budget} | Category: ${testCase.category}`);

      const req = {
        body: {
          budget: testCase.budget,
          category: testCase.category
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

      await getBudgetAdvice(req, res, next);

      console.log('Result Success:', responseData?.success);
      if (responseData?.success) {
        console.log(`Within Budget Options (${responseData.withinBudget.length}):`);
        responseData.withinBudget.forEach((item, idx) => {
          console.log(`  ${idx + 1}. ${item.product.name}`);
          console.log(`     Price: ₹${item.product.discountPrice || item.product.price} | Rating: ⭐ ${item.product.rating}`);
          console.log(`     Reason: "${item.reason}"`);
        });

        console.log(`\nSlightly Better Alternatives / Stretch Suggestions (${responseData.alternatives.length}):`);
        responseData.alternatives.forEach((item, idx) => {
          console.log(`  ${idx + 1}. Upgrade: ${item.product.name} (Price: ₹${item.product.discountPrice || item.product.price})`);
          console.log(`     Upgrade From: "${item.upgradeFromName}"`);
          console.log(`     Value Difference: "${item.valueDifference}"`);
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
