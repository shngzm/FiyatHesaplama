import ActivityLog from '../models/ActivityLog.js';

export const getActivityLogs = async (req, res) => {
  try {
    const { userId, action, startDate, endDate, limit } = req.query;
    
    const filters = {};
    if (userId) filters.userId = userId;
    if (action) filters.action = action;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (limit) filters.limit = parseInt(limit);
    
    const logs = await ActivityLog.findAll(filters);
    
    res.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error) {
    console.error('[GET ACTIVITY LOGS ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs',
      error: error.message
    });
  }
};

export const getActivityStatistics = async (req, res) => {
  try {
    const { userId, action, startDate, endDate } = req.query;
    
    const filters = {};
    if (userId) filters.userId = userId;
    if (action) filters.action = action;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    
    const stats = await ActivityLog.getStatistics(filters);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[GET ACTIVITY STATISTICS ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity statistics',
      error: error.message
    });
  }
};
