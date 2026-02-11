# Fiyat Hesaplama v3.0 - Quick Start

## 📦 Deployment Zips

- **lambda-with-deps-v3.zip** (4.1MB) - Backend with activity logging & subType support
- **frontend-deploy-v3.zip** (197KB) - Frontend with all new features

## 🆕 New Features

### 1. Product SubTypes
- **Kolye/Bilezik** (default)
- **Yüzük** (separate type)
- **Küpe** (separate type)

### 2. Activity Logging
- Admin-only access
- Tracks all user actions (15+ types)
- Filtering by date, action, user
- Statistics dashboard

### 3. Save Calculation as Order
- "Siparişe Ekle" button in calculation results
- Customer selection modal
- Automatic order creation

### 4. Enhanced Navigation
- "Aktivite Raporu" button for admins

## 🚀 Quick Deploy

### Backend
```bash
aws lambda update-function-code \
  --function-name GramFiyat-Backend \
  --zip-file fileb://lambda-with-deps-v3.zip
```

**Environment Variables (add this):**
```
ACTIVITY_LOGS_TABLE=GramFiyat-ActivityLogs
```

### Frontend
Upload `frontend-deploy-v3.zip` to AWS Amplify console.

### Database
**New Table Required:** GramFiyat-ActivityLogs

**Quick Setup:**
```bash
curl -X POST https://<your-api>/api/init
```

## ✅ Quick Test

1. Login as admin
2. Navigate to "Aktivite Raporu" → Should see activity logs
3. Go to "Ürün Yönetimi" → Create product with subType "Yüzük"
4. Go to "Gram Hesaplama" → Select "Yüzük" filter → Product appears
5. Complete calculation → Click "Siparişe Ekle" → Select customer → Order created

## 📄 Full Documentation

See **DEPLOYMENT-GUIDE-v3.md** for complete deployment instructions, troubleshooting, and testing checklist.

---

**Total Tables:** 7 (GramFiyat-ActivityLogs is new)  
**Total Changes:** 15+ files (backend + frontend)  
**Breaking Changes:** None (backward compatible)
