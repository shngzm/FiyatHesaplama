# Fiyat Hesaplama v3.0 - Complete Deployment Guide

**Release Date:** February 10, 2025  
**Version:** 3.0.0 (Activity Logging & Product SubTypes)

## 🎯 What's New in v3.0

### 1. Product SubType System
- **Kolye/Bilezik** → Single type (null/undefined subType)
- **Yüzük** → Separate selectable subType ('yuzuk')
- **Küpe** → Separate selectable subType ('kupe')
- Product management UI includes subType dropdown and badges
- Calculation component filters products by selected subType

### 2. Activity Logging System
- **Automatic tracking** of all user actions via middleware
- **Admin-only access** to activity reports
- **15+ action types** tracked:
  - Customer: CREATE, UPDATE, DELETE
  - Order: CREATE, UPDATE, DELETE
  - Product: CREATE, UPDATE, DELETE
  - Model: CREATE, UPDATE, DELETE
  - Gold Price: UPDATE
  - Auth: USER_LOGIN, USER_REGISTER
- **Activity filters**: date range, action type, user
- **Statistics**: total operations, breakdown by action/user/date

### 3. Save Calculation as Order
- New "Siparişe Ekle" button in calculation results
- Customer selection modal
- Automatically converts calculation to order with all details
- Notes include selected product subType

### 4. Enhanced Navigation
- New "Aktivite Raporu" button for admin users on home page

---

## 📦 Deployment Files

### Backend: `lambda-with-deps-v3.zip` (4.1MB)
**New/Updated Files:**
- `src/models/ActivityLog.js` - Activity logging model with DynamoDB
- `src/controllers/activityLogController.js` - Activity log API endpoints
- `src/routes/activityLogs.js` - Admin-only activity log routes
- `src/middleware/activityLogger.js` - Automatic activity logging middleware
- `src/config/dynamodb.js` - Updated with 7 tables (added ACTIVITY_LOGS)
- `src/routes/init.js` - Updated to create ACTIVITY_LOGS table
- `src/server.js` - Integrated activity logging middleware
- All product models - Added `subType` field support

### Frontend: `frontend-deploy-v3.zip` (197KB)
**New/Updated Files:**
- `app/models/product.model.ts` - Added ProductSubType type
- `app/services/product.service.ts` - Exposed productsSubject for filtering
- `app/services/activity-log.service.ts` - NEW: Activity log API service
- `app/models/activity-log.model.ts` - NEW: Activity log interfaces
- `app/components/activity-report/` - NEW: Complete activity report component
- `app/components/product-management/` - Updated with subType dropdown and badges
- `app/components/calculation/` - Updated with subType filtering and save-as-order
- `app/components/home/` - Added activity report navigation button
- `app/routes.ts` - Added /activity-report route with admin guard

---

## 🗄️ DynamoDB Schema Changes

### New Table: ACTIVITY_LOGS
**Table Name:** `GramFiyat-ActivityLogs`  
**Primary Key:** `id` (String, HASH)  
**GSI:** `UserIdIndex`
  - Partition Key: `userId` (String)
  - Sort Key: `timestamp` (String)

**Attributes:**
```javascript
{
  id: String,              // UUID
  userId: String,          // User who performed action
  username: String,        // Username for display
  action: String,          // Action type (CREATE_CUSTOMER, UPDATE_ORDER, etc.)
  method: String,          // HTTP method (POST, PUT, DELETE)
  path: String,            // API path
  ip: String,              // Client IP address
  userAgent: String,       // Client user agent
  statusCode: Number,      // HTTP status code
  resourceId: String,      // ID of affected resource (optional)
  requestData: Object,     // Sanitized request data (optional)
  timestamp: String        // ISO 8601 timestamp
}
```

**Creation Command** (AWS CLI):
```bash
aws dynamodb create-table \
  --table-name GramFiyat-ActivityLogs \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=userId,AttributeType=S \
    AttributeName=timestamp,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    "[{\"IndexName\": \"UserIdIndex\",\"KeySchema\": [{\"AttributeName\":\"userId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"timestamp\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### Updated Table: PRODUCTS
**New Field:** `subType` (String, optional)
- Values: `null` (Kolye/Bilezik), `"yuzuk"` (Yüzük), `"kupe"` (Küpe)
- No schema migration needed - existing products default to null

---

## 🚀 AWS Lambda Deployment

### 1. Upload Backend to Lambda

```bash
# Upload lambda-with-deps-v3.zip to AWS Lambda
aws lambda update-function-code \
  --function-name GramFiyat-Backend \
  --zip-file fileb://lambda-with-deps-v3.zip \
  --region us-east-1
```

### 2. Environment Variables (No Changes)
All existing environment variables remain the same:
```
JWT_SECRET=<your-secret>
JWT_EXPIRES_IN=7d
USERS_TABLE=GramFiyat-Users
MODELS_TABLE=GramFiyat-Models
PRODUCTS_TABLE=GramFiyat-Products
GOLD_PRICES_TABLE=GramFiyat-GoldPrices
CUSTOMERS_TABLE=GramFiyat-Customers
ORDERS_TABLE=GramFiyat-Orders
ACTIVITY_LOGS_TABLE=GramFiyat-ActivityLogs  # NEW
AWS_REGION=us-east-1
```

### 3. Lambda Configuration
- **Runtime:** Node.js 18.x or later
- **Handler:** `index.handler`
- **Timeout:** 30 seconds
- **Memory:** 512 MB
- **IAM Role:** Must have DynamoDB full access for 7 tables

---

## 🌐 AWS Amplify Deployment (Frontend)

### Option 1: AWS Console Upload
1. Go to AWS Amplify → Your App → Hosting
2. Drag & drop `frontend-deploy-v3.zip`
3. Wait for deployment (2-3 minutes)

### Option 2: AWS CLI Upload
```bash
aws amplify create-deployment \
  --app-id <your-app-id> \
  --branch-name main \
  --zip-file fileb://frontend-deploy-v3.zip \
  --region us-east-1
```

### Environment Variables (Frontend)
Update `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://<your-lambda-api-gateway-url>'
};
```

---

## 🔧 DynamoDB Table Creation

### Quick Setup (All 7 Tables)
Run the init endpoint after deploying Lambda:
```bash
curl -X POST https://<your-api-gateway-url>/api/init \
  -H "Content-Type: application/json"
```

### Manual Table Creation (if needed)
Create tables in this order:
1. GramFiyat-Users
2. GramFiyat-Models
3. GramFiyat-Products
4. GramFiyat-GoldPrices
5. GramFiyat-Customers
6. GramFiyat-Orders (create with 1 GSI: customerId-index)
7. **GramFiyat-ActivityLogs** (NEW - create with UserIdIndex GSI)

**AWS Console Limitation:** Only 1 GSI can be added during table creation.

**Orders Table Additional GSIs** (add after creation):
- `status-index` (status HASH)
- `createdBy-index` (createdBy HASH, createdAt RANGE)

---

## 👤 Admin User Setup

### Create Admin User
```bash
curl -X POST https://<your-api-gateway-url>/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "YourSecurePassword123!",
    "email": "admin@example.com",
    "role": "admin"
  }'
```

### Verify Admin Access
```bash
# Login
curl -X POST https://<your-api-gateway-url>/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "YourSecurePassword123!"
  }'

# Test activity logs endpoint (admin-only)
curl https://<your-api-gateway-url>/api/activity-logs \
  -H "Authorization: Bearer <your-token>"
```

---

## ✅ Testing Checklist

### 1. Product SubType Feature
- [ ] Login as admin
- [ ] Navigate to "Ürün Yönetimi"
- [ ] Create product with subType "Kolye/Bilezik" (null)
- [ ] Create product with subType "Yüzük"
- [ ] Create product with subType "Küpe"
- [ ] Verify product list shows correct badges (blue, purple, green)

### 2. Calculation with SubType Filtering
- [ ] Navigate to "Gram Hesaplama"
- [ ] Select subType "Kolye/Bilezik"
- [ ] Verify only Kolye/Bilezik products appear in dropdowns
- [ ] Switch to "Yüzük" subType
- [ ] Verify only Yüzük products appear
- [ ] Perform calculation
- [ ] Verify results display correctly

### 3. Save Calculation as Order
- [ ] Complete a calculation
- [ ] Click "Siparişe Ekle" button
- [ ] Modal should appear with customer selection
- [ ] Select a customer
- [ ] Click "Kaydet"
- [ ] Navigate to "Sipariş Yönetimi"
- [ ] Verify order was created with calculation details

### 4. Activity Logging
- [ ] Login as admin
- [ ] Navigate to "Aktivite Raporu" from home page
- [ ] Verify activity log table displays
- [ ] Create a new customer
- [ ] Refresh activity logs
- [ ] Verify "CREATE_CUSTOMER" action appears
- [ ] Test date range filter
- [ ] Test action type filter
- [ ] Verify statistics display correctly

### 5. Non-Admin User Restrictions
- [ ] Create a non-admin user
- [ ] Login as non-admin
- [ ] Verify "Aktivite Raporu" button does NOT appear on home page
- [ ] Attempt to access `/activity-report` directly
- [ ] Verify redirected to login or access denied

### 6. Existing Features (Regression Test)
- [ ] Customer management (CRUD operations)
- [ ] Order management (CRUD operations)
- [ ] Model management (CRUD operations)
- [ ] Gold price management
- [ ] User management (admin-only)
- [ ] Gram calculator
- [ ] Scrap calculator

---

## 🐛 Troubleshooting

### Issue: Activity logs not appearing
**Solution:** 
- Check Lambda logs for middleware errors
- Verify ACTIVITY_LOGS_TABLE environment variable set
- Ensure DynamoDB table created successfully
- Check IAM role has DynamoDB:PutItem permission

### Issue: SubType dropdown not showing
**Solution:**
- Clear browser cache
- Check browser console for errors
- Verify frontend build includes updated product model
- Check API response includes subType field

### Issue: "Siparişe Ekle" button not working
**Solution:**
- Verify customers exist in database
- Check customer service HTTP requests succeed
- Verify order service createOrder endpoint functional
- Check browser console for errors

### Issue: Non-admin can access activity reports
**Solution:**
- Verify admin guard applied to /activity-report route
- Check user token includes correct role
- Verify backend auth middleware validates admin role

---

## 📊 Database Statistics

### Total Tables: 7
1. GramFiyat-Users (1 GSI)
2. GramFiyat-Models (0 GSI)
3. GramFiyat-Products (1 GSI)
4. GramFiyat-GoldPrices (0 GSI)
5. GramFiyat-Customers (1 GSI)
6. GramFiyat-Orders (3 GSI)
7. **GramFiyat-ActivityLogs (1 GSI)** - NEW

### Total GSIs: 8
- UserIdIndex (Users)
- modelId-index (Products)
- createdBy-index (Customers)
- customerId-index (Orders)
- status-index (Orders)
- createdBy-index (Orders)
- **UserIdIndex (ActivityLogs)** - NEW

---

## 🔒 Security Considerations

### Activity Logging Privacy
- **Password fields** automatically sanitized from logs
- **Token fields** automatically sanitized from logs
- Activity logs **admin-only** access via authentication middleware
- IP addresses logged for audit trail

### SubType Data Integrity
- SubType validation on backend (null, 'yuzuk', 'kupe' only)
- Frontend dropdown prevents invalid values
- Existing products backward compatible (null default)

---

## 📝 Migration Notes

### From v2.0 to v3.0

**No breaking changes.** All existing features remain functional.

**New Features:**
1. Product subType field (optional, defaults to null)
2. Activity logging (automatic, no action required)
3. Save calculation as order (new UI button)
4. Activity report (admin-only navigation)

**Database:**
- 1 new table: GramFiyat-ActivityLogs
- Products table: new optional field `subType`
- No data migration required

**Environment Variables:**
- Add `ACTIVITY_LOGS_TABLE=GramFiyat-ActivityLogs` to Lambda

**User Experience:**
- Admin users: New "Aktivite Raporu" button on home page
- All users: New "Siparişe Ekle" button in calculations
- Product management: New "Tip" column and dropdown

---

## 📞 Support

**Issues:** Check [TESTING.md](../docs/TESTING.md) for detailed test cases  
**Architecture:** See [ARCHITECTURE.md](../docs/ARCHITECTURE.md) for system design  
**Documentation:** Refer to [PRD.md](../docs/PRD.md) for feature specifications

---

**Deployment Complete!** 🎉

Your Fiyat Hesaplama application v3.0 is now live with:
- ✅ Product subtype differentiation (Kolye/Bilezik, Yüzük, Küpe)
- ✅ Comprehensive activity logging for admin audit
- ✅ One-click conversion of calculations to orders
- ✅ Enhanced admin reporting and statistics
