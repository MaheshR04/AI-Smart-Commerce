import UserBehavior from '../models/UserBehavior.js';
import UserPreference from '../models/UserPreference.js';
import Product from '../models/Product.js';

/**
 * Log user search behavior
 */
export const logSearch = async (userId, query) => {
  if (!userId || !query) return;
  try {
    await UserBehavior.findOneAndUpdate(
      { userId },
      { 
        $push: { 
          searchedProducts: { query, timestamp: new Date() } 
        } 
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Failed to log search behavior:', error.message);
  }
};

/**
 * Log product view/click behavior and update user preferences
 */
export const logView = async (userId, productId) => {
  if (!userId || !productId) return;
  try {
    const product = await Product.findById(productId);
    if (!product) return;

    // 1. Log Behavior
    const behavior = await UserBehavior.findOneAndUpdate(
      { userId },
      {
        $push: {
          viewedProducts: { productId, timestamp: new Date() },
          clickedProducts: { productId, timestamp: new Date() }
        }
      },
      { upsert: true, new: true }
    );

    // 2. Fetch last 15 viewed products to calculate preferences
    const limitViewed = behavior.viewedProducts.slice(-15);
    const viewedProductIds = limitViewed.map(v => v.productId);
    const products = await Product.find({ _id: { $in: viewedProductIds } });

    // Compute brand and category frequency maps
    const brandsMap = {};
    const categoriesMap = {};
    let totalPrice = 0;

    products.forEach(p => {
      brandsMap[p.brand] = (brandsMap[p.brand] || 0) + 1;
      categoriesMap[p.category] = (categoriesMap[p.category] || 0) + 1;
      totalPrice += p.price;
    });

    // Sort brands and categories by frequency
    const favoriteBrands = Object.keys(brandsMap).sort((a, b) => brandsMap[b] - brandsMap[a]).slice(0, 5);
    const favoriteCategories = Object.keys(categoriesMap).sort((a, b) => categoriesMap[b] - categoriesMap[a]).slice(0, 5);

    // Dynamic budget range (average price +/- 40%)
    let budgetMin = 0;
    let budgetMax = 0;
    if (products.length > 0) {
      const avgPrice = totalPrice / products.length;
      budgetMin = Math.round(avgPrice * 0.6);
      budgetMax = Math.round(avgPrice * 1.4);
    }

    // Determine interests based on keywords/tags of viewed products
    const interestSet = new Set();
    products.forEach(p => {
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach(t => interestSet.add(t));
      }
      if (p.useCases && Array.isArray(p.useCases)) {
        p.useCases.forEach(uc => interestSet.add(uc));
      }
    });
    const interests = Array.from(interestSet).slice(0, 10);

    // 3. Save UserPreferences
    await UserPreference.findOneAndUpdate(
      { userId },
      {
        favoriteBrands,
        favoriteCategories,
        budgetRange: { min: budgetMin, max: budgetMax },
        interests
      },
      { upsert: true, new: true }
    );

  } catch (error) {
    console.error('Failed to log view/click behavior:', error.message);
  }
};

/**
 * Log product purchases
 */
export const logPurchase = async (userId, productIds) => {
  if (!userId || !productIds || productIds.length === 0) return;
  try {
    const pushItems = productIds.map(productId => ({ productId, timestamp: new Date() }));
    await UserBehavior.findOneAndUpdate(
      { userId },
      {
        $push: {
          purchasedProducts: { $each: pushItems }
        }
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Failed to log purchase behavior:', error.message);
  }
};
