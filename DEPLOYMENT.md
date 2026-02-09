# Gram Fiyat - Production Deployment Guide

## 🚀 Production Hazırlık

Bu uygulama AWS üzerinde deploy edilmek üzere hazırlanmıştır.

### Mimari

- **Frontend**: Angular 17 (Static Web App)
- **Backend**: Express.js + Node.js (Lambda veya EC2)
- **Database**: AWS DynamoDB
- **Authentication**: JWT

---

## 📋 Ön Gereksinimler

1. AWS hesabı
2. AWS CLI kurulu ve yapılandırılmış
3. Node.js 18+ 
4. npm veya yarn

---

## 🔧 Backend Deployment (AWS Lambda + API Gateway)

### 1. DynamoDB Tablolarını Oluştur

AWS Console'dan veya AWS CLI ile:

```bash
# Navigate to backend
cd backend

# Create tables (production'da USE_LOCAL_DYNAMODB=false olmalı)
node src/config/createTables.js
```

### 2. Environment Variables Ayarla

`backend/.env.production` dosyasını oluştur:

```bash
NODE_ENV=production
PORT=3000
AWS_REGION=eu-central-1
USE_LOCAL_DYNAMODB=false

# JWT Secret (güçlü bir key oluştur!)
JWT_SECRET=your_super_secret_key_here

# Admin credentials (mutlaka değiştir!)
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=strong_password_here

# CORS (frontend domain'ini yaz)
CORS_ORIGIN=https://your-frontend-domain.com
```

### 3. Backend'i Deploy Et

**Seçenek A: AWS Lambda (Serverless)**

```bash
# Install serverless framework
npm install -g serverless

# Configure serverless.yml
# Deploy
serverless deploy
```

**Seçenek B: AWS EC2**

```bash
# SSH to EC2 instance
# Clone repository
# Install dependencies
cd backend
npm install --production

# Start with PM2
npm install -g pm2
pm2 start src/server.js --name gramfiyat-api
pm2 startup
pm2 save
```

---

## 🌐 Frontend Deployment (AWS Amplify / S3 + CloudFront)

### 1. Environment Variables Güncelle

`src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-gateway-url.com/api'
};
```

### 2. Build

```bash
npm run build:prod
```

Build output: `dist/fiyat-hesaplama/browser/`

### 3. Deploy

**Seçenek A: AWS Amplify**

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

**Seçenek B: S3 + CloudFront**

```bash
# Upload to S3
aws s3 sync dist/fiyat-hesaplama/browser/ s3://your-bucket-name

# Configure CloudFront for SPA routing
# Set error page to index.html for 403/404
```

---

## 🔐 Güvenlik Checklist

- [ ] JWT_SECRET değiştirildi (güçlü random string)
- [ ] Admin şifresi değiştirildi
- [ ] CORS_ORIGIN production domain'e ayarlandı
- [ ] AWS IAM permissions minimum seviyede
- [ ] DynamoDB tables encryption enabled
- [ ] HTTPS kullanılıyor (SSL certificate)
- [ ] Rate limiting eklendi (opsiyonel)
- [ ] .env dosyaları git'e commit edilmedi

---

## 📊 Production Monitoring

### CloudWatch Alarms Kur

1. API Gateway 5xx errors
2. Lambda function errors
3. DynamoDB read/write capacity
4. Lambda concurrency limits

### Logging

Backend logları CloudWatch'a gönderilir. Hata takibi için:

```bash
aws logs tail /aws/lambda/gramfiyat-api --follow
```

---

## 🔄 Update & Rollback

### Backend Update

```bash
cd backend
git pull
npm install
pm2 restart gramfiyat-api
```

### Frontend Update

```bash
git pull
npm install
npm run build:prod
amplify publish
```

### Rollback

```bash
# Lambda
serverless deploy --stage production --version <previous-version>

# Amplify
# Use Amplify Console to redeploy previous version
```

---

## 💰 Cost Optimization

- **DynamoDB**: Use on-demand pricing for predictable costs
- **Lambda**: 1M free requests/month
- **S3**: Static hosting is cheap
- **CloudFront**: Free tier covers basic usage

**Estimated Monthly Cost**: $5-20 (for low-medium traffic)

---

## 🆘 Troubleshooting

### Backend not responding

```bash
# Check logs
pm2 logs gramfiyat-api

# Check DynamoDB connection
aws dynamodb list-tables --region eu-central-1
```

### CORS errors

- Verify CORS_ORIGIN in backend .env
- Check API Gateway CORS configuration

### Authentication issues

- Check JWT_SECRET matches between environments
- Verify token expiration (7 days default)

---

## 📞 Support

For issues, check:
- Backend logs (CloudWatch or PM2)
- Browser console (Frontend errors)
- DynamoDB metrics (AWS Console)

---

## 📝 Admin First Login

After deployment:

1. Call init endpoint to create admin:
```bash
curl -X POST https://your-api-domain.com/api/auth/init
```

2. Login with credentials from .env file

3. **Immediately change admin password** via UI

---

**Last Updated**: 2026-02-09
