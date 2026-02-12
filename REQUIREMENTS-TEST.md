# Requirements Test Document
## Fiyat Hesaplama Uygulaması - Test Senaryoları

**Created:** 2026-02-12  
**Based on:** PRD.md v1.1

---

## 1. Ürün Tipi Gereksinimleri

### ✅ REQ-001: Kolye/Bilezik Özellikleri
```
- Model: ZORUNLU
- Ayar: ZORUNLU  
- Sıra: ZORUNLU (3, 5, 7, ..., 61 tek sayılar)
- Uzunluk: ZORUNLU
- Formül: ((Uzunluk + Pay) * 1cmTel) + DigerAgirliklar - KesilenParca
```

### ✅ REQ-002: Yüzük/Küpe Özellikleri  
```
- Model: ZORUNLU
- Ayar: ZORUNLU
- Sıra: YOK (Alan gösterilmemeli!)
- Uzunluk: YOK
- Formül: (BirimCmTel + DigerAgirliklar)
```

---

## 2. Test Senaryoları

### Test Case 1: Kolye/Bilezik - Model Listesi Yükleme
```typescript
GIVEN: Kullanıcı hesaplama sayfasında
AND: Ürün tipi "Kolye/Bilezik" seçili
WHEN: Sayfa yüklendiğinde
THEN: Model dropdown'da sadece productType="Kolye/Bilezik" olan modeller gösterilmeli
AND: Model listesi boş olmamalı (en az 1 model olmalı)
```

### Test Case 2: Yüzük - Model Listesi Yükleme
```typescript
GIVEN: Kullanıcı hesaplama sayfasında
AND: Ürün tipi "Yüzük" seçili
WHEN: Sayfa yüklendiğinde
THEN: Model dropdown'da sadece productType="Yüzük" olan modeller gösterilmeli
AND: Model listesi boş olmamalı
```

### Test Case 3: Küpe - Model Listesi Yükleme
```typescript
GIVEN: Kullanıcı hesaplama sayfasında
AND: Ürün tipi "Küpe" seçili
WHEN: Sayfa yüklendiğinde
THEN: Model dropdown'da sadece productType="Küpe" olan modeller gösterilmeli
```

### Test Case 4: Yüzük - Sıra Alanı Gösterilmemeli
```typescript
GIVEN: Kullanıcı hesaplama sayfasında
WHEN: Ürün tipi "Yüzük" seçildiğinde
THEN: "Sıra" alanı DOM'da bulunmamalı
AND: Form validation'da sıra zorunlu olmamalı
```

### Test Case 5: Küpe - Sıra Alanı Gösterilmemeli
```typescript
GIVEN: Kullanıcı hesaplama sayfasında
WHEN: Ürün tipi "Küpe" seçildiğinde
THEN: "Sıra" alanı DOM'da bulunmamalı
AND: Form validation'da sıra zorunlu olmamalı
```

### Test Case 6: Kolye/Bilezik - Sıra Alanı Gösterilmeli
```typescript
GIVEN: Kullanıcı hesaplama sayfasında
WHEN: Ürün tipi "Kolye/Bilezik" seçildiğinde
THEN: "Sıra" alanı görünür olmalı
AND: Form validation'da sıra zorunlu olmalı
```

### Test Case 7: Yüzük Ürün Ekleme
```typescript
GIVEN: Admin ürün yönetimi sayfasında
AND: Yeni ürün formu açık
WHEN: Şu bilgiler girilir:
  - Model: "Test Yüzük" (productType: "Yüzük")
  - Ayar: 14
  - Birim CM Tel: 10.5
  - Diğer Ağırlıklar: 2.3
  - İşçilik: 50
AND: "Kaydet" butonuna tıklanır
THEN: HTTP 201 Created response dönmeli
AND: Ürün başarıyla kaydedilmeli
AND: Sıra alanı gönderilmemeli (backend 400 hatası vermemeli)
```

### Test Case 8: Küpe Ürün Ekleme
```typescript
GIVEN: Admin ürün yönetimi sayfasında
AND: Yeni ürün formu açık
WHEN: Şu bilgiler girilir:
  - Model: "Test Küpe" (productType: "Küpe")
  - Ayar: 22
  - Birim CM Tel: 8.2
  - Diğer Ağırlıklar: 1.5
  - İşçilik: 40
AND: "Kaydet" butonuna tıklanır
THEN: HTTP 201 Created response dönmeli
AND: Ürün başarıyla kaydedilmeli
```

### Test Case 9: Kolye/Bilezik Ürün Ekleme
```typescript
GIVEN: Admin ürün yönetimi sayfasında
WHEN: Şu bilgiler girilir:
  - Model: "Test Kolye" (productType: "Kolye/Bilezik")
  - Ayar: 22
  - Sıra: 5
  - Birim CM Tel: 12.5
  - Kesilen Parça: 3.2
  - Diğer Ağırlıklar: 4.1
  - İşçilik: 60
THEN: Ürün başarıyla kaydedilmeli
AND: Sıra alanı zorunlu olmalı
```

---

## 3. Hata Senaryoları

### Error Test 1: Model Boş Gelme Sorunu
```typescript
PROBLEM: Model dropdown boş geliyor
ROOT CAUSE: ProductService.getProductsByType() modelleri filtreleyemiyor
EXPECTED: Model yüklendiğinde productType ile filtreleme yapılmalı
FIX: ModelService'den modelleri doğru yükle ve filtrele
```

### Error Test 2: Yüzük Ekleme 400 Hatası
```typescript
PROBLEM: Yüzük ekleme sırasında 400 Bad Request
ROOT CAUSE: Backend'de sıra alanı zorunlu olarak kontrol ediliyor
EXPECTED: Yüzük/Küpe için sıra kontrolü OLMAMALI
FIX: Backend product controller validation'ı productType'a göre yapmalı
```

### Error Test 3: Sıra Alanı Yüzük/Küpe'de Görünüyor
```typescript
PROBLEM: Yüzük/Küpe seçildiğinde sıra alanı hala görünüyor
ROOT CAUSE: Frontend'de conditional rendering eksik
EXPECTED: isYuzukKupe durumunda sıra alanı gizlenmeli
FIX: HTML template'de *ngIf="!isYuzukKupe" ekle
```

---

## 4. Backend Validation Rules

### Kolye/Bilezik Backend Validation
```javascript
if (productType === 'Kolye/Bilezik') {
  required: ['modelId', 'ayar', 'sira', 'birimCmTel', 'kesilenParca', 'digerAgirliklar', 'iscilik']
}
```

### Yüzük Backend Validation
```javascript
if (productType === 'Yüzük') {
  required: ['modelId', 'ayar', 'birimCmTel', 'digerAgirliklar', 'iscilik']
  NOT_REQUIRED: ['sira', 'kesilenParca']
}
```

### Küpe Backend Validation
```javascript
if (productType === 'Küpe') {
  required: ['modelId', 'ayar', 'birimCmTel', 'digerAgirliklar', 'iscilik']
  NOT_REQUIRED: ['sira', 'kesilenParca']
}
```

---

## 5. Düzeltme Checklist

- [ ] Frontend: Yüzük/Küpe için sıra alanını gizle
- [ ] Frontend: Model dropdown'u productType'a göre filtrele
- [ ] Frontend: ProductService.getProductsByType() düzelt
- [ ] Backend: Product validation'ı productType'a göre yap
- [ ] Backend: Yüzük/Küpe için sıra zorunlu olmasın
- [ ] Test: Model listesi yükleniyor mu?
- [ ] Test: Yüzük eklenebiliyor mu?
- [ ] Test: Küpe eklenebiliyor mu?
- [ ] Test: Sıra alanı doğru gösteriliyor mu?

---

## 6. Manuel Test Adımları

### Test 1: Model Listesi
```
1. Hesaplama sayfasını aç
2. Ürün Tipi: "Yüzük" seç
3. Model dropdown'a tıkla
EXPECTED: Yüzük modelleri listelenmeli
ACTUAL: Boş geliyor ❌
```

### Test 2: Yüzük Ekleme
```
1. Admin Login
2. Ürün Yönetimi → Yeni Ürün
3. Model: "Yüzük Model 1"
4. Ayar: 14
5. Kaydet
EXPECTED: 201 Created
ACTUAL: 400 Bad Request ❌
```

### Test 3: Sıra Alanı Visibility
```
1. Hesaplama sayfası
2. Ürün Tipi: "Yüzük"
EXPECTED: Sıra alanı görünmemeli
ACTUAL: Hala görünüyor ❌
```

---

**Sonuç:** 3/3 test FAILED - Acil düzeltme gerekiyor!
