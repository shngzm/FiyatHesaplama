# 🚨 ACİL: Amplify 404 Hatası Çözümü

## ✅ Tamamlananlar

1. **Eski zipler temizlendi** ✅
2. **Yeni deployment paketleri oluşturuldu** ✅
   - `frontend-deploy.zip` (192 KB)
   - `backend-lambda-deploy.zip` (4.7 MB)
3. **amplify.yml düzeltildi** ✅
   - `npm run build:prod` → `npm run build`
   - Bu build komutu başarılı çalışıyor
4. **Staging branch güncel** ✅
5. **Deployment prosedürü dökümante edildi** ✅

---

## 🎯 ŞİMDİ YAPILACAKLAR (AWS Console)

### Adım 1: Amplify Rewrite Rules Kontrolü

**URL:** https://console.aws.amazon.com/amplify/home?region=eu-central-1#/d12wynbw2ij4ni

1. **App Settings → Rewrites and redirects** tıkla

2. **Mevcut kuralları kontrol et:**
   - Eğer `/<*>` → `/index.html` kuralı **YOKSA** veya **Status 404** ise:

3. **Yeni kural ekle (veya düzenle):**
   ```
   Source address: /<*>
   Target address: /index.html
   Type: 200 (Rewrite)
   Country code: Leave empty
   ```

4. **ÖNEMLI:** Bu kural **EN ALTTA** olmalı (en düşük priority)

5. **Save** tıkla

### Adım 2: Staging Build'i Tetikle

1. **Hosting environments** → **staging** tıkla

2. Sağ üstten **"Redeploy this version"** tıkla
   - VEYA -
   **"Deploy without Git"** → **"Upload"** → `frontend-deploy.zip` seç

3. **Build'i izle** (3-5 dakika)
   - Provision ✅
   - Build ✅
   - Deploy ✅
   - Finalize ✅

### Adım 3: Test Et

```bash
# Ana sayfa
curl -I https://staging.d12wynbw2ij4ni.amplifyapp.com
# Beklenen: HTTP/2 200

# Routing test
curl -I https://staging.d12wynbw2ij4ni.amplifyapp.com/admin-login
# Beklenen: HTTP/2 200 (404 DEĞİL!)
```

**Tarayıcıda:**
1. https://staging.d12wynbw2ij4ni.amplifyapp.com
2. F12 → Console (hata olmamalı)
3. `/admin-login`, `/calculation` route'larını test et

---

## 🔍 Build Başarısız Olursa

### Kontrol Edilecekler:

1. **Build Logs**
   - Amplify Console → Staging → Build details
   - Hata mesajlarını oku

2. **Yaygın Hatalar:**

   **"Module not found"**
   ```
   Çözüm: package.json'da dependency var mı kontrol et
   ```

   **"npm ci failed"**
   ```
   Çözüm: package-lock.json güncel mi kontrol et
   ```

   **"Build timeout"**
   ```
   Çözüm: App Settings → General → Build timeout: 15 min
   ```

3. **Environment Variables**
   - App Settings → Environment variables
   - `NODE_ENV=production` ekle

---

## 📋 Rewrite Rules - Detaylı Yapılandırma

### Doğru Yapılandırma (Çalışan)

```
Rule 1:
Source: /<*>
Target: /index.html
Type: 200 (Rewrite)
```

**NEDEN 200?**
- SPA (Single Page Application) için gerekli
- Tüm Angular route'ları index.html'e yönlendirir
- 404 döndürmez, içeriği serve eder

### Yanlış Yapılandırma (404 Veren)

```
❌ YANLIŞ:
Source: /<*>
Target: /index.html
Type: 404 (Redirect)

❌ YANLIŞ:
Rewrite rule eksik
```

---

## 🎯 Başarı Kriterleri

### ✅ Build Başarılı:
```
✓ Provision (2 dk)
✓ Build (4 dk)
  - npm ci ✅
  - npm run build ✅
  - Artifacts: dist/fiyat-hesaplama/browser/ ✅
✓ Deploy (1 dk)
✓ Finalize (30 sn)
```

### ✅ URL'ler Çalışıyor:
```
https://staging.d12wynbw2ij4ni.amplifyapp.com → 200 ✅
https://staging.d12wynbw2ij4ni.amplifyapp.com/admin-login → 200 ✅
https://staging.d12wynbw2ij4ni.amplifyapp.com/calculation → 200 ✅
```

### ✅ Functionality:
```
- Ana sayfa yükleniyor ✅
- Routing çalışıyor (404 yok) ✅
- Console'da hata yok ✅
- Login formu görünüyor ✅
```

---

## 🚀 Başarılı Olduktan Sonra

### Main Branch'e Deploy

```bash
cd /Users/gizemesmer/Desktop/personal/fiyathesaplama
git checkout main
git merge staging
git push origin main
```

Amplify otomatik olarak main branch'i build edecek.

---

## 📞 Hala 404 Alıyorsan

### Debug Adımları:

1. **Cache temizle:**
   ```bash
   # Browser
   Cmd+Shift+R (Mac)
   Ctrl+Shift+R (Win/Linux)
   ```

2. **CloudFront cache temizle:**
   ```
   Amplify Console → Hosting → Invalidations
   Create invalidation: /*
   ```

3. **Build output kontrol et:**
   ```
   Amplify Console → Build details → Artifacts
   dist/fiyat-hesaplama/browser/index.html olmalı
   ```

4. **Manuel rewrite rule ekle:**
   ```
   AWS Console → Amplify → Rewrites
   Add: /<*> → /index.html (200)
   ```

---

## 📦 Deployment Paketleri Hazır

```
/Users/gizemesmer/Desktop/personal/fiyathesaplama/
├── frontend-deploy.zip (192 KB) ← Amplify'a upload et
└── backend-lambda-deploy.zip (4.7 MB) ← Lambda'ya upload et
```

---

## ⏰ Süre Tahmini

- Rewrite rules düzenleme: 2 dakika
- Build başlatma: 1 dakika
- Build tamamlanma: 5 dakika
- Test: 2 dakika
- **TOPLAM: ~10 dakika**

---

**SONUÇ:** Staging branch hazır, zipler hazır. Sadece AWS Console'dan rewrite rule'u kontrol edip build'i başlat. 404 hatası kesinlikle çözülecek! 🎉
