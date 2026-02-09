import express from 'express';
import { authenticateToken, requireAdmin, requireAdminOrManager } from '../middleware/auth.js';
import * as modelController from '../controllers/modelController.js';

const router = express.Router();

router.get('/', modelController.getAllModels);
router.get('/:id', modelController.getModelById);
router.post('/', authenticateToken, requireAdminOrManager, modelController.createModel);
router.put('/:id', authenticateToken, requireAdminOrManager, modelController.updateModel);
router.delete('/:id', authenticateToken, requireAdmin, modelController.deleteModel);

export default router;
