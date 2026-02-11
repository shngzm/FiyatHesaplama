import Customer from '../models/Customer.js';

// @route   POST /api/customers
// @desc    Create a new customer
// @access  Private (Admin)
export const createCustomer = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, howDidYouFindUs, howDidYouFindUsOther, notes } = req.body;

    // Validation
    if (!firstName || !lastName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and phone are required'
      });
    }

    // Phone validation (Turkish format)
    const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    const customer = await Customer.create({
      firstName,
      lastName,
      phone: phone.replace(/\s/g, ''), // Remove spaces
      email,
      howDidYouFindUs,
      howDidYouFindUsOther,
      notes,
      createdBy: req.user.userId
    });

    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('[CREATE CUSTOMER ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error creating customer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @route   GET /api/customers
// @desc    Get all customers
// @access  Private (Admin)
export const getCustomers = async (req, res) => {
  try {
    const { search } = req.query;

    let customers;
    if (search) {
      customers = await Customer.search(search);
    } else {
      customers = await Customer.findAll();
    }

    res.json({
      success: true,
      data: customers,
      count: customers.length
    });
  } catch (error) {
    console.error('[GET CUSTOMERS ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @route   GET /api/customers/:id
// @desc    Get customer by ID
// @access  Private (Admin)
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByIdWithStats(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('[GET CUSTOMER ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @route   PUT /api/customers/:id
// @desc    Update customer
// @access  Private (Admin)
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if customer exists
    const existingCustomer = await Customer.findById(id);
    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Phone validation if phone is being updated
    if (updates.phone) {
      const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
      if (!phoneRegex.test(updates.phone.replace(/\s/g, ''))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format'
        });
      }
      updates.phone = updates.phone.replace(/\s/g, '');
    }

    const customer = await Customer.update(id, updates, req.user.userId);

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('[UPDATE CUSTOMER ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @route   DELETE /api/customers/:id
// @desc    Delete customer
// @access  Private (Admin)
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // TODO: Check if customer has orders, prevent deletion if they do
    // For now, allow deletion

    await Customer.delete(id);

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('[DELETE CUSTOMER ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
