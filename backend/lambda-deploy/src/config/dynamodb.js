import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

// Configure DynamoDB Client
const dynamoDBClientConfig = {
  region: process.env.AWS_REGION || 'eu-central-1'
};

// Use local DynamoDB if configured
if (process.env.USE_LOCAL_DYNAMODB === 'true') {
  dynamoDBClientConfig.endpoint = process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000';
  // For local DynamoDB, we need dummy credentials
  dynamoDBClientConfig.credentials = {
    accessKeyId: 'fakeAccessKeyId',
    secretAccessKey: 'fakeSecretAccessKey'
  };
}

const client = new DynamoDBClient(dynamoDBClientConfig);

// Create Document Client for easier data manipulation
const ddbDocClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true
  },
  unmarshallOptions: {
    wrapNumbers: false
  }
});

// Table names from environment
export const TABLES = {
  USERS: process.env.USERS_TABLE || 'GramFiyat-Users',
  MODELS: process.env.MODELS_TABLE || 'GramFiyat-Models',
  PRODUCTS: process.env.PRODUCTS_TABLE || 'GramFiyat-Products',
  GOLD_PRICES: process.env.GOLD_PRICES_TABLE || 'GramFiyat-GoldPrices',
  CUSTOMERS: process.env.CUSTOMERS_TABLE || 'GramFiyat-Customers',
  ORDERS: process.env.ORDERS_TABLE || 'GramFiyat-Orders',
  ACTIVITY_LOGS: process.env.ACTIVITY_LOGS_TABLE || 'GramFiyat-ActivityLogs'
};

console.log('✅ DynamoDB Client configured');
console.log('📍 Region:', dynamoDBClientConfig.region);
console.log('📊 Tables:', Object.keys(TABLES).join(', '));
if (process.env.USE_LOCAL_DYNAMODB === 'true') {
  console.log('🏠 Using Local DynamoDB:', dynamoDBClientConfig.endpoint);
}

export { client, ddbDocClient };
export { ddbDocClient as docClient };
export default ddbDocClient;
