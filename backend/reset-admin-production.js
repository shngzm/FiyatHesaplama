import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';

// PRODUCTION DynamoDB (AWS)
const client = new DynamoDBClient({
  region: 'eu-central-1'
  // endpoint yok - production AWS kullanacak
});

const docClient = DynamoDBDocumentClient.from(client);

async function resetAdminPassword() {
  try {
    console.log('🔍 Searching for admin user in PRODUCTION DynamoDB...');
    
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
      console.log('❌ Admin user not found in production');
      return;
    }

    const adminUser = scanResult.Items[0];
    console.log('✅ Found admin user:', { id: adminUser.id, username: adminUser.username, isActive: adminUser.isActive });

    // Hash new password
    const newPassword = 'admin123';
    const passwordHash = await bcrypt.hash(newPassword, 10);
    console.log('🔒 New password hash generated');

    // Update password and activate
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
    console.log('✅ PRODUCTION admin password reset successfully');
    console.log('Username: admin');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

resetAdminPassword();
