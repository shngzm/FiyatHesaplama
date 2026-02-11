import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('[LOGIN] Attempt for username:', username);

    // Validation
    if (!username || !password) {
      console.log('[LOGIN] Missing credentials');
      return res.status(400).json({ 
        success: false,
        message: 'Username and password are required' 
      });
    }

    // Find user
    const user = await User.findByUsername(username);
    if (!user) {
      console.log('[LOGIN] User not found:', username);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    console.log('[LOGIN] User found:', { id: user.id, username: user.username, role: user.role, isActive: user.isActive });

    // Check if user is active
    if (!user.isActive) {
      console.log('[LOGIN] User inactive:', username);
      return res.status(403).json({ 
        success: false,
        message: 'Account is inactive' 
      });
    }

    // Verify password
    console.log('[LOGIN] Checking password for:', username);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('[LOGIN] Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('[LOGIN] Invalid password for:', username);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = generateToken(user.id);
    console.log('[LOGIN] Success for:', username);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('[LOGIN ERROR]', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @route   POST /api/auth/register
// @desc    Register new user (admin only in production)
// @access  Public (change to protected in production)
export const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Username and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }

    // Check if user exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Username already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username: username.toLowerCase(),
      password: hashedPassword,
      role: role || 'user',
      isActive: true
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration' 
    });
  }
};

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Protected
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @route   GET /api/auth/users
// @desc    Get all users (admin only)
// @access  Protected
export const getAllUsers = async (req, res) => {
  try {
    console.log('[GET_USERS] Fetching all users...');
    
    const users = await User.findAll();
    
    // Remove password from response
    const usersWithoutPassword = users.map(({ password, ...user }) => user);
    
    console.log('[GET_USERS] Found users:', usersWithoutPassword.length);
    
    res.json({
      success: true,
      users: usersWithoutPassword
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// @route   DELETE /api/auth/users/:id
// @desc    Delete user (admin only)
// @access  Protected
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('[DELETE_USER] Deleting user:', id);
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent deleting yourself
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const allUsers = await User.findAll();
      const adminCount = allUsers.filter(u => u.role === 'admin').length;
      
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last admin user'
        });
      }
    }
    
    // Delete user
    await User.delete(id);
    
    console.log('[DELETE_USER] User deleted successfully:', id);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during user deletion' 
    });
  }
};

// @route   POST /api/auth/init
// @desc    Initialize default admin user
// @access  Public (should be protected in production)
export const initializeAdmin = async (req, res) => {
  try {
    // Check if any admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({ 
        success: false,
        message: 'Admin user already exists' 
      });
    }

    const username = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await User.create({
      username,
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      username: admin.username
    });
  } catch (error) {
    console.error('Initialize admin error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during admin initialization' 
    });
  }
};
