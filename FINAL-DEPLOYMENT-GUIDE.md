# Final Deployment Guide - Fiyat Hesaplama Uygulaması

**Date:** 2025-01-23  
**Status:** ✅ Production Ready  
**Tests:** ✅ All Passed (13/13 Backend Tests)

---

## 📦 Deployment Packages

### Frontend Package
- **File:** `frontend-deploy.zip`
- **Location:** `/Users/gizemesmer/Desktop/personal/fiyathesaplama/frontend-deploy.zip`
- **Contents:** `dist/fiyat-hesaplama/browser/` (Angular production build)
- **Target:** AWS Amplify

### Backend Package
- **File:** `backend-lambda-deploy.zip`
- **Location:** `/Users/gizemesmer/Desktop/personal/fiyathesaplama/backend/backend-lambda-deploy.zip`
- **Contents:** Lambda handler + production dependencies
- **Target:** AWS Lambda

---

## 🚀 Deployment Steps

### 1. Database Setup (DynamoDB)

#### Create ActivityLog Table
```bash
cd /Users/gizemesmer/Desktop/personal/fiyathesaplama/backend
node CREATE_ACTIVITY_LOG_TABLE.js
```

**Expected Output:**
```
✅ ActivityLog table created successfully
📊 Table: ACTIVITY_LOGS
🔑 Partition Key: id
🔍 GSI: userId-index, action-index
```

#### Migrate Products (Add productType Field)
```bash
cd /Users/gizemesmer/Desktop/personal/fiyathesaplama/backend
node MIGRATE_PRODUCTS.js
```

**Expected Output:**
```
🔄 Scanning PRODUCTS table...
✅ Updated X products with productType field
📋 Migration complete
```

**Note:** This migration is safe to run multiple times. It only updates products missing the `productType` field.

---

### 2. Frontend Deployment (AWS Amplify)

#### Option A: Upload via Amplify Console
1. Go to AWS Amplify Console
2. Select your app: `fiyat-hesaplama`
3. Click "Manual Deploy"
4. Upload `frontend-deploy.zip`
5. Wait for deployment (2-5 minutes)

#### Option B: Deploy via AWS CLI
```bash
aws amplify start-deployment \
  --app-id d20mfjd2x04tfy \
  --branch-name main \
  --source-url file://frontend-deploy.zip
```

#### Verify Frontend Deployment
- URL: https://main.d20mfjd2x04tfy.amplifyapp.com
- Test: Navigate to login page
- Check: Console for errors
- Expected: No 404 errors, app loads correctly

---

### 3. Backend Deployment (AWS Lambda)

#### Upload Lambda Package
1. Go to AWS Lambda Console
2. Select function: `gramfiyat-backend`
3. Click "Upload from" → ".zip file"
4. Select `backend-lambda-deploy.zip`
5. Click "Save"

#### Configure Environment Variables
Set the following in Lambda Configuration → Environment variables:

```
NODE_ENV=production
JWT_SECRET=<your-secure-jwt-secret>
AWS_REGION=eu-central-1
DYNAMODB_TABLE_USERS=USERS
DYNAMODB_TABLE_MODELS=MODELS
DYNAMODB_TABLE_PRODUCTS=PRODUCTS
DYNAMODB_TABLE_GOLD_PRICES=GOLD_PRICES
DYNAMODB_TABLE_CUSTOMERS=CUSTOMERS
DYNAMODB_TABLE_ORDERS=ORDERS
DYNAMODB_TABLE_ACTIVITY_LOGS=ACTIVITY_LOGS
FRONTEND_URL=https://main.d20mfjd2x04tfy.amplifyapp.com
```

#### Verify Backend Deployment
Test the health endpoint:
```bash
curl https://your-lambda-url/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-23T..."
}
```

---

## ✅ Post-Deployment Verification

### 1. Health Checks
```bash
# Frontend
curl https://main.d20mfjd2x04tfy.amplifyapp.com

# Backend
curl https://your-lambda-url/api/health

# Database
aws dynamodb describe-table --table-name ACTIVITY_LOGS --region eu-central-1
```

### 2. Functional Testing

#### Login Test
1. Navigate to: https://main.d20mfjd2x04tfy.amplifyapp.com/admin-login
2. Use admin credentials
3. Verify successful login
4. Check: Activity log entry created

#### Model Management Test
1. Go to Model Management
2. Create a new model:
   - Model Tipi: Test Model
   - Product Type: Kolye/Bilezik
   - Ayar: 14
   - Birim CM Tel: 0.5
3. Verify: Model appears in list

#### Calculation Test
1. Go to Calculation page
2. Select Product Type: Kolye/Bilezik
3. Select Model: (any model)
4. Enter Uzunluk: 45
5. Click Calculate
6. Verify: Result shows gram and price

---

## 🔧 Configuration Changes

### Frontend (Amplify)
**Rewrite Rules:** (Already configured in `amplify.yml`)
```yaml
- source: /<*>
  target: /index.html
  status: '200'
```

### Backend (Lambda)
**Handler:** `lambda.handler`  
**Runtime:** Node.js 18.x  
**Timeout:** 30 seconds  
**Memory:** 512 MB

**Security:**
- Trust Proxy: `false` (configured)
- Rate Limiting: 100 req/15min
- CORS: Configured for Amplify URL
- Authentication: JWT with HttpOnly cookies

---

## 📊 Test Results

### Backend Tests (Jest + Supertest)
```
Test Suites: 1 passed
Tests:       13 passed
- Health Check API
- Model CRUD Operations
- Product CRUD Operations
- Calculation Logic (Kolye/Bilezik)
- Calculation Logic (Yüzük/Küpe)
- Price Calculation
- Ayar Coefficients
- Business Rules Validation
```

**Coverage:**
- Health endpoint
- Authentication middleware
- Model/Product APIs
- Calculation formulas
- Business rules (uzunluk requirement, model selection)

---

## 🐛 Troubleshooting

### Frontend 404 Errors
**Issue:** Static assets returning 404  
**Solution:** Verified in amplify.yml - rewrite rule set to status 200

### Trust Proxy Validation Errors
**Issue:** Lambda rejecting X-Forwarded-* headers  
**Solution:** Set `trust proxy: false` in both server.js files

### Database Connection Issues
**Issue:** DynamoDB table not found  
**Solution:** Verify table names in environment variables match actual table names

### Calculation Errors
**Issue:** Missing uzunluk for Kolye/Bilezik  
**Solution:** Frontend validation enforces uzunluk requirement

---

## 📁 Files Modified/Created

### Database Migration Scripts
- `backend/CREATE_ACTIVITY_LOG_TABLE.js` - Creates ActivityLog table with GSI
- `backend/MIGRATE_PRODUCTS.js` - Adds productType field to existing products

### Test Files
- `backend/tests/api.test.js` - Comprehensive API integration tests
- `backend/src/testServer.js` - Test server configuration (no app.listen)
- `backend/jest.config.json` - Jest configuration for ES modules

### Configuration
- `backend/package.json` - Added test scripts and dependencies
- `backend/src/server.js` - Trust proxy = false
- `backend/lambda-deploy/src/server.js` - Trust proxy = false

### Frontend
- `src/app/components/calculation/calculation.component.ts` - Reactive forms implementation
- `src/app/services/calculation.service.ts` - Safe parameter handling (??operators)

---

## 🔐 Security Checklist

- [x] Trust proxy disabled (security requirement)
- [x] JWT authentication configured
- [x] Rate limiting enabled (100 req/15min)
- [x] CORS restricted to known origins
- [x] Helmet security headers enabled
- [x] Environment variables for secrets
- [x] Password hashing (bcrypt)
- [x] Input validation on all endpoints

---

## 📝 Important Notes

1. **Node.js Version:** AWS Lambda runs Node.js 18.x (compatible with current code)
2. **ActivityLog Table:** Must be created manually via `CREATE_ACTIVITY_LOG_TABLE.js`
3. **Product Migration:** Run `MIGRATE_PRODUCTS.js` after deploying backend
4. **Frontend Build:** Completed successfully - 495.60 kB total
5. **Backend Tests:** All 13 tests passing
6. **Deployment Packages:** Ready in project root

---

## 🎯 Next Steps After Deployment

1. ✅ Upload frontend-deploy.zip to Amplify
2. ✅ Upload backend-lambda-deploy.zip to Lambda
3. ✅ Create ActivityLog table
4. ✅ Run product migration
5. ✅ Verify health endpoints
6. ✅ Test login flow
7. ✅ Test calculation functionality
8. ✅ Monitor CloudWatch logs

---

## 📞 Support

If issues occur after deployment:
1. Check CloudWatch Logs (Lambda)
2. Check Amplify Console Logs (Frontend)
3. Verify DynamoDB table status
4. Review environment variables
5. Test API endpoints individually

---

**Deployment Ready:** ✅ All tests passed, packages created, documentation complete.
