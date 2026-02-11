import ActivityLog from '../models/ActivityLog.js';

// Actions to log
const LOGGABLE_ACTIONS = {
  'POST /api/customers': 'CREATE_CUSTOMER',
  'PUT /api/customers': 'UPDATE_CUSTOMER',
  'DELETE /api/customers': 'DELETE_CUSTOMER',
  'POST /api/orders': 'CREATE_ORDER',
  'PUT /api/orders': 'UPDATE_ORDER',
  'DELETE /api/orders': 'DELETE_ORDER',
  'POST /api/products': 'CREATE_PRODUCT',
  'PUT /api/products': 'UPDATE_PRODUCT',
  'DELETE /api/products': 'DELETE_PRODUCT',
  'POST /api/models': 'CREATE_MODEL',
  'PUT /api/models': 'UPDATE_MODEL',
  'DELETE /api/models': 'DELETE_MODEL',
  'POST /api/gold-price': 'UPDATE_GOLD_PRICE',
  'POST /api/auth/login': 'USER_LOGIN',
  'POST /api/auth/register': 'USER_REGISTER'
};

export const activityLogger = async (req, res, next) => {
  // Store original methods
  const originalJson = res.json;
  const originalSend = res.send;
  
  // Override res.json
  res.json = function(data) {
    logActivity(req, res, data);
    return originalJson.call(this, data);
  };
  
  // Override res.send
  res.send = function(data) {
    logActivity(req, res, data);
    return originalSend.call(this, data);
  };
  
  next();
};

async function logActivity(req, res, responseData) {
  try {
    // Only log successful requests (2xx status codes)
    if (res.statusCode < 200 || res.statusCode >= 300) {
      return;
    }
    
    const actionKey = `${req.method} ${req.path.split('?')[0]}`;
    const actionMatch = Object.keys(LOGGABLE_ACTIONS).find(key => {
      const pattern = key.replace(/:\w+/g, '[^/]+');
      return new RegExp(`^${pattern}`).test(actionKey);
    });
    
    if (!actionMatch) {
      return;
    }
    
    const action = LOGGABLE_ACTIONS[actionMatch];
    
    const logData = {
      userId: req.user?.id || 'anonymous',
      username: req.user?.username || 'anonymous',
      action,
      method: req.method,
      path: req.path,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      statusCode: res.statusCode
    };
    
    // Add resource ID if available
    if (req.params.id) {
      logData.resourceId = req.params.id;
    }
    
    // Add request body for create/update operations (exclude sensitive data)
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      const sanitizedBody = { ...req.body };
      delete sanitizedBody.password;
      delete sanitizedBody.token;
      logData.requestData = sanitizedBody;
    }
    
    await ActivityLog.create(logData);
  } catch (error) {
    // Don't fail the request if logging fails
    console.error('[ACTIVITY LOGGER ERROR]', error);
  }
}
