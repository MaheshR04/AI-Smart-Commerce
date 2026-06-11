import express from 'express';
import { chatWithAI, compareProducts, summarizeReviews, planGoalSetup, getCartSuggestions, getBudgetAdvice, getPersonalizedRecommendations } from '../controllers/aiController.js';
import { optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', optionalProtect, chatWithAI);
router.post('/compare', compareProducts);
router.get('/reviews/summary/:productId', summarizeReviews);
router.post('/plan-goal', planGoalSetup);
router.post('/cart-suggestions', getCartSuggestions);
router.post('/budget-advisor', getBudgetAdvice);
router.post('/personalized-recommendations', optionalProtect, getPersonalizedRecommendations);

export default router;
