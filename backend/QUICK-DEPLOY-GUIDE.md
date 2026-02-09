# Quick Deployment Guide - Lambda Upload

## 📦 Deployment Package Ready

**File:** `backend/lambda-deployment-final.zip` (4.6 MB)

This package includes:
- ✅ All source code with init route
- ✅ Production node_modules
- ✅ Lambda handler (lambda.js)
- ✅ Updated server.js with /api/init route

## 🚀 Upload to AWS Lambda (3 Steps)

### Step 1: Go to Lambda Console
```
https://eu-central-1.console.aws.amazon.com/lambda/home?region=eu-central-1#/functions
```

### Step 2: Update Function Code
1. Click on your function: **`gram-fiyat-api`**
2. Scroll to **"Code source"** section
3. Click **"Upload from"** → **".zip file"**
4. Select: `backend/lambda-deployment-final.zip`
5. Click **"Save"**
6. Wait 30-60 seconds for deployment

### Step 3: Test the Init Endpoint
```bash
curl -X POST https://pxcjtq8cl9.execute-api.eu-central-1.amazonaws.com/prod/api/init/admin
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Admin user updated successfully",
  "username": "admin",
  "password": "admin123"
}
```

### Step 4: Test Login
```bash
curl -X POST https://pxcjtq8cl9.execute-api.eu-central-1.amazonaws.com/prod/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "username": "admin",
    "role": "admin"
  }
}
```

## ✅ Done!

Your 401 error will be fixed after deployment.

---

## Package Contents

```
lambda-deployment-final.zip/
├── lambda.js                    # Lambda handler
├── package.json                 # Dependencies
├── node_modules/                # Production dependencies (4.5 MB)
└── src/
    ├── server.js               # ✨ Updated with /api/init route
    ├── routes/
    │   ├── init.js            # ✨ Init route (creates/updates admin)
    │   ├── auth.js
    │   ├── models.js
    │   ├── products.js
    │   └── goldPrice.js
    ├── controllers/
    ├── models/
    ├── middleware/
    └── config/
```

## Alternative: AWS CLI Method

If you prefer using AWS CLI:

```bash
# Make sure you're in the backend directory
cd backend

# Upload to Lambda
aws lambda update-function-code \
  --function-name gram-fiyat-api \
  --zip-file fileb://lambda-deployment-final.zip \
  --region eu-central-1

# Wait for deployment
aws lambda wait function-updated \
  --function-name gram-fiyat-api \
  --region eu-central-1

# Test
curl -X POST https://pxcjtq8cl9.execute-api.eu-central-1.amazonaws.com/prod/api/init/admin
```

## Troubleshooting

### If deployment fails:
- Check Lambda function memory (minimum 512 MB recommended)
- Check Lambda timeout (minimum 30 seconds recommended)
- Check CloudWatch Logs for errors

### If 404 still appears:
- Wait 1-2 minutes for Lambda to warm up
- Check API Gateway configuration
- Verify the route is registered in CloudWatch logs

### If 401 still appears after init:
- The admin password was successfully reset
- Clear browser cache/localStorage
- Try login again with: admin/admin123
