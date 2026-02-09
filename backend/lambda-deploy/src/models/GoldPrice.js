import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import ddbDocClient, { TABLES } from '../config/dynamodb.js';

export default {
  async create(priceData) {
    const goldPrice = {
      id: uuidv4(),
      ...priceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await ddbDocClient.send(new PutCommand({
      TableName: TABLES.GOLD_PRICES,
      Item: goldPrice
    }));

    return goldPrice;
  },

  async find(options = {}) {
    const result = await ddbDocClient.send(new ScanCommand({
      TableName: TABLES.GOLD_PRICES,
      Limit: options.limit
    }));

    // Sort by createdAt descending
    const items = result.Items || [];
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (options.limit) {
      return items.slice(0, options.limit);
    }

    return items;
  },

  async findOne(options = {}) {
    const result = await this.find({ limit: 1 });
    return result.length > 0 ? result[0] : null;
  }
};
