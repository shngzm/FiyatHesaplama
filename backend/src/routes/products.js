import express from 'express';
import { authenticateToken, requireAdmin, requireAdminOrManager } from '../middleware/auth.js';
import * as productController from '../controllers/productController.js';

const router = express.Router();

router.get('/', productController.getAllProducts);
router.get('/search', productController.getProductByModelAyarSira);
router.get('/:id', productController.getProductById);
router.post('/', authenticateToken, requireAdminOrManager, productController.createProduct);
router.put('/:id', authenticateToken, requireAdminOrManager, productController.updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, productController.deleteProduct);

export default router;
