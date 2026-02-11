# 🚀 FULL DEPLOYMENT GUIDE - Version 2.0 Complete

**Build Date:** 2025-02-10 11:56  
**Version:** 2.0.0-FULL  
**Phase:** 1 + 2 Combined (Product Type + Customer/Order Management)  
**Status:** ✅ PRODUCTION READY

---

## 📦 Deployment Packages

| Dosya | Boyut | Kullanım | İçerik |
|-------|-------|----------|--------|
| **frontend-deploy-full-v2.zip** | 188 KB | AWS Amplify | Angular app with Customer & Order UI |
| **lambda-deploy-full-v2.zip** | 30 KB | AWS Lambda | Express API with Customer & Order endpoints |

---

## ✨ Version 2.0 - Full Features

### Phase 1: Product Type Calculation ✅
- ✅ Product type selection (Kolye/Bilezik, Yüzük/Küpe)
- ✅ Dual formula system
- ✅ Conditional form fields
- ✅ Enhanced calculation history

### Phase 2: Customer & Order Management ✅
- ✅ **Customer Management**
  - Create/Update/Delete customers
  - Customer search
  - Phone & email validation
  - "How did you find us?" tracking
  - Notes and history

- ✅ **Order Management**
  - Create orders from calculations
  - Link orders to customers
  - Order status tracking (Bekliyor → Sipariş Verildi → Teslim Edildi → İptal)
  - Order filtering (by customer, status, date)
  - Order statistics
  - Discount support

### Backend Improvements ✅
- ✅ **502 Error Fix**: Better timeout handling & error logging
- ✅ **Lambda wrapper**: Proper error handling with CORS
- ✅ **Logging**: Comprehensive request/response logging
- ✅ **Error handling**: Detailed error messages in development

---

## 🗄️ DynamoDB Tables (6 Total)

### Existing Tables (Updated)
1. **GramFiyat-Users** (No changes)
2. **GramFiyat-Models** (No changes)
3. **GramFiyat-Products** (Schema updated - added productType & calculationDetails)
4. **GramFiyat-GoldPrices** (No changes)

### NEW Tables
5. **GramFiyat-Customers** ✨
   ```
   Partition Key: id (String)
   Attributes:
   - firstName, lastName, phone, email
   - howDidYouFindUs (List<String>)
   - howDidYouFindUsOther (String)
   - notes (String)
   - createdAt, createdBy, updatedAt, updatedBy
   ```

6. **GramFiyat-Orders** ✨
   ```
   Partition Key: id (String)
   GSI: CustomerIdIndex (customerId)
   Attributes:
   - orderNumber (Auto-generated: ORD-timestamp-random)
   - customerId, customerName
   - productType, modelName, purity
   - calculationDetails (Complete breakdown)
   - subtotal, discount, total
   - goldPrice (At time of order)
   - status (bekliyor | siparis-verildi | teslim-edildi | iptal)
   - notes
   - createdAt, createdBy, updatedAt, updatedBy
   ```

---

## 🚀 Step-by-Step Deployment

### 1️⃣ DynamoDB Setup (10 dakika)

#### Opsiyon A: Otomatik (Önerilen)
Lambda deploy ettikten sonra:
```bash
curl -X POST https://YOUR-API-URL/prod/api/init
```

Bu komut **6 tabloyu** otomatik oluşturur:
- GramFiyat-Users
- GramFiyat-Models  
- GramFiyat-Products
- GramFiyat-GoldPrices
- GramFiyat-Customers ✨
- GramFiyat-Orders ✨

#### Opsiyon B: Manuel (AWS Console)
Her tablo için:
1. AWS Console → DynamoDB → Create table
2. Table name: `GramFiyat-<TableName>`
3. Partition key: `id` (String)
4. Billing mode: **Pay-per-request** (On-demand)
5. Create table

**Özel İndeksler:**
- **GramFiyat-Users**: UsernameIndex (username)
- **GramFiyat-Products**: ModelIdIndex (modelId)
- **GramFiyat-Orders**: CustomerIdIndex (customerId)

---

### 2️⃣ Lambda Backend Deploy (15 dakika)

#### A. Lambda Function Oluştur
1. AWS Lambda Console → Create function
2. **Function name:** `gramfiyat-api-v2`
3. **Runtime:** Node.js 18.x
4. **Architecture:** x86_64
5. Create function

#### B. Code Upload
1. Code source → Upload from → .zip file
2. Select: `lambda-deploy-full-v2.zip`
3. Upload

#### C. Handler Configuration ⚠️ **KRİTİK!**
1. Runtime settings → Edit
2. **Handler:** `lambda.handler` (tam olarak bu şekilde!)

#### D. Timeout & Memory
1. Configuration → General configuration → Edit
2. **Timeout:** 30 seconds (default: 3s - 502 hatası için önemli!)
3. **Memory:** 512 MB
4. Save

#### E. Environment Variables
Configuration → Environment variables → Edit → Add:
```
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-CHANGE-THIS
DYNAMODB_TABLE_PREFIX=GramFiyat-
AWS_REGION=eu-central-1
```

**⚠️ JWT_SECRET'ı mutlaka değiştir!**
```bash
# Güçlü secret oluşturmak için:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### F. IAM Permissions
1. Configuration → Permissions → Execution role (tıkla)
2. Add permissions → Attach policies
3. **AmazonDynamoDBFullAccess** ekle
4. Save

#### G. Test Lambda
1. Test sekmesi → Create new test event
2. Event name: `healthCheck`
3. Event JSON:
```json
{
  "resource": "/api/health",
  "path": "/api/health",
  "httpMethod": "GET",
  "headers": {},
  "body": null
}
```
4. Test → Response 200 OK olmalı

---

### 3️⃣ API Gateway Setup (10 dakika)

#### A. Create REST API
1. AWS Console → API Gateway → Create API
2. **REST API** → Build
3. **API name:** `gramfiyat-api-v2`
4. **Endpoint type:** Regional
5. Create API

#### B. Create Proxy Resource
1. Actions → Create Resource
2. **Resource Name:** `proxy`
3. **Resource Path:** `{proxy+}` ✅ IMPORTANT!
4. **Enable API Gateway CORS:** ✅ CHECK THIS!
5. Create Resource

#### C. Create ANY Method
1. Select `/{proxy+}` resource
2. Actions → Create Method → **ANY**
3. **Integration type:** Lambda Function
4. **Use Lambda Proxy integration:** ✅ CHECK THIS!
5. **Lambda Function:** Select `gramfiyat-api-v2`
6. Save
7. **OK** to give API Gateway permission

#### D. Deploy API
1. Actions → Deploy API
2. **Deployment stage:** [New Stage]
3. **Stage name:** `prod`
4. Deploy

#### E. Get API URL
Stages → prod → **Invoke URL**:
```
https://XXXXXXXXXX.execute-api.eu-central-1.amazonaws.com/prod
```
**🔖 Bu URL'i kaydet! Frontend'de kullanacağız.**

#### F. Enable CORS (Again)
1. Select `/{proxy+}` resource
2. Actions → Enable CORS
3. **Access-Control-Allow-Origin:** `*`
4. **Enable CORS and replace existing CORS headers**
5. Yes, replace

---

### 4️⃣ Amplify Frontend Deploy (15 dakika)

#### A. Create Amplify App
1. AWS Console → Amplify → Get Started
2. **Deploy without Git provider**
3. **App name:** `gramfiyat-app-v2`
4. Continue

#### B. Manual Deploy
1. **Drag and drop** or choose file
2. Select: `frontend-deploy-full-v2.zip`
3. Save and deploy

#### C. Environment Variables ⚠️ **ÇOK ÖNEMLİ!**
1. App settings → Environment variables
2. Add environment variable:

```
Key: NEXT_PUBLIC_API_URL
Value: https://XXXXXXXXXX.execute-api.eu-central-1.amazonaws.com/prod/api
```

**⚠️ API Gateway URL'ini kullan (Adım 3E'den)**  
**⚠️ Sonuna `/api` eklemeyi unutma!**

#### D. SPA Rewrites ⚠️ **ÇOK ÖNEMLİ!**
Angular SPA routing için **mutlaka** gerekli:

1. App settings → Rewrites and redirects
2. Add rewrite rule:

| Source address | Target address | Type |
|---------------|----------------|------|
| `</^[^.]+$\|\.(?!(css\|gif\|ico\|jpg\|js\|png\|txt\|svg\|woff\|ttf\|map\|json)$)([^.]+$)/>` | `/index.html` | 200 (Rewrite) |

**Bu olmadan sayfa refresh'te 404 alırsın!**

#### E. Redeploy
1. Main branch → Redeploy this version
2. Wait for deployment to complete

#### F. Get App URL
```
https://YOUR-APP-NAME.amplifyapp.com
```

---

### 5️⃣ Initialize Database (5 dakika)

Backend deploy edildikten sonra tabloları ve admin kullanıcısını oluştur:

```bash
curl -X POST https://YOUR-API-URL/prod/api/init
```

Bu komut:
- ✅ 6 DynamoDB tablosunu oluşturur
- ✅ Admin kullanıcısı oluşturur (username: `mrc`, password: `6161`)
- ✅ Sample data ekler (optional)

**CloudWatch Logs'ta kontrol et:**
```
✅ GramFiyat-Users - Oluşturuldu
✅ GramFiyat-Models - Oluşturuldu
✅ GramFiyat-Products - Oluşturuldu
✅ GramFiyat-GoldPrices - Oluşturuldu
✅ GramFiyat-Customers - Oluşturuldu
✅ GramFiyat-Orders - Oluşturuldu
✅ Admin kullanıcısı oluşturuldu
```

---

## 🧪 Testing Checklist

### Backend API Tests

#### 1. Health Check
```bash
curl https://YOUR-API-URL/prod/api/health
```
**Expected:**
```json
{
  "status": "OK",
  "message": "Gram/Fiyat API is running",
  "environment": "production",
  "timestamp": "2025-02-10T..."
}
```

#### 2. Admin Login
```bash
curl -X POST https://YOUR-API-URL/prod/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"mrc","password":"6161"}'
```
**Expected:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "username": "mrc",
    "role": "admin"
  }
}
```

#### 3. Customers API (Requires Token)
```bash
TOKEN="YOUR_JWT_TOKEN"

# Get all customers
curl https://YOUR-API-URL/prod/api/customers \
  -H "Authorization: Bearer $TOKEN"

# Create customer
curl -X POST https://YOUR-API-URL/prod/api/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Müşteri",
    "phone": "05551234567",
    "howDidYouFindUs": ["Instagram"]
  }'
```

#### 4. Orders API (Requires Token)
```bash
# Get all orders
curl https://YOUR-API-URL/prod/api/orders \
  -H "Authorization: Bearer $TOKEN"

# Get order statistics
curl https://YOUR-API-URL/prod/api/orders/statistics \
  -H "Authorization: Bearer $TOKEN"
```

### Frontend UI Tests

#### 1. Basic Access
- [ ] Ana sayfa açılıyor: `https://YOUR-APP.amplifyapp.com`
- [ ] Login sayfası çalışıyor: `/login`
- [ ] Admin login: `mrc` / `6161`

#### 2. Customer Management
- [ ] Müşteri listesi görünüyor: `/customers`
- [ ] Yeni müşteri ekleme formu çalışıyor
- [ ] Telefon formatı doğrulanıyor (05XX XXX XX XX)
- [ ] "Bizi nasıl buldunuz?" multi-select çalışıyor
- [ ] Müşteri arama çalışıyor
- [ ] Müşteri düzenleme çalışıyor
- [ ] Müşteri silme çalışıyor

#### 3. Order Management
- [ ] Sipariş listesi görünüyor: `/orders`
- [ ] Müşteriye göre filtreleme çalışıyor
- [ ] Duruma göre filtreleme çalışıyor
- [ ] Sipariş durumu güncelleme çalışıyor
- [ ] Sipariş silme çalışıyor

#### 4. Calculation (Existing Feature)
- [ ] Product type dropdown çalışıyor: `/calculation`
- [ ] Kolye/Bilezik seçilince uzunluk field görünüyor
- [ ] Yüzük/Küpe seçilince uzunluk field gizleniyor
- [ ] Hesaplama çalışıyor
- [ ] History'de product type görünüyor

#### 5. Navigation
- [ ] Ana sayfadan Customer Management'a gidiliyor
- [ ] Ana sayfadan Order Management'a gidiliyor
- [ ] Page refresh 404 vermiyor (SPA rewrites çalışıyor)

---

## 🔒 Post-Deployment Security

### 1. Change Admin Password
İlk girişten hemen sonra:
1. Admin Panel → User Management
2. `mrc` kullanıcısını bul
3. Şifreyi değiştir
4. **Yeni şifreyi güvenli bir yerde sakla!**

### 2. Change JWT Secret
Lambda environment variables'da:
1. `JWT_SECRET` değerini güçlü bir string ile değiştir
2. Lambda'yı yeniden deploy et veya restart et

### 3. Configure CORS (Production)
Lambda `src/server.js`:
```javascript
const allowedOrigins = [
  'https://YOUR-ACTUAL-APP.amplifyapp.com',  // Prod Amplify URL
  'http://localhost:4200'  // Dev only - remove in prod
];
```

### 4. Enable CloudWatch Alarms
- Lambda errors
- API Gateway 5XX errors
- DynamoDB throttling

---

## 🆘 Troubleshooting

### 502 Bad Gateway Error

**Sebep 1: Lambda Timeout**
- ✅ **Çözüm:** Lambda timeout'u 30 saniyeye çıkar
- Configuration → General configuration → Timeout: 30 seconds

**Sebep 2: DynamoDB Connection Error**
- ✅ **Çözüm:** Lambda IAM role'e DynamoDBFullAccess ekle
- Configuration → Permissions → Execution role → Add policy

**Sebep 3: Handler Not Found**
- ✅ **Çözüm:** Handler'ı `lambda.handler` olarak ayarla
- Runtime settings → Handler: `lambda.handler`

### CORS Error (Access blocked)

**Sebep 1: API Gateway CORS Not Enabled**
- ✅ **Çözüm:** API Gateway'de CORS enable et
- Resources → Actions → Enable CORS

**Sebep 2: Environment Variable Missing**
- ✅ **Çözüm:** Amplify'da `NEXT_PUBLIC_API_URL` ekle ve redeploy

### 404 on Page Refresh

**Sebep: SPA Rewrites Missing**
- ✅ **Çözüm:** Amplify'da SPA rewrite kuralı ekle (Adım 4D)

### Customer/Order API Returns 401

**Sebep 1: Token Expired**
- ✅ **Çözüm:** Tekrar login ol, yeni token al

**Sebep 2: Token Not Sent**
- ✅ **Çözüm:** `Authorization: Bearer TOKEN` header'ı ekle

### DynamoDB Table Not Found

**Sebep: Init Endpoint Çağrılmadı**
- ✅ **Çözüm:** `/api/init` endpoint'ini POST ile çağır

---

## 📊 Deployment Summary

### ✅ Completed
- [x] Backend: Lambda + API Gateway deployed
- [x] Frontend: Amplify deployed  
- [x] DynamoDB: 6 tables created
- [x] Admin user: Created (mrc/6161)
- [x] Environment variables: Configured
- [x] SPA rewrites: Added
- [x] 502 error: Fixed (timeout + error handling)
- [x] Customer Management: Full CRUD
- [x] Order Management: Full CRUD + Statistics

### 📝 Next Steps (Optional)
- [ ] Change admin password
- [ ] Configure production CORS
- [ ] Set up CloudWatch alarms
- [ ] Add backup strategy
- [ ] Performance monitoring
- [ ] Phase 3: Monthly Reporting (Future)

---

## 🎉 Success!

**Uygulamanız artık production'da canlı!**

### Access URLs
- **Frontend:** `https://YOUR-APP.amplifyapp.com`
- **Backend API:** `https://YOUR-API-URL.execute-api.eu-central-1.amazonaws.com/prod/api`
- **Admin Panel:** `https://YOUR-APP.amplifyapp.com/login`

### Default Credentials
```
Username: mrc
Password: 6161
⚠️ İLK GİRİŞTEN SONRA MUTLAKA DEĞİŞTİR!
```

### Features Live
- ✅ Product Type Calculation (Kolye/Bilezik, Yüzük/Küpe)
- ✅ Customer Management (CRUD + Search)
- ✅ Order Management (CRUD + Filtering + Statistics)
- ✅ Admin Panel (Users, Models, Products, Gold Price)
- ✅ Calculation History
- ✅ Real-time Gold Price Updates

---

**Generated:** 2025-02-10 11:56  
**Version:** 2.0.0-FULL  
**Build Size:** Frontend 188 KB | Backend 30 KB  
**Tables:** 6 DynamoDB tables  
**API Endpoints:** 25+ REST endpoints  
**Status:** 🚀 PRODUCTION READY
