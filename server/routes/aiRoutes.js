import express from 'express';
import { chatWithAI, compareProducts, summarizeReviews } from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', chatWithAI);
router.post('/compare', compareProducts);
router.get('/reviews/summary/:productId', summarizeReviews);

export default router;
