# Amplify Staging Branch Yapılandırma Rehberi

## 🔧 Sorun
**URL:** https://staging.d12wynbw2ij4ni.amplifyapp.com  
**Hata:** HTTP ERROR 404

## ✅ Çözüm Adımları

### 1. AWS Amplify Console'a Git
```
https://console.aws.amazon.com/amplify
```

### 2. App'i Seç
- **App Name:** fiyat-hesaplama
- **App ID:** d12wynbw2ij4ni

### 3. Staging Branch'i Bağla

#### Adım 1: Branch Ekle
1. Sol menüden **"App settings"** → **"General"** tıkla
2. **"Connect branch"** butonuna tıkla
3. **Branch:** `staging` seç
4. **Confirm** tıkla

#### Adım 2: Build Settings Kontrol
1. **"App settings"** → **"Build settings"** tıkla
2. `amplify.yml` dosyasının yüklendiğini doğrula
3. Aşağıdaki yapılandırmanın olduğundan emin ol:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build:prod
  artifacts:
    baseDirectory: dist/fiyat-hesaplama/browser
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
customHeaders:
  - pattern: '**/*'
    headers:
      - key: 'Cache-Control'
        value: 'public, max-age=31536000, immutable'
      - key: 'Strict-Transport-Security'
        value: 'max-age=31536000; includeSubDomains'
      - key: 'X-Content-Type-Options'
        value: 'nosniff'
      - key: 'X-Frame-Options'
        value: 'DENY'
  - pattern: '/index.html'
    headers:
      - key: 'Cache-Control'
        value: 'no-cache, no-store, must-revalidate'
customRules:
  - source: '/<*>'
    target: '/index.html'
    status: '200'
    condition: null
```

#### Adım 3: Redirects & Rewrites Kontrol
1. **"App settings"** → **"Rewrites and redirects"** tıkla
2. Aşağıdaki kuralı ekle (yoksa):

**Rule:**
```
Source: /<*>
Target: /index.html
Type: 200 (Rewrite)
```

**Sıralama önemli!** Bu kural en altta olmalı.

### 4. Staging Branch'i Deploy Et

#### Manuel Deploy
1. **"Hosting"** → **"staging"** branch'ine tıkla
2. Sağ üstten **"Redeploy this version"** tıkla
3. **"Redeploy"** onayla

#### Otomatik Deploy (Git Push ile)
Staging branch'e push yaptığında otomatik deploy olur:
```bash
git checkout staging
git add .
git commit -m "Your changes"
git push origin staging
```

### 5. Build'i İzle

#### Build Logs
1. **"Build details"** sayfasına git
2. **Provision** → **Build** → **Deploy** aşamalarını izle
3. Her aşamanın yeşil olduğunu doğrula

#### Beklenen Build Çıktısı
```
✓ Provision (1-2 dakika)
✓ Build (3-5 dakika)
  - npm ci
  - npm run build:prod
  - Output: dist/fiyat-hesaplama/browser/
✓ Deploy (1-2 dakika)
✓ Finalize (30 saniye)
```

### 6. Test Et

#### Build Tamamlandıktan Sonra
```bash
# Ana sayfa
curl https://staging.d12wynbw2ij4ni.amplifyapp.com

# Angular routing test
curl https://staging.d12wynbw2ij4ni.amplifyapp.com/admin-login

# Beklenen: Her iki istek de 200 döndürmeli (404 değil)
```

#### Tarayıcıda Test
1. https://staging.d12wynbw2ij4ni.amplifyapp.com adresine git
2. Ana sayfanın yüklendiğini doğrula
3. `/admin-login` gibi route'lara git
4. 404 hatası olmamalı

---

## 🐛 Hata Ayıklama

### Build Başarısız Olursa

#### 1. Build Logs Kontrol
```
App settings → Build settings → View build logs
```

**Yaygın Hatalar:**
- `npm ci` hatası → `package-lock.json` missing
- Build timeout → Memory/timeout ayarlarını artır
- Module not found → Dependencies kontrol et

#### 2. Environment Variables
```
App settings → Environment variables
```

Gerekli değişkenler:
```
NODE_ENV=production
```

#### 3. Build Settings
**Increase timeout:**
- App settings → General → Edit
- Build timeout: 15 minutes

**Increase memory:**
- App settings → General → Edit
- Build compute: Large (7 GB)

### 404 Hatası Devam Ederse

#### 1. Rewrite Rules Kontrol
AWS Console'da:
```
App settings → Rewrites and redirects
```

Manuel ekle:
- Source: `/<*>`
- Target: `/index.html`
- Type: `200 (Rewrite)`

#### 2. Cache Clear
```bash
# Chrome
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)

# CDN Cache
Amplify console → Hosting → Invalidations → Create invalidation
Path: /*
```

#### 3. Amplify Cache Clear
```
App settings → General → Clear cache → Confirm
```

---

## 📊 Staging vs Main Karşılaştırma

| Özellik | Main | Staging |
|---------|------|---------|
| URL | main.d20mfjd2x04tfy.amplifyapp.com | staging.d12wynbw2ij4ni.amplifyapp.com |
| Branch | main | staging |
| Auto Deploy | ✅ Aktif | ✅ Aktif |
| Build Config | amplify.yml | amplify.yml (aynı) |

---

## ✅ Son Kontrol Listesi

- [ ] Staging branch push edildi ✅ (Tamamlandı)
- [ ] AWS Amplify Console'a gidildi
- [ ] Staging branch bağlandı
- [ ] Build ayarları kontrol edildi
- [ ] Rewrite rules eklendi (/<*> → /index.html, status 200)
- [ ] Build başlatıldı
- [ ] Build başarıyla tamamlandı
- [ ] https://staging.d12wynbw2ij4ni.amplifyapp.com çalışıyor
- [ ] Routing test edildi (404 yok)

---

## 🚀 Hızlı Komutlar

### Staging'e Deploy
```bash
cd /Users/gizemesmer/Desktop/personal/fiyathesaplama
git checkout staging
git pull origin staging
# Değişiklik yap
git add .
git commit -m "Staging update"
git push origin staging
# Amplify otomatik build başlatır
```

### Main'e Merge
```bash
git checkout main
git merge staging
git push origin main
# Main branch de otomatik deploy olur
```

---

**ÖNEMLİ:** Staging branch şu anda push edildi ve hazır. Sadece AWS Amplify Console'dan staging branch'i bağlaman ve build'i başlatman gerekiyor!
