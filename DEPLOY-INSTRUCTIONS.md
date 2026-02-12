# Deployment Instructions

## Değişiklik Özeti (2025-02-12)

### 🔧 Backend Düzeltmeleri
- ✅ Product validation: Yüzük/Küpe için `sıra` field'ı optional yapıldı
- ✅ Tüm export hataları düzeltildi (docClient, authenticate)
- ✅ Express trust proxy ve rate limiter ayarları yapıldı

### 🎨 Frontend Düzeltmeleri  
- ✅ Model entity'ye `productType` field'ı eklendi
- ✅ Calculation component: Model filtering productType'a göre yapılıyor
- ✅ Sıra field'ı sadece Kolye/Bilezik için gösteriliyor (conditional rendering)
- ✅ Ürün Tipi → Model Seçimi → Ayar → Sıra (sadece Kolye/Bilezik) → Hesapla akışı
- ✅ `subType` field'ı tamamen kaldırıldı

### 📦 Hazırlanan Paketler
- Backend: `backend-lambda-deploy.zip` (52 KB)
- Frontend: `dist/fiyat-hesaplama/` (build complete)

---

## Backend Deployment (AWS Lambda)

### Option 1: AWS Console (Web UI)
1. AWS Console → Lambda → `gram-fiyat-hesaplama-backend`
2. **Code** tab → **Upload from** → **.zip file**
3. `backend/lambda-deploy/backend-lambda-deploy.zip` dosyasını seç
4. **Save** → **Deploy**

### Option 2: AWS CLI
```bash
cd backend/lambda-deploy
aws lambda update-function-code \
  --function-name gram-fiyat-hesaplama-backend \
  --zip-file fileb://backend-lambda-deploy.zip
```

---

## Frontend Deployment (AWS Amplify)

### Option 1: Git Push (Otomatik Deploy)
```bash
cd /Users/gizemesmer/Desktop/personal/fiyathesaplama
git add .
git commit -m "fix: Model filtering by productType, conditional sıra field"
git push origin main
```
Amplify otomatik olarak build edip deploy edecek.

### Option 2: Manuel Deploy (Amplify Console)
1. AWS Amplify Console → `gram-fiyat-hesaplama` app
2. **Hosting** → **Manual deploy**
3. `dist/fiyat-hesaplama/` klasörünü zip'le ve upload et

---

## Database Migration (DynamoDB)

### Model Tablosuna productType Ekleme
Mevcut modellere `productType` field'ı eklenmeli:

```bash
# Örnek: Model #1'e productType ekle
aws dynamodb update-item \
  --table-name GramFiyat-Models \
  --key '{"id": {"S": "MODEL_ID"}}' \
  --update-expression "SET productType = :pt" \
  --expression-attribute-values '{":pt": {"S": "Kolye/Bilezik"}}'
```

Ya da AWS Console'dan:
1. DynamoDB → Tables → `GramFiyat-Models`
2. **Explore table items**
3. Her model için **Edit** → `productType` field ekle (`Kolye/Bilezik`, `Yüzük`, `Küpe`)

**Önemli:** Yeni modeller eklerken `productType` field'ını mutlaka belirtin!

---

## Admin User Oluşturma

Eğer admin kullanıcı yoksa:

```bash
cd backend/lambda-deploy
node INIT-DATABASE.js
```

Ya da AWS DynamoDB Console'dan manuel ekle:
- Table: `GramFiyat-Users`
- Item:
  ```json
  {
    "id": "admin-001",
    "username": "mrc",
    "password": "$2a$10$qBh1NC5uRbZp04Vrrk5jpe6PUXB1NIDzcN1vJL399Y6Pn2QP9KGVK",
    "role": "admin",
    "firstName": "Admin",
    "lastName": "User",
    "createdAt": "2025-02-12T12:00:00Z"
  }
  ```
Şifre: `admin123`

---

## Test Adımları

### 1. Backend Test
```bash
curl -X POST https://YOUR_LAMBDA_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "mrc", "password": "admin123"}'
```

### 2. Frontend Test
1. https://YOUR_AMPLIFY_URL açın
2. `mrc` / `admin123` ile giriş yapın
3. **Model Yönetimi** → Yeni model ekleyin (productType seçin!)
4. **Hesaplama** → Ürün tipi seçin → Modeller filtrelenmiş olmalı
5. Kolye/Bilezik seçerseniz → Sıra field'ı gösterilmeli
6. Yüzük/Küpe seçerseniz → Sıra field'ı GİZLENMELİ

---

## Environment URLs

- **Frontend (Staging):** https://d12wynbw2ij4ni.amplifyapp.com
- **Backend (Lambda):** https://YOUR_LAMBDA_FUNCTION_URL
- **DynamoDB Region:** eu-central-1

---

## Kritik Notlar

1. **Model entity productType field'ı YENİ!** Mevcut modellere productType eklenmeli
2. **Validation değişti:** Yüzük/Küpe için `sıra` artık optional
3. **UI değişti:** Sıra field'ı conditional rendering (sadece Kolye/Bilezik)
4. **subType kaldırıldı:** Artık sadece productType var

---

## Rollback (Geri Alma)

Eğer sorun çıkarsa:

### Backend Rollback
```bash
# Önceki version'a dön
aws lambda update-function-code \
  --function-name gram-fiyat-hesaplama-backend \
  --s3-bucket YOUR_BACKUP_BUCKET \
  --s3-key previous-version.zip
```

### Frontend Rollback
Amplify Console → **Deployments** → Previous deployment → **Redeploy**

---

**Deploy Date:** 2025-02-12  
**Version:** 2.1.1  
**Changes:** Model filtering by productType, conditional sıra field for Yüzük/Küpe
