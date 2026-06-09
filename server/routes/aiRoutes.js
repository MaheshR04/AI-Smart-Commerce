import express from 'express';
import { chatWithAI, compareProducts, summarizeReviews, planGoalSetup } from '../controllers/aiController.js';
import { optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', optionalProtect, chatWithAI);
router.post('/compare', compareProducts);
router.get('/reviews/summary/:productId', summarizeReviews);
router.post('/plan-goal', planGoalSetup);

export default router;
