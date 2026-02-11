/**
 * Product Migration Script
 * 
 * Bu script mevcut Product kayıtlarını yeni yapıya (productType alanı eklenmiş) migrate eder.
 * Eski yapıdaki kolye/bilezik ve yüzük/küpe alanlarını productType'a dönüştürür.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const docClient = DynamoDBDocumentClient.from(client);

const migrateProducts = async () => {
  console.log('🔄 Product migration başlatılıyor...\n');

  try {
    // Tüm ürünleri al
    const scanCommand = new ScanCommand({
      TableName: 'Products'
    });
    const result = await docClient.send(scanCommand);
    const products = result.Items || [];

    console.log(`📦 Toplam ${products.length} ürün bulundu.\n`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      // Eğer zaten productType varsa, atla
      if (product.productType) {
        console.log(`⏭️ Ürün zaten migrate edilmiş: ${product.id}`);
        skippedCount++;
        continue;
      }

      // productType belirle
      let productType = 'Yüzük'; // Varsayılan
      
      // Eski yapıya göre productType'ı belirle
      // Eğer kesilenParca > 0 ise muhtemelen Kolye/Bilezik
      if (product.kesilenParca && product.kesilenParca > 0) {
        productType = 'Kolye/Bilezik';
      }

      // Güncellenen ürünü kaydet
      const updatedProduct = {
        ...product,
        productType,
        updatedAt: Date.now()
      };

      const putCommand = new PutCommand({
        TableName: 'Products',
        Item: updatedProduct
      });

      await docClient.send(putCommand);
      console.log(`✅ Migrate edildi: ${product.id} - ${productType}`);
      migratedCount++;
    }

    console.log(`\n📊 Migration tamamlandı:`);
    console.log(`   ✅ Migrate edilen: ${migratedCount}`);
    console.log(`   ⏭️ Atlanan: ${skippedCount}`);
    console.log(`   📦 Toplam: ${products.length}`);

  } catch (error) {
    console.error('❌ Migration hatası:', error);
    throw error;
  }
};

// Script'i çalıştır
migrateProducts()
  .then(() => {
    console.log('\n✅ İşlem tamamlandı.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ İşlem başarısız:', error);
    process.exit(1);
  });
