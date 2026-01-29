# Gram/Fiyat - Desktop Uygulaması

Bu uygulama Electron kullanılarak masaüstü uygulamasına dönüştürülmüştür.

## Geliştirme Ortamı

### 1. Uygulamayı Test Etme (Electron ile)
```bash
npm run build:prod
npm run electron
```

Bu komut Angular uygulamasını derler ve Electron penceresinde açar.

## Dağıtım (Distribution)

### Tüm Platformlar İçin
```bash
npm run dist
```

### Sadece macOS İçin
```bash
npm run dist:mac
```
Çıktı: `release/Gram-Fiyat-1.0.0.dmg`

### Sadece Windows İçin  
```bash
npm run dist:win
```
Çıktı: 
- `release/Gram-Fiyat Setup 1.0.0.exe` (installer)
- `release/Gram-Fiyat 1.0.0.exe` (portable)

### Sadece Linux İçin
```bash
npm run dist:linux
```
Çıktı:
- `release/Gram-Fiyat-1.0.0.AppImage`
- `release/gram-fiyat_1.0.0_amd64.deb`

## Dağıtılabilir Dosyalar

Oluşturulan dosyalar `release/` klasöründe bulunur:

- **Windows**: `.exe` dosyası - çift tıkla ve çalıştır
- **macOS**: `.dmg` dosyası - aç ve Applications'a sürükle
- **Linux**: `.AppImage` veya `.deb` - çalıştırılabilir

Bu dosyalar herhangi bir bilgisayarda **hiçbir ek gereksinim olmadan** çalışır.
Node.js, Angular CLI veya başka bir şey yüklemek gerekmez.

## Dosya Boyutları

Her platform için paket ~100-150 MB civarındadır çünkü:
- Electron (Chromium + Node.js) dahildir
- Angular uygulaması dahildir
- Tüm bağımlılıklar dahildir

## Not

İlk build işlemi biraz zaman alabilir (5-10 dakika), çünkü Electron tüm platformlar için gerekli dosyaları indirir.
