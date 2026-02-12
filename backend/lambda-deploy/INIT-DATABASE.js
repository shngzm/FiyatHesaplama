#!/usr/bin/env node

/**
 * DynamoDB Initialization Script
 * Bu script DynamoDB tablolarını oluşturur ve ilk admin kullanıcısını ekler
 * 
 * Kullanım:
 * 1. Lambda'da /api/init endpoint'ini çağırın
 * 2. Veya bu scripti lokal çalıştırın: node INIT-DATABASE.js
 */

import { CreateTableCommand, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { client, TABLES } from './src/config/dynamodb.js';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

const createTablesIfNotExist = async () => {
  console.log('🗄️  DynamoDB Tablolarını kontrol ediyorum...\n');

  // Mevcut tabloları listele
  const listCommand = new ListTablesCommand({});
  const existingTables = await client.send(listCommand);
  const tableNames = existingTables.TableNames || [];

  const tablesToCreate = [
    {
      name: TABLES.USERS,
      config: {
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
      }
    },
    {
      name: TABLES.MODELS,
      config: {
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
      }
    },
    {
      name: TABLES.PRODUCTS,
      config: {
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
      }
    },
    {
      name: TABLES.GOLD_PRICES,
      config: {
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
    },
    {
      name: TABLES.CUSTOMERS,
      config: {
        TableName: TABLES.CUSTOMERS,
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
    },
    {
      name: TABLES.ORDERS,
      config: {
        TableName: TABLES.ORDERS,
        KeySchema: [
          { AttributeName: 'id', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
          { AttributeName: 'id', AttributeType: 'S' },
          { AttributeName: 'customerId', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'CustomerIdIndex',
            KeySchema: [
              { AttributeName: 'customerId', KeyType: 'HASH' }
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
      }
    }
  ];

  for (const table of tablesToCreate) {
    if (tableNames.includes(table.name)) {
      console.log(`✅ ${table.name} - Zaten mevcut`);
    } else {
      try {
        await client.send(new CreateTableCommand(table.config));
        console.log(`✅ ${table.name} - Oluşturuldu`);
        // Tablo oluşturulduktan sonra biraz bekle
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ ${table.name} - Hata:`, error.message);
      }
    }
  }

  console.log('\n🎉 Tüm tablolar hazır!\n');
};

const createAdminUser = async () => {
  console.log('👤 Admin kullanıcısı oluşturuluyor...\n');

  try {
    // Sabit admin ID kullan (varsa güncelle, yoksa oluştur)
    const adminId = 'user-admin-mrc-001';
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('🔐 Password hashed for admin123');
    
    const adminUser = {
      id: adminId,
      username: 'mrc',
      email: 'admin@gramfiyat.com',
      password: hashedPassword,
      fullName: 'Admin User',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // DynamoDB'ye direkt yaz (varsa üzerine yaz)
    const { PutCommand } = await import('@aws-sdk/lib-dynamodb');
    const { default: ddbDocClient } = await import('./src/config/dynamodb.js');
    
    console.log('💾 Writing admin user to DynamoDB...');
    await ddbDocClient.send(new PutCommand({
      TableName: TABLES.USERS,
      Item: adminUser
    }));

    console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!');
    console.log('   ID:', adminUser.id);
    console.log('   Username: mrc');
    console.log('   Password: admin123');
    console.log('   Role: admin');
    console.log('   Hash:', hashedPassword.substring(0, 20) + '...');
    console.log('');
  } catch (error) {
    console.error('❌ Admin kullanıcısı oluşturulamadı:');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);
    throw error;
  }
};

// Ana fonksiyon
const initialize = async () => {
  console.log('\n🚀 DynamoDB Initialization Başlatılıyor...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    await createTablesIfNotExist();
    await createAdminUser();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✨ Initialization tamamlandı!\n');
    console.log('📝 Admin Login Bilgileri:');
    console.log('   URL: https://your-app.amplifyapp.com/admin/login');
    console.log('   Username: mrc');
    console.log('   Password: 6161\n');
  } catch (error) {
    console.error('❌ Initialization hatası:', error);
    process.exit(1);
  }
};

// Eğer doğrudan çalıştırılıyorsa
if (import.meta.url === `file://${process.argv[1]}`) {
  initialize()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default initialize;
