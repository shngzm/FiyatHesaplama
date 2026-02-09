import express from 'express';
import { login, register, getCurrentUser, getAllUsers, deleteUser, initializeAdmin } from '../controllers/authController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/init', initializeAdmin);
router.get('/me', authenticateToken, getCurrentUser);
router.get('/users', authenticateToken, requireAdmin, getAllUsers);
router.delete('/users/:id', authenticateToken, requireAdmin, deleteUser);

export default router;
