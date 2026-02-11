# 🔴 502 Error Fix Checklist

## Lambda Ayarlarını Kontrol Et:

### 1. Configuration → General configuration

**Timeout kontrol et:**
- ❌ 3 seconds (default) → YANLIŞ
- ✅ 30 seconds → DOĞRU

**Değiştir:**
1. Lambda console → Configuration → General configuration
2. Edit
3. Timeout: **30** seconds
4. Save

---

### 2. Runtime settings kontrol et

**Handler kontrol et:**
- ❌ `index.handler` → YANLIŞ
- ❌ `lambda` → YANLIŞ  
- ❌ `handler` → YANLIŞ
- ✅ `lambda.handler` → DOĞRU

**Değiştir:**
1. Code → Runtime settings → Edit
2. Handler: **lambda.handler**
3. Save

---

### 3. Environment variables kontrol et

**Olması gerekenler:**
```
NODE_ENV = production
JWT_SECRET = your-secret-here
DYNAMODB_TABLE_PREFIX = GramFiyat-
AWS_REGION = eu-central-1
```

**Ekle:**
1. Configuration → Environment variables → Edit
2. Her birini ekle
3. Save

---

### 4. Permissions kontrol et

**IAM Role:**
1. Configuration → Permissions
2. Execution role → Click role name
3. Permissions → Attach policies
4. **AmazonDynamoDBFullAccess** ekli mi?

---

### 5. CloudWatch Logs Kontrol Et

**Hata mesajlarını gör:**
1. Lambda → Monitor → View logs in CloudWatch
2. Latest log stream'i aç
3. Error mesajları var mı?

**Önemli hatalar:**
- `Task timed out after 3.00 seconds` → Timeout artır
- `Cannot find module` → Handler yanlış
- `AccessDenied` → DynamoDB permission eksik
- `ValidationException` → Environment variable eksik

---

## 🧪 Test Et

### Lambda Test:

1. Test → Create test event
2. Event JSON:
```json
{
  "httpMethod": "POST",
  "path": "/api/auth/login",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "{\"username\":\"admin\",\"password\":\"admin123\"}"
}
```
3. Test
4. Response 200 olmalı

### API Gateway Test:

```bash
curl -v https://YOUR-API-URL/prod/api/health
```

200 dönmeli

---

## 🔧 En Sık Sorunlar

### 1. Task timed out after 3.00 seconds
**Çözüm:** Timeout'u 30 saniyeye çıkar

### 2. Runtime.HandlerNotFound: lambda.handler is undefined
**Çözüm:** Handler'ı `lambda.handler` yap

### 3. Cannot find module './config/dynamodb'
**Çözüm:** Zip dosyasını yeniden upload et

### 4. ResourceNotFoundException: Requested resource not found
**Çözüm:** DynamoDB tablolarını oluştur (`/api/init/admin` çağır)

---

## 📋 Hızlı Düzeltme Sırası:

1. ✅ Timeout = 30 seconds
2. ✅ Handler = lambda.handler
3. ✅ Environment variables ekle
4. ✅ DynamoDB permission ekle
5. ✅ CloudWatch logs kontrol et
6. ✅ Test et

---

**Her adımı yaptıktan sonra tekrar dene!**
