# 🚀 Hızlı AWS Deployment

**Tarih:** 2025-02-10  
**Süre:** ~15 dakika

---

## 📋 Hazırlık

### Dosyalar ✅
- ✅ `lambda-deploy-full-v2.zip` (30 KB) - Backend
- ✅ `frontend-deploy-full-v2.zip` (188 KB) - Frontend

### Gerekli Bilgiler
- AWS Console erişimi
- Admin yetkisi (Lambda, API Gateway, Amplify, DynamoDB)

---

## 1️⃣ Lambda Deployment (5 dk)

### AWS Console'dan:

1. **Lambda → Create function**
   - Function name: `gram-fiyat-api`
   - Runtime: **Node.js 18.x**
   - Create function

2. **Code Upload**
   - Code source → Upload from → .zip file
   - Upload: `lambda-deploy-full-v2.zip`
   - Save

3. **Configuration → General configuration**
   - **Handler:** `lambda.handler` ⚠️ (EXACTLY this!)
   - **Timeout:** 30 seconds ⚠️ (Critical for 502 fix!)
   - **Memory:** 512 MB
   - Save

4. **Configuration → Environment variables**
   ```
   NODE_ENV = production
   JWT_SECRET = YOUR-STRONG-SECRET-HERE
   DYNAMODB_TABLE_PREFIX = GramFiyat-
   AWS_REGION = eu-central-1
   ```
   Save

5. **Configuration → Permissions**
   - Execution role → Add permissions
   - Attach policy: **AmazonDynamoDBFullAccess**

6. **Test**
   - Test → Create test event
   - Event JSON:
   ```json
   {
     "httpMethod": "GET",
     "path": "/api/health",
     "headers": {}
   }
   ```
   - Test → Should return 200 OK

---

## 2️⃣ API Gateway (5 dk)

### AWS Console'dan:

1. **API Gateway → Create API**
   - REST API → Build
   - API name: `gram-fiyat-api`
   - Create

2. **Create Resource**
   - Actions → Create Resource
   - Resource name: **proxy**
   - Resource path: **{proxy+}** ⚠️
   - Enable CORS: ✅
   - Create

3. **Create Method**
   - Select `/{proxy+}` resource
   - Actions → Create Method
   - Method: **ANY**
   - Integration type: Lambda Function
   - Lambda proxy integration: ✅
   - Lambda function: `gram-fiyat-api`
   - Save
   - OK (give permission)

4. **Enable CORS**
   - Select `/{proxy+}` resource
   - Actions → Enable CORS
   - Enable CORS and replace existing headers
   - Yes, replace

5. **Deploy API**
   - Actions → Deploy API
   - Deployment stage: **[New Stage]**
   - Stage name: **prod**
   - Deploy

6. **Copy Invoke URL**
   - Stages → prod
   - Copy: `https://xxxxxxxx.execute-api.eu-central-1.amazonaws.com/prod`
   - ⚠️ SAVE THIS URL!

7. **Test**
   ```bash
   curl https://YOUR-API-URL/prod/api/health
   ```
   Should return: `{"status":"ok","message":"API is running"}`

---

## 3️⃣ DynamoDB Tables (2 dk)

### /api/init endpoint ile (otomatik):

```bash
curl -X POST https://YOUR-API-URL/prod/api/init/admin
```

**Response:**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "username": "admin",
  "password": "admin123"
}
```

Bu komut:
- ✅ 6 DynamoDB tablosu oluşturur
- ✅ Admin kullanıcısı ekler (admin/admin123)

**Tablolar:**
1. GramFiyat-Users
2. GramFiyat-Models
3. GramFiyat-Products
4. GramFiyat-GoldPrices
5. GramFiyat-Customers
6. GramFiyat-Orders

---

## 4️⃣ Amplify Deployment (5 dk)

### AWS Console'dan:

1. **Amplify → New app → Deploy without Git**
   - App name: `gram-fiyat-hesaplama`
   - Environment name: `production`
   - Method: **Drag and drop**

2. **Upload Frontend**
   - Drag: `frontend-deploy-full-v2.zip`
   - Wait for extraction
   - Save and deploy

3. **Environment Variables**
   - App settings → Environment variables
   - Add variable:
     ```
     Key: NEXT_PUBLIC_API_URL
     Value: https://YOUR-API-URL/prod/api
     ```
   - ⚠️ Include `/api` at the end!
   - Save

4. **Configure Rewrites (CRITICAL!)**
   - App settings → Rewrites and redirects
   - Add rule:
     ```
     Source: </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|ttf|map|json)$)([^.]+$)/>
     Target: /index.html
     Type: 200 (Rewrite)
     ```
   - Save

5. **Redeploy**
   - Hosting → Redeploy this version
   - Wait ~2 minutes

6. **Copy Domain**
   - Copy: `https://production.xxxxxx.amplifyapp.com`
   - ⚠️ SAVE THIS URL!

---

## 5️⃣ Test Everything (3 dk)

### Backend Tests:

```bash
# Health check
curl https://YOUR-API-URL/prod/api/health

# Login
curl -X POST https://YOUR-API-URL/prod/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Should return token
```

### Frontend Tests:

1. **Open:** `https://YOUR-APP.amplifyapp.com`
2. **Login:** 
   - Username: `admin`
   - Password: `admin123`
3. **Test:**
   - ✅ Dashboard loads
   - ✅ Customer Management works
   - ✅ Order Management works
   - ✅ Product Calculation works
   - ✅ Page refresh doesn't 404

---

## ⚠️ Critical Checklist

### Lambda
- [ ] Handler: `lambda.handler` (not `index.handler`)
- [ ] Timeout: 30 seconds (not 3 seconds)
- [ ] Memory: 512 MB
- [ ] Environment variables set
- [ ] DynamoDB permissions added

### API Gateway
- [ ] Resource: `{proxy+}` (not just `/`)
- [ ] Method: ANY
- [ ] Lambda proxy integration enabled
- [ ] CORS enabled
- [ ] Deployed to `prod` stage

### Amplify
- [ ] Environment variable: `NEXT_PUBLIC_API_URL` with `/api`
- [ ] SPA rewrite rule added
- [ ] Redeployed after config changes

### DynamoDB
- [ ] 6 tables created
- [ ] Admin user exists
- [ ] Can login successfully

---

## 🔒 Post-Deployment Security

### Immediately after deployment:

1. **Change Admin Password**
   ```bash
   # Login first to get token
   TOKEN=$(curl -s -X POST https://YOUR-API-URL/prod/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

   # Change password
   curl -X PUT https://YOUR-API-URL/prod/api/auth/profile \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"password":"YOUR-NEW-STRONG-PASSWORD"}'
   ```

2. **Update JWT_SECRET**
   - Generate: `openssl rand -base64 32`
   - Lambda → Configuration → Environment variables
   - Update `JWT_SECRET`
   - Save

3. **Update CORS Origins**
   - Remove `localhost` from allowed origins in Lambda code
   - Only keep production Amplify domain

---

## 🐛 Troubleshooting

### 502 Bad Gateway
- ✅ Lambda timeout = 30 seconds (not 3)
- ✅ Handler = `lambda.handler`
- Check CloudWatch logs: Lambda → Monitor → View logs

### CORS Errors
- ✅ CORS enabled on API Gateway resource
- ✅ Lambda proxy integration enabled
- ✅ Environment variable `NEXT_PUBLIC_API_URL` set

### 404 on Page Refresh
- ✅ SPA rewrite rule added to Amplify
- ✅ Redeployed after adding rule

### Login Fails
- ✅ /api/init/admin called
- ✅ DynamoDB tables created
- Check CloudWatch logs

### Can't Create Customer/Order
- ✅ Logged in as admin
- ✅ Token valid
- Check browser console for errors

---

## 📊 URLs to Save

Fill these in:

```
API URL: https://________.execute-api.eu-central-1.amazonaws.com/prod
Frontend URL: https://production.________.amplifyapp.com

Admin Login:
  Username: admin
  Password: admin123 (CHANGE THIS!)
```

---

## ✅ Deployment Complete!

**Total Time:** ~15 minutes  
**Status:** Production Ready 🚀

**Next Steps:**
1. Change admin password
2. Update JWT_SECRET
3. Configure CloudWatch alarms
4. Set up backup strategy

---

**Need Help?** Check `FULL-DEPLOYMENT-GUIDE.md` for detailed troubleshooting.
