import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';

const client = new DynamoDBClient({
  region: 'eu-central-1',
  endpoint: 'http://localhost:8000'
});

const docClient = DynamoDBDocumentClient.from(client);

async function resetAdminPassword() {
  try {
    // First, find admin user
    const scanParams = {
      TableName: 'GramFiyat-Users',
      FilterExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': 'admin'
      }
    };

    const scanResult = await docClient.send(new ScanCommand(scanParams));
    
    if (!scanResult.Items || scanResult.Items.length === 0) {
      console.log('❌ Admin user not found');
      return;
    }

    const adminUser = scanResult.Items[0];
    console.log('✅ Found admin user:', { id: adminUser.id, username: adminUser.username });

    // Hash new password
    const newPassword = 'admin123';
    const passwordHash = await bcrypt.hash(newPassword, 10);
    console.log('🔒 New password hash generated');

    // Update password
    const updateParams = {
      TableName: 'GramFiyat-Users',
      Key: { id: adminUser.id },
      UpdateExpression: 'SET password = :password, isActive = :active',
      ExpressionAttributeValues: {
        ':password': passwordHash,
        ':active': true
      }
    };

    await docClient.send(new UpdateCommand(updateParams));
    console.log('✅ Admin password reset successfully');
    console.log('Username: admin');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

resetAdminPassword();
