import { PutCommand, GetCommand, ScanCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import ddbDocClient, { TABLES } from '../config/dynamodb.js';

export default {
  async create(productData) {
    // Validate required fields
    if (!productData.productType) {
      throw new Error('productType alanı zorunludur');
    }
    if (!productData.ayar) {
      throw new Error('ayar alanı zorunludur');
    }
    if (productData.iscilik === undefined || productData.iscilik === null) {
      throw new Error('iscilik alanı zorunludur');
    }

    // Validate conditional fields based on productType
    if (productData.productType === 'kolye-bilezik') {
      if (!productData.modelId) {
        throw new Error('Kolye/Bilezik için modelId zorunludur');
      }
      if (!productData.sira) {
        throw new Error('Kolye/Bilezik için sıra zorunludur');
      }
      if (!productData.birimCmTel) {
        throw new Error('Kolye/Bilezik için birimCmTel zorunludur');
      }
    } else if (productData.productType === 'yuzuk' || productData.productType === 'kupe') {
      if (!productData.gram) {
        throw new Error('Yüzük/Küpe için gram zorunludur');
      }
    } else {
      throw new Error('Geçersiz productType. Geçerli değerler: kolye-bilezik, yuzuk, kupe');
    }

    const product = {
      id: uuidv4(),
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await ddbDocClient.send(new PutCommand({
      TableName: TABLES.PRODUCTS,
      Item: product
    }));

    return product;
  },

  async find() {
    const result = await ddbDocClient.send(new ScanCommand({
      TableName: TABLES.PRODUCTS
    }));

    return result.Items || [];
  },

  async findById(id) {
    const result = await ddbDocClient.send(new GetCommand({
      TableName: TABLES.PRODUCTS,
      Key: { id }
    }));

    return result.Item;
  },

  async findOne(query) {
    if (query.modelId && query.ayar && query.sira) {
      const result = await ddbDocClient.send(new ScanCommand({
        TableName: TABLES.PRODUCTS,
        FilterExpression: 'modelId = :modelId AND ayar = :ayar AND sira = :sira',
        ExpressionAttributeValues: {
          ':modelId': query.modelId,
          ':ayar': query.ayar,
          ':sira': query.sira
        }
      }));
      return result.Items && result.Items.length > 0 ? result.Items[0] : null;
    }
    return null;
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
      TableName: TABLES.PRODUCTS,
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
        TableName: TABLES.PRODUCTS,
        Key: { id }
      }));
    }
    return item;
  },

  // Populate helper (since DynamoDB doesn't have joins)
  async populate(product, field) {
    if (!product) return null;
    
    if (field === 'modelId' && product.modelId) {
      const Model = (await import('./Model.js')).default;
      const model = await Model.findById(product.modelId);
      return { ...product, modelId: model };
    }
    
    return product;
  }
};
