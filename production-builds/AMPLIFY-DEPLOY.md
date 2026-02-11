# AWS Amplify Deployment - Fiyat Hesaplama v3.0

## 🚨 404 Error Fix

**Problem:** `frontend-deploy-v3.zip` contains files in `browser/` subfolder, causing 404 errors.

**Solution:** Use `amplify-deploy-v3.zip` instead (files in root).

---

## 📦 Deployment Steps

### Option 1: AWS Amplify Console (Recommended)

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Select your app: **Fiyat Hesaplama** or **GramFiyat**
3. Click **Hosting environments** → **staging** (or your branch)
4. Click **Deploy** button (top right)
5. **Drag and drop** → `amplify-deploy-v3.zip`
6. Wait 2-3 minutes for deployment
7. Visit your URL: `https://staging.d12wynbw2ij4ni.amplifyapp.com`

### Option 2: AWS CLI

```bash
aws amplify start-deployment \
  --app-id d12wynbw2ij4ni \
  --branch-name staging \
  --source-url s3://your-bucket/amplify-deploy-v3.zip
```

---

## 🔧 Deployment Files

### ✅ Use This: `amplify-deploy-v3.zip` (192KB)
**Structure:**
```
amplify-deploy-v3.zip/
├── index.html
├── favicon.ico
├── styles-KWKGRH2W.css
├── main-RQWPATKX.js
├── polyfills-FFHMD2TL.js
└── assets/
    ├── icon.png
    └── elizi-goldtool-logo.jpeg
```

### ❌ Don't Use: `frontend-deploy-v3.zip`
**Structure (wrong):**
```
frontend-deploy-v3.zip/
├── 3rdpartylicenses.txt
└── browser/            ← Extra folder causes 404
    ├── index.html
    ├── ...
```

---

## 🌐 Environment Variables

**IMPORTANT:** Set `apiUrl` in Amplify environment:

1. Go to Amplify Console → Your App
2. Click **Environment variables** (left sidebar)
3. Add variable:
   - **Key:** `API_URL`
   - **Value:** `https://your-lambda-api-gateway-url.amazonaws.com`

Or update `src/environments/environment.prod.ts` before building:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-gateway-url.amazonaws.com'
};
```

---

## ✅ Verification

After deployment:

1. Visit: `https://staging.d12wynbw2ij4ni.amplifyapp.com`
2. Should see **Fiyat Hesaplama** home page
3. Test login (admin/user)
4. Check browser console for API errors

**If still 404:**
- Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
- Check Amplify build logs for errors
- Verify app is deployed to correct branch

---

## 🐛 Troubleshooting

### Issue: Still getting 404 after deployment
**Solution:**
```bash
# Check Amplify app status
aws amplify get-app --app-id d12wynbw2ij4ni

# Check branch status
aws amplify get-branch --app-id d12wynbw2ij4ni --branch-name staging

# Manual redeploy
aws amplify start-job \
  --app-id d12wynbw2ij4ni \
  --branch-name staging \
  --job-type RELEASE
```

### Issue: Index.html not found
**Cause:** Wrong folder structure in zip
**Solution:** Use `amplify-deploy-v3.zip` (not `frontend-deploy-v3.zip`)

### Issue: API calls failing (CORS errors)
**Solution:**
1. Check Lambda API Gateway CORS settings
2. Verify `apiUrl` in environment variables
3. Check browser console for actual error

---

## 📋 Deployment Checklist

- [ ] Use correct zip: `amplify-deploy-v3.zip`
- [ ] Upload via Amplify Console
- [ ] Wait for deployment to complete (green checkmark)
- [ ] Clear browser cache
- [ ] Test home page loads
- [ ] Test login functionality
- [ ] Verify API calls work (check network tab)
- [ ] Test all new features:
  - [ ] Product subType (Yüzük/Küpe)
  - [ ] Calculation with subType filter
  - [ ] Save calculation as order
  - [ ] Activity reports (admin only)

---

## 🚀 Quick Deploy Command

```bash
# From project root
cd /Users/gizemesmer/Desktop/personal/fiyathesaplama/production-builds

# Open Amplify Console
open https://console.aws.amazon.com/amplify/

# Upload: amplify-deploy-v3.zip
```

---

**Next Steps:**
1. Upload `amplify-deploy-v3.zip` to Amplify
2. Deploy backend: `lambda-with-deps-v3.zip` to AWS Lambda
3. Create DynamoDB tables (7 total)
4. Test complete workflow

**Need help?** Check `DEPLOYMENT-GUIDE-v3.md` for full instructions.
