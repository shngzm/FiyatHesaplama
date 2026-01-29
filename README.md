<div align="center">
  <img src="src/assets/elizi-goldtool-logo.jpeg" alt="Elizi GoldTool Logo" width="200"/>
  
  # Elizi GoldTool
  
  ### Trabzon Hasırı Gram Hesaplama Uygulaması
  
  Modern Angular tabanlı kuyum ürünleri gram hesaplama ve yönetim uygulaması. Model ve ürün parametrelerine göre otomatik gram hesaplaması, LocalStorage tabanlı veri yönetimi ve admin paneli sunar.
  
  🌐 **[Web'den Kullan](https://[username].github.io/fiyathesaplama)** - Herhangi bir kurulum gerektirmez!
  
</div>

## 🚀 Özellikler

- ✅ **Web'den Erişim:** Tarayıcıdan direkt kullanım, indirme gerektirmez
- ✅ **Desktop Uygulamaları:** Mac (Apple Silicon & Intel) için offline kullanım
- ✅ Otomatik gram hesaplama (formül bazlı)
- ✅ Model yönetimi (Dinamik/Statik kesim tipleri)
- ✅ Ürün yönetimi (toplu ekleme, inline editing)
- ✅ Admin paneli (şifre korumalı)
- ✅ LocalStorage veri saklama
- ✅ Hesaplama geçmişi (son 5 kayıt)
- ✅ Responsive tasarım
- ✅ TypeScript ile tip güvenliği
- ✅ Reactive Forms kullanımı

## 🌐 Web Versiyonu (Önerilen)

**Hızlı Erişim:** https://[username].github.io/fiyathesaplama

### Avantajlar:
- ✅ Kurulum gerektirmez
- ✅ Tüm cihazlarda çalışır (Mac, Windows, iPad, iPhone)
- ✅ Otomatik güncellenir
- ✅ Güvenlik uyarısı yok
- ✅ Veriler tarayıcıda güvenle saklanır

## 💻 Desktop Uygulamaları

Offline kullanım için:
- **EliziGramFiyat.dmg** - Apple Silicon (M1/M2/M3)
- **EliziGramFiyat-Intel.dmg** - Intel Mac

Kurulum talimatları için `EliziGramFiyat-Kullanim.txt` dosyasına bakın.

## 📋 Gereksinimler

- Node.js 18.x veya üzeri
- npm 9.x veya üzeri
- Modern web tarayıcı (Chrome, Firefox, Safari, Edge)

## 🛠️ Kurulum

```bash
# Repoyu klonlayın
git clone <repo-url>
cd fiyathesaplama

# Bağımlılıkları yükleyin
npm install
```

## 💻 Geliştirme

### Development Server
```bash
# Geliştirme sunucusunu başlatın
npm start
# veya
npx ng serve
```

Tarayıcınızda `http://localhost:4200/` adresine gidin. Kod değişiklikleriniz otomatik olarak yansıyacaktır.

### Production Build
```bash
# Production build oluşturun
npm run build
# veya
npx ng build --configuration production
```

Build dosyaları `dist/` klasöründe oluşturulacaktır.

## 🧪 Testler

```bash
# Unit testleri çalıştırın
npm test

# Test coverage raporu oluşturun
npm run test:coverage

# Coverage raporunu görüntüleyin
open coverage/index.html
```

## 📚 Dokümantasyon

Detaylı dokümantasyon için `docs/` klasörüne bakın:

- **[PRD.md](docs/PRD.md)** - Ürün gereksinimleri ve özellikler
- **[ROADMAP.md](docs/ROADMAP.md)** - Geliştirme yol haritası
- **[STATE.md](docs/STATE.md)** - Proje durumu ve ilerleme
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Mimari tasarım dokümantasyonu
- **[TESTING.md](docs/TESTING.md)** - Test stratejisi ve kılavuzlar

## 🏗️ Proje Yapısı

```
src/app/
  ├── components/       # UI bileşenleri
  ├── services/         # Business logic ve data yönetimi
  ├── models/           # TypeScript interface'ler
  ├── validators/       # Custom form validatörleri
  └── shared/           # Paylaşılan yardımcılar
```

### Admin Paneli (mrc / 6161)

1. **Model Yönetimi**
   - Yeni model ekleyin (Model Tipi, Kesim Tipi, Pay)
   - Mevcut modelleri düzenleyin (inline editing)
   - Kullanılmayan modelleri silin

2. **Ürün Yönetimi**
   - Toplu ürün ekleyin (alt alta satırlar)
   - Model, Ayar, Sıra kombinasyonlarını tanımlayın
   - 1 cm tel, kesilen parça ve diğer ağırlıkları girin
   - Mevcut ürünleri düzenleyin veya silin

3. **Veri Yönetimi**
   - Excel dosyasından import edin
   - Verileri Excel'e export edin

### Kullanıcı Arayüzü

1. **Gram Hesaplama**
   - Model, Ayar ve Sıra seçin (dropdown'dan)
   - Ürün uzunluğunu cm cinsinden girin
   - "Ürün Gramı Hesapla" butonuna tıklayın
   - Sonucu görün (örn: 24.35 gram)

## 🛠️ Teknoloji Stack

- **Frontend Framework:** Angular 17+
- **Language:** TypeScript 5.2+
- **State Management:** RxJS BehaviorSubject + LocalStorage
- **Forms:** Reactive Forms
- **Styling:** SCSS
- **Testing:** Jasmine + Karma
- **Build:** Angular CLI

## ⚠️ Önemli Notlar

- Model ve ürün verileri LocalStorage'da tutulur
- Hesaplama geçmişi sadece session bazlı (sayfa yenilendiğinde kaybolur)
- Admin şifresi: mrc / 6161 (hardcoded)
- Database bağlantısı bulunmamaktadır
- Gram hassasiyeti: 2 ondalık basamak (örn: 24.35 g)
- **Styling:** SCSS
- **Testing:** Jasmine + Karma
- **Build:** Angular CLI

## ⚠️ Önemli Notlar

- Veriler sadece uygulama çalışırken bellekte tutulur
- Sayfa yenilendiğinde veriler kaybolur
- Database bağlantısı bulunmamaktadır
- LocalStorage entegrasyonu gelecek sürümlerde planlanmaktadır

## 🤝 Katkıda Bulunma

1. Bu repoyu fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Commit Kuralları

Commit mesajları için [Conventional Commits](https://www.conventionalcommits.org/) standartını kullanıyoruz:

- `feat:` Yeni özellik
- `fix:` Bug düzeltmesi
- `docs:` Dokümantasyon değişiklikleri
- `style:` Kod formatı değişiklikleri
- `refactor:` Kod iyileştirmeleri
- `test:` Test ekleme/düzeltme
- `chore:` Build/tooling değişiklikleri

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Sorularınız için issue açabilir veya proje sahibiyle iletişime geçebilirsiniz.

---

**Son Güncelleme:** 2026-01-26  
**Angular Version:** 17.3.x  
**Node Version:** 18+
