# Desktop Uygulama Kurulum Rehberi

## Sorun
npm paket kurulumlarında network timeout hataları alıyoruz. Bu nedenle Electron kurulumu şu an tamamlanamıyor.

## Çözüm Seçenekleri

### Seçenek 1: Network Sorununugelir Sonra Electron Kurulumu (ÖNERİLEN)

Stabil bir internet bağlantısına eriştiğinizde aşağıdaki adımları izleyin:

#### 1. Node Modules Temizliği
```bash
cd /Users/gizemesmer/Desktop/personal/fiyathesaplama
rm -rf node_modules package-lock.json
```

#### 2. npm Cache Temizliği
```bash
npm cache clean --force
```

#### 3. Temel Angular Paketlerini Kur
```bash
npm install
```

#### 4. Electron Paketlerini Kur
```bash
npm install --save-dev electron@28.0.0 electron-builder@24.0.0
```

#### 5. Production Build
```bash
npm run build:prod
```

#### 6. Test Et
```bash
npm run electron
```

#### 7. Distribütable Oluştur

**macOS için:**
```bash
npm run dist:mac
```
Çıktı: `release/Gram-Fiyat-1.0.0.dmg`

**Windows için:**
```bash
npm run dist:win
```
Çıktı: `release/Gram-Fiyat Setup 1.0.0.exe` ve `release/Gram-Fiyat-1.0.0.exe` (portable)

**Linux için:**
```bash
npm run dist:linux
```
Çıktı: `release/Gram-Fiyat-1.0.0.AppImage` ve `release/gram-fiyat_1.0.0_amd64.deb`

---

### Seçenek 2: Alternatif npm Registry Kullan

Eğer şirket networku veya firewall kullanıyorsanız:

```bash
# Taobao mirror (Çin)
npm config set registry https://registry.npmmirror.com

# Veya yarn kullan
brew install yarn
yarn install
yarn add -D electron@28.0.0 electron-builder@24.0.0
```

Kurulumdan sonra orijinal registry'e dön:
```bash
npm config set registry https://registry.npmjs.org/
```

---

### Seçenek 3: Offline Kurulum (Advanced)

1. İyi internet bağlantısı olan başka bir bilgisayarda:
   - Aynı projeyi klonla
   - `npm install` çalıştır
   - `node_modules` klasörünü zip'le

2. Bu bilgisayarda:
   - zip'i aç
   - `npm run build:prod && npm run electron` çalıştır

---

### Seçenek 4: Tauri Kullan (Daha Hafif Alternatif)

Electron'a göre çok daha küçük dosya boyutu (~3-5MB vs 100-150MB):

```bash
# Rust kur (eğer yoksa)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Tauri CLI kur
npm install --save-dev @tauri-apps/cli

# Tauri init
npx tauri init

# Build
npm run tauri build
```

---

## Zaten Oluşturulmuş Dosyalar

✅ `/electron.js` - Electron main process dosyası
✅ `/package.json` - Electron build konfigürasyonu eklendi
✅ `/README-ELECTRON.md` - Detaylı Electron dokümantasyonu

**Eksik Adım:** Sadece paketlerin kurulması ve build yapılması gerekiyor.

---

## Network Sorununun Olası Nedenleri

1. **Firewall/Proxy:** Şirket networkü npm registry'i engelliyor olabilir
2. **npm Cache Bozulması:** Cache temizleme gerekebilir
3. **DNS Sorunu:** Alternatif DNS (8.8.8.8) denenebilir
4. **Timeout Ayarı:** npm timeout süresini artırabilirsiniz:
   ```bash
   npm config set fetch-timeout 60000
   npm config set fetch-retry-maxtimeout 120000
   ```

---

## İletişim İçin

Kurulum tamamlandıktan sonra test etmek için:
1. `npm run electron` ile geliştirme modunda çalıştırın
2. Her şey çalışıyorsa `npm run dist:mac` ile distribütable oluşturun
3. Release klasöründeki .dmg dosyasını çift tıklayarak test edin

**Önemli:** Release klasöründeki .dmg/.exe/.AppImage dosyaları artık hiçbir kurulum gerektirmeden herhangi bir bilgisayarda çalışabilir.
