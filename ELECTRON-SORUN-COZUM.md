# Desktop Uygulama Çalıştırma Sorunu ve Çözümleri

## Sorun
Electron 28 ve electron-builder 26.4.0 arasında uyumsuzluk var. Helper uygulamaları düzgün paketlenmiyor ve uygulama "Unable to find helper app" hatası veriyor.

## Geçici Çözüm 1: Web Sürümünü Kullanın (ÖNERİLEN)

Uygulama zaten build edildi ve çalışıyor. Basit bir web sunucusuyla lokal olarak çalıştırabilirsiniz:

```bash
# 1. Build klasörüne gidin
cd dist/fiyat-hesaplama/browser

# 2. Python ile basit HTTP sunucusu başlatın
python3 -m http.server 4200

# 3. Tarayıcıda açın
open http://localhost:4200
```

Ya da:

```bash
# npm serve paketi ile
npx serve dist/fiyat-hesaplama/browser -p 4200
```

Bu şekilde:
- ✅ Hiçbir kurulum gerekmez
- ✅ Tüm özellikler çalışır (LocalStorage, API, Excel)
- ✅ Her tarayıcıdan erişilebilir
- ✅ Offline çalışır (build edilmiş dosyalar local)

## Geçici Çözüm 2: Angular Development Server

```bash
yarn start
# veya
npm run start
```

Tarayıcıda `http://localhost:4200` açın.

## Kalıcı Çözüm (Gelecek için)

### Seçenek A: Electron Versiyonunu Düşürün

```bash
yarn remove electron
yarn add -D electron@27.0.0 --ignore-engines
yarn dist:mac
```

Electron 27 electron-builder ile daha uyumlu.

### Seçenek B: Tauri Kullanın (Daha hafif, daha modern)

Tauri, Rust tabanlı ve Electron'dan çok daha hafif (~3-5 MB vs ~100 MB):

```bash
# Rust kur
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Tauri ekle
yarn add -D @tauri-apps/cli
npx tauri init

# Build
yarn tauri build
```

### Seçenek C: Neutralinojs (En hafif)

Neutralinojs çok daha hafif (~5 MB) ve basit:

```bash
npm install -g @neutralinojs/neu
neu create myapp
# Angular dist'i Neutralino'ya kopyala
# neu build
```

## Şu Anki Durum

✅ Angular uygulaması başarıyla build edildi
✅ Tüm özellikler çalışıyor
✅ DMG/App dosyaları oluşturuldu
❌ Helper app sorunu nedeniyle macOS'ta Electron çalışmıyor

## Önerilen Aksiyon

**Şimdilik web versiyonunu kullanın:**

```bash
cd /Users/gizemesmer/Desktop/personal/fiyathesaplama
npx serve dist/fiyat-hesaplama/browser -p 4200
```

Tarayıcıdan `http://localhost:4200` adresinde çalışacak ve tüm özellikler (LocalStorage, altın fiyatı API, işçilik hesabı, Excel import/export) sorunsuz çalışacaktır.

**Gelecekte:** Electron 27'ye downgrade edin veya Tauri'ye geçin.

---

**Not:** Bu sorun Electron 28'deki helper app path değişikliklerinden kaynaklanıyor ve electron-builder henüz tam destek vermiyor. Birçok geliştirici aynı sorunla karşılaşıyor.
