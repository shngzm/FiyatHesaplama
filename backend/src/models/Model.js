import { PutCommand, GetCommand, ScanCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import ddbDocClient, { TABLES } from '../config/dynamodb.js';

export default {
  async create(modelData) {
    const model = {
      id: uuidv4(),
      ...modelData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await ddbDocClient.send(new PutCommand({
      TableName: TABLES.MODELS,
      Item: model
    }));

    return model;
  },

  async find() {
    const result = await ddbDocClient.send(new ScanCommand({
      TableName: TABLES.MODELS
    }));

    return result.Items || [];
  },

  async findById(id) {
    const result = await ddbDocClient.send(new GetCommand({
      TableName: TABLES.MODELS,
      Key: { id }
    }));

    return result.Item;
  },

  async findByIdAndUpdate(id, updateData, options = {}) {
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
      TableName: TABLES.MODELS,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    }));

    return result.Attributes;
  },

  async findByIdAndDelete(id) {
    const item = await this.findById(id);
    if (item) {
      await ddbDocClient.send(new DeleteCommand({
        TableName: TABLES.MODELS,
        Key: { id }
      }));
    }
    return item;
  }
};
