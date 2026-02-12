import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  getActivityLogs,
  getActivityStatistics
} from '../controllers/activityLogController.js';

const router = express.Router();

// All routes require authentication and admin role
router.get('/', authenticate, requireAdmin, getActivityLogs);
router.get('/statistics', authenticate, requireAdmin, getActivityStatistics);

export default router;
