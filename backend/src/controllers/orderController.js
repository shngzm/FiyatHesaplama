import Order from '../models/Order.js';
import Customer from '../models/Customer.js';

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private (Admin)
export const createOrder = async (req, res) => {
  try {
    const {
      customerId,
      productType,
      modelName,
      purity,
      calculationDetails,
      subtotal,
      discount,
      total,
      notes,
      goldPrice
    } = req.body;

    // Validation
    if (!customerId || !productType || !modelName || !purity || !calculationDetails || !subtotal || total === undefined || !goldPrice) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Create order with customer name for quick access
    const order = await Order.create({
      customerId,
      customerName: `${customer.firstName} ${customer.lastName}`,
      productType,
      modelName,
      purity,
      calculationDetails,
      subtotal,
      discount: discount || 0,
      total,
      notes,
      goldPrice,
      createdBy: req.user.userId
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('[CREATE ORDER ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @route   GET /api/orders
// @desc    Get all orders with optional filters
// @access  Private (Admin)
export const getOrders = async (req, res) => {
  try {
    const { customerId, status, startDate, endDate } = req.query;

    const filters = {};
    if (customerId) filters.customerId = customerId;
    if (status) filters.status = status;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const orders = await Order.findAll(filters);

    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('[GET ORDERS ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @route   GET /api/orders/customer/:customerId
// @desc    Get all orders for a specific customer
// @access  Private (Admin)
export const getOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Check if customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const orders = await Order.findByCustomerId(customerId);

    res.json({
      success: true,
      data: orders,
      count: orders.length,
      customer: {
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`
      }
    });
  } catch (error) {
    console.error('[GET CUSTOMER ORDERS ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private (Admin)
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Optionally fetch customer details
    const customer = await Customer.findById(order.customerId);

    res.json({
      success: true,
      data: {
        ...order,
        customer: customer ? {
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone
        } : null
      }
    });
  } catch (error) {
    console.error('[GET ORDER ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @route   PUT /api/orders/:id
// @desc    Update order
// @access  Private (Admin)
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if order exists
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Validate status if being updated
    if (updates.status) {
      const validStatuses = ['bekliyor', 'siparis-verildi', 'teslim-edildi', 'iptal'];
      if (!validStatuses.includes(updates.status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }
    }

    const order = await Order.update(id, updates, req.user.userId);

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('[UPDATE ORDER ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @route   DELETE /api/orders/:id
// @desc    Delete order
// @access  Private (Admin)
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if order exists
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await Order.delete(id);

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('[DELETE ORDER ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @route   GET /api/orders/statistics
// @desc    Get order statistics
// @access  Private (Admin)
export const getOrderStatistics = async (req, res) => {
  try {
    const { startDate, endDate, customerId } = req.query;

    const filters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (customerId) filters.customerId = customerId;

    const stats = await Order.getStatistics(filters);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[GET ORDER STATISTICS ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
