import { client, TABLES, docClient } from '../config/dynamodb.js';
import { PutCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

class Order {
  /**
   * Create a new order
   * @param {Object} orderData
   * @returns {Promise<Object>}
   */
  static async create(orderData) {
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    const order = {
      id: uuidv4(),
      orderNumber,
      customerId: orderData.customerId,
      customerName: orderData.customerName, // Denormalized for quick access
      productType: orderData.productType, // 'kolye-bilezik' | 'yuzuk-kupe'
      modelName: orderData.modelName,
      purity: orderData.purity,
      calculationDetails: orderData.calculationDetails, // Complete calculation breakdown
      subtotal: orderData.subtotal,
      discount: orderData.discount || 0,
      total: orderData.total,
      notes: orderData.notes || null,
      status: orderData.status || 'bekliyor', // 'bekliyor' | 'siparis-verildi' | 'teslim-edildi' | 'iptal'
      goldPrice: orderData.goldPrice, // Gold price at time of order
      createdAt: new Date().toISOString(),
      createdBy: orderData.createdBy,
      updatedAt: new Date().toISOString(),
      updatedBy: orderData.createdBy
    };

    const command = new PutCommand({
      TableName: TABLES.ORDERS,
      Item: order
    });

    await docClient.send(command);
    return order;
  }

  /**
   * Get order by ID
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const command = new GetCommand({
      TableName: TABLES.ORDERS,
      Key: { id }
    });

    const result = await docClient.send(command);
    return result.Item || null;
  }

  /**
   * Get all orders with optional filters
   * @param {Object} filters
   * @returns {Promise<Array>}
   */
  static async findAll(filters = {}) {
    const params = {
      TableName: TABLES.ORDERS
    };

    const filterExpressions = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    // Filter by customerId
    if (filters.customerId) {
      filterExpressions.push('#customerId = :customerId');
      expressionAttributeNames['#customerId'] = 'customerId';
      expressionAttributeValues[':customerId'] = filters.customerId;
    }

    // Filter by status
    if (filters.status) {
      filterExpressions.push('#status = :status');
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = filters.status;
    }

    // Filter by createdBy
    if (filters.createdBy) {
      filterExpressions.push('createdBy = :createdBy');
      expressionAttributeValues[':createdBy'] = filters.createdBy;
    }

    // Filter by date range
    if (filters.startDate) {
      filterExpressions.push('createdAt >= :startDate');
      expressionAttributeValues[':startDate'] = filters.startDate;
    }

    if (filters.endDate) {
      filterExpressions.push('createdAt <= :endDate');
      expressionAttributeValues[':endDate'] = filters.endDate;
    }

    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(' AND ');
      params.ExpressionAttributeValues = expressionAttributeValues;
      if (Object.keys(expressionAttributeNames).length > 0) {
        params.ExpressionAttributeNames = expressionAttributeNames;
      }
    }

    const command = new ScanCommand(params);
    const result = await docClient.send(command);
    
    // Sort by createdAt descending
    return (result.Items || []).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  /**
   * Get orders by customer ID
   * @param {string} customerId
   * @returns {Promise<Array>}
   */
  static async findByCustomerId(customerId) {
    return this.findAll({ customerId });
  }

  /**
   * Update order
   * @param {string} id
   * @param {Object} updates
   * @param {string} updatedBy
   * @returns {Promise<Object>}
   */
  static async update(id, updates, updatedBy) {
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    // Build update expression dynamically
    const allowedFields = ['status', 'notes', 'discount', 'total', 'subtotal'];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateExpressions.push(`#${field} = :${field}`);
        expressionAttributeNames[`#${field}`] = field;
        expressionAttributeValues[`:${field}`] = updates[field];
      }
    });

    // Always update updatedAt and updatedBy
    updateExpressions.push('#updatedAt = :updatedAt');
    updateExpressions.push('#updatedBy = :updatedBy');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeNames['#updatedBy'] = 'updatedBy';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();
    expressionAttributeValues[':updatedBy'] = updatedBy;

    const command = new UpdateCommand({
      TableName: TABLES.ORDERS,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    const result = await docClient.send(command);
    return result.Attributes;
  }

  /**
   * Delete order
   * @param {string} id
   * @returns {Promise<void>}
   */
  static async delete(id) {
    const command = new DeleteCommand({
      TableName: TABLES.ORDERS,
      Key: { id }
    });

    await docClient.send(command);
  }

  /**
   * Get order statistics for a date range
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  static async getStatistics(filters = {}) {
    const orders = await this.findAll(filters);
    
    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
      averageOrderValue: 0,
      statusBreakdown: {
        bekliyor: 0,
        'siparis-verildi': 0,
        'teslim-edildi': 0,
        iptal: 0
      }
    };

    // Calculate average
    if (stats.totalOrders > 0) {
      stats.averageOrderValue = stats.totalRevenue / stats.totalOrders;
    }

    // Count by status
    orders.forEach(order => {
      if (stats.statusBreakdown.hasOwnProperty(order.status)) {
        stats.statusBreakdown[order.status]++;
      }
    });

    return stats;
  }
}

export default Order;
