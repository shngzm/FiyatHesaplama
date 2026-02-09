import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import * as goldPriceController from '../controllers/goldPriceController.js';

const router = express.Router();

router.get('/', goldPriceController.getGoldPrice);
router.get('/history', goldPriceController.getGoldPriceHistory);
router.post('/', authenticateToken, requireAdmin, goldPriceController.updateGoldPrice);

export default router;
