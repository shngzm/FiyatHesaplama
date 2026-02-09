import { PutCommand, GetCommand, QueryCommand, ScanCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import ddbDocClient, { TABLES } from '../config/dynamodb.js';

export default {
  async create(userData) {
    const user = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await ddbDocClient.send(new PutCommand({
      TableName: TABLES.USERS,
      Item: user
    }));

    return user;
  },

  async findById(id) {
    const result = await ddbDocClient.send(new GetCommand({
      TableName: TABLES.USERS,
      Key: { id }
    }));

    return result.Item;
  },

  async findByUsername(username) {
    const result = await ddbDocClient.send(new QueryCommand({
      TableName: TABLES.USERS,
      IndexName: 'UsernameIndex',
      KeyConditionExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': username.toLowerCase()
      }
    }));

    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
  },

  async findAll() {
    const result = await ddbDocClient.send(new ScanCommand({
      TableName: TABLES.USERS
    }));

    return result.Items || [];
  },

  async findOne(query) {
    if (query.username) {
      return this.findByUsername(query.username);
    }
    if (query.id) {
      return this.findById(query.id);
    }
    if (query.role) {
      const result = await ddbDocClient.send(new ScanCommand({
        TableName: TABLES.USERS,
        FilterExpression: '#role = :role',
        ExpressionAttributeNames: {
          '#role': 'role'
        },
        ExpressionAttributeValues: {
          ':role': query.role
        }
      }));
      return result.Items && result.Items.length > 0 ? result.Items[0] : null;
    }
    return null;
  },

  async update(id, updateData) {
    const updateExpression = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    Object.keys(updateData).forEach((key, index) => {
      updateExpression.push(`#attr${index} = :val${index}`);
      expressionAttributeNames[`#attr${index}`] = key;
      expressionAttributeValues[`:val${index}`] = updateData[key];
    });

    updateExpression.push(`#updatedAt = :updatedAt`);
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const result = await ddbDocClient.send(new UpdateCommand({
      TableName: TABLES.USERS,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    }));

    return result.Attributes;
  },

  async delete(id) {
    await ddbDocClient.send(new DeleteCommand({
      TableName: TABLES.USERS,
      Key: { id }
    }));
  }
};
