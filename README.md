<div align="center">
  
  # Gram Fiyat Hesaplama
  
  ### Trabzon Hasırı Gram ve Fiyat Hesaplama Web Uygulaması
  
  Modern Angular + Express + DynamoDB tabanlı kuyum ürünleri gram hesaplama ve yönetim uygulaması. Model ve ürün parametrelerine göre otomatik gram hesaplaması, DynamoDB veri saklama ve JWT authentication ile korunan admin paneli sunar.
  
</div>

## 🚀 Özellikler

### Frontend
- ✅ **Angular 17** - Modern web framework
- ✅ **Responsive Design** - Tüm cihazlarda çalışır
- ✅ **TypeScript** - Tip güvenliği
- ✅ **Reactive Forms** - Form yönetimi
- ✅ **RxJS** - Reaktif programlama

### Backend
- ✅ **Express.js** - RESTful API
- ✅ **JWT Authentication** - Güvenli kimlik doğrulama
- ✅ **DynamoDB** - NoSQL veritabanı
- ✅ **Rate Limiting** - DDoS koruması
- ✅ **Helmet** - Güvenlik headers
- ✅ **Compression** - Response sıkıştırma

### Özellikler
- ✅ Otomatik gram hesaplama (formül bazlı)
- ✅ Model yönetimi (CRUD operations)
- ✅ Ürün yönetimi (toplu ekleme, inline editing)
- ✅ Altın fiyatı yönetimi
- ✅ Admin paneli (JWT korumalı)
- ✅ Hesaplama geçmişi
- ✅ RESTful API
- ✅ Real-time updates

## 📋 Gereksinimler

- Node.js 18.x veya üzeri (Production: 20.x önerilir)
- npm 9.x veya üzeri
- AWS Account (Production deployment için)
- Modern web tarayıcı (Chrome, Firefox, Safari, Edge)

## 🛠️ Kurulum

```bash
# Repoyu klonlayın
git clone <repo-url>
cd fiyathesaplama

# Frontend bağımlılıkları
npm install

# Backend bağımlılıkları
cd backend
npm install
```

## 💻 Geliştirme

### Development Servers

**Terminal 1 - DynamoDB Local:**
```bash
cd backend/dynamodb-local
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -port 8000
```

**Terminal 2 - Backend API:**
```bash
cd backend
npm run dev
# API çalışır: http://localhost:3000
```

**Terminal 3 - Frontend:**
```bash
npm start
# Frontend çalışır: http://localhost:4200
```

### İlk Kurulum

```bash
# Backend tablolarını oluştur
cd backend
node src/config/createTables.js

# Admin kullanıcı oluştur
curl -X POST http://localhost:3000/api/auth/init

# Admin giriş bilgileri:
# Username: admin
# Password: admin123
```

### Production Build

**Frontend:**
```bash
npm run build:prod
# Output: dist/fiyat-hesaplama/browser/
```

**Backend:**
```bash
cd backend
npm run prod
```

## 🧪 Testler

```bash
# Frontend unit testleri
npm test

# Test coverage
npm run test:coverage
```

## 📚 Dokümantasyon

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment kılavuzu
- **[docs/PRD.md](docs/PRD.md)** - Ürün gereksinimleri
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Mimari tasarım
- **[docs/STATE.md](docs/STATE.md)** - Proje durumu

## 🏗️ Proje Yapısı

```
/
├── src/                    # Frontend (Angular)
│   ├── app/
│   │   ├── components/    # UI bileşenleri
│   │   ├── services/      # API servisleri
│   │   ├── models/        # TypeScript interfaces
│   │   ├── guards/        # Route guards
│   │   └── interceptors/  # HTTP interceptors
│   └── environments/      # Environment configs
│
├── backend/               # Backend (Express)
│   ├── src/
│   │   ├── config/       # DB ve app config
│   │   ├── models/       # DynamoDB models
│   │   ├── controllers/  # Route controllers
│   │   ├── routes/       # API routes
│   │   └── middleware/   # Auth & validation
│   └── .env              # Environment variables
│
└── docs/                 # Dokümantasyon
```

## 🔐 Admin Paneli

**Giriş:** http://localhost:4200/#/admin-login
- Username: `admin`
- Password: `admin123` (production'da değiştirin!)

**Özellikler:**
1. Model yönetimi (CRUD)
2. Ürün yönetimi (CRUD)
3. Altın fiyatı güncelleme
4. Kullanıcı yönetimi
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
