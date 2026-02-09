import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: 'eu-central-1',
  endpoint: 'http://localhost:8000'
});

const docClient = DynamoDBDocumentClient.from(client);

const params = {
  TableName: 'GramFiyat-Users',
  Key: { id: '9969c0a2-86af-4620-af9c-ffe72b208b3d' },
  UpdateExpression: 'SET isActive = :active',
  ExpressionAttributeValues: {
    ':active': true
  }
};

docClient.send(new UpdateCommand(params))
  .then(() => {
    console.log('✅ Admin user activated');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
