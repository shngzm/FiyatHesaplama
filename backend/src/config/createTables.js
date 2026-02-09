import { CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { client, TABLES } from './dynamodb.js';

const createTables = async () => {
  const tables = [
    {
      TableName: TABLES.USERS,
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'username', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'UsernameIndex',
          KeySchema: [
            { AttributeName: 'username', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          }
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    },
    {
      TableName: TABLES.MODELS,
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    },
    {
      TableName: TABLES.PRODUCTS,
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'modelId', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'ModelIdIndex',
          KeySchema: [
            { AttributeName: 'modelId', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          }
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    },
    {
      TableName: TABLES.GOLD_PRICES,
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    }
  ];

  for (const table of tables) {
    try {
      await client.send(new CreateTableCommand(table));
      console.log(`✅ Table created: ${table.TableName}`);
    } catch (error) {
      if (error.name === 'ResourceInUseException') {
        console.log(`ℹ️  Table already exists: ${table.TableName}`);
      } else {
        console.error(`❌ Error creating table ${table.TableName}:`, error.message);
      }
    }
  }
};

createTables().then(() => {
  console.log('🎉 Tables setup complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error setting up tables:', error);
  process.exit(1);
});
