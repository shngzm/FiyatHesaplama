# Production Builds

This directory contains production-ready deployment packages for the Gram/Fiyat application.

## 📦 Contents

| File | Size | Description |
|------|------|-------------|
| `frontend-production.zip` | 188 KB | Angular frontend (optimized) |
| `backend-production.zip` | 4.5 MB | Node.js backend with dependencies |
| `BUILD-SUMMARY.md` | 6.3 KB | Build details and quick deploy guide |

## 🚀 Quick Start

### 1. Extract Packages
```bash
unzip frontend-production.zip
unzip backend-production.zip
```

### 2. Deploy Frontend
Choose one:
```bash
# Static hosting (Netlify, Vercel, S3)
cd dist/fiyat-hesaplama/browser && netlify deploy --prod

# Or AWS S3
aws s3 sync dist/fiyat-hesaplama/browser/ s3://your-bucket/
```

### 3. Deploy Backend
```bash
cd backend
export NODE_ENV=production
export JWT_SECRET=your-secret-key
export AWS_REGION=us-east-1
npm start
```

## 📚 Documentation

- **[BUILD-SUMMARY.md](./BUILD-SUMMARY.md)** - Detailed build information
- **[../PRODUCTION-DEPLOYMENT-GUIDE.md](../PRODUCTION-DEPLOYMENT-GUIDE.md)** - Complete deployment guide with all options

## ⚙️ Environment Setup

Before deploying, ensure you have:

1. **Frontend**: Update API URL in `environment.prod.ts`
2. **Backend**: Set required environment variables:
   - `NODE_ENV=production`
   - `JWT_SECRET` (32+ characters)
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `CORS_ORIGIN`

## ✅ What's Included

### Frontend Package
- ✅ Compiled Angular 17 application
- ✅ Optimized bundles (105 KB gzipped)
- ✅ Static assets
- ✅ Production environment config

### Backend Package
- ✅ Express.js API server
- ✅ Production dependencies only
- ✅ JWT authentication
- ✅ DynamoDB integration
- ✅ Security middleware (Helmet, CORS, Rate limiting)

## 🎯 Build Info

**Build Date:** February 10, 2026  
**Frontend Framework:** Angular 17.3.0  
**Backend Runtime:** Node.js 18+  
**Database:** AWS DynamoDB  
**Total Package Size:** 4.7 MB

---

**Ready to deploy!** 🚀
