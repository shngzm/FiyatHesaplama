# Product Table Migration Plan

## Değişiklik Özeti

Ürün modelini basitleştirmek için DynamoDB PRODUCTS tablosunda schema değişikliği gerekiyor.

### Eski Schema (Mevcut)
```
{
  id: String (PK),
  modelId: String (required),
  ayar: Number (required),
  sira: Number (required),
  birimCmTel: Number (required),
  kesilenParca: Number,
  digerAgirliklar: Number,
  iscilik: Number (required),
  subType: String ('yuzuk' | 'kupe' | null) // DEPRECATED
}
```

### Yeni Schema (Hedef)
```
{
  id: String (PK),
  productType: String (required) // 'kolye-bilezik' | 'yuzuk' | 'kupe'
  ayar: Number (required),
  iscilik: Number (required),
  
  // Kolye/Bilezik için zorunlu (optional for yuzuk/kupe)
  modelId: String,
  sira: Number,
  birimCmTel: Number,
  kesilenParca: Number,
  digerAgirliklar: Number,
  
  // Yüzük/Küpe için zorunlu (optional for kolye-bilezik)
  gram: Number
}
```

## Migration Stratejileri

### ✅ Strateji 1: Add Field & Default (ÖNERİLEN)

**장Avantajları:**
- Veri kaybı yok
- Kolay rollback
- Production'da güvenli

**Adımlar:**

1. **Backend güncellemesi (YAPILDI)**
   - Product.js modeli yeni schema'yı destekliyor
   - create() metodu productType validation yapıyor

2. **Mevcut verileri güncelle**
   ```bash
   # Tüm mevcut ürünlere productType ekle (kolye-bilezik olarak default)
   aws dynamodb scan --table-name PRODUCTS | \
   jq -r '.Items[].id.S' | \
   xargs -I {} aws dynamodb update-item \
     --table-name PRODUCTS \
     --key '{"id":{"S":"{}"}}' \
     --update-expression "SET productType = :type" \
     --expression-attribute-values '{":type":{"S":"kolye-bilezik"}}'
   ```

3. **Manuel düzeltme**
   - Admin panelinden yüzük/küpe ürünleri kontrol et
   - Gerekirse productType'larını 'yuzuk' veya 'kupe' olarak güncelle
   - Yüzük/Küpe ürünlerine gram değeri ekle

4. **subType alanını kaldır (opsiyonel)**
   ```bash
   # Artık kullanılmayan subType alanını sil
   aws dynamodb scan --table-name PRODUCTS | \
   jq -r '.Items[].id.S' | \
   xargs -I {} aws dynamodb update-item \
     --table-name PRODUCTS \
     --key '{"id":{"S":"{}"}}' \
     --update-expression "REMOVE subType"
   ```

### ⚠️ Strateji 2: Table Recreation (RİSKLİ)

**Dezavantajları:**
- Tüm ürün verisi kaybolur
- Hesaplamalar ve siparişler etkilenebilir
- Geri döndürülemez

**Sadece şu durumlarda kullan:**
- Test environment
- Henüz production'da veri yok
- Backup alındı

**Adımlar:**
1. Mevcut PRODUCTS tablosunun backup'ını al
2. Tabloyu sil: `aws dynamodb delete-table --table-name PRODUCTS`
3. createTables.js çalıştır (yeni schema ile)
4. Ürünleri yeniden ekle (admin panel veya script)

### 📋 Strateji 3: Dual Schema Support (GEÇİCİ)

Backend'de hem eski hem yeni schema'yı destekle, zamanla migrate et.

**Kod örneği:**
```javascript
async findOne(query) {
  // Yeni schema (productType var)
  if (query.productType) {
    if (query.productType === 'kolye-bilezik') {
      // modelId + ayar + sira ile ara
    } else {
      // productType + ayar + gram ile ara
    }
  }
  // Eski schema (backward compatibility)
  else if (query.modelId && query.ayar && query.sira) {
    // Eski mantık
  }
}
```

**Dezavantajları:**
- Karmaşık kod
- Maintenance yükü
- Uzun vadede teknik borç

## Önerilen Aksiyon Planı

### Production için (Eğer canlıda veri varsa):

1. **Şimdi:** Strateji 1'i uygula
   - Backend zaten hazır
   - AWS CLI ile mevcut ürünlere productType='kolye-bilezik' ekle
   - Manuel kontrol yap

2. **Test:** Yeni ürün ekleme ve hesaplama test et
   - Kolye/Bilezik: model + ölçüler
   - Yüzük: sadece gram
   - Küpe: sadece gram

3. **Deploy:** Frontend v4 ve Backend v4 beraber deploy et

### Test/Dev için:

1. **Şimdi:** Strateji 2'yi uygula
   - createTables.js'i çalıştır (otomatik tablo oluşturur)
   - Yeni ürünler ekle

2. **Test:** Tüm akışları test et

## Migration Script

```javascript
// backend/migrations/add-productType.js
import ddbDocClient, { TABLES } from '../src/config/dynamodb.js';
import { ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

async function migrateProducts() {
  console.log('Starting product migration...');
  
  // Get all products
  const result = await ddbDocClient.send(new ScanCommand({
    TableName: TABLES.PRODUCTS
  }));
  
  const products = result.Items || [];
  console.log(`Found ${products.length} products to migrate`);
  
  for (const product of products) {
    if (!product.productType) {
      // Default to kolye-bilezik
      await ddbDocClient.send(new UpdateCommand({
        TableName: TABLES.PRODUCTS,
        Key: { id: product.id },
        UpdateExpression: 'SET productType = :type',
        ExpressionAttributeValues: {
          ':type': 'kolye-bilezik'
        }
      }));
      console.log(`Migrated product ${product.id}`);
    }
  }
  
  console.log('Migration complete!');
}

migrateProducts().catch(console.error);
```

**Çalıştırma:**
```bash
cd backend
node migrations/add-productType.js
```

## Rollback Planı

Eğer bir şeyler ters giderse:

1. **Backend'i eski versiyona dön**
   - lambda-with-deps-v3.zip'i yeniden deploy et

2. **Frontend'i eski versiyona dön**
   - amplify-deploy-v3.zip'i yeniden upload et

3. **Database değişikliği geri alınamaz**
   - Ama productType alanı eklemek zararsızdır
   - Eski backend productType'ı görmezden gelir

## Checklist

### Önce Yap:
- [ ] Backend Product.js güncellemesi (✅ YAPILDI)
- [ ] Frontend product.model.ts güncellemesi (✅ YAPILDI)
- [ ] Frontend ProductManagement component (✅ YAPILDI)
- [ ] Frontend Calculation component (✅ YAPILDI)
- [ ] Migration script oluştur
- [ ] Test environment'ta test et

### Migration Günü:
- [ ] Backup al (AWS Console > DynamoDB > PRODUCTS > Export to S3)
- [ ] Migration script çalıştır
- [ ] Manuel kontrol yap (productType alanı tüm ürünlerde var mı?)
- [ ] Backend v4 deploy et
- [ ] Frontend v4 deploy et
- [ ] Smoke test (ürün ekle, hesapla, sipariş oluştur)

### Migration Sonrası:
- [ ] Yüzük/Küpe ürünleri kontrol et ve düzelt
- [ ] subType alanını kaldır (opsiyonel)
- [ ] Monitoring (CloudWatch logs)
- [ ] User feedback topla

## Sorular & Cevaplar

**S: Mevcut hesaplamalar ve siparişler etkilenir mi?**
C: Hayır. productType eklenmesi mevcut dataları bozmaz. Sadece yeni ürünler yeni schema'yı kullanır.

**S: Eski frontend çalışmaya devam eder mi?**
C: Evet, eski frontend modelId/ayar/sira ile çalışmaya devam eder. Ama productType gösteremez.

**S: Veri kaybı riski var mı?**
C: Strateji 1 (önerilen) ile veri kaybı riski YOK. Yeni alan ekleniyor, mevcut alanlar korunuyor.

**S: Ne kadar sürer?**
C: ~100 ürün için migration script 1-2 dakika. Manuel kontrol 5-10 dakika.

## Karar

**Hangi stratejiyi kullanacaksın? Bu dokümanı okuduktan sonra kullanıcıya sor.**

Eğer production'da az ürün varsa (< 50) → **Strateji 1**
Eğer hiç ürün yoksa → **Strateji 2** (tabloyu yeniden oluştur)
Eğer çok ürün varsa (> 100) → **Strateji 1 + Migration Script**
