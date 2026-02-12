import { PutCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import ddbDocClient, { TABLES } from '../config/dynamodb.js';

export default {
  async create(logData) {
    const log = {
      id: uuidv4(),
      ...logData,
      timestamp: new Date().toISOString()
    };

    await ddbDocClient.send(new PutCommand({
      TableName: TABLES.ACTIVITY_LOGS,
      Item: log
    }));

    return log;
  },

  async findAll(filters = {}) {
    const { userId, action, startDate, endDate, limit = 100 } = filters;
    
    let filterExpression = '';
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};
    
    const conditions = [];
    
    if (userId) {
      conditions.push('#userId = :userId');
      expressionAttributeNames['#userId'] = 'userId';
      expressionAttributeValues[':userId'] = userId;
    }
    
    if (action) {
      conditions.push('#action = :action');
      expressionAttributeNames['#action'] = 'action';
      expressionAttributeValues[':action'] = action;
    }
    
    if (startDate) {
      conditions.push('#timestamp >= :startDate');
      expressionAttributeNames['#timestamp'] = 'timestamp';
      expressionAttributeValues[':startDate'] = startDate;
    }
    
    if (endDate) {
      conditions.push('#timestamp <= :endDate');
      if (!expressionAttributeNames['#timestamp']) {
        expressionAttributeNames['#timestamp'] = 'timestamp';
      }
      expressionAttributeValues[':endDate'] = endDate;
    }
    
    if (conditions.length > 0) {
      filterExpression = conditions.join(' AND ');
    }
    
    const params = {
      TableName: TABLES.ACTIVITY_LOGS,
      Limit: limit
    };
    
    if (filterExpression) {
      params.FilterExpression = filterExpression;
      params.ExpressionAttributeNames = expressionAttributeNames;
      params.ExpressionAttributeValues = expressionAttributeValues;
    }
    
    const result = await ddbDocClient.send(new ScanCommand(params));
    
    // Sort by timestamp descending
    const items = result.Items || [];
    return items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async getStatistics(filters = {}) {
    const logs = await this.findAll(filters);
    
    const stats = {
      total: logs.length,
      byAction: {},
      byUser: {},
      byDate: {}
    };
    
    logs.forEach(log => {
      // By action
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
      
      // By user
      if (log.userId) {
        stats.byUser[log.userId] = (stats.byUser[log.userId] || 0) + 1;
      }
      
      // By date
      const date = log.timestamp.split('T')[0];
      stats.byDate[date] = (stats.byDate[date] || 0) + 1;
    });
    
    return stats;
  }
};
