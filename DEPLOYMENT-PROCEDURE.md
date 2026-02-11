# Deployment Prosedürü - Fiyat Hesaplama Uygulaması

> **UYARI:** Bu döküman her deployment'ta mutlaka takip edilmelidir. 404 hatalarını önlemek için kritik adımları içerir.

---

## 🎯 Deployment Prosedürü Özeti

### Temel Kurallar

1. **Eski zipleri her zaman sil, yeni zip oluştur**
2. **Amplify rewrite kurallarını asla değiştirme**
3. **Build output dizinini doğrula**
4. **Staging'e deploy et, test et, sonra main'e merge et**

---

## 📦 1. Deployment Paketleri Oluşturma

### Otomatik Yöntem (Önerilen)
```bash
cd /Users/gizemesmer/Desktop/personal/fiyathesaplama
./build-deployment.sh
```

### Manuel Yöntem

#### Adım 1: Eski Zipleri Temizle
```bash
cd /Users/gizemesmer/Desktop/personal/fiyathesaplama
rm -f *.zip backend/*.zip production-builds/*.zip dist/*.zip
```

#### Adım 2: Frontend Build
```bash
npm run build
# Output: dist/fiyat-hesaplama/browser/
```

#### Adım 3: Frontend Zip Oluştur
```bash
cd dist/fiyat-hesaplama/browser
zip -r /Users/gizemesmer/Desktop/personal/fiyathesaplama/frontend-deploy.zip . -q
cd /Users/gizemesmer/Desktop/personal/fiyathesaplama
```

#### Adım 4: Backend Zip Oluştur
```bash
cd backend
zip -r /Users/gizemesmer/Desktop/personal/fiyathesaplama/backend-lambda-deploy.zip \
  lambda-deploy/src \
  lambda-deploy/lambda.js \
  lambda-deploy/package.json \
  lambda-deploy/package-lock.json \
  lambda-deploy/node_modules \
  -q
cd ..
```

#### Adım 5: Doğrula
```bash
ls -lh *.zip
# Beklenen:
# frontend-deploy.zip     (~200 KB)
# backend-lambda-deploy.zip (~4-5 MB)
```

---

## 🚀 2. Amplify Deployment (Frontend)

### ⚠️ KRİTİK: Amplify Yapılandırması

**amplify.yml - ASLA DEĞİŞTİRME:**
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist/fiyat-hesaplama/browser
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

**Rewrite Rules - AWS Console'da Kontrol Et:**
1. Amplify Console → App Settings → Rewrites and redirects
2. Aşağıdaki kural **MUTLAKA** olmalı:

```
Source: /<*>
Target: /index.html
Type: 200 (Rewrite)
```

**Önemli:** Type `404` değil, `200` olmalı!

### Staging'e Deploy

#### Yöntem 1: Manuel Upload (Önerilen - İlk Defa İçin)
```bash
# 1. AWS Amplify Console'a git
https://console.aws.amazon.com/amplify/home?region=eu-central-1#/d12wynbw2ij4ni

# 2. Staging branch'i seç
- Hosting → staging

# 3. Manual deploy
- Deploy without Git → Upload frontend-deploy.zip

# 4. Build'i izle (3-5 dakika)
```

#### Yöntem 2: Git Push (Sonraki Deployment'lar İçin)
```bash
# Staging branch'e geç
git checkout staging

# Değişiklikleri commit et
git add .
git commit -m "Deployment update: $(date +%Y-%m-%d)"

# Push et (otomatik build başlar)
git push origin staging
```

### Main'e Deploy

**Staging'de test ettikten SONRA:**
```bash
# Main'e geç
git checkout main

# Staging'i merge et
git merge staging

# Push et
git push origin main
```

---

## ⚡ 3. Lambda Deployment (Backend)

### AWS Console'dan Upload

```bash
# 1. Lambda Console'a git
https://console.aws.amazon.com/lambda/home?region=eu-central-1#/functions/gramfiyat-backend

# 2. Upload
- Code → Upload from → .zip file
- Select: backend-lambda-deploy.zip
- Save

# 3. Test
- Test → Configure test event
- Event JSON: { "httpMethod": "GET", "path": "/api/health" }
- Test → Success bekleniyor
```

### Environment Variables Kontrol
```
NODE_ENV=production
JWT_SECRET=<your-secret>
AWS_REGION=eu-central-1
DYNAMODB_TABLE_USERS=USERS
DYNAMODB_TABLE_MODELS=MODELS
DYNAMODB_TABLE_PRODUCTS=PRODUCTS
DYNAMODB_TABLE_GOLD_PRICES=GOLD_PRICES
DYNAMODB_TABLE_CUSTOMERS=CUSTOMERS
DYNAMODB_TABLE_ORDERS=ORDERS
DYNAMODB_TABLE_ACTIVITY_LOGS=ACTIVITY_LOGS
```

---

## ✅ 4. Post-Deployment Verification

### Frontend Test

```bash
# Staging
curl -I https://staging.d12wynbw2ij4ni.amplifyapp.com
# Beklenen: HTTP/2 200

curl -I https://staging.d12wynbw2ij4ni.amplifyapp.com/admin-login
# Beklenen: HTTP/2 200 (404 DEĞİL!)

# Main
curl -I https://main.d20mfjd2x04tfy.amplifyapp.com
# Beklenen: HTTP/2 200
```

### Backend Test

```bash
# Health check
curl https://your-lambda-url/api/health
# Beklenen: {"status":"ok","timestamp":"..."}
```

### Browser Test

1. **Ana sayfa:** https://staging.d12wynbw2ij4ni.amplifyapp.com
   - ✅ Sayfa yüklenmeli
   - ✅ Console'da hata olmamalı

2. **Routing:** `/admin-login`, `/calculation`, `/models`
   - ✅ Her route çalışmalı
   - ❌ 404 hatası olmamalı

3. **Functionality:**
   - ✅ Login çalışmalı
   - ✅ Hesaplama yapılabilmeli
   - ✅ Model/Ürün CRUD çalışmalı

---

## 🐛 5. Troubleshooting - 404 Hatası

### Sorun: Amplify 404 Hatası

#### Kontrol Listesi:
```bash
# 1. Build output dizinini kontrol et
cd dist/fiyat-hesaplama/browser
ls -la
# index.html olmalı!

# 2. amplify.yml kontrol et
cat amplify.yml | grep baseDirectory
# Output: baseDirectory: dist/fiyat-hesaplama/browser

# 3. Rewrite rules kontrol et (AWS Console)
# /<*> → /index.html (Status: 200)
```

#### Çözüm Adımları:

**1. Amplify Console → Rewrites and redirects**
```
Ekle/Düzenle:
Source: /<*>
Target: /index.html
Type: 200 (Rewrite)
Priority: Son sırada olmalı
```

**2. Cache Clear**
```bash
# Browser cache
Cmd+Shift+R (Mac) / Ctrl+Shift+R (Win/Linux)

# CloudFront cache (AWS Console)
Amplify → Hosting → Invalidations → Create
Path: /*
```

**3. Redeploy**
```bash
Amplify Console → staging → Redeploy this version
```

---

## 📋 6. Deployment Checklist

### Pre-Deployment
- [ ] Eski zipleri sil
- [ ] Frontend build al (`npm run build`)
- [ ] Frontend zip oluştur (dist/fiyat-hesaplama/browser → frontend-deploy.zip)
- [ ] Backend zip oluştur (lambda-deploy → backend-lambda-deploy.zip)
- [ ] Zip boyutlarını kontrol et

### Staging Deployment
- [ ] Amplify → staging branch → Manual deploy
- [ ] frontend-deploy.zip upload et
- [ ] Build başarılı olmalı (yeşil)
- [ ] https://staging.d12wynbw2ij4ni.amplifyapp.com test et
- [ ] Routing test et (404 olmamalı)
- [ ] Functionality test et

### Backend Deployment
- [ ] Lambda Console → Upload .zip
- [ ] backend-lambda-deploy.zip upload et
- [ ] Environment variables kontrol et
- [ ] Test event çalıştır
- [ ] Health endpoint test et

### Production (Main) Deployment
- [ ] Staging'de her şey çalışıyor
- [ ] git merge staging → main
- [ ] git push origin main
- [ ] Build başarılı olmalı
- [ ] https://main.d20mfjd2x04tfy.amplifyapp.com test et
- [ ] Production'da test et

### Post-Deployment
- [ ] Tüm routes çalışıyor
- [ ] Login/logout çalışıyor
- [ ] CRUD operations çalışıyor
- [ ] Calculation çalışıyor
- [ ] Console'da hata yok
- [ ] CloudWatch logs kontrol et

---

## 🔄 7. Regular Update Workflow

### Staging Update
```bash
# 1. Staging'e geç
git checkout staging

# 2. Değişiklikleri yap
# ... kod değişiklikleri ...

# 3. Build ve test et lokalde
npm run build
ng serve

# 4. Commit ve push
git add .
git commit -m "Feature: xyz"
git push origin staging

# 5. Amplify otomatik build başlatır
# 6. Build tamamlanınca test et
# 7. Sorun yoksa main'e merge et
```

### Main Update (Production)
```bash
# 1. Staging'de test edilmiş olmalı!
git checkout main
git merge staging
git push origin main

# 2. Amplify otomatik build başlatır
# 3. Production'da test et
```

---

## 📊 8. Build Output Verification

### Frontend Build Kontrolü
```bash
cd /Users/gizemesmer/Desktop/personal/fiyathesaplama
npm run build

# Output kontrolü
ls -la dist/fiyat-hesaplama/browser/
# Olması gerekenler:
# - index.html
# - main-*.js
# - polyfills-*.js
# - styles-*.css
# - assets/
```

### Backend Package Kontrolü
```bash
cd backend/lambda-deploy
ls -la

# Olması gerekenler:
# - lambda.js (handler)
# - package.json
# - src/ (Express app)
# - node_modules/ (production deps)
```

---

## 🎯 9. Key Points - 404 Hatalarını Önlemek

### ✅ YAPILMASI GEREKENLER

1. **Build output doğru dizinde**
   - `dist/fiyat-hesaplama/browser/` içinde `index.html` olmalı

2. **amplify.yml doğru yapılandırılmış**
   - `baseDirectory: dist/fiyat-hesaplama/browser`
   - `npm run build` (build:prod değil)

3. **Rewrite rules mutlaka olmalı**
   - AWS Console → Rewrites and redirects
   - `/<*>` → `/index.html` (Status: 200)

4. **Her deployment'ta yeni zip**
   - Eski zipleri sil
   - Yeni build al
   - Yeni zip oluştur

5. **Staging'de test et**
   - Production'a geçmeden önce staging'de doğrula

### ❌ YAPILMAMASI GEREKENLER

1. **amplify.yml'i değiştirme** (çalışıyor)
2. **Eski zipleri kullanma**
3. **Build dizinini değiştirme**
4. **Rewrite kurallarını silme**
5. **Staging'i bypass etme**

---

## 📞 Support Commands

### Build & Package
```bash
./build-deployment.sh
```

### Clean Everything
```bash
rm -f *.zip backend/*.zip production-builds/*.zip dist/*.zip
npm run build
```

### Quick Deploy (Staging Test Edilmiş)
```bash
git checkout main
git merge staging
git push origin main
```

---

**Son Güncelleme:** 2026-02-11  
**Versiyon:** 2.1.0  
**Status:** Production Ready with Staging
