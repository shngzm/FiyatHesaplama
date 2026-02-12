import { PutCommand, GetCommand, QueryCommand, ScanCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import ddbDocClient, { TABLES } from '../config/dynamodb.js';

export default {
  async create(userData) {
    const timestamp = new Date().toISOString();
    const user = {
      id: `user-${uuidv4()}`,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      fullName: userData.fullName || '',
      role: userData.role || 'user',
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    try {
      console.log('Creating user in DynamoDB:', { username: user.username, role: user.role });
      
      await ddbDocClient.send(new PutCommand({
        TableName: TABLES.USERS,
        Item: user,
        ConditionExpression: 'attribute_not_exists(id)'
      }));
      
      console.log('User created successfully:', user.id);
      
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('User.create error:', error);
      
      if (error.name === 'ResourceNotFoundException') {
        throw new Error(`Users table (${TABLES.USERS}) does not exist. Run INIT-DATABASE.js first.`);
      }
      
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('User ID already exists (UUID collision - very rare)');
      }
      
      throw new Error(`Failed to create user: ${error.message}`);
    }
  },

  async findById(id) {
    const result = await ddbDocClient.send(new GetCommand({
      TableName: TABLES.USERS,
      Key: { id }
    }));

    return result.Item;
  },

  async findByUsername(username) {
    try {
      console.log('Finding user by username:', username);
      
      const result = await ddbDocClient.send(new QueryCommand({
        TableName: TABLES.USERS,
        IndexName: 'UsernameIndex',
        KeyConditionExpression: 'username = :username',
        ExpressionAttributeValues: {
          ':username': username.toLowerCase()
        }
      }));

      console.log('Query result:', result.Items?.length || 0, 'items found');
      return result.Items && result.Items.length > 0 ? result.Items[0] : null;
    } catch (error) {
      console.error('User.findByUsername error:', error);
      
      if (error.name === 'ResourceNotFoundException') {
        throw new Error(`Users table (${TABLES.USERS}) or UsernameIndex does not exist`);
      }
      
      throw new Error(`Failed to find user: ${error.message}`);
    }
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
