import express from 'express';
import bcrypt from 'bcryptjs';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import ddbDocClient from '../config/dynamodb.js';

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

export default router;
