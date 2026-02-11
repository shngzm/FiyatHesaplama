/**
 * DynamoDB ActivityLog Tablosu Oluşturma Script'i
 * 
 * Bu script ActivityLog tablosunu manuel olarak DynamoDB'de oluşturur.
 * AWS CLI veya AWS Console kullanarak bu komutu çalıştırabilirsiniz.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { CreateTableCommand } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const createActivityLogTable = async () => {
  const params = {
    TableName: 'ActivityLogs',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }, // Partition key
      { AttributeName: 'timestamp', KeyType: 'RANGE' } // Sort key
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'N' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'action', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'UserIdIndex',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'ActionIndex',
        KeySchema: [
          { AttributeName: 'action', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  };

  try {
    const command = new CreateTableCommand(params);
    const result = await client.send(command);
    console.log('✅ ActivityLog tablosu başarıyla oluşturuldu:', result.TableDescription.TableName);
    console.log('Tablo ARN:', result.TableDescription.TableArn);
    console.log('Tablo durumu:', result.TableDescription.TableStatus);
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log('⚠️ ActivityLog tablosu zaten mevcut.');
    } else {
      console.error('❌ Tablo oluşturma hatası:', error);
      throw error;
    }
  }
};

// Script'i çalıştır
createActivityLogTable()
  .then(() => {
    console.log('\n✅ İşlem tamamlandı.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ İşlem başarısız:', error);
    process.exit(1);
  });
