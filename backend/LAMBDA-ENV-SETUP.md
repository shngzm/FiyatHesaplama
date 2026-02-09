# Fix Lambda 502 Error - Environment Variables Setup

## 🔴 Problem
Getting 502 error because Lambda function is missing required environment variables.

## ✅ Solution: Configure Lambda Environment Variables

### Step 1: Go to Lambda Configuration

1. Open [Lambda Console](https://eu-central-1.console.aws.amazon.com/lambda/home?region=eu-central-1#/functions)
2. Click on function: **`gram-fiyat-api`**
3. Go to **"Configuration"** tab
4. Click **"Environment variables"** (left sidebar)
5. Click **"Edit"**

### Step 2: Add Required Environment Variables

Click **"Add environment variable"** for each:

| Key | Value |
|-----|-------|
| `JWT_SECRET` | `gramfiyat-secret-key-2026` |
| `AWS_REGION` | `eu-central-1` |
| `NODE_ENV` | `production` |
| `USERS_TABLE` | `GramFiyat-Users` |
| `MODELS_TABLE` | `GramFiyat-Models` |
| `PRODUCTS_TABLE` | `GramFiyat-Products` |
| `GOLD_PRICES_TABLE` | `GramFiyat-GoldPrices` |

### Step 3: Save Configuration

1. Click **"Save"** button
2. Wait 10-20 seconds for Lambda to update

### Step 4: Test

```bash
# Test health endpoint
curl https://pxcjtq8cl9.execute-api.eu-central-1.amazonaws.com/prod/api/health

# Should return:
# {"status":"OK","message":"Gram/Fiyat API is running","environment":"production","timestamp":"..."}
```

### Step 5: Initialize Admin

```bash
curl -X POST https://pxcjtq8cl9.execute-api.eu-central-1.amazonaws.com/prod/api/init/admin
```

### Step 6: Test Login

```bash
curl -X POST https://pxcjtq8cl9.execute-api.eu-central-1.amazonaws.com/prod/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## Alternative: AWS CLI Method

```bash
aws lambda update-function-configuration \
  --function-name gram-fiyat-api \
  --environment "Variables={
    JWT_SECRET=gramfiyat-secret-key-2026,
    AWS_REGION=eu-central-1,
    NODE_ENV=production,
    USERS_TABLE=GramFiyat-Users,
    MODELS_TABLE=GramFiyat-Models,
    PRODUCTS_TABLE=GramFiyat-Products,
    GOLD_PRICES_TABLE=GramFiyat-GoldPrices
  }" \
  --region eu-central-1
```

---

## Environment Variables Explained

- **JWT_SECRET**: Secret key for JWT token encryption (CRITICAL!)
- **AWS_REGION**: AWS region where DynamoDB tables are located
- **NODE_ENV**: Environment mode (production/development)
- **USERS_TABLE**: DynamoDB table name for users
- **MODELS_TABLE**: DynamoDB table name for models
- **PRODUCTS_TABLE**: DynamoDB table name for products
- **GOLD_PRICES_TABLE**: DynamoDB table name for gold prices

---

## Troubleshooting

### Still getting 502?

**Check CloudWatch Logs:**
1. Go to Lambda function
2. Click "Monitor" tab
3. Click "View CloudWatch logs"
4. Look for error messages

**Common Issues:**
- Missing JWT_SECRET → Login will fail
- Wrong table names → Database queries will fail
- Missing AWS_REGION → DynamoDB connection will fail

### Check Lambda Settings:

**Memory:** Minimum 512 MB recommended
- Configuration → General configuration → Edit
- Set Memory to at least 512 MB

**Timeout:** Minimum 30 seconds recommended
- Configuration → General configuration → Edit
- Set Timeout to at least 30 seconds

**IAM Role Permissions:**
Lambda execution role must have:
- `dynamodb:GetItem`
- `dynamodb:PutItem`
- `dynamodb:UpdateItem`
- `dynamodb:DeleteItem`
- `dynamodb:Query`
- `dynamodb:Scan`

---

## Security Note

⚠️ **Important:** The `JWT_SECRET` shown here is for initial setup. After deployment, you should:

1. Change it to a strong random secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. Update the Lambda environment variable with the new secret

3. Restart the Lambda function
