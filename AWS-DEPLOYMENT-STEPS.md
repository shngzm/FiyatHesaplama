# AWS Deployment Adımları (Manuel)

## Frontend Deployment - AWS Amplify Hosting

### 1. AWS Console'a Giriş
1. https://console.aws.amazon.com/ adresine git
2. EU (Frankfurt) - eu-central-1 region'ını seç

### 2. Amplify Hosting Kurulumu
1. AWS Amplify servisini aç
2. "Host web app" > "Deploy without Git" seç
3. App name: `gram-fiyat-calculator`
4. Environment: `production`
5. Method: "Drag and drop" veya "Manual deploy"

### 3. Build Dosyalarını Yükle
```bash
# Local'de çalıştır:
cd /Users/gizemesmer/Desktop/personal/fiyathesaplama
npm run build:prod

# dist/fiyat-hesaplama/browser/ klasörünü ZIP'le
cd dist/fiyat-hesaplama
zip -r ../../fiyat-hesaplama-build.zip browser/
```

4. ZIP dosyasını Amplify Console'a yükle
5. Deploy butonuna tıkla
6. URL'i kopyala (örn: https://main.d123abc.amplifyapp.com)

---

## Backend Deployment - AWS Lambda (Serverless) veya EC2

### Seçenek A: AWS Lambda + API Gateway (Önerilen - Maliyet Etkin)

#### 1. DynamoDB Tablolarını Oluştur
AWS Console > DynamoDB > Create table:

**Tablo 1: GramFiyat-Users**
- Partition key: `id` (String)
- GSI: `UsernameIndex` (username - String)

**Tablo 2: GramFiyat-Models**
- Partition key: `id` (String)

**Tablo 3: GramFiyat-Products**
- Partition key: `id` (String)
- GSI: `ModelIdIndex` (modelId - String)

**Tablo 4: GramFiyat-GoldPrices**
- Partition key: `id` (String)

#### 2. Lambda Function Oluştur
```bash
# Backend'i deploy için hazırla
cd backend
npm install --production

# node_modules ile birlikte ZIP'le
zip -r lambda-deployment.zip . -x "*.git*" -x "dynamodb-local/*" -x ".env"
```

AWS Console > Lambda:
1. "Create function" > "Author from scratch"
2. Function name: `gram-fiyat-api`
3. 
4. Architecture: arm64 (daha ucuz)
5. Upload lambda-deployment.zip
6. Environment variables:
   - `USE_LOCAL_DYNAMODB=false`
   - `JWT_SECRET=<yeni-güvenli-secret>`
   - `NODE_ENV=production`
   - (Not: AWS_REGION ekleme, Lambda otomatik ayarlar)
7. Timeout: 30 saniye
8. Memory: 512 MB

#### 3. API Gateway Kur
1. API Gateway > Create API > REST API
2. API name: `gram-fiyat-api`
3. Create resource: `/{proxy+}`
4. Create method: ANY
5. Integration: Lambda function `gram-fiyat-api`
6. Deploy API > Stage: `prod`
7. API URL'i kopyala (örn: https://abc123.execute-api.eu-central-1.amazonaws.com/prod)

#### 4. IAM Permissions
Lambda'ya DynamoDB izinleri ekle:
- Configuration > Permissions > Execution role
- Add policy: `AmazonDynamoDBFullAccess`

---

### Seçenek B: EC2 (Daha Basit Ancak Daha Pahalı)

#### 1. EC2 Instance Oluştur
1. EC2 > Launch Instance
2. AMI: Amazon Linux 2023
3. Instance type: t3.micro (750 saat/ay free tier)
4. Security Group: HTTP (80), HTTPS (443), Custom TCP (3000)
5. Key pair: Oluştur ve indir

#### 2. Backend'i Deploy Et
```bash
# SSH ile bağlan
ssh -i "your-key.pem" ec2-user@ec2-xx-xx-xx-xx.eu-central-1.compute.amazonaws.com

# Node.js kur
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# PM2 kur
sudo npm install -g pm2

# Kodu transfer et (local'den)
scp -i "your-key.pem" -r backend/ ec2-user@ec2-xx-xx-xx-xx:/home/ec2-user/

# EC2'de çalıştır
cd backend
npm install --production
pm2 start src/server.js --name gram-fiyat-api
pm2 save
pm2 startup
```

#### 3. Nginx Reverse Proxy (Opsiyonel)
```bash
sudo yum install nginx -y
sudo nano /etc/nginx/conf.d/gram-fiyat.conf
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Frontend-Backend Bağlantısı

### 1. Backend URL'i Frontend'e Ekle
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://your-api-url.com/api'  // Lambda veya EC2 URL'i
};
```

### 2. Backend CORS Ayarları
```javascript
// backend/src/server.js
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://main.d123abc.amplifyapp.com';
```

### 3. Rebuild & Redeploy
```bash
npm run build:prod
# Yeni build'i Amplify'a yükle
```

---

## Production Checklist

- [ ] DynamoDB tabloları oluşturuldu
- [ ] Backend deploy edildi (Lambda veya EC2)
- [ ] API endpoint test edildi
- [ ] Frontend environment.prod.ts güncellendi
- [ ] CORS origin ayarlandı
- [ ] JWT_SECRET değiştirildi
- [ ] Admin şifresi değiştirildi (`admin123` → güvenli şifre)
- [ ] SSL/HTTPS aktif (Amplify otomatik, EC2'de Certbot gerekir)
- [ ] CloudWatch logs aktif
- [ ] Backup stratejisi belirlendi (DynamoDB on-demand backup)

---

## Maliyet Tahmini (Aylık)

**Serverless (Lambda) Yaklaşımı:**
- Amplify Hosting: $0 (build) + $0.15/GB (5 GB = ~$0.75)
- Lambda: İlk 1M istek ücretsiz, sonrası $0.20/1M istek
- DynamoDB: İlk 25 GB + 25 RCU/WCU ücretsiz
- API Gateway: İlk 1M istek ücretsiz
**Toplam: ~$1-5/ay (düşük trafik)**

**EC2 Yaklaşımı:**
- Amplify: $0.75
- t3.micro: $8-10/ay (free tier sonrası)
- DynamoDB: Ücretsiz (düşük kullanımda)
**Toplam: ~$10-15/ay**

---

## Hızlı Test

Backend health check:
```bash
curl https://your-api-url.com/api/health
```

Login test:
```bash
curl -X POST https://your-api-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```
