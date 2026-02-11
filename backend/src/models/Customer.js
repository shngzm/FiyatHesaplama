import { client, TABLES, docClient } from '../config/dynamodb.js';
import { PutCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

class Customer {
  /**
   * Create a new customer
   * @param {Object} customerData
   * @returns {Promise<Object>}
   */
  static async create(customerData) {
    // Check if phone number already exists
    const existingCustomer = await this.findByPhone(customerData.phone);
    if (existingCustomer) {
      throw new Error('Bu telefon numarası ile kayıtlı bir müşteri zaten var');
    }

    const customer = {
      id: uuidv4(),
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      phone: customerData.phone,
      email: customerData.email || null,
      howDidYouFindUs: customerData.howDidYouFindUs || [],
      howDidYouFindUsOther: customerData.howDidYouFindUsOther || null,
      notes: customerData.notes || null,
      createdAt: new Date().toISOString(),
      createdBy: customerData.createdBy,
      updatedAt: new Date().toISOString(),
      updatedBy: customerData.createdBy
    };

    const command = new PutCommand({
      TableName: TABLES.CUSTOMERS,
      Item: customer
    });

    await docClient.send(command);
    return customer;
  }

  /**
   * Get customer by ID
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const command = new GetCommand({
      TableName: TABLES.CUSTOMERS,
      Key: { id }
    });

    const result = await docClient.send(command);
    return result.Item || null;
  }

  /**
   * Get all customers
   * @param {Object} filters
   * @returns {Promise<Array>}
   */
  static async findAll(filters = {}) {
    const params = {
      TableName: TABLES.CUSTOMERS
    };

    // Add filter by createdBy if provided
    if (filters.createdBy) {
      params.FilterExpression = 'createdBy = :createdBy';
      params.ExpressionAttributeValues = {
        ':createdBy': filters.createdBy
      };
    }

    const command = new ScanCommand(params);
    const result = await docClient.send(command);
    
    // Sort by createdAt descending
    return (result.Items || []).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  /**
   * Find customer by phone number
   * @param {string} phone
   * @returns {Promise<Object|null>}
   */
  static async findByPhone(phone) {
    const command = new ScanCommand({
      TableName: TABLES.CUSTOMERS,
      FilterExpression: 'phone = :phone',
      ExpressionAttributeValues: {
        ':phone': phone
      }
    });

    const result = await docClient.send(command);
    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
  }

  /**
   * Search customers by name or phone
   * @param {string} searchTerm
   * @returns {Promise<Array>}
   */
  static async search(searchTerm) {
    const command = new ScanCommand({
      TableName: TABLES.CUSTOMERS,
      FilterExpression: 'contains(firstName, :search) OR contains(lastName, :search) OR contains(phone, :search)',
      ExpressionAttributeValues: {
        ':search': searchTerm
      }
    });

    const result = await docClient.send(command);
    return result.Items || [];
  }

  /**
   * Update customer
   * @param {string} id
   * @param {Object} updates
   * @param {string} updatedBy
   * @returns {Promise<Object>}
   */
  static async update(id, updates, updatedBy) {
    // Check if phone number is being updated and if it already exists
    if (updates.phone) {
      const existingCustomer = await this.findByPhone(updates.phone);
      if (existingCustomer && existingCustomer.id !== id) {
        throw new Error('Bu telefon numarası ile kayıtlı başka bir müşteri zaten var');
      }
    }

    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    // Build update expression dynamically
    const allowedFields = ['firstName', 'lastName', 'phone', 'email', 'howDidYouFindUs', 'howDidYouFindUsOther', 'notes'];
    
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
      TableName: TABLES.CUSTOMERS,
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
   * Delete customer
   * @param {string} id
   * @returns {Promise<void>}
   */
  static async delete(id) {
    const command = new DeleteCommand({
      TableName: TABLES.CUSTOMERS,
      Key: { id }
    });

    await docClient.send(command);
  }

  /**
   * Get customer with order count
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  static async findByIdWithStats(id) {
    const customer = await this.findById(id);
    if (!customer) return null;

    // Get order count for this customer
    // We'll implement this after creating Order model
    customer.orderCount = 0;
    
    return customer;
  }
}

export default Customer;
