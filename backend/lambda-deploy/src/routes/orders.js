import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createOrder,
  getOrders,
  getOrderById,
  getOrdersByCustomer,
  updateOrder,
  deleteOrder,
  getOrderStatistics
} from '../controllers/orderController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/orders/statistics
router.get('/statistics', getOrderStatistics);

// @route   GET /api/orders/customer/:customerId
router.get('/customer/:customerId', getOrdersByCustomer);

// @route   POST /api/orders
router.post('/', createOrder);

// @route   GET /api/orders
router.get('/', getOrders);

// @route   GET /api/orders/:id
router.get('/:id', getOrderById);

// @route   PUT /api/orders/:id
router.put('/:id', updateOrder);

// @route   DELETE /api/orders/:id
router.delete('/:id', deleteOrder);

export default router;
