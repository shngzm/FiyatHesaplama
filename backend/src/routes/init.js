import express from 'express';
import bcrypt from 'bcryptjs';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { CreateTableCommand, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import ddbDocClient, { client, TABLES } from '../config/dynamodb.js';

const router = express.Router();

// Initialize admin user (one-time setup)
router.post('/admin', async (req, res) => {
  try {
    console.log('[INIT] Checking for existing admin user...');
    
    // Check if admin already exists
    const scanParams = {
      TableName: 'GramFiyat-Users',
      FilterExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': 'admin'
      }
    };

    const existingUser = await ddbDocClient.send(new ScanCommand(scanParams));
    
    if (existingUser.Items && existingUser.Items.length > 0) {
      console.log('[INIT] Admin user already exists, updating...');
      // Update existing admin
      const adminUser = existingUser.Items[0];
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      const updateParams = {
        TableName: 'GramFiyat-Users',
        Item: {
          ...adminUser,
          password: passwordHash,
          isActive: true,
          updatedAt: new Date().toISOString()
        }
      };
      
      await ddbDocClient.send(new PutCommand(updateParams));
      
      return res.json({
        success: true,
        message: 'Admin user updated successfully',
        username: 'admin',
        password: 'admin123'
      });
    }

    // Create new admin user
    console.log('[INIT] Creating new admin user...');
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    const newAdmin = {
      id: `user_${Date.now()}_admin`,
      username: 'admin',
      password: passwordHash,
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const putParams = {
      TableName: 'GramFiyat-Users',
      Item: newAdmin
    };

    await ddbDocClient.send(new PutCommand(putParams));

    console.log('[INIT] Admin user created successfully');
    
    res.json({
      success: true,
      message: 'Admin user created successfully',
      username: 'admin',
      password: 'admin123'
    });

  } catch (error) {
    console.error('[INIT] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize admin user',
      error: error.message
    });
  }
});

// Create all DynamoDB tables (one-time setup)
router.post('/tables', async (req, res) => {
  try {
    console.log('[INIT] Creating DynamoDB tables...');
    
    // List existing tables
    const listCommand = new ListTablesCommand({});
    const existingTables = await client.send(listCommand);
    const tableNames = existingTables.TableNames || [];
    
    const tablesToCreate = [
      {
        name: TABLES.USERS,
        config: {
          TableName: TABLES.USERS,
          KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
          AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'username', AttributeType: 'S' }
          ],
          GlobalSecondaryIndexes: [{
            IndexName: 'UsernameIndex',
            KeySchema: [{ AttributeName: 'username', KeyType: 'HASH' }],
            Projection: { ProjectionType: 'ALL' },
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
          }],
          BillingMode: 'PAY_PER_REQUEST'
        }
      },
      {
        name: TABLES.MODELS,
        config: {
          TableName: TABLES.MODELS,
          KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
          AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
          BillingMode: 'PAY_PER_REQUEST'
        }
      },
      {
        name: TABLES.PRODUCTS,
        config: {
          TableName: TABLES.PRODUCTS,
          KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
          AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'modelId', AttributeType: 'S' }
          ],
          GlobalSecondaryIndexes: [{
            IndexName: 'ModelIdIndex',
            KeySchema: [{ AttributeName: 'modelId', KeyType: 'HASH' }],
            Projection: { ProjectionType: 'ALL' },
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
          }],
          BillingMode: 'PAY_PER_REQUEST'
        }
      },
      {
        name: TABLES.GOLD_PRICES,
        config: {
          TableName: TABLES.GOLD_PRICES,
          KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
          AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
          BillingMode: 'PAY_PER_REQUEST'
        }
      },
      {
        name: TABLES.CUSTOMERS,
        config: {
          TableName: TABLES.CUSTOMERS,
          KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
          AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
          BillingMode: 'PAY_PER_REQUEST'
        }
      },
      {
        name: TABLES.ORDERS,
        config: {
          TableName: TABLES.ORDERS,
          KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
          AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'customerId', AttributeType: 'S' }
          ],
          GlobalSecondaryIndexes: [{
            IndexName: 'CustomerIdIndex',
            KeySchema: [{ AttributeName: 'customerId', KeyType: 'HASH' }],
            Projection: { ProjectionType: 'ALL' },
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
          }],
          BillingMode: 'PAY_PER_REQUEST'
        }
      },
      {
        name: TABLES.ACTIVITY_LOGS,
        config: {
          TableName: TABLES.ACTIVITY_LOGS,
          KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
          AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'userId', AttributeType: 'S' },
            { AttributeName: 'timestamp', AttributeType: 'S' }
          ],
          GlobalSecondaryIndexes: [{
            IndexName: 'UserIdIndex',
            KeySchema: [
              { AttributeName: 'userId', KeyType: 'HASH' },
              { AttributeName: 'timestamp', KeyType: 'RANGE' }
            ],
            Projection: { ProjectionType: 'ALL' },
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
          }],
          BillingMode: 'PAY_PER_REQUEST'
        }
      }
    ];
    
    const results = [];
    
    for (const table of tablesToCreate) {
      if (tableNames.includes(table.name)) {
        console.log(`[INIT] Table ${table.name} already exists`);
        results.push({ table: table.name, status: 'exists' });
      } else {
        console.log(`[INIT] Creating table ${table.name}...`);
        const command = new CreateTableCommand(table.config);
        await client.send(command);
        results.push({ table: table.name, status: 'created' });
        console.log(`[INIT] Table ${table.name} created successfully`);
      }
    }
    
    res.json({
      success: true,
      message: 'DynamoDB tables initialized',
      results
    });
    
  } catch (error) {
    console.error('[INIT TABLES ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize tables',
      error: error.message
    });
  }
});

export default router;
