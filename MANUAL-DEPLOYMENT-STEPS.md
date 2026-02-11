# Manuel AWS Deployment Adımları

## 📦 Hazırlık
Bu rehberde kullanılacak dosyalar:
- `production-builds/frontend-deploy-final.zip` - Frontend
- `production-builds/lambda-deploy-final.zip` - Backend
- `backend/src/config/createTables.js` - DynamoDB initialization

---

## 🗄️ ADIM 1: DynamoDB Tablolarını Oluşturun

### Otomatik Yöntem (Lambda üzerinden):
1. Lambda'yı deploy ettikten sonra test event ile çağırın:
```json
{
  "httpMethod": "POST",
  "path": "/api/init",
  "body": "{}"
}
```

### Manuel Yöntem (AWS Console):

#### Tablo 1: GramFiyat-Users
```
Table name: GramFiyat-Users
Partition key: id (String)
Billing mode: Provisioned (1 RCU, 1 WCU)

Global Secondary Index:
  - Index name: UsernameIndex
  - Partition key: username (String)
  - Projection type: ALL
```

#### Tablo 2: GramFiyat-Models
```
Table name: GramFiyat-Models
Partition key: id (String)
Billing mode: Provisioned (1 RCU, 1 WCU)
```

#### Tablo 3: GramFiyat-Products
```
Table name: GramFiyat-Products
Partition key: id (String)
Billing mode: Provisioned (1 RCU, 1 WCU)

Global Secondary Index:
  - Index name: ModelIdIndex
  - Partition key: modelId (String)
  - Projection type: ALL
```

#### Tablo 4: GramFiyat-GoldPrices
```
Table name: GramFiyat-GoldPrices
Partition key: id (String)
Billing mode: Provisioned (1 RCU, 1 WCU)
```

---

## 🔧 ADIM 2: Lambda Backend Deployment

1. **AWS Console → Lambda → Functions → [Your Function]**

2. **Code Sekmesi:**
   - "Upload from" → ".zip file"
   - Dosya seç: `production-builds/lambda-deploy-final.zip`
   - "Save"

3. **⚠️ KRİTİK - Handler Ayarı:**
   - Configuration → General configuration → Edit
   - **Runtime settings:**
     ```
     Runtime: Node.js 18.x
     Handler: lambda.handler
     ```
   - "Save"

4. **Environment Variables:**
   - Configuration → Environment variables → Edit
   ```
   NODE_ENV = production
   JWT_SECRET = your-super-secret-jwt-key-change-this
   DYNAMODB_TABLE_PREFIX = GramFiyat-
   ```
   - "Save"

5. **Execution Role Permissions:**
   - Configuration → Permissions → Role name tıklayın
   - "Attach policies" → "AmazonDynamoDBFullAccess" ekleyin

6. **Test:**
   - Test sekmesi → "Create new test event"
   - Event name: `healthcheck`
   - Event JSON:
   ```json
   {
     "httpMethod": "GET",
     "path": "/health"
   }
   ```
   - "Test" → Response'da 200 gelirse ✅

---

## 🌐 ADIM 3: API Gateway URL

1. **AWS Console → API Gateway → [Your API]**

2. **Stages → prod**

3. **Invoke URL'i kopyalayın:**
   ```
   https://xxxxxx.execute-api.eu-central-1.amazonaws.com/prod
   ```

4. **Bu URL'i not alın** - Frontend'de kullanılacak

---

## 🎨 ADIM 4: Frontend Deployment (Amplify)

1. **AWS Amplify Console → "New app" → "Deploy without Git"**

2. **App name:** `GramFiyat` veya istediğiniz isim

3. **Manual deployment:**
   - "Choose files" veya sürükle-bırak
   - Dosya: `production-builds/frontend-deploy-final.zip`
   - "Save and deploy"

4. **Deployment tamamlanınca URL'inizi alın:**
   ```
   https://xxxxxx.amplifyapp.com
   ```

---

## 🔗 ADIM 5: Frontend'i Backend'e Bağlayın

1. **Amplify Console → App → "App settings" → "Environment variables"**

2. **"Manage variables" → Ekleyin:**
   ```
   Variable: NEXT_PUBLIC_API_URL
   Value: https://xxxxxx.execute-api.eu-central-1.amazonaws.com/prod/api
   ```
   ⚠️ Sonuna `/api` eklemeyi unutmayın!

3. **"Save"**

4. **"Deployments" → "Redeploy this version"**

---

## 🔄 ADIM 6: SPA Rewrite Rules (404 FIX)

**ÇOK ÖNEMLİ:** Bu olmadan sayfa yenileme 404 verir!

1. **Amplify Console → "App settings" → "Rewrites and redirects"**

2. **"Add rule" → Şu kuralı ekleyin:**
   ```
   Source:
   </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>

   Target:
   /index.html

   Type:
   200 (Rewrite)
   ```

3. **"Save"**

---

## ✅ ADIM 7: İlk Admin Kullanıcısı Oluşturma

Backend deploy edildikten sonra ilk admin kullanıcısını oluşturun:

### Lambda Test Event:
```json
{
  "httpMethod": "POST",
  "path": "/api/init",
  "body": "{}"
}
```

Bu çağrı:
- ✅ Tabloları oluşturur (varsa atlar)
- ✅ Admin kullanıcısı oluşturur (username: `mrc`, password: `6161`)

---

## 🧪 ADIM 8: Test Senaryoları

### 1. Frontend Test:
```
https://xxxxxx.amplifyapp.com
```
- ✅ Ana sayfa yükleniyor mu?
- ✅ "Ürün Tipi" dropdown'u var mı? (Kolye/Bilezik, Yüzük/Küpe)
- ✅ Yüzük/Küpe seçince uzunluk alanı gizleniyor mu?

### 2. Admin Login Test:
```
https://xxxxxx.amplifyapp.com/admin/login
```
- Username: `mrc`
- Password: `6161`
- ✅ Giriş yapabiliyor musunuz?

### 3. API Health Check:
```bash
curl https://xxxxxx.execute-api.....amazonaws.com/prod/health
```
Response: `{"status":"ok","timestamp":"..."}`

### 4. Admin Token Alma:
```bash
curl -X POST https://xxxxxx.execute-api.....amazonaws.com/prod/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"mrc","password":"6161"}'
```
Response: `{"token":"eyJhbG...","user":{...}}`

---

## 🐛 Sorun Giderme

### Lambda 502 Bad Gateway:
```
CloudWatch → Log groups → /aws/lambda/[your-function]
```
- Handler `lambda.handler` mi?
- Environment variables doğru mu?
- DynamoDB permissions var mı?

### Frontend API bağlanamıyor:
- Browser Console (F12) → Network sekmesi
- API URL doğru mu? (`NEXT_PUBLIC_API_URL`)
- CORS hatası varsa API Gateway CORS check

### 404 on page refresh:
- SPA rewrite rules eklendi mi?
- Amplify → Rewrites and redirects kontrol

### DynamoDB Access Denied:
- Lambda Execution Role → Policies → DynamoDBFullAccess ekle

---

## 📊 Deployment Checklist

- [ ] DynamoDB tabloları oluşturuldu
- [ ] Lambda backend deploy edildi
- [ ] Handler `lambda.handler` olarak ayarlandı
- [ ] Environment variables eklendi
- [ ] Lambda execution role'e DynamoDB permission eklendi
- [ ] API Gateway URL alındı
- [ ] Frontend Amplify'a deploy edildi
- [ ] NEXT_PUBLIC_API_URL environment variable eklendi
- [ ] Frontend redeploy edildi
- [ ] SPA rewrite rules eklendi
- [ ] Admin kullanıcısı oluşturuldu (/api/init)
- [ ] Frontend'den admin login test edildi
- [ ] Hesaplama test edildi
- [ ] Yeni feature (Ürün Tipi) test edildi

---

## 🎯 Deployment Sonrası

✅ **Frontend URL:** https://xxxxxx.amplifyapp.com  
✅ **API URL:** https://xxxxxx.execute-api.....amazonaws.com/prod  
✅ **Admin Login:** mrc / 6161  
✅ **Yeni Özellik:** Ürün Tipi Seçimi (Kolye/Bilezik vs Yüzük/Küpe)  

**Version:** 2.0.0 - Phase 1 Complete  
**Date:** 2026-02-10

---

**Notlar:**
- İlk deployment sonrası altın kuru gerçek API'den gelmeyebilir (normal)
- CloudWatch logs'u düzenli kontrol edin
- DynamoDB On-Demand billing'e geçmek için tablolarda "Edit" → "On-demand"
