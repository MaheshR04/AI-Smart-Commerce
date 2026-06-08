import { GoogleGenerativeAI } from '@google/generative-ai';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

// Initialize Gemini API if key is present
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error('Failed to initialize GoogleGenerativeAI:', error.message);
    return null;
  }
};

/**
 * Helper to get all products in DB for local parsing or model context
 */
const getAllProductsSummary = async () => {
  const products = await Product.find({});
  return products.map(p => ({
    id: p._id.toString(),
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: p.price,
    discountPrice: p.discountPrice || 0,
    activePrice: p.discountPrice > 0 ? p.discountPrice : p.price,
    rating: p.rating,
    description: p.description,
    specifications: p.specifications
  }));
};

/**
 * @desc    AI Shopping Assistant Chat
 * @route   POST /api/ai/chat
 * @access  Public
 */
export const chatWithAI = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message query is required' });
    }

    const dbProducts = await getAllProductsSummary();
    const gemini = getGeminiClient();

    if (gemini) {
      try {
        const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        // Build prompt with context
        const systemPrompt = `You are a helpful and intelligent AI Shopping Assistant for "SmartCommerce", a premium e-commerce platform.
Your task is to understand the user's requirements and recommend matching products from our catalog.

Here is our complete active product catalog (JSON format):
${JSON.stringify(dbProducts, null, 2)}

Instructions:
1. Recommending items: Recommend only from the catalog list above. Do NOT invent new products.
2. Direct links: For every product you recommend, list its exact name, brand, active price (use discount price if greater than 0), and key specifications. 
3. User intent: Pay close attention to category, brand preference, features, and price constraints (e.g. "under ₹50,000 for coding").
4. Response formatting: Use clear, beautifully structured markdown with bullet points.
5. In your response JSON, also return a structured list of recommended product IDs in the "recommendations" array.

Return your response strictly in the following JSON format:
{
  "reply": "Your markdown formatted reply content here.",
  "recommendations": ["product_id_1", "product_id_2"]
}
Make sure to escape control characters in strings for valid JSON parsing.`;

        const prompt = `${systemPrompt}\n\nUser Question: "${message}"`;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        
        // Extract JSON block from response if model wraps it in markdown code blocks
        let jsonStr = responseText;
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
        }

        const parsed = JSON.parse(jsonStr);
        
        // Fetch full product objects for recommended IDs
        const matchedProducts = await Product.find({ _id: { $in: parsed.recommendations } });

        return res.json({
          success: true,
          reply: parsed.reply,
          recommendations: matchedProducts
        });
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local NLP matching engine:', err.message);
      }
    }

    // --- LOCAL NLP / HEURISTIC FALLBACK HANDLER ---
    const lower = message.toLowerCase();
    let matchedCategory = null;
    let maxPriceLimit = null;
    let minPriceLimit = null;
    let categoryKeywords = [];

    // Parse categories & keywords
    if (lower.match(/(laptop|computer|macbook|pc|tablet|ipad|kindle|ps5|console|gaming|drone|headphone|earbud|audio|speaker|tv|television|camera|sony|boat|samsung|apple|electronics)/)) {
      matchedCategory = 'Electronics';
      categoryKeywords = ['laptop', 'macbook', 'tablet', 'kindle', 'console', 'earbud', 'headphone', 'tv', 'camera', 'drone'];
    } else if (lower.match(/(shoe|sneaker|jeans|denim|shirt|polo|t-shirt|jacket|clothing|wear|apparel|fashion|helmet|vega|nike|adidas|levis)/)) {
      matchedCategory = 'Fashion';
      categoryKeywords = ['shoe', 'jeans', 'shirt', 'polo', 'jacket', 'helmet'];
    } else if (lower.match(/(vacuum|cooker|fryer|pot|sheet|curtain|shelf|ikea|decor|furniture|kitchen|home|lamp)/)) {
      matchedCategory = 'Home & Kitchen';
      categoryKeywords = ['vacuum', 'cooker', 'fryer', 'bedsheet', 'curtains', 'shelf', 'kit', 'lamp'];
    } else if (lower.match(/(habit|sapiens|alchemist|book|read|novel|author)/)) {
      matchedCategory = 'Books';
    } else if (lower.match(/(cetaphil|olaplex|clinique|cream|hydrator|moisturizer|hair|skin|beauty|makeup)/)) {
      matchedCategory = 'Beauty';
    }

    // Parse price limits (e.g. "under 50,000", "below 1500")
    const priceMatches = lower.match(/(?:under|below|less than|max|budget of|within)\s*(?:rs\.?|inr|₹)?\s*([\d,]+)/i);
    if (priceMatches) {
      maxPriceLimit = Number(priceMatches[1].replace(/,/g, ''));
    }

    const minPriceMatches = lower.match(/(?:above|over|more than|min|at least)\s*(?:rs\.?|inr|₹)?\s*([\d,]+)/i);
    if (minPriceMatches) {
      minPriceLimit = Number(minPriceMatches[1].replace(/,/g, ''));
    }

    // Query DB with parsed filters
    const query = {};
    if (matchedCategory) {
      query.category = matchedCategory;
    }

    const filteredProducts = await Product.find(query);

    // Filter by keywords, specifications and price limits
    let scoredProducts = filteredProducts.map(p => {
      let score = 0;
      const nameLower = p.name.toLowerCase();
      const descLower = p.description.toLowerCase();
      const activePrice = p.discountPrice > 0 ? p.discountPrice : p.price;

      // Price checks
      if (maxPriceLimit && activePrice > maxPriceLimit) return null;
      if (minPriceLimit && activePrice < minPriceLimit) return null;

      // Keyword matching scores
      categoryKeywords.forEach(kw => {
        if (nameLower.includes(kw)) score += 10;
        if (descLower.includes(kw)) score += 3;
      });

      // Special purpose keywords: "coding", "gaming", "work", "travel", etc.
      if (lower.includes('coding') || lower.includes('programming') || lower.includes('development')) {
        if (nameLower.includes('macbook') || nameLower.includes('laptop')) score += 15;
      }
      if (lower.includes('gaming') || lower.includes('game') || lower.includes('playstation')) {
        if (nameLower.includes('console') || nameLower.includes('playstation') || nameLower.includes('ps5') || nameLower.includes('s24')) score += 15;
      }

      return { product: p, score, activePrice };
    }).filter(Boolean);

    // Sort by match score and rating
    scoredProducts.sort((a, b) => b.score - a.score || b.product.rating - a.product.rating);

    const recommended = scoredProducts.slice(0, 3).map(sp => sp.product);

    // Formulate a beautiful markdown response based on query
    let reply = '';
    if (recommended.length > 0) {
      reply = `Based on your request, I searched our catalog and found the following top recommendation(s) matching your criteria:\n\n`;
      recommended.forEach((p, idx) => {
        const priceStr = p.discountPrice > 0 
          ? `**₹${p.discountPrice.toLocaleString('en-IN')}** (Save ₹${(p.price - p.discountPrice).toLocaleString('en-IN')})`
          : `**₹${p.price.toLocaleString('en-IN')}**`;
          
        reply += `### ${idx + 1}. ${p.name}\n`;
        reply += `- **Brand:** ${p.brand} | **Rating:** ${p.rating} / 5.0\n`;
        reply += `- **Price:** ${priceStr}\n`;
        
        if (p.specifications && p.specifications.length > 0) {
          reply += `- **Key Specs:** ${p.specifications.slice(0, 3).map(s => `${s.key}: ${s.value}`).join(' | ')}\n`;
        }
        reply += `- **Summary:** ${p.description.substring(0, 140)}...\n\n`;
      });
      reply += `Feel free to click on the product card(s) below to view full specifications, add items to your cart, or check out! Let me know if you need any other options compared or searched.`;
    } else {
      reply = `I couldn't find any products in our current catalog that exactly match your filters. Try checking your spelling or adjusting your budget limits. \n\nYou can also browse our main categories like **Electronics**, **Fashion**, and **Home & Kitchen** directly from the homepage menu.`;
    }

    return res.json({
      success: true,
      reply,
      recommendations: recommended
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Product Comparison
 * @route   POST /api/ai/compare
 * @access  Public
 */
export const compareProducts = async (req, res, next) => {
  try {
    const { productIds } = req.body;
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ success: false, message: 'productIds array is required' });
    }

    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'No matching products found' });
    }

    const gemini = getGeminiClient();

    if (gemini) {
      try {
        const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const systemPrompt = `You are a premium AI Product Comparison Engine for "SmartCommerce".
Your task is to take the provided products list and generate a side-by-side comparison including specs, pros, cons, and a final recommended choice (verdict).

Here are the products to compare (JSON):
${JSON.stringify(products, null, 2)}

Return your response strictly in the following JSON format:
{
  "specsComparison": [
    { "key": "Feature Name (e.g. RAM, Battery, etc.)", "values": { "product_id_1": "value1", "product_id_2": "value2" } }
  ],
  "prosCons": {
    "product_id_1": { "pros": ["pro1"], "cons": ["con1"] }
  },
  "verdict": "Detailed markdown final verdict explaining which one is recommended for what type of user."
}`;

        const prompt = `${systemPrompt}\n\nGenerate the comparison now.`;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        
        let jsonStr = responseText;
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
        }

        const parsed = JSON.parse(jsonStr);
        return res.json({
          success: true,
          products,
          comparison: parsed
        });
      } catch (err) {
        console.warn('Gemini comparison call failed, falling back to local comparison generator:', err.message);
      }
    }

    // --- LOCAL HEURISTIC COMPARISON GENERATOR ---
    const specsComparisonMap = {};
    const prosCons = {};

    // Mapped standard specifications keys
    products.forEach(p => {
      const pId = p._id.toString();
      
      // Initialize pros/cons
      const activePrice = p.discountPrice > 0 ? p.discountPrice : p.price;
      const rating = p.rating || 4.0;
      
      const pros = [];
      const cons = [];

      if (rating >= 4.6) pros.push('Highly rated by customers');
      if (p.discountPrice > 0) pros.push('Currently on discount sale');
      if (p.stock < 20 && p.stock > 0) cons.push('Limited stock remaining');
      if (activePrice > 50000) cons.push('Premium price point');

      // Generate mock pros/cons by product category/brand details
      if (p.category === 'Electronics') {
        pros.push('Premium build quality');
        pros.push('High performance specifications');
      } else if (p.category === 'Fashion') {
        pros.push('Modern stylish aesthetics');
        pros.push('Comfortable for daily wear');
      } else if (p.category === 'Home & Kitchen') {
        pros.push('Highly utility driven design');
        pros.push('Durable long lasting materials');
      } else {
        pros.push('Excellent value for money');
      }

      prosCons[pId] = { pros, cons };

      // Map specifications
      if (p.specifications && p.specifications.length > 0) {
        p.specifications.forEach(spec => {
          if (!specsComparisonMap[spec.key]) {
            specsComparisonMap[spec.key] = {};
          }
          specsComparisonMap[spec.key][pId] = spec.value;
        });
      }
    });

    // Convert specsComparisonMap to array
    const specsComparison = Object.keys(specsComparisonMap).map(key => {
      const values = {};
      products.forEach(p => {
        const pId = p._id.toString();
        values[pId] = specsComparisonMap[key][pId] || 'N/A';
      });
      return { key, values };
    });

    // Create a final verdict
    let verdict = `### AI Recommendation Verdict\n\n`;
    if (products.length >= 2) {
      const p1 = products[0];
      const p2 = products[1];
      const p1Price = p1.discountPrice > 0 ? p1.discountPrice : p1.price;
      const p2Price = p2.discountPrice > 0 ? p2.discountPrice : p2.price;

      verdict += `Comparing **${p1.name}** vs **${p2.name}**:\n\n`;
      verdict += `- **Premium Choice:** If budget is not a constraint and you want best-in-class features, **${p1.rating >= p2.rating ? p1.name : p2.name}** is the recommended choice with a rating of **${Math.max(p1.rating, p2.rating)}/5.0**.\n`;
      verdict += `- **Budget Choice:** If you are looking to save money, **${p1Price <= p2Price ? p1.name : p2.name}** offers excellent value priced at **₹${Math.min(p1Price, p2Price).toLocaleString('en-IN')}**.\n\n`;
      verdict += `Consider your specific application: For intensive use cases, prioritize specifications like processor, capacity, or build quality listed in the side-by-side details table above.`;
    } else {
      verdict += `Add more items to compare their features side-by-side!`;
    }

    return res.json({
      success: true,
      products,
      comparison: {
        specsComparison,
        prosCons,
        verdict
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Review Summarizer
 * @route   GET /api/ai/reviews/summary/:productId
 * @access  Public
 */
export const summarizeReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Fetch actual reviews from DB
    const reviews = await Review.find({ productId });
    const gemini = getGeminiClient();

    if (gemini) {
      try {
        const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const systemPrompt = `You are a professional AI Review Summarizer for "SmartCommerce".
Your task is to take a product's details and its customer reviews, and generate a concise summary separating reviews into Pros, Cons, and a Final Verdict.

Product Name: ${product.name}
Product Description: ${product.description}
Specifications: ${JSON.stringify(product.specifications)}

Customer Reviews (JSON):
${JSON.stringify(reviews.map(r => ({ rating: r.rating, comment: r.comment })), null, 2)}

Instructions:
1. Summarize pros into bullet points.
2. Summarize cons into bullet points.
3. Write a 2-3 sentence final verdict.
4. If there are no customer reviews, synthesize realistic pros/cons and verdict based on the product description and specifications.

Return your response strictly in the following JSON format:
{
  "pros": ["pro1", "pro2"],
  "cons": ["con1", "con2"],
  "verdict": "Final summary verdict text here."
}`;

        const prompt = `${systemPrompt}\n\nGenerate the review summary now.`;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        
        let jsonStr = responseText;
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
        }

        const parsed = JSON.parse(jsonStr);
        return res.json({
          success: true,
          summary: parsed
        });
      } catch (err) {
        console.warn('Gemini review summarizer call failed, falling back to local summaries:', err.message);
      }
    }

    // --- LOCAL REVIEW SUMMARY GENERATOR ---
    const pros = [];
    const cons = [];
    let verdict = '';

    // Synthesize based on actual reviews if we have them
    if (reviews.length > 0) {
      reviews.forEach(r => {
        if (r.rating >= 4) {
          if (r.comment.length > 10 && pros.length < 3) pros.push(r.comment);
        } else {
          if (r.comment.length > 10 && cons.length < 3) cons.push(r.comment);
        }
      });
    }

    // Add fallbacks to guarantee high-quality results
    if (product.category === 'Electronics') {
      if (pros.length === 0) {
        pros.push('Cutting-edge high performance chipset & technology');
        pros.push('Premium and robust design aesthetics');
      }
      if (cons.length === 0) {
        cons.push('Premium price tier compared to average options');
        cons.push('Requires charging adapters or custom ports');
      }
      verdict = `An exceptional premium device tailored for tech enthusiasts and power users. While it sits at a premium price point, its raw performance, outstanding display features, and build quality justify the investment.`;
    } else if (product.category === 'Fashion') {
      if (pros.length === 0) {
        pros.push('Extremely comfortable for active/daily usage');
        pros.push('High-quality breathable fabric composition');
      }
      if (cons.length === 0) {
        cons.push('Sizes might run slightly tight for some buyers');
        cons.push('Needs careful wash care instructions');
      }
      verdict = `A stylish and durable additions to your wardrobe. Perfect for daily styling details or workouts, balancing modern visual design with robust materials.`;
    } else {
      if (pros.length === 0) {
        pros.push('Great value for money matching description');
        pros.push('User friendly operation and packaging');
      }
      if (cons.length === 0) {
        cons.push('Availability might fluctuate in stock');
      }
      verdict = `Highly functional product that delivers exactly on its promises. A solid purchase decision that offers great utility for everyday applications.`;
    }

    return res.json({
      success: true,
      summary: {
        pros: pros.slice(0, 3),
        cons: cons.length > 0 ? cons.slice(0, 3) : ['No significant negatives reported'],
        verdict
      }
    });
  } catch (error) {
    next(error);
  }
};
