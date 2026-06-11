import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { getPersonalizedRecommendations } from './controllers/aiController.js';
import User from './models/User.js';
import UserPreference from './models/UserPreference.js';
import UserBehavior from './models/UserBehavior.js';
import Product from './models/Product.js';
import Wishlist from './models/Wishlist.js';
import Order from './models/Order.js';

dotenv.config();

const runTest = async () => {
  try {
    await connectDB();

    // 1. Fetch test customer
    const testUser = await User.findOne({ email: 'customer@example.com' });
    if (!testUser) {
      console.error('Test user customer@example.com not found. Make sure products and users are seeded.');
      mongoose.connection.close();
      return;
    }

    console.log(`\nFound test user: ${testUser.name} (${testUser._id})`);

    // Let's print current user preferences and behaviors for debugging
    const prefs = await UserPreference.findOne({ userId: testUser._id });
    console.log('\nUser Preferences:');
    console.log(`  Favorite Brands: ${prefs?.favoriteBrands?.join(', ') || 'None'}`);
    console.log(`  Favorite Categories: ${prefs?.favoriteCategories?.join(', ') || 'None'}`);
    console.log(`  Interests: ${prefs?.interests?.join(', ') || 'None'}`);
    console.log(`  Budget Range: ₹${prefs?.budgetRange?.min} - ₹${prefs?.budgetRange?.max}`);

    const behavior = await UserBehavior.findOne({ userId: testUser._id });
    console.log('\nUser Behavior:');
    console.log(`  Viewed Products Count: ${behavior?.viewedProducts?.length || 0}`);
    console.log(`  Purchased Products Count: ${behavior?.purchasedProducts?.length || 0}`);

    // Mock request and response
    const req = {
      user: testUser,
      body: {
        viewedProductIds: [] // guest simulation ids
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
        console.error('Controller passed error to next():', err);
      }
    };

    console.log('\nExecuting getPersonalizedRecommendations controller...');
    await getPersonalizedRecommendations(req, res, next);

    console.log('Result Success:', responseData?.success);
    if (responseData?.success) {
      console.log(`\n1. Recommended for You (${responseData.recommendedForYou?.length || 0} products):`);
      responseData.recommendedForYou?.slice(0, 4).forEach((p, idx) => {
        console.log(`  ${idx + 1}. ${p.name} (Brand: ${p.brand} | Category: ${p.category} | Price: ₹${p.discountPrice || p.price})`);
      });

      console.log(`\n2. Because You Viewed (${responseData.becauseYouViewed?.length || 0} entries):`);
      responseData.becauseYouViewed?.forEach((entry, idx) => {
        console.log(`  Entry ${idx + 1}: Based on viewing "${entry.baseProduct?.name}"`);
        entry.recommendations?.forEach((rec, rIdx) => {
          console.log(`     -> Rec ${rIdx + 1}: ${rec.name} (Price: ₹${rec.discountPrice || rec.price})`);
        });
      });

      console.log(`\n3. Frequently Bought Together (${responseData.frequentlyBoughtTogether?.length || 0} products):`);
      responseData.frequentlyBoughtTogether?.forEach((p, idx) => {
        console.log(`  ${idx + 1}. ${p.name} (Category: ${p.category} | Price: ₹${p.discountPrice || p.price})`);
      });
    } else {
      console.log('Failed to fetch recommendations:', responseData);
    }

    // Now test GUEST fallback simulation
    console.log('\n=========================================');
    console.log('Testing GUEST fallbacks...');
    
    // Find some active electronic items to pass as viewed IDs
    const someProducts = await Product.find({ category: 'Electronics' }).limit(2);
    const guestReq = {
      user: null, // guest user
      body: {
        viewedProductIds: someProducts.map(p => p._id.toString())
      }
    };

    let guestResponseData = null;
    const guestRes = {
      json: (data) => {
        guestResponseData = data;
        return data;
      },
      status: (code) => {
        return {
          json: (data) => {
            guestResponseData = { statusCode: code, ...data };
            return data;
          }
        };
      }
    };

    await getPersonalizedRecommendations(guestReq, guestRes, next);

    console.log('Guest Result Success:', guestResponseData?.success);
    if (guestResponseData?.success) {
      console.log(`Guest Because You Viewed (${guestResponseData.becauseYouViewed?.length || 0} entries):`);
      guestResponseData.becauseYouViewed?.forEach((entry, idx) => {
        console.log(`  Entry ${idx + 1}: Based on guest viewing "${entry.baseProduct?.name}"`);
        entry.recommendations?.forEach((rec, rIdx) => {
          console.log(`     -> Rec ${rIdx + 1}: ${rec.name}`);
        });
      });
    }

    mongoose.connection.close();
  } catch (err) {
    console.error('Test execution crashed:', err);
    mongoose.connection.close();
  }
};

runTest();
