# Product Requirements Document (PRD)
## Elizi GoldTool - Trabzon Hasırı Gram Hesaplama Uygulaması

**Product Name:** Elizi GoldTool  
**Version:** 1.1  
**Last Updated:** 2026-01-26  
**Status:** In Development

---

## 1. Overview

### 1.1 Purpose
Elizi GoldTool, kuyum ürünlerinin (örn: altın zincir, bilezik) gramajının parametrelere göre otomatik hesaplanmasını sağlayan bir Angular web uygulamasıdır. Uygulama, model ve ürün tanımlarını yöneten admin arayüzü ile gram hesaplaması yapan kullanıcı arayüzünden oluşur.

### 1.2 Goals
- Model ve ürün parametrelerinin merkezi yönetimini sağlamak
- Ürün gramajının otomatik ve hızlı hesaplanmasını sağlamak
- Kullanıcı dostu ve hatasız hesaplama arayüzü sağlamak
- Hesaplama geçmişini takip etmek
- LocalStorage ile veri kalıcılığı sağlamak (sayfa yenilenmelerinde)
- Altın kurunu çekerek güncel fiyat hesaplaması yapmak

### 1.3 Scope
**In Scope:**
- Admin paneli (şifre korumalı)
- Model yönetimi (CRUD)
- Ürün yönetimi (CRUD)
- Kullanıcı gram hesaplama arayüzü
- Fiyat hesaplama (altın kuru entegrasyonu)
- LocalStorage ile veri kalıcılığı
- Hesaplama geçmişi (son 5 kayıt)
- Inline editing
- Expandable hesaplama detayları

**Out of Scope:**
- Veritabanı entegrasyonu
- Çoklu kullanıcı yönetimi
- Rol tabanlı yetkilendirme
- Fiyat API'si dışında harici entegrasyonlar
- Stok yönetimi
- Ödeme sistemi


---

## 2. User Stories

### 2.1 Admin - Authentication

#### US-001: Admin Login
**As an** admin  
**I want to** şifre ile giriş yapmak  
**So that** model ve ürün yönetimi yapabilirim

**Acceptance Criteria:**
- Kullanıcı adı: `mrc`
- Şifre: `6161`
- Yanlış giriş denemesinde hata mesajı gösterilir
- Başarılı girişte admin paneline yönlendirilir
- Logout özelliği bulunur

### 2.2 Admin - Model Management

#### US-002: Model Ekleme
**As an** admin  
**I want to** yeni model eklemek  
**So that** ürün tanımlarında kullanabilirim

**Acceptance Criteria:**
- Model Tipi (isim): Text input, zorunlu
- Kesim Tipi: Dropdown (Dinamik/Statik), zorunlu
- Pay (cm): Number input
  - Dinamik seçiliyse: 0 olarak set edilir, disabled
  - Statik seçiliyse: Elle girilebilir, zorunlu
- Aynı model tipi adı ile tekrar ekleme engellenmelidir
- Başarılı ekleme sonrası bildirim gösterilir

#### US-003: Model Listeleme
**As an** admin  
**I want to** tüm modelleri görmek  
**So that** yönetebilirim

**Acceptance Criteria:**
- Tüm modeller tablo formatında listelenir
- Her satırda: Model Tipi, Kesim Tipi, Pay değeri görünür
- Inline editing ile düzenleme yapılabilir
- Silme butonu bulunur

#### US-004: Model Güncelleme
**As an** admin  
**I want to** model bilgilerini güncellemek  
**So that** değişiklikleri yansıtabilirim

**Acceptance Criteria:**
- Tabloda inline editing ile düzenleme yapılabilir
- Tüm alanlar düzenlenebilir
- Kesim tipi değiştiğinde pay alanı kuralları uygulanır
- Değişiklikler kaydedildiğinde LocalStorage güncellenir

#### US-005: Model Silme
**As an** admin  
**I want to** model silmek  
**So that** kullanılmayan modelleri kaldırabilirim

**Acceptance Criteria:**
- Sil butonuna tıklandığında onay dialogu gösterilir
- Dialog mesajı: "Bu modele bağlı [X] adet ürün de silinecek. Onaylıyor musunuz?"
- Onay verildiğinde model ve ilişkili tüm ürünler silinir
- İptal edildiğinde işlem yapılmaz
- Silme sonrası bildirim gösterilir

### 2.3 Admin - Product Management

#### US-006: Ürün Ekleme (Toplu)
**As an** admin  
**I want to** birden fazla ürün eklemek  
**So that** veri girişi hızlı olsun

**Acceptance Criteria:**
- Form alanları:
  - Model: Dropdown (daha önce eklenen modeller)
  - Ayar: Dropdown (14 ayar / 22 ayar)
  - Sıra: Dropdown (3, 5, 7, 9, ..., 61 - tek sayılar)
  - 1 cm'e Giden Tel: Number input (gram), zorunlu, 2 ondalık hassasiyet
  - Kesilen Parça: Number input (gram), 2 ondalık hassasiyet
    - Model kesim tipi "Dinamik" ise: Elle girilir, zorunlu
    - Model kesim tipi "Statik" ise: 0 olarak set edilir, disabled
  - Diğer Ağırlıklar: Number input (gram), zorunlu, 2 ondalık hassasiyet
    - Placeholder: "Toka, diş vb. toplam ağırlık"
- Alt alta birden fazla ürün satırı eklenebilir
- "+ Yeni Satır Ekle" butonu ile satır sayısı artırılabilir
- "X" butonu ile satır silinebilir
- "Toplu Kaydet" butonu ile tüm satırlar kaydedilir
- Aynı Model + Ayar + Sıra kombinasyonu zaten varsa:
  - İlgili satır kırmızı işaretlenir
  - Hata mesajı gösterilir: "Bu kombinasyon zaten mevcut"
  - Kayıt yapılmaz
- Başarılı kayıt sonrası form temizlenir ve bildirim gösterilir

#### US-007: Ürün Listeleme
**As an** admin  
**I want to** tüm ürünleri görmek  
**So that** yönetebilirim

**Acceptance Criteria:**
- Tüm ürünler tablo formatında listelenir
- Kolonlar: Model, Ayar, Sıra, 1cm Tel, Kesilen Parça, Diğer Ağırlıklar
- Tabloda arama/filtreleme yapılabilir
- Model'e göre gruplanmış görünüm (optional)
- Inline editing ile düzenleme yapılabilir
- Silme butonu bulunur

#### US-008: Ürün Güncelleme
**As an** admin  
**I want to** ürün bilgilerini güncellemek  
**So that** hataları düzeltebilirim

**Acceptance Criteria:**
- Tabloda inline editing ile düzenleme yapılabilir
- Tüm alanlar düzenlenebilir
- Model değiştiğinde kesim tipi kuralları uygulanır
- Güncelleme sırasında unique constraint kontrol edilir
- Değişiklikler kaydedildiğinde LocalStorage güncellenir

#### US-009: Ürün Silme
**As an** admin  
**I want to** ürün silmek  
**So that** yanlış kayıtları kaldırabilirim

**Acceptance Criteria:**
- Sil butonuna tıklandığında onay dialogu gösterilir
- Dialog mesajı: "Bu ürünü silmek istediğinizden emin misiniz?"
- Onay verildiğinde ürün silinir
- Silme sonrası bildirim gösterilir

### 2.4 User - Weight Calculation

#### US-010: Gram Hesaplama
**As a** kullanıcı  
**I want to** ürün gramını hesaplamak  
**So that** hızlı ve doğru sonuç alabilirim

**Acceptance Criteria:**
- Form alanları:
  - Model Seçimi: Dropdown (sadece kayıtlı modeller)
  - Ayar Seçimi: Dropdown
    - Seçilen model için kayıtlı ayarlar gösterilir (14 ve/veya 22)
    - Eğer model için sadece bir ayar varsa otomatik seçilir
  - Sıra Seçimi: Dropdown
    - Seçilen model + ayar için kayıtlı sıralar gösterilir
    - Eğer sadece bir seçenek varsa otomatik seçilir
  - Uzunluk: Number input (cm cinsinden), zorunlu, 2 ondalık hassasiyet
- "Ürün Gramı Hesapla" butonu
- Hesaplama formülü:
  ```
  Sonuç = ((Uzunluk + Pay) * 1cm'e Giden Tel) + Diğer Ağırlıklar - Kesilen Parça
  ```
- Gram sonucu 2 ondalık hassasiyetle gösterilir (örn: 15.43 gram)
- Fiyat hesaplama:
  - Güncel altın kuru API'den çekilir
  - Seçilen ayara göre (14/22) fiyat hesaplanır
  - Fiyat TL olarak 2 ondalık hassasiyetle gösterilir
  - Altın kuru bilgisi ve son güncellenme zamanı gösterilir
- Hesaplama detayları expandable (açılıp kapanabilir)
- Hesaplama sonrası dropdown'lar ve uzunluk değerleri görünür kalır
- Yeni hesaplama için "Yeni Hesaplama" butonu

#### US-011: Hesaplama Geçmişi
**As a** kullanıcı  
**I want to** son hesaplamalarımı görmek  
**So that** tekrar kontrol edebilirim

**Acceptance Criteria:**
- Son 5 hesaplama liste halinde gösterilir
- Her kayıt için: Model, Ayar, Sıra, Uzunluk, Sonuç (gram) görünür
- En son hesaplama en üstte olacak şekilde sıralanır
- Sayfa yenilendiğinde geçmiş kaybolur (in-memory)

---

## 3. Functional Requirements

### 3.1 Authentication
- **FR-001:** Sistem basit şifre koruması sağlamalıdır (mrc / 6161)
- **FR-002:** Admin paneli sadece giriş yapılmışsa erişilebilir olmalıdır
- **FR-003:** Logout özelliği bulunmalıdır

### 3.2 Model Management
- **FR-004:** Sistem model CRUD işlemlerini desteklemelidir
- **FR-005:** Model tipi unique olmalıdır
- **FR-006:** Kesim tipi "Dinamik" ise pay = 0, "Statik" ise pay > 0 olmalıdır
- **FR-007:** Model silindiğinde ilişkili ürünler de silinmelidir

### 3.3 Product Management
- **FR-008:** Sistem ürün CRUD işlemlerini desteklemelidir
- **FR-009:** Model + Ayar + Sıra kombinasyonu unique olmalıdır
- **FR-010:** Kesim tipi "Dinamik" olan model ürünlerinde kesilen parça > 0 olmalıdır
- **FR-011:** Kesim tipi "Statik" olan model ürünlerinde kesilen parça = 0 olmalıdır
- **FR-012:** Toplu ürün ekleme özelliği bulunmalıdır
- **FR-013:** Inline editing desteklenmelidir

### 3.4 Calculation Module
- **FR-014:** Sistem dropdown'larda sadece kayıtlı kombinasyonları göstermelidir
- **FR-015:** Hesaplama formülü: `((Uzunluk + Pay) * 1cm Tel) + Diğer Ağırlıklar - Kesilen Parça`
- **FR-016:** Tüm gram değerleri 2 ondalık hassasiyette olmalıdır
- **FR-017:** Son 5 hesaplama geçmişi saklanmalıdır (in-memory)

### 3.5 Data Storage
- **FR-018:** Veriler browser LocalStorage'da saklanmalıdır
- **FR-019:** CRUD işlemlerinden sonra LocalStorage otomatik güncellenmelidir
- **FR-020:** Sayfa yenilendiğinde LocalStorage'dan veriler yüklenmelidir

### 3.6 Price Calculation
- **FR-021:** Sistem güncel altın kurunu harici API'den çekmelidir
- **FR-022:** Altın kuru TL/gram olarak hesaplanmalıdır
- **FR-023:** 14 ayar için fiyat hesaplama: (Gram * Kur * 14/24)
- **FR-024:** 22 ayar için fiyat hesaplama: (Gram * Kur * 22/24)
- **FR-025:** Fiyat 2 ondalık hassasiyette gösterilmelidir
- **FR-026:** API hatası durumunda kullanıcı bilgilendirilmelidir
- **FR-027:** Altın kuru bilgisi ve son güncelleme zamanı gösterilmelidir
- **FR-028:** Kur verisi cache'lenebilir (5-10 dakika)

### 3.7 Validation
- **FR-029:** Tüm zorunlu alanlar doldurulmalıdır
- **FR-030:** Sayısal alanlar negatif olamaz
- **FR-031:** Sıra numaraları 3-61 arası tek sayılar olmalıdır
- **FR-032:** Unique constraint ihlallerinde uyarı gösterilmelidir

### 3.8 User Interface
- **FR-033:** Admin ve Kullanıcı arayüzleri ayrı olmalıdır
- **FR-034:** Responsive tasarım desteklenmelidir
- **FR-035:** Tüm işlemlerde başarı/hata bildirimleri gösterilmelidir
- **FR-036:** Silme işlemlerinde onay dialogu gösterilmelidir
- **FR-037:** Hesaplama detayları expandable/collapsible olmalıdır
- **FR-038:** Ana sayfa basit ve kullanıcı dostu olmalıdır (2 ana CTA)

---

---

## 4. Data Models

### 4.1 Model Object
```typescript
interface Model {
  id: string;                    // Unique identifier
  modelTipi: string;             // Model adı (unique)
  kesimTipi: 'Dinamik' | 'Statik'; // Kesim türü
  pay: number;                   // Pay değeri (gram)
                                 // Dinamik: 0, Statik: > 0
  createdAt: Date;
  updatedAt?: Date;
}
```

### 4.2 Product Object
```typescript
interface Product {
  id: string;                    // Unique identifier
  modelId: string;               // Foreign key to Model
  ayar: 14 | 22;                 // Ayar bilgisi
  sira: number;                  // Sıra (3, 5, 7, ..., 61)
  birimCmTel: number;            // 1 cm'e giden tel (gram)
  kesilenParca: number;          // Kesilen parça (gram)
  digerAgirliklar: number;       // Diğer ağırlıklar (gram)
  createdAt: Date;
  updatedAt?: Date;
  
  // Computed/Helper fields
  modelTipi?: string;            // Model adı (display için)
  kesimTipi?: string;            // Kesim tipi (display için)
  pay?: number;                  // Pay değeri (hesaplama için)
}
```

### 4.3 Calculation History Object
```typescript
interface CalculationHistory {
  id: string;
  modelTipi: string;
  ayar: 14 | 22;
  sira: number;
  uzunluk: number;               // cm
  pay: number;                   // gram
  birimCmTel: number;            // gram
  digerAgirliklar: number;       // gram
  kesilenParca: number;          // gram
  sonuc: number;                 // Hesaplanan gram
  fiyat?: number;                // Hesaplanan fiyat (TL)
  altinKuru?: number;            // Kullanılan altın kuru (TL/gram)
  calculatedAt: Date;
}
```

### 4.4 Gold Price Object
```typescript
interface GoldPrice {
  currency: string;              // TRY
  buying: number;                // Alış fiyatı (TL/gram)
  selling: number;               // Satış fiyatı (TL/gram)
  timestamp: Date;               // Son güncelleme zamanı
}
```

### 4.5 Unique Constraints
- Model: `modelTipi` (unique)
- Product: `modelId + ayar + sira` (composite unique)

---

## 5. Calculation Formulas

### 5.1 Weight Calculation
```
Sonuç (gram) = ((Uzunluk + Pay) * Birim CM Tel) + Diğer Ağırlıklar - Kesilen Parça
```

### 5.2 Price Calculation
```
14 Ayar Fiyat (TL) = Sonuç (gram) * Altın Kuru (TL/gram) * (14/24)
22 Ayar Fiyat (TL) = Sonuç (gram) * Altın Kuru (TL/gram) * (22/24)
```

**Not:** Altın kuru API'den anlık olarak çekilir. 24 ayar saf altın üzerinden hesaplanır.

**Parametreler:**
- **Uzunluk:** Kullanıcı tarafından girilen ürün uzunluğu (cm)
- **Pay:** Model'den gelen pay değeri (gram)
  - Dinamik kesim: 0
  - Statik kesim: > 0
- **Birim CM Tel:** Ürün tanımından gelen, 1 cm için gereken tel miktarı (gram)
- **Diğer Ağırlıklar:** Ürün tanımından gelen, toka, diş vb. ekstra ağırlıklar (gram)
- **Kesilen Parça:** Ürün tanımından gelen, örgüden kesilen miktar (gram)
  - Dinamik kesim: > 0
  - Statik kesim: 0

### 5.3 Weight Calculation Examples

**Senaryo 1: Dinamik Kesim**
- Model: Klasik Zincir (Dinamik, Pay: 0)
- Ayar: 22, Sıra: 5
- Uzunluk: 50 cm
- Birim CM Tel: 0.45 gram
- Diğer Ağırlıklar: 2.30 gram (toka)
- Kesilen Parça: 0.80 gram

```
Sonuç = ((50 + 0) * 0.45) + 2.30 - 0.80
      = (50 * 0.45) + 2.30 - 0.80
      = 22.50 + 2.30 - 0.80
      = 24.00 gram
```

**Senaryo 2: Statik Kesim**
- Model: Özel Tasarım (Statik, Pay: 1.50)
- Ayar: 14, Sıra: 7
- Uzunluk: 40 cm
- Birim CM Tel: 0.35 gram
- Diğer Ağırlıklar: 3.20 gram
- Kesilen Parça: 0 gram

```
Sonuç = ((40 + 1.50) * 0.35) + 3.20 - 0
      = (41.50 * 0.35) + 3.20
      = 14.53 + 3.20
      = 17.73 gram
```

### 5.4 Price Calculation Example

**Senaryo: Yukarıdaki Senaryo 2 için fiyat hesaplama**
- Hesaplanan Gram: 17.73 gram
- Ayar: 14
- Altın Kuru (anlık): 2,850 TL/gram (24 ayar)

```
14 Ayar Fiyat = 17.73 * 2,850 * (14/24)
              = 17.73 * 2,850 * 0.583333
              = 29,480.55 TL
```

**Not:** 22 ayar için (22/24) = 0.916667 çarpanı kullanılır.

---

## 6. External Services

### 6.1 Gold Price API
**Service:** Altın Kuru API  
**Purpose:** Güncel 24 ayar altın fiyatını TL/gram olarak çekmek

**API Options:**
1. **Altın API (Önerilen)**: `https://api.genelpara.com/embed/altin.json`
   - Free tier mevcut
   - TL bazlı altın fiyatları
   - Günlük güncelleme

2. **TCMB (Alternatif)**: T.C. Merkez Bankası Döviz Kurları
   - Resmi kaynak
   - XML/JSON format
   - Günlük güncelleme

**Response Format (Example):**
```json
{
  "GA": {
    "Alış": "2,845.50",
    "Satış": "2,850.75",
    "Tarih": "26.01.2026 14:30"
  }
}
```

**Error Handling:**
- API çağrısı başarısız olursa kullanıcıya bilgi gösterilir
- Son başarılı kur bilgisi cache'den kullanılabilir (5-10 dakika)
- Manuel kur girişi seçeneği sunulabilir (gelecek özellik)

**Rate Limiting:**
- Cache mekanizması ile API çağrıları azaltılır
- Hesaplama başına değil, sayfa yüklendiğinde bir kez çekilir
- 5-10 dakika boyunca cache'lenir

---

## 7. Non-Functional Requirements

### 7.1 Performance
- Hesaplamalar anlık olarak gerçekleşmelidir (< 100ms)
- API çağrıları cache'lenerek performans optimize edilmelidir (< 2s ilk çağrı)
- Sayfa yüklenme süresi 2 saniyeden az olmalıdır
- Tablolarda 1000+ kayıt için performans sorun yaşamamalıdır

### 7.2 Usability
- Arayüz Türkçe olmalıdır
- Form alanları açıkça etiketlenmelidir
- Hata mesajları anlaşılır ve Türkçe olmalıdır
- Dropdown'lar otomatik filtreleme yapmalıdır
- Inline editing kullanıcı dostu olmalıdır
- Mobil cihazlarda kullanılabilir olmalıdır

### 7.3 Data Integrity
- Tüm sayısal değerler 2 ondalık hassasiyette saklanmalıdır
- Unique constraint'ler her zaman kontrol edilmelidir
- LocalStorage corrupt olmaya karşı korunmalıdır
- Silme işlemleri cascade (ilişkisel) olarak çalışmalıdır

### 7.4 Browser Compatibility
- Chrome (son 2 versiyon)
- Firefox (son 2 versiyon)
- Safari (son 2 versiyon)
- Edge (son 2 versiyon)

### 7.5 Security
- Admin şifresi hardcoded olacak (ilk versiyon)
- XSS koruması sağlanmalıdır
- Input validasyonu yapılmalıdır
- API key'leri environment variables'da saklanmalıdır

### 7.6 Reliability
- Validasyon hataları kullanıcı dostu gösterilmelidir
- Kritik işlemler için onay dialogları bulunmalıdır
- Hesaplama hataları gracefully handle edilmelidir
- API hatalarında fallback mekanizmaları bulunmalıdır

---

## 8. Technical Constraints

### 8.1 Technology Stack
- **Framework:** Angular 17+
- **Language:** TypeScript 5.2+
- **Styling:** SCSS with animations
- **State Management:** RxJS BehaviorSubject/Subject + LocalStorage
- **HTTP Client:** Angular HttpClient for API calls
- **Forms:** Reactive Forms
- **UI Components:** Angular Material (önerilen) veya custom

### 8.2 Browser APIs
- LocalStorage API (veri kalıcılığı için)
- HttpClient (altın kuru API çağrıları için)

---

## 8. User Interface Design

### 8.1 Application Structure
```
┌─────────────────────────────────────┐
│         Header / Navigation         │
│  [Logo] [Ana Sayfa] [Admin] [Çıkış]│
└─────────────────────────────────────┘
│
├─ Ana Sayfa (Kullanıcı)
│  ├─ Gram Hesaplama Formu
│  └─ Son 5 Hesaplama Geçmişi
│
└─ Admin Paneli
   ├─ Login Sayfası
   ├─ Model Yönetimi
   │  ├─ Model Listesi (Tablo + Inline Edit)
   │  └─ Model Ekleme Formu
   └─ Ürün Yönetimi
      ├─ Ürün Listesi (Tablo + Inline Edit)
      └─ Toplu Ürün Ekleme Formu
```

### 8.2 Page Layouts

#### 8.2.1 Login Page
```
┌──────────────────────────┐
│   Admin Login            │
│                          │
│   Kullanıcı Adı: [____] │
│   Şifre:         [____] │
│                          │
│   [Giriş Yap]           │
└──────────────────────────┘
```

#### 8.2.2 Model Management
```
┌──────────────────────────────────────────────┐
│ Model Yönetimi                              │
├──────────────────────────────────────────────┤
│ Yeni Model Ekle                              │
│ Model Tipi: [________]                       │
│ Kesim Tipi: [Dropdown ▼]                     │
│ Pay (cm): [_____]                            │
│ [Ekle]                                       │
├──────────────────────────────────────────────┤
│ Model Listesi            [Ara: _____]        │
│ ┌─────────┬──────────┬──────┬────────┐      │
│ │ Model   │ Kesim    │ Pay  │ İşlem  │      │
│ ├─────────┼──────────┼──────┼────────┤      │
│ │ Klasik  │ Dinamik  │ 0.00 │ [✏️] [🗑️]│      │
│ │ Özel    │ Statik   │ 1.50 │ [✏️] [🗑️]│      │
│ └─────────┴──────────┴──────┴────────┘      │
└──────────────────────────────────────────────┘
```

#### 8.2.3 Product Management
```
┌────────────────────────────────────────────────────────┐
│ Ürün Yönetimi                                          │
├────────────────────────────────────────────────────────┤
│ Toplu Ürün Ekle                    [+ Yeni Satır]      │
│ ┌──────┬─────┬────┬──────┬─────┬─────┬──────┐        │
│ │Model │Ayar │Sıra│1cm Tel│Kesilen│Diğer│İşlem │        │
│ ├──────┼─────┼────┼──────┼─────┼─────┼──────┤        │
│ │[▼]   │[▼]  │[▼] │[___]│[___]│[___]│ [X]  │        │
│ │[▼]   │[▼]  │[▼] │[___]│[___]│[___]│ [X]  │        │
│ └──────┴─────┴────┴──────┴─────┴─────┴──────┘        │
│ [Toplu Kaydet]                                         │
├────────────────────────────────────────────────────────┤
│ Ürün Listesi                       [Ara: _____]        │
│ ┌──────┬─────┬────┬──────┬─────┬─────┬──────┐        │
│ │Model │Ayar │Sıra│1cm Tel│Kesilen│Diğer│İşlem │        │
│ ├──────┼─────┼────┼──────┼─────┼─────┼──────┤        │
│ │Klasik│ 22  │ 5  │ 0.45│ 0.80│ 2.30│[✏️][🗑️]│        │
│ │Klasik│ 14  │ 7  │ 0.35│ 0.65│ 2.10│[✏️][🗑️]│        │
│ └──────┴─────┴────┴──────┴─────┴─────┴──────┘        │
└────────────────────────────────────────────────────────┘
```

#### 8.2.4 User Calculation Page
```
┌────────────────────────────────────────────────┐
│ Gram Hesaplama                                 │
├────────────────────────────────────────────────┤
│ Model:      [Klasik Zincir        ▼]           │
│ Ayar:       [22 ayar             ▼]           │
│ Sıra:       [5                   ▼]           │
│ Uzunluk:    [_____] cm                         │
│                                                │
│ [Ürün Gramı Hesapla]                          │
│                                                │
│ ┌────────────────────────────────────┐        │
│ │ SONUÇ: 24.35 gram                  │        │
│ └────────────────────────────────────┘        │
│                                                │
│ [Yeni Hesaplama]                              │
├────────────────────────────────────────────────┤
│ Son Hesaplamalar                              │
│ ┌──────┬─────┬────┬──────┬────────┐          │
│ │Model │Ayar │Sıra│Uzunluk│Sonuç  │          │
│ ├──────┼─────┼────┼──────┼────────┤          │
│ │Klasik│ 22  │ 5  │ 50cm │24.35 g │          │
│ │Özel  │ 14  │ 7  │ 40cm │17.73 g │          │
│ └──────┴─────┴────┴──────┴────────┘          │
└────────────────────────────────────────────────┘
```

### 8.3 Dialog/Modal Designs

#### 8.3.1 Delete Model Confirmation
```
┌──────────────────────────────────────┐
│ ⚠️  Model Silme Onayı                │
├──────────────────────────────────────┤
│ Bu modele bağlı 12 adet ürün de      │
│ silinecek. Onaylıyor musunuz?       │
│                                      │
│ Model: Klasik Zincir                 │
│                                      │
│        [İptal]  [Evet, Sil]         │
└──────────────────────────────────────┘
```

#### 8.3.2 Delete Product Confirmation
```
┌──────────────────────────────────────┐
│ ⚠️  Ürün Silme Onayı                 │
├──────────────────────────────────────┤
│ Bu ürünü silmek istediğinizden       │
│ emin misiniz?                        │
│                                      │
│ Model: Klasik - 22 ayar - Sıra 5     │
│                                      │
│        [İptal]  [Evet, Sil]         │
└──────────────────────────────────────┘
```

#### 8.3.3 Validation Error
```
┌──────────────────────────────────────┐
│ ❌ Hata                               │
├──────────────────────────────────────┤
│ Bu kombinasyon zaten mevcut:         │
│ Model: Klasik - 22 ayar - Sıra 5     │
│                                      │
│              [Tamam]                 │
└──────────────────────────────────────┘
```

---

## 9. Excel File Structure

### 9.1 Sheet: "Modeller"
| id | modelTipi | kesimTipi | pay | createdAt | updatedAt |
|----|-----------|-----------|-----|-----------|-----------|
| 1  | Klasik Zincir | Dinamik | 0.00 | 2026-01-26 | 2026-01-26 |
| 2  | Özel Tasarım | Statik | 1.50 | 2026-01-26 | 2026-01-26 |

### 9.2 Sheet: "Ürünler"
| id | modelId | ayar | sira | birimCmTel | kesilenParca | digerAgirliklar | createdAt | updatedAt |
|----|---------|------|------|------------|--------------|-----------------|-----------|-----------|
| 1  | 1       | 22   | 5    | 0.45       | 0.80         | 2.30            | 2026-01-26 | 2026-01-26 |
| 2  | 1       | 14   | 7    | 0.35       | 0.65         | 2.10            | 2026-01-26 | 2026-01-26 |
| 3  | 2       | 22   | 3    | 0.55       | 0.00         | 3.20            | 2026-01-26 | 2026-01-26 |

---

## 10. Validation Rules

### 10.1 Model Validation
| Field | Rule | Error Message |
|-------|------|---------------|
| modelTipi | Required, 2-50 chars, unique | "Model tipi zorunludur ve benzersiz olmalıdır" |
| kesimTipi | Required, enum | "Kesim tipi seçilmelidir" |
| pay | Required if Statik, >= 0, 2 decimals | "Pay değeri girilmelidir" |

### 10.2 Product Validation
| Field | Rule | Error Message |
|-------|------|---------------|
| modelId | Required, exists in Modeller | "Model seçilmelidir" |
| ayar | Required, 14 or 22 | "Ayar seçilmelidir" |
| sira | Required, 3-61, odd numbers | "Geçerli bir sıra seçilmelidir" |
| birimCmTel | Required, > 0, 2 decimals | "1 cm tel miktarı girilmelidir" |
| kesilenParca | >= 0, 2 decimals, required if Dinamik | "Kesilen parça miktarı girilmelidir" |
| digerAgirliklar | Required, >= 0, 2 decimals | "Diğer ağırlıklar girilmelidir" |
| Unique | modelId + ayar + sira | "Bu kombinasyon zaten mevcut" |

### 10.3 Calculation Validation
| Field | Rule | Error Message |
|-------|------|---------------|
| model | Required, exists | "Model seçilmelidir" |
| ayar | Required, exists for model | "Ayar seçilmelidir" |
| sira | Required, exists for model+ayar | "Sıra seçilmelidir" |
| uzunluk | Required, > 0, <= 1000, 2 decimals | "Uzunluk 0-1000 cm arasında olmalıdır" |

---

## 11. Error Handling

### 11.1 User-Facing Errors
- Form validation errors: Field-level, inline
- Unique constraint: Modal dialog
- Excel import errors: Detailed list
- Calculation errors: Inline message
- Network/file errors: Toast notification

### 11.2 System Errors
- Excel file not found: Fallback to empty data
- Excel corrupt: Show error, prevent app crash
- Calculation overflow: Show error message
- Browser compatibility: Show warning

---

## 12. Future Considerations (Out of Scope for v1.0)

### 12.1 Authentication
- Çoklu kullanıcı desteği
- Rol tabanlı erişim kontrolü (Admin, User, Viewer)
- Şifre değiştirme özelliği
- Session management

### 12.2 Data Management
- Cloud storage entegrasyonu
- Otomatik backup (scheduled)
- Version history / audit log
- LocalStorage export/import özelliği

### 12.3 Advanced Features
- Manuel altın kuru girişi
- Müşteri yönetimi
- Sipariş takibi
- Stok yönetimi
- Raporlama ve analizler
- Excel şablonu download
- Bulk operations (toplu silme, güncelleme)

### 12.4 UI/UX
- Dark mode
- Dil seçimi (TR/EN)
- Gelişmiş filtreleme ve sıralama
- Grafik ve chart'lar
- Print/PDF export
- Keyboard shortcuts

### 12.5 Technical
- Backend API entegrasyonu
- Real-time senkronizasyon
- Offline mode support
- Progressive Web App (PWA)
- Unit & E2E test coverage

---

## 13. Assumptions & Dependencies

### 13.1 Assumptions
- Kullanıcılar modern web tarayıcıları kullanacaktır
- LocalStorage manuel olarak yedeklenebilir (Excel export ile)
- Maksimum 1000 model ve 5000 ürün olacaktır
- Tek kullanıcı aynı anda sistemi kullanacaktır
- Admin şifresi güvenli bir ortamda saklanacaktır
- Altın kuru API'si erişilebilir ve güvenilir olacaktır
- İnternet bağlantısı fiyat hesaplaması için gereklidir

### 13.2 Dependencies
- Node.js 18+ ve npm kurulu olmalıdır
- Angular CLI kurulu olmalıdır
- Modern web tarayıcı (Chrome, Firefox, Safari, Edge)
- Altın kuru API'sine erişim
- İnternet bağlantısı (fiyat hesaplaması için)

### 13.3 Constraints
- LocalStorage kapasitesi (~5-10 MB browser limiti)
- Hesaplama geçmişi sadece session bazlı (max 5)
- Admin şifresi hardcoded (ilk versiyon)
- Tek dil desteği (Türkçe)
- API rate limiting (cache ile optimize edilecek)
- Altın kuru 5-10 dakika cache'lenir

---

## 14. Success Criteria

### 14.1 Functional Success
- ✅ Admin tüm CRUD işlemlerini yapabiliyor
- ✅ Kullanıcı hızlı ve doğru gram hesaplama yapabiliyor
- ✅ Kullanıcı güncel altın kuru ile fiyat hesaplama yapabiliyor
- ✅ Validasyonlar çalışıyor
- ✅ Excel import/export her iki sayfada çalışıyor
- ✅ LocalStorage persistence çalışıyor
- ✅ Unique constraint'ler kontrol ediliyor
- ✅ Cascade delete çalışıyor
- ✅ Hesaplama detayları expandable/collapsible
- ✅ Ana sayfa basit ve kullanıcı dostu (2 CTA)

### 14.2 Performance Success
- ✅ Hesaplamalar < 100ms
- ✅ API çağrıları < 2s (ilk çağrı)
- ✅ Sayfa yüklenme < 2s
- ✅ Excel işlemleri < 5s (1000 kayıt)
- ✅ 1000+ kayıtta performans sorun yok
- ✅ Cache mekanizması çalışıyor

### 14.3 User Experience Success
- ✅ Arayüz sezgisel ve kolay kullanılabilir
- ✅ Hata mesajları anlaşılır
- ✅ Mobile responsive çalışıyor
- ✅ Inline editing kolay kullanılıyor
- ✅ Dropdown filtreleme çalışıyor

---2026-01-26  
**Version:** 1.1  
**Status:** In Development

## 15. Approval

**Product Owner:** [İsim]  
**Technical Lead:** [İsim]  
**Approval Date:** [Tarih]  
**Version:** 2.0  
**Status:** Ready for Development

---

## 16. NEW FEATURES - Version 2.0

### Feature 1: Product Type-Based Calculation System
#### Overview
Farklı ürün tipleri (Kolye/Bilezik vs Yüzük/Küpe) için farklı hesaplama formülleri uygulanacak.

#### US-012: Product Type Selection
**As a** kullanıcı  
**I want to** ürün tipini seçmek  
**So that** doğru formülle hesaplama yapılsın

**Acceptance Criteria:**
- Hesaplama sayfasında ürün tipi dropdown'u eklenmelidir
- Seçenekler: "Kolye/Bilezik" ve "Yüzük/Küpe"
- Default seçim: "Kolye/Bilezik"
- Ürün tipi seçimi hesaplamadan önce yapılmalıdır

#### Calculation Formulas by Product Type

**Kolye/Bilezik (Existing Formula):**
```
Sonuç = ((Uzunluk + Pay) * 1cm Tel) + Diğer Ağırlıklar - Kesilen Parça
```

**Yüzük/Küpe (New Formula):**
```
Sonuç = (Sıra * 1cm Tel) + Diğer Ağırlıklar
```

**Key Differences:**
- Yüzük/Küpe formülünde "Uzunluk", "Pay" ve "Kesilen Parça" kullanılmaz
- Sadece "Sıra" ve "1cm Tel" çarpımı + Diğer Ağırlıklar

**Form Field Behavior:**
- Kolye/Bilezik seçildiğinde: Uzunluk alanı gösterilir (zorunlu)
- Yüzük/Küpe seçildiğinde: Uzunluk alanı gizlenir veya disabled

---

### Feature 2: Order Management & Customer System
#### Overview
Müşteri bilgileri ve siparişleri DynamoDB'de saklanacak. Her sipariş bir müşteriye bağlı olacak (1-to-1).

#### Data Models

**Customer Model:**
```typescript
interface Customer {
  customerId: string;          // PK: UUID
  name: string;                // İsim
  phone: string;               // Telefon (unique)
  email?: string;              // Email (optional)
  address?: string;            // Adres (optional)
  notes?: string;              // Notlar (optional)
  createdAt: string;           // ISO 8601 timestamp
  updatedAt: string;           // ISO 8601 timestamp
}
```

**Order Model:**
```typescript
interface Order {
  orderId: string;             // PK: UUID
  customerId: string;          // FK: Customer ID
  productType: 'Kolye/Bilezik' | 'Yüzük/Küpe';
  modelId: string;             // FK: Model ID
  ayar: 14 | 22;
  sira: number;
  uzunluk?: number;            // Only for Kolye/Bilezik
  calculatedGram: number;      // Hesaplanan gram
  goldPrice: number;           // Kullanılan altın kuru
  totalPrice: number;          // Hesaplanan fiyat
  orderDate: string;           // ISO 8601 timestamp
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;              // Sipariş notları
  createdAt: string;
  updatedAt: string;
  
  // Denormalized for display
  customerName?: string;
  customerPhone?: string;
  modelName?: string;
}
```

#### DynamoDB Schema

**Table: Customers**
- Partition Key: `customerId` (String)
- GSI1: `phone` (String) - For unique phone lookup
- Attributes: All fields from Customer model

**Table: Orders**
- Partition Key: `orderId` (String)
- Sort Key: `orderDate` (String)
- GSI1: `customerId` + `orderDate` - For customer's orders
- GSI2: `status` + `orderDate` - For filtering by status
- Attributes: All fields from Order model

#### US-013: Customer Management
**As an** admin  
**I want to** müşteri bilgilerini yönetmek  
**So that** siparişleri müşterilere bağlayabilirim

**Acceptance Criteria:**
- Admin panelinde "Müşteri Yönetimi" sekmesi eklenmelidir
- Müşteri CRUD işlemleri yapılabilmelidir
- Telefon numarası unique olmalıdır
- Müşteri listesi tablo formatında gösterilmelidir
- Arama/filtreleme yapılabilmelidir
- Müşteriye bağlı siparişler silinmemelidir (constraint)

#### US-014: Order Creation from Calculation
**As a** kullanıcı  
**I want to** hesaplamadan direkt sipariş oluşturmak  
**So that** müşteri bilgilerini kaydedebilirim

**Acceptance Criteria:**
- Hesaplama sonucunda "Sipariş Oluştur" butonu gösterilmelidir
- Buton tıklandığında sipariş formu açılmalıdır
- Form alanları:
  - Müşteri Seçimi: Dropdown (mevcut müşteriler) + "Yeni Müşteri" seçeneği
  - Yeni müşteri için: İsim, Telefon (zorunlu), Email, Adres (opsiyonel)
  - Sipariş Notları (opsiyonel)
  - Durum: Default "pending"
- Hesaplama verileri otomatik doldurulmalıdır
- Kayıt sonrası DynamoDB'ye yazılmalıdır
- Başarı bildirimi gösterilmelidir

#### US-015: Order Management
**As an** admin  
**I want to** siparişleri görüntülemek ve yönetmek  
**So that** sipariş durumlarını takip edebilirim

**Acceptance Criteria:**
- Admin panelinde "Sipariş Yönetimi" sekmesi eklenmelidir
- Tüm siparişler liste/tablo formatında gösterilmelidir
- Kolonlar: Sipariş ID, Müşteri, Ürün Tipi, Model, Gram, Fiyat, Durum, Tarih
- Durum filtreleme: Pending, Completed, Cancelled
- Tarih aralığı filtreleme yapılabilmelidir
- Sipariş detayları görüntülenebilmelidir
- Sipariş durumu güncellenebilmelidir
- Sipariş notları eklenebilir/güncellenebilir

#### API Endpoints

**Customers:**
- `POST /api/customers` - Create customer
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer by ID
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer (with constraint check)
- `GET /api/customers/phone/:phone` - Check phone uniqueness

**Orders:**
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders (with filters: status, dateRange, customerId)
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order
- `PUT /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

---

### Feature 3: Monthly Reporting System
#### Overview
Admin kullanıcılar için aylık raporlama sistemi. Grafikler ve PDF/Excel export özellikleri.

#### Report Data Model
```typescript
interface MonthlyReport {
  reportId: string;            // PK: UUID
  month: string;               // Format: "YYYY-MM"
  totalOrders: number;         // Toplam sipariş sayısı
  completedOrders: number;     // Tamamlanan sipariş
  cancelledOrders: number;     // İptal edilen sipariş
  totalRevenue: number;        // Toplam ciro (TL)
  totalGrams: number;          // Toplam gram
  ayar14Count: number;         // 14 ayar sipariş sayısı
  ayar22Count: number;         // 22 ayar sipariş sayısı
  kolyeBilezikCount: number;  // Kolye/Bilezik sayısı
  yuzukKupeCount: number;     // Yüzük/Küpe sayısı
  topModels: Array<{          // En çok sipariş alan modeller
    modelId: string;
    modelName: string;
    count: number;
  }>;
  topCustomers: Array<{       // En çok sipariş veren müşteriler
    customerId: string;
    customerName: string;
    orderCount: number;
    totalSpent: number;
  }>;
  createdAt: string;
  generatedBy: string;        // Admin user ID
}
```

#### DynamoDB Schema

**Table: Reports**
- Partition Key: `month` (String) - Format: "YYYY-MM"
- Sort Key: `createdAt` (String)
- Attributes: All fields from MonthlyReport model

**S3 Storage:**
- Bucket: `gramfiyat-reports`
- Path structure: `/reports/{year}/{month}/`
- File naming: `report-{month}-{timestamp}.pdf` or `.xlsx`
- Lifecycle policy:
  - Standard (0-30 days)
  - Standard-IA (30-90 days)
  - Glacier (90+ days)

#### US-016: Generate Monthly Report
**As an** admin  
**I want to** aylık rapor oluşturmak  
**So that** işletme performansını görebilirim

**Acceptance Criteria:**
- Admin panelinde "Raporlar" sekmesi eklenmelidir
- Ay ve yıl seçimi yapılabilmelidir
- "Rapor Oluştur" butonu ile rapor generate edilmelidir
- Rapor oluşturulurken loading gösterilmelidir
- Rapor verileri DynamoDB'den hesaplanmalıdır
- Rapor otomatik olarak DynamoDB'ye kaydedilmelidir
- Başarı bildirimi gösterilmelidir

#### US-017: View Report Dashboard
**As an** admin  
**I want to** rapor dashboard'unu görmek  
**So that** verileri görsel olarak anlayabilirim

**Acceptance Criteria:**
- Rapor sayfasında özet kartlar gösterilmelidir:
  - Toplam Sipariş
  - Tamamlanan Sipariş
  - Toplam Ciro
  - Toplam Gram
- Grafikler (ng2-charts kullanılarak):
  - Bar Chart: Ayar dağılımı (14 vs 22)
  - Pie Chart: Ürün tipi dağılımı (Kolye/Bilezik vs Yüzük/Küpe)
  - Line Chart: Aylık trend (son 6 ay)
  - Bar Chart: En çok sipariş alan modeller (top 5)
  - Table: En çok sipariş veren müşteriler (top 10)
- Grafiklerde hover tooltip gösterilmelidir
- Responsive tasarım olmalıdır

#### US-018: Export Report
**As an** admin  
**I want to** raporu PDF veya Excel olarak dışa aktarmak  
**So that** paylaşabilir veya arşivleyebilirim

**Acceptance Criteria:**
- Rapor sayfasında "PDF İndir" ve "Excel İndir" butonları olmalıdır
- PDF export:
  - Logo ve başlık bilgisi
  - Özet istatistikler
  - Grafikler (görsel olarak)
  - Tablo verileri
- Excel export:
  - Özet istatistikler (ilk sayfa)
  - Detaylı sipariş listesi (ikinci sayfa)
  - Müşteri istatistikleri (üçüncü sayfa)
- Export işlemi background'da çalışmalıdır
- Dosya hazır olunca otomatik indirilmelidir
- Export sonrası S3'e yükleme yapılmalıdır
- Export geçmişi tutulmalıdır

#### API Endpoints

**Reports:**
- `POST /api/reports/generate` - Generate monthly report
  - Body: `{ month: "YYYY-MM" }`
  - Returns: Report data
- `GET /api/reports/:month` - Get report by month
- `GET /api/reports` - List all reports (with pagination)
- `GET /api/reports/:month/pdf` - Generate and download PDF
- `GET /api/reports/:month/excel` - Generate and download Excel
- `POST /api/reports/:reportId/upload-s3` - Upload to S3

#### Chart Requirements

**ng2-charts Integration:**
```typescript
// Install
npm install ng2-charts chart.js

// Import in component
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
```

**Chart Types:**
1. **Bar Chart** - Ayar dağılımı
2. **Pie Chart** - Ürün tipi dağılımı
3. **Line Chart** - Aylık trend
4. **Horizontal Bar Chart** - Top modeller

**Chart Colors:**
- 14 Ayar: Gold (#FFD700)
- 22 Ayar: Dark Gold (#B8860B)
- Kolye/Bilezik: Blue (#4A90E2)
- Yüzük/Küpe: Purple (#9B59B6)

---

## 17. AWS Architecture for New Features

### 17.1 DynamoDB Tables

**Customers Table:**
```
Table Name: GramFiyat-Customers
Billing Mode: On-Demand (start), Provisioned (scale)
Partition Key: customerId (String)
GSI1: phone-index
  - Partition Key: phone (String)
  - Projection: ALL
Attributes: customerId, name, phone, email, address, notes, createdAt, updatedAt
```

**Orders Table:**
```
Table Name: GramFiyat-Orders
Billing Mode: On-Demand (start), Provisioned (scale)
Partition Key: orderId (String)
Sort Key: orderDate (String)
GSI1: customer-orders-index
  - Partition Key: customerId (String)
  - Sort Key: orderDate (String)
  - Projection: ALL
GSI2: status-orders-index
  - Partition Key: status (String)
  - Sort Key: orderDate (String)
  - Projection: ALL
Attributes: All Order fields
```

**Reports Table:**
```
Table Name: GramFiyat-Reports
Billing Mode: On-Demand
Partition Key: month (String)
Sort Key: createdAt (String)
Attributes: All MonthlyReport fields
```

### 17.2 S3 Configuration

**Bucket: gramfiyat-reports**
```
Region: eu-central-1 (or closest)
Versioning: Enabled
Encryption: AES-256
Public Access: Blocked
CORS: Enabled for download
```

**Lifecycle Policy:**
```json
{
  "Rules": [
    {
      "Id": "MoveToIA",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

### 17.3 Lambda Functions

**New Functions:**
- `generateMonthlyReport` - Calculate and store report
- `exportReportPDF` - Generate PDF from report data
- `exportReportExcel` - Generate Excel from report data
- `uploadReportToS3` - Upload file to S3

**Updated Functions:**
- `createOrder` - New endpoint
- `getOrders` - New endpoint with filters
- `createCustomer` - New endpoint
- `getCustomers` - New endpoint

### 17.4 Cost Estimation (Monthly)

**DynamoDB:**
- Customers: ~1000 items × 1 KB = 1 MB storage → $0.25/month
- Orders: ~5000 items × 2 KB = 10 MB storage → $2.50/month
- Reports: ~12 items × 50 KB = 0.6 MB storage → $0.15/month
- Read/Write (On-Demand): ~10,000 requests/month → $2.50/month

**S3:**
- Storage: ~100 reports × 5 MB = 500 MB → $0.01/month (Standard)
- Standard-IA (30-90 days): 500 MB → $0.0125/month
- Glacier (90+ days): 500 MB → $0.004/month
- Data Transfer: 50 GB/month → $4.50/month

**Lambda:**
- Invocations: 50,000/month → $0.01/month
- Duration: 10,000 GB-seconds → $0.17/month

**CloudWatch:**
- Logs: 10 GB/month → $0.50/month
- Metrics: Basic (free)

**API Gateway:**
- 100,000 requests/month → $0.35/month

**Total Estimated Cost:**
- **Starting (On-Demand):** ~$18/month
- **Scaling (Provisioned + optimization):** ~$73/month

**Cost Optimization Tips:**
1. Use DynamoDB On-Demand for starting
2. Switch to Provisioned when traffic is predictable
3. Implement S3 lifecycle policies
4. Cache report data in frontend
5. Optimize Lambda memory/duration
6. Use CloudWatch Logs Insights sparingly

---

## 18. Implementation Phases

### Phase 1: Product Type Calculation (Week 1-2)
- [ ] Update Calculation model with productType field
- [ ] Update CalculationService with new formula
- [ ] Update UI: Add product type dropdown
- [ ] Update form logic: Show/hide uzunluk field
- [ ] Add tests for new formula
- [ ] Update documentation

### Phase 2: Customer Management (Week 3-4)
- [ ] Create Customer model
- [ ] Create DynamoDB Customers table
- [ ] Create Customer API endpoints
- [ ] Create Customer service (frontend)
- [ ] Create Customer management component
- [ ] Add tests
- [ ] Update documentation

### Phase 3: Order System (Week 5-6)
- [ ] Create Order model
- [ ] Create DynamoDB Orders table
- [ ] Create Order API endpoints
- [ ] Create Order service (frontend)
- [ ] Update calculation component: Add "Sipariş Oluştur" button
- [ ] Create order form modal
- [ ] Create order management component
- [ ] Add tests
- [ ] Update documentation

### Phase 4: Reporting System (Week 7-9)
- [ ] Create MonthlyReport model
- [ ] Create DynamoDB Reports table
- [ ] Create S3 bucket with lifecycle
- [ ] Create report generation Lambda
- [ ] Create PDF export Lambda
- [ ] Create Excel export Lambda
- [ ] Install and configure ng2-charts
- [ ] Create report dashboard component
- [ ] Create chart components
- [ ] Create export buttons
- [ ] Add tests
- [ ] Update documentation

### Phase 5: Integration & Testing (Week 10)
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security audit
- [ ] Documentation finalization
- [ ] User acceptance testing
- [ ] Production deployment
- [ ] Monitor and optimize

---

## 19. Testing Strategy for New Features

### 19.1 Unit Tests
- Product type calculation formulas
- Customer service CRUD operations
- Order service CRUD operations
- Report generation logic
- Chart data transformation
- PDF/Excel generation

### 19.2 Integration Tests
- Calculation → Order flow
- Order → Customer relationship
- Report generation from Orders
- S3 upload/download
- DynamoDB queries with GSIs

### 19.3 E2E Tests
- Complete order flow
- Report generation and export
- Customer management workflow
- Multi-user scenarios (admin vs user)

---

## 20. Security Considerations

### 20.1 Data Protection
- Customer phone numbers encrypted at rest
- PII (Personally Identifiable Information) handling
- GDPR compliance considerations
- Data retention policies

### 20.2 Access Control
- Only admin users can access reports
- Only admin users can manage customers
- Regular users can only create orders
- S3 bucket access restricted to Lambda

### 20.3 API Security
- JWT token validation
- Rate limiting on endpoints
- Input sanitization
- SQL/NoSQL injection prevention

---

**Last Updated:** 2026-02-10  
**Version:** 2.0  
**Status:** Ready for Implementation
