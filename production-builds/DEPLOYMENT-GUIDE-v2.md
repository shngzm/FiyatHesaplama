# 🚀 AWS Deployment Paketleri - Version 2.0

## 📦 İçindekiler

Bu klasörde AWS'ye manuel deployment için hazırlanmış iki adet zip dosyası bulunmaktadır:

### 1. frontend-deploy-v2.zip (183 KB)
**Amplify için Frontend Paketi**
- ✅ Angular production build (optimized)
- ✅ 446.28 kB raw size → 105.04 kB transfer size
- ✅ Build time: ~4 seconds
- ✅ Tüm static assets dahil

### 2. lambda-deploy-v2.zip (27 KB)
**Lambda için Backend Paketi**  
- ✅ Lambda handler (lambda.js)
- ✅ Express server ve routes
- ✅ DynamoDB models ve controllers
- ✅ INIT-DATABASE.js (tablo oluşturma scripti)
- ❌ node_modules hariç (Lambda runtime'da yüklenecek)
- ❌ Local development dosyaları hariç

---

## 🎯 Phase 1 Features (Product Type Calculation)

Bu deployment paketi şu özellikleri içerir:

### ✨ Yeni Özellikler
1. **Product Type Selection:**
   - Kolye/Bilezik
   - Yüzük/Küpe

2. **Dual Formula Support:**
   - **Kolye/Bilezik:** `((Uzunluk - Kesilen Parça) * 1cm Tel) + Diğer Ağırlıklar`
   - **Yüzük/Küpe:** `(Sıra * 1cm Tel) + Diğer Ağırlıklar`

3. **Conditional Form Fields:**
   - Uzunluk field sadece Kolye/Bilezik için gösteriliyor
   - Her ürün tipi için özel validasyonlar

4. **Enhanced History:**
   - Product type bilgisi calculation history'de gösteriliyor
   - Her hesaplama için kullanılan formula breakdown'da açıkça belirtiliyor

---

## 📋 Deployment Adımları

### **1. DynamoDB Tablolarını Oluştur**

#### Opsiyon A: AWS Console'dan Manuel Oluştur
1. AWS Console → DynamoDB → Tables → Create table
2. Her tablo için aşağıdaki ayarları kullan:

| Tablo Adı | Partition Key | GSI (Global Secondary Index) |
|-----------|--------------|------------------------------|
| GramFiyat-Users | id (String) | UsernameIndex: username (String) |
| GramFiyat-Models | id (String) | - |
| GramFiyat-Products | id (String) | ModelIdIndex: modelId (String) |
| GramFiyat-GoldPrices | id (String) | - |

**Tüm tablolar için:**
- Billing mode: Pay-per-request (on-demand)
- Read/Write capacity: 1 unit (provisioned ise)

#### Opsiyon B: API Endpoint ile Otomatik Oluştur
Lambda deploy edildikten sonra:
```bash
curl -X POST https://YOUR-API-GATEWAY-URL/prod/api/init
```

---

### **2. Lambda Function Deploy**

#### 2.1. Lambda Oluştur
1. AWS Console → Lambda → Create function
2. **Basic information:**
   - Function name: `gramfiyat-api`
   - Runtime: **Node.js 18.x**
   - Architecture: x86_64

#### 2.2. Code Upload
1. **Code source** → Upload from → **.zip file**
2. `lambda-deploy-v2.zip` dosyasını seç ve upload et

#### 2.3. Handler Configuration ⚠️ **ÇOK ÖNEMLİ**
1. Runtime settings → Edit
2. Handler: `lambda.handler` (tam olarak bu şekilde)
   - ❌ Yanlış: `index.handler`, `lambda`, `handler`
   - ✅ Doğru: `lambda.handler`

#### 2.4. Environment Variables
Configuration → Environment variables → Edit:
```
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DYNAMODB_TABLE_PREFIX=GramFiyat-
AWS_REGION=eu-central-1
```

#### 2.5. IAM Role Permissions
1. Configuration → Permissions → Execution role
2. Role'e tıkla → Add permissions → Attach policies
3. **AmazonDynamoDBFullAccess** policy'sini ekle

#### 2.6. Test Lambda
1. Test sekmesi → Create new test event
2. Event name: `healthCheck`
3. Event JSON:
```json
{
  "resource": "/api/health",
  "path": "/api/health",
  "httpMethod": "GET",
  "headers": {}
}
```
4. Test → Response kontrol et (200 OK olmalı)

---

### **3. API Gateway Oluştur**

#### 3.1. Create REST API
1. AWS Console → API Gateway → Create API
2. REST API → Build
3. API name: `gramfiyat-api`
4. Endpoint type: Regional

#### 3.2. Create Resource
1. Actions → Create Resource
2. Resource name: `{proxy+}`
3. Enable API Gateway CORS: ✅

#### 3.3. Create Method
1. Select `{proxy+}` resource
2. Actions → Create Method → ANY
3. Integration type: Lambda Function
4. Lambda Function: `gramfiyat-api`
5. Use Lambda Proxy integration: ✅
6. Save

#### 3.4. Deploy API
1. Actions → Deploy API
2. Deployment stage: `[New Stage]`
3. Stage name: `prod`
4. Deploy

#### 3.5. CORS Configuration
1. Select `{proxy+}` resource
2. Actions → Enable CORS
3. Access-Control-Allow-Origin: `*`
4. Enable CORS → Yes

#### 3.6. Not API Gateway URL
Deploy edilen API'nin URL'ini kopyala:
```
https://xxxxxxxxxx.execute-api.eu-central-1.amazonaws.com/prod
```

---

### **4. Amplify Frontend Deploy**

#### 4.1. Create Amplify App
1. AWS Console → Amplify → Get Started
2. Deploy without Git provider
3. App name: `gramfiyat-app`

#### 4.2. Manual Deploy
1. Drag and drop or upload `frontend-deploy-v2.zip`
2. Deploy

#### 4.3. Environment Variables ⚠️ **ÖNEMLİ**
1. App settings → Environment variables
2. Add variable:
```
NEXT_PUBLIC_API_URL = https://xxxxxxxxxx.execute-api.eu-central-1.amazonaws.com/prod/api
```
(API Gateway URL'ini kullan)

#### 4.4. SPA Rewrites ⚠️ **ÇOK ÖNEMLİ**
Angular SPA olduğu için refresh'te 404 almamak için rewrites gerekli:

1. App settings → Rewrites and redirects
2. Add rewrite:

| Source address | Target address | Type |
|---------------|----------------|------|
| `</^[^.]+$\|\.(?!(css\|gif\|ico\|jpg\|js\|png\|txt\|svg\|woff\|ttf\|map\|json)$)([^.]+$)/>` | `/index.html` | 200 (Rewrite) |

#### 4.5. Redeploy
Environment variable ekledikten sonra:
1. Main branch → Redeploy this version

---

### **5. Admin Kullanıcısı Oluştur**

Lambda deploy edildikten sonra admin kullanıcısını oluştur:

#### Opsiyon A: API Endpoint ile
```bash
curl -X POST https://YOUR-API-GATEWAY-URL/prod/api/init
```

#### Opsiyon B: Lambda Console'dan Script Çalıştır
1. Lambda → Functions → gramfiyat-api
2. Test event oluştur:
```json
{
  "resource": "/api/init",
  "path": "/api/init",
  "httpMethod": "POST"
}
```
3. CloudWatch Logs'ta admin kullanıcısı oluşturulduğunu gör

**Default Admin Credentials:**
- Username: `mrc`
- Password: `6161`
- Role: `admin`

⚠️ **Üretimde mutlaka şifreyi değiştir!**

---

## 🧪 Testing

### 1. Backend Health Check
```bash
curl https://YOUR-API-GATEWAY-URL/prod/api/health
```
Beklenen response:
```json
{
  "status": "OK",
  "timestamp": "2025-02-10T...",
  "environment": "production"
}
```

### 2. Admin Login Test
```bash
curl -X POST https://YOUR-API-GATEWAY-URL/prod/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "mrc", "password": "6161"}'
```

### 3. Frontend Test
1. Amplify URL'ini tarayıcıda aç
2. Ana sayfa yüklenmeli
3. Admin → Login → `mrc` / `6161` ile giriş yap
4. Calculation sayfasında:
   - Product type dropdown çalışıyor mu?
   - Kolye/Bilezik seçince uzunluk field görünüyor mu?
   - Yüzük/Küpe seçince uzunluk field gizleniyor mu?
   - Hesaplama çalışıyor mu?
   - History'de product type görünüyor mu?

---

## 🔧 Troubleshooting

### Lambda Handler Error
**Hata:** `Cannot find module 'lambda'` veya `handler not found`
**Çözüm:** Handler'ı `lambda.handler` olarak ayarla (tam olarak bu şekilde)

### DynamoDB Access Error
**Hata:** `User: ... is not authorized to perform: dynamodb:PutItem`
**Çözüm:** Lambda execution role'e DynamoDBFullAccess policy ekle

### CORS Error (Frontend)
**Hata:** `Access to fetch blocked by CORS policy`
**Çözüm:** 
1. API Gateway'de CORS enable et
2. Lambda'da CORS headers zaten var (src/server.js)

### 404 on Page Refresh
**Hata:** Amplify'da sayfa refresh'te 404
**Çözüm:** SPA rewrites kuralını ekle (yukarıdaki adımda açıklandığı gibi)

### Environment Variable Not Working
**Hata:** API calls localhost'a gidiyor
**Çözüm:** 
1. Amplify environment variable ekle
2. App'i redeploy et
3. Browser cache temizle

---

## 📊 Deployment Checklist

### Backend (Lambda + API Gateway)
- [ ] DynamoDB tabloları oluşturuldu
- [ ] Lambda function oluşturuldu
- [ ] lambda-deploy-v2.zip upload edildi
- [ ] Handler `lambda.handler` olarak ayarlandı
- [ ] Environment variables eklendi
- [ ] IAM role DynamoDB access aldı
- [ ] API Gateway oluşturuldu
- [ ] API Gateway Lambda'ya bağlandı
- [ ] API deployed (prod stage)
- [ ] CORS enabled
- [ ] Health check çalışıyor
- [ ] Admin kullanıcısı oluşturuldu

### Frontend (Amplify)
- [ ] Amplify app oluşturuldu
- [ ] frontend-deploy-v2.zip upload edildi
- [ ] Environment variable eklendi (NEXT_PUBLIC_API_URL)
- [ ] SPA rewrites kuralı eklendi
- [ ] App redeployed
- [ ] Ana sayfa açılıyor
- [ ] Admin login çalışıyor
- [ ] Product type dropdown çalışıyor
- [ ] Hesaplamalar doğru çalışıyor

---

## 🎉 Deployment Tamamlandı!

Tüm adımları tamamladıysanız uygulamanız artık production'da çalışıyor!

**Uygulama URL'leri:**
- Frontend: `https://your-app-name.amplifyapp.com`
- Backend: `https://xxxxxxxxxx.execute-api.eu-central-1.amazonaws.com/prod/api`

**Admin Panel:**
- URL: `https://your-app-name.amplifyapp.com/admin/login`
- Username: `mrc`
- Password: `6161` (⚠️ değiştirin!)

---

## 📝 Next Steps

### Phase 2: Customer/Order Management
- Müşteri profili oluşturma
- Sipariş kayıt sistemi
- Müşteri bazlı işlem geçmişi
- Detaylı raporlama

Deployment için: `docs/ROADMAP.md` ve `docs/STATE.md` dosyalarına bakın.

---

**Generated:** 2025-02-10  
**Version:** 2.0.0  
**Phase:** 1 (Product Type Calculation)
