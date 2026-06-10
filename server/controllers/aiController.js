import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import AIChat from '../models/AIChat.js';
import AIRecommendation from '../models/AIRecommendation.js';
import UserPreference from '../models/UserPreference.js';
import UserBehavior from '../models/UserBehavior.js';

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

// Initialize OpenAI API if key is present
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  try {
    return new OpenAI({ apiKey });
  } catch (error) {
    console.error('Failed to initialize OpenAI:', error.message);
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
    specifications: p.specifications,
    tags: p.tags || [],
    keywords: p.keywords || [],
    useCases: p.useCases || [],
    pros: p.pros || [],
    cons: p.cons || []
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
    const openai = getOpenAIClient();
    const gemini = getGeminiClient();

    // 1. Compile User Profile Context & Conversation History
    let userContextStr = '';
    let recentChatsStr = '';

    if (req.user) {
      const userPrefs = await UserPreference.findOne({ userId: req.user._id });
      const userBehaviors = await UserBehavior.findOne({ userId: req.user._id })
        .populate('viewedProducts.productId', 'name brand category price')
        .populate('purchasedProducts.productId', 'name brand category price');

      const recentChats = await AIChat.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(5);

      if (userPrefs) {
        userContextStr += `- Favorite Brands: ${userPrefs.favoriteBrands.join(', ') || 'None'}\n`;
        userContextStr += `- Favorite Categories: ${userPrefs.favoriteCategories.join(', ') || 'None'}\n`;
        userContextStr += `- Estimated Budget Range: ₹${userPrefs.budgetRange?.min?.toLocaleString('en-IN') || 0} - ₹${userPrefs.budgetRange?.max?.toLocaleString('en-IN') || 0}\n`;
        userContextStr += `- Explicit Interests: ${userPrefs.interests.join(', ') || 'None'}\n`;
      }
      
      if (userBehaviors) {
        const viewed = userBehaviors.viewedProducts.slice(-5).map(v => v.productId ? v.productId.name : 'Unknown').filter(Boolean);
        const purchased = userBehaviors.purchasedProducts.slice(-5).map(p => p.productId ? p.productId.name : 'Unknown').filter(Boolean);
        userContextStr += `- Recently Viewed Products: ${viewed.join(', ') || 'None'}\n`;
        userContextStr += `- Recently Purchased Products: ${purchased.join(', ') || 'None'}\n`;
      }

      if (recentChats && recentChats.length > 0) {
        recentChatsStr = recentChats.reverse().map(c => `User: ${c.query}\nAssistant: ${c.response}`).join('\n\n');
      }
    }

    // 2. Build personalized system prompt
    const systemPrompt = `You are a professional and helpful AI Shopping Assistant for "SmartCommerce", a premium e-commerce platform.
Your task is to understand the user's requirements, analyze their preferences/behavior, and recommend matching products from our database.

Here is the user profile context representing their shopping behavior and preferences:
${userContextStr || 'No user behavior or preferences logged yet.'}

Here is a brief conversation history context:
${recentChatsStr || 'No previous chats.'}

Here is our complete active product catalog (JSON format):
${JSON.stringify(dbProducts, null, 2)}

Instructions:
1. Recommending items: Recommend only from the catalog list above. Do NOT invent new products. If no products match, politely explain what categories/brands are available.
2. Be a shopping assistant: Help the user decide what to buy. You MUST structure your reply as follows:
   - At the very top of your reply, display the extracted requirements from the user's query:
     * **Extracted Category:** <category name or N/A>
     * **Extracted Budget:** <budget limit or N/A>
     * **Extracted Use Case:** <intended use case or N/A>
     * **Extracted Preferences:** <extracted preferences like brands, size, specs or N/A>
   - Then, introduce your recommendation.
   - For every recommended product, you MUST include:
     * Brand, specifications, active price (use discount price if > 0).
     * **Why Recommended:** <detailed explanation of why this product fits their query/needs>
     * **Best Use Case:** <specific best use case scenario for this product>
     * **Value for Money Score:** <score>/10 (evaluated based on the product features and pricing)
3. User intent: Tailor choices to match the user's favorite brands, favorite categories, budget constraints, and explicit interests when appropriate.
4. Response formatting: Use clear, beautifully structured markdown with bullet points.
5. In your response JSON, also return a structured list of recommended product IDs in the "recommendations" array.

Return your response strictly in the following JSON format:
{
  "reply": "Your markdown formatted reply content here.",
  "recommendations": ["product_id_1", "product_id_2"]
}
Make sure to escape control characters in strings for valid JSON parsing.`;

    let parsed = null;

    // 3. Try OpenAI API
    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          response_format: { type: 'json_object' }
        });
        const responseText = response.choices[0].message.content.trim();
        parsed = JSON.parse(responseText);
      } catch (err) {
        console.warn('OpenAI API call failed, attempting Gemini fallback:', err.message);
      }
    }

    // 4. Try Gemini API as fallback
    if (!parsed && gemini) {
      try {
        const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `${systemPrompt}\n\nUser Question: "${message}"`;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        
        let jsonStr = responseText;
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
        }
        parsed = JSON.parse(jsonStr);
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local NLP matching engine:', err.message);
      }
    }

    // 5. If LLM succeeded, save logs and return response
    if (parsed) {
      const responseReply = parsed.reply;
      let matchedProducts = [];
      if (parsed.recommendations && parsed.recommendations.length > 0) {
        matchedProducts = await Product.find({ _id: { $in: parsed.recommendations } });
      }

      // Save AIChat history
      await AIChat.create({
        userId: req.user ? req.user._id : undefined,
        query: message,
        response: responseReply
      });

      // Save AIRecommendation log
      if (matchedProducts.length > 0) {
        await AIRecommendation.create({
          userId: req.user ? req.user._id : undefined,
          query: message,
          recommendedProducts: matchedProducts.map(p => p._id)
        });
      }

      return res.json({
        success: true,
        reply: responseReply,
        recommendations: matchedProducts
      });
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

    // Parse price limits
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

    // Heuristic Preferences Extraction
    let extractedPrefs = 'N/A';
    const brandsInDb = ['Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'Vega', 'Solimo', 'D\'Decor', 'Lykos', 'OnePlus', 'iQOO', 'Vivo', 'Dyson', 'ASUS', 'Bose', 'Logitech', 'Intel', 'AMD', 'NVIDIA', 'HP', 'Dell', 'Lenovo'];
    const foundBrands = [];
    brandsInDb.forEach(b => {
      if (lower.includes(b.toLowerCase())) {
        foundBrands.push(b);
      }
    });
    if (foundBrands.length > 0) {
      extractedPrefs = `Preferred Brand(s): ${foundBrands.join(', ')}`;
    }

    // Heuristic Use Case Extraction
    let extractedUseCase = 'General Everyday Use';
    if (lower.includes('game') || lower.includes('gaming') || lower.includes('playstation')) {
      extractedUseCase = 'High-Fidelity Gaming';
    } else if (lower.includes('code') || lower.includes('program') || lower.includes('develop')) {
      extractedUseCase = 'Software Programming & Compilation';
    } else if (lower.includes('jog') || lower.includes('run') || lower.includes('walk') || lower.includes('gym') || lower.includes('workout')) {
      extractedUseCase = 'Athletic & Fitness Training';
    }

    // Formulate a beautiful markdown response based on query
    let reply = '';
    if (recommended.length > 0) {
      reply = `### Extracted Requirements:\n`;
      reply += `- **Category:** ${matchedCategory || 'N/A'}\n`;
      reply += `- **Budget:** ${maxPriceLimit ? `Under ₹${maxPriceLimit.toLocaleString('en-IN')}` : 'N/A'}\n`;
      reply += `- **Use Case:** ${extractedUseCase}\n`;
      reply += `- **Preferences:** ${extractedPrefs}\n\n`;
      reply += `Based on your request, I searched our catalog and found the following top recommendation(s) matching your criteria:\n\n`;
      
      recommended.forEach((p, idx) => {
        const priceStr = p.discountPrice > 0 
          ? `**₹${p.discountPrice.toLocaleString('en-IN')}** (Save ₹${(p.price - p.discountPrice).toLocaleString('en-IN')})`
          : `**₹${p.price.toLocaleString('en-IN')}**`;
        
        // Dynamic Value for Money Score based on rating and discount presence
        let valScore = Math.min(10, Math.round(p.rating * 2));
        if (p.discountPrice > 0) valScore = Math.min(10, valScore + 1);

        // Dynamic Why Recommended
        let whyRecommended = `This product is highly recommended because it is a premium ${p.category} item from ${p.brand} that fits your budget and search parameters.`;
        if (extractedUseCase === 'High-Fidelity Gaming' && p.category === 'Electronics') {
          whyRecommended = `Perfect fit for gaming, offering robust high-speed performance and standard graphics rendering capability.`;
        } else if (extractedUseCase === 'Software Programming & Compilation' && p.category === 'Electronics') {
          whyRecommended = `Excellent for development, featuring great processing power, multitasking capacity, and reliability.`;
        } else if (extractedUseCase === 'Athletic & Fitness Training' && p.category === 'Fashion') {
          whyRecommended = `Highly suited for training sessions, designed to support physical exercise with breathable construction and custom support.`;
        }

        // Dynamic Best Use Case
        let bestUseCase = p.useCases && p.useCases.length > 0 ? p.useCases[0] : extractedUseCase;

        reply += `### ${idx + 1}. ${p.name}\n`;
        reply += `- **Brand:** ${p.brand} | **Rating:** ${p.rating} / 5.0\n`;
        reply += `- **Price:** ${priceStr}\n`;
        
        if (p.specifications && p.specifications.length > 0) {
          reply += `- **Key Specs:** ${p.specifications.slice(0, 3).map(s => `${s.key}: ${s.value}`).join(' | ')}\n`;
        }
        reply += `- **Summary:** ${p.description.substring(0, 140)}...\n`;
        reply += `- **Why Recommended:** ${whyRecommended}\n`;
        reply += `- **Best Use Case:** ${bestUseCase}\n`;
        reply += `- **Value for Money Score:** ${valScore}/10\n\n`;
      });
      reply += `Feel free to click on the product card(s) below to view full specifications, add items to your cart, or check out! Let me know if you need any other options compared or searched.`;
    } else {
      reply = `### Extracted Requirements:\n`;
      reply += `- **Category:** ${matchedCategory || 'N/A'}\n`;
      reply += `- **Budget:** ${maxPriceLimit ? `Under ₹${maxPriceLimit.toLocaleString('en-IN')}` : 'N/A'}\n`;
      reply += `- **Use Case:** ${extractedUseCase}\n`;
      reply += `- **Preferences:** ${extractedPrefs}\n\n`;
      reply += `I couldn't find any products in our current catalog that exactly match your filters. Try checking your spelling or adjusting your budget limits. \n\nYou can also browse our main categories like **Electronics**, **Fashion**, and **Home & Kitchen** directly from the homepage menu.`;
    }

    // Save AIChat history
    await AIChat.create({
      userId: req.user ? req.user._id : undefined,
      query: message,
      response: reply
    });

    // Save AIRecommendation log
    if (recommended.length > 0) {
      await AIRecommendation.create({
        userId: req.user ? req.user._id : undefined,
        query: message,
        recommendedProducts: recommended.map(p => p._id)
      });
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

/**
 * @desc    AI Goal-Based Shopping Planner
 * @route   POST /api/ai/plan-goal
 * @access  Public
 */
export const planGoalSetup = async (req, res, next) => {
  try {
    const { goal } = req.body;
    if (!goal) {
      return res.status(400).json({ success: false, message: 'Goal query is required' });
    }

    const dbProducts = await getAllProductsSummary();
    const gemini = getGeminiClient();

    if (gemini) {
      try {
        const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const systemPrompt = `You are a premium AI Goal-Based Shopping Planner for "SmartCommerce".
Your task is to take a user's shopping goal (like "Build Gaming Setup", "Start YouTube Channel", "Home Gym Setup", "Programming Setup") and recommend a bundle of products from our catalog.

Here is our complete active product catalog (JSON format):
${JSON.stringify(dbProducts, null, 2)}

Instructions:
1. Recommending items: Recommend only from the catalog list above. Select 2 to 4 products that logically fit the goal.
2. Direct reasons: For each recommended product, write a brief, compelling 1-2 sentence reason explaining why it fits this goal.
3. Response formatting: Return your response strictly in the following JSON format:
{
  "goalName": "The goal name formatted nicely",
  "intro": "A 2-3 sentence overview explaining how this setup bundle solves the user's goal.",
  "bundleRecommendations": [
    { "productId": "productIdStr", "reason": "Reason why it fits the goal" }
  ]
}
Make sure to escape control characters in strings for valid JSON parsing.`;

        const prompt = `${systemPrompt}\n\nUser Goal: "${goal}"`;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        
        let jsonStr = responseText;
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
        }

        const parsed = JSON.parse(jsonStr);

        // Populate the full product objects for the bundle
        const ids = parsed.bundleRecommendations.map(item => item.productId);
        const products = await Product.find({ _id: { $in: ids } });

        const mappedRecommendations = parsed.bundleRecommendations.map(item => {
          const matchedProd = products.find(p => p._id.toString() === item.productId);
          return {
            product: matchedProd,
            reason: item.reason
          };
        }).filter(item => item.product);

        return res.json({
          success: true,
          goalName: parsed.goalName,
          intro: parsed.intro,
          recommendations: mappedRecommendations
        });
      } catch (err) {
        console.warn('Gemini Goal Planner call failed, falling back to local planner matching engine:', err.message);
      }
    }

    // --- LOCAL GOAL PLANNER FALLBACK ---
    let goalName = goal;
    let intro = '';
    let recommendations = [];
    const lower = goal.toLowerCase();

    if (lower.includes('gaming') || lower.includes('playstation') || lower.includes('game')) {
      goalName = 'Build Premium Gaming Setup';
      intro = 'Create the ultimate home gaming station with a next-generation console, high-performance visual processing, and top-tier active noise-cancelling acoustics.';
      
      const ps5 = await Product.findOne({ name: /playstation/i });
      const sonyHeadphones = await Product.findOne({ name: /wh-1000xm5/i });
      const s24 = await Product.findOne({ name: /s24 ultra/i });

      if (ps5) recommendations.push({ product: ps5, reason: 'The central hub of your gaming setup, delivering blazing-fast loading speeds and 4K ray-traced visuals.' });
      if (sonyHeadphones) recommendations.push({ product: sonyHeadphones, reason: 'Provides industry-leading active noise cancellation for complete immersion in game soundscapes.' });
      if (s24) recommendations.push({ product: s24, reason: 'Perfect secondary display and companion controller for console sync apps and high-fidelity mobile gaming.' });
    } 
    else if (lower.includes('youtube') || lower.includes('video') || lower.includes('vlog') || lower.includes('channel')) {
      goalName = 'Start Professional YouTube Channel';
      intro = 'Kickstart your content creation journey with ultra-high resolution recording hardware, an advanced editing studio setup, and high-fidelity sound monitoring.';
      
      const drone = await Product.findOne({ name: /dji mini/i });
      const macbook = await Product.findOne({ name: /macbook pro/i });
      const sonyHeadphones = await Product.findOne({ name: /wh-1000xm5/i });

      if (drone) recommendations.push({ product: drone, reason: 'Enables high-definition 4K aerial shots and professional cinematic angles to elevate production values.' });
      if (macbook) recommendations.push({ product: macbook, reason: 'A video editing powerhouse equipped with Apple silicon to render complex Timelines without frame drops.' });
      if (sonyHeadphones) recommendations.push({ product: sonyHeadphones, reason: 'Allows precise audio editing, noise monitoring, and vocal leveling with premium acoustics.' });
    } 
    else if (lower.includes('gym') || lower.includes('workout') || lower.includes('fitness') || lower.includes('health')) {
      goalName = 'Home Gym & Fitness Setup';
      intro = 'Optimize your home workout area with heavy-duty training footwear, high-comfort athletic wear, and smart cleaning tools to maintain a hygienic environment.';
      
      const nike = await Product.findOne({ name: /alpha trainer/i });
      const adidas = await Product.findOne({ name: /ultraboost/i });
      const dyson = await Product.findOne({ name: /dyson v15/i });

      if (nike) recommendations.push({ product: nike, reason: 'Features a flat, supportive rubber base designed specifically for high-impact lifts and training stability.' });
      if (adidas) recommendations.push({ product: adidas, reason: 'Provides cloud-like boost cushioning for long-distance runs and high-intensity cardio exercises.' });
      if (dyson) recommendations.push({ product: dyson, reason: 'Ensures your home gym remains clean, hygienic, and free of dust or pet dander with laser-assisted suction.' });
    } 
    else {
      // Default / Programming setup fallback
      goalName = lower.includes('program') || lower.includes('code') || lower.includes('developer') 
        ? 'Professional Software Programming Setup' 
        : `Shopping Plan for: ${goal}`;
      intro = 'Build a high-efficiency development workflow with processing power built for compilation tasks, noise isolation, and productivity habits.';

      const macbook = await Product.findOne({ name: /macbook pro/i });
      const sonyHeadphones = await Product.findOne({ name: /wh-1000xm5/i });
      const habits = await Product.findOne({ name: /atomic habits/i });

      if (macbook) recommendations.push({ product: macbook, reason: 'Executes compilation pipelines, Docker containers, and local dev servers with blazing efficiency.' });
      if (sonyHeadphones) recommendations.push({ product: sonyHeadphones, reason: 'Creates a quiet, focused development zone to help you reach a state of flow while writing code.' });
      if (habits) recommendations.push({ product: habits, reason: 'Learn James Clear\'s proven guidelines to form deep work habits and structured learning routines.' });
    }

    // Fallback if DB query was empty
    if (recommendations.length === 0) {
      const fallbackProds = await Product.find({}).limit(2);
      fallbackProds.forEach(p => {
        recommendations.push({ product: p, reason: 'A popular high-quality item from our catalog to help achieve your targets.' });
      });
    }

    return res.json({
      success: true,
      goalName,
      intro,
      recommendations
    });
  } catch (error) {
    next(error);
  }
};
