import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// @route   POST /api/customers
router.post('/', createCustomer);

// @route   GET /api/customers
router.get('/', getCustomers);

// @route   GET /api/customers/:id
router.get('/:id', getCustomerById);

// @route   PUT /api/customers/:id
router.put('/:id', updateCustomer);

// @route   DELETE /api/customers/:id
router.delete('/:id', deleteCustomer);

export default router;
