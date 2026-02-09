# Manual Deployment Instructions - Fix Admin Login

## Problem
Admin user exists in production DynamoDB but password is incorrect, causing 401 errors on login.

## Solution
Added new `/api/init/admin` endpoint that resets admin password even if admin already exists.

## Deployment Steps

### Option 1: Update Lambda Function Code (Recommended)

1. **Upload the deployment package:**
   - File location: `backend/lambda-deployment.zip`
   - Go to AWS Console → Lambda → Your function (GramFiyatAPI or similar)
   - Click "Upload from" → ".zip file"
   - Select `lambda-deployment.zip`
   - Click "Save"

2. **Wait for deployment** (1-2 minutes)

3. **Test the new endpoint:**
   ```bash
   curl -X POST https://pxcjtq8cl9.execute-api.eu-central-1.amazonaws.com/prod/api/init/admin
   ```
   
   Expected response:
   ```json
   {
     "success": true,
     "message": "Admin user updated successfully",
     "username": "admin",
     "password": "admin123"
   }
   ```

4. **Test login:**
   ```bash
   curl -X POST https://pxcjtq8cl9.execute-api.eu-central-1.amazonaws.com/prod/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

### Option 2: Deploy via AWS CLI (If credentials are valid)

```bash
# First, fix your AWS credentials
aws configure

# Then update Lambda function
cd backend
zip -r lambda-deployment.zip . -x "node_modules/*" -x "dynamodb-local/*" -x ".env"

aws lambda update-function-code \
  --function-name GramFiyatAPI \
  --zip-file fileb://lambda-deployment.zip \
  --region eu-central-1
```

### Option 3: Deploy via AWS SAM/Serverless Framework (If configured)

```bash
# If using SAM
sam build
sam deploy

# If using Serverless Framework
serverless deploy
```

## Changes Made

### 1. Created `/src/routes/init.js`
- Endpoint: `POST /api/init/admin`
- Function: Creates or updates admin user with default credentials
- Password: `admin123` (bcrypt hashed)

### 2. Updated `/src/server.js`
- Added import for init routes
- Registered `/api/init` route

## After Deployment

1. Call the init endpoint to reset admin password
2. Login with `admin` / `admin123`
3. **IMPORTANT:** Change the password immediately after first login

## Files Modified

- `backend/src/server.js` - Added init route registration
- `backend/src/routes/init.js` - Already existed, just needed to be registered

## Security Note

The `/api/init/admin` endpoint should be protected or disabled in production after initial setup. Consider:
- Adding IP whitelist
- Requiring a secret token
- Disabling after first use

## Verification

After deployment, verify all routes:
```bash
# Check health
curl https://pxcjtq8cl9.execute-api.eu-central-1.amazonaws.com/prod/api/health

# Initialize admin
curl -X POST https://pxcjtq8cl9.execute-api.eu-central-1.amazonaws.com/prod/api/init/admin

# Test login
curl -X POST https://pxcjtq8cl9.execute-api.eu-central-1.amazonaws.com/prod/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```
