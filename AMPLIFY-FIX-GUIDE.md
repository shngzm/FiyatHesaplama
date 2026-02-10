# AWS Amplify 404 Error - Fix Guide

## Problem
Your Amplify app at `staging.d12wynbw2ij4ni.amplifyapp.com` is returning a 404 error.

## Root Cause
The most common causes are:
1. ❌ Incorrect build output directory configuration
2. ❌ Build failed but deployment continued
3. ❌ Missing `amplify.yml` configuration
4. ❌ SPA routing not configured

## ✅ Solution

### Step 1: Add Amplify Configuration File

An `amplify.yml` file has been created in your project root. This tells Amplify:
- How to build your app
- Where to find the built files (`dist/fiyat-hesaplama/browser`)

**File created:** `amplify.yml`

### Step 2: Fix Amplify Build Settings

1. **Go to AWS Amplify Console:**
   - Open: https://console.aws.amazon.com/amplify
   - Select your app: `staging.d12wynbw2ij4ni.amplifyapp.com`

2. **Update Build Settings:**
   - Go to **App settings** → **Build settings**
   - Click **Edit**
   - Ensure the configuration matches:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build:prod
  artifacts:
    baseDirectory: dist/fiyat-hesaplama/browser
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

3. **Save the build settings**

### Step 3: Configure Rewrites and Redirects (SPA Support)

Angular is a Single Page Application, so all routes need to redirect to `index.html`.

1. In Amplify Console, go to **App settings** → **Rewrites and redirects**
2. Click **Edit**
3. Add this rule (if not already present):

```
Source: </^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>
Target: /index.html
Status: 200 (Rewrite)
```

Or use this simpler rule:

```
Source: /<*>
Target: /index.html
Status: 200 (Rewrite)
```

4. **Save**

### Step 4: Redeploy

Option A: **Trigger New Build (Recommended)**
```bash
# If connected to Git repository
git add amplify.yml
git commit -m "Add Amplify configuration"
git push
```

Option B: **Manual Redeploy from Console**
1. Go to your Amplify app in the console
2. Click on the branch (e.g., `staging`)
3. Click **Redeploy this version** 
4. Or upload the production build manually:
   - Click **Deploy** → **Deploy without Git**
   - Upload the `dist/fiyat-hesaplama/browser` folder contents

Option C: **Deploy Using Amplify CLI**
```bash
# Install Amplify CLI (if not installed)
npm install -g @aws-amplify/cli

# Configure
amplify configure

# Pull existing environment
amplify pull --appId d12wynbw2ij4ni --envName staging

# Publish
amplify publish
```

### Step 5: Verify Build Logs

1. After triggering redeploy, go to your app in Amplify Console
2. Click on the build in progress
3. Check the build logs for errors:
   - **Provision** should succeed
   - **Build** should show `npm run build:prod` completing successfully
   - **Deploy** should upload files to the correct location
   
**Look for these success indicators:**
```
✓ Build complete
✓ Artifacts uploaded
✓ Deployment complete
```

### Step 6: Update Environment Variables (If Needed)

If your build needs environment variables:

1. Go to **App settings** → **Environment variables**
2. Add any required variables:
   - `NODE_ENV=production`
   - Any API URLs or keys

### Step 7: Test the Deployment

After redeployment completes:

1. Visit: `https://staging.d12wynbw2ij4ni.amplifyapp.com`
2. Clear browser cache or use incognito mode
3. Test different routes to ensure SPA routing works

## 🔍 Troubleshooting

### Issue: Build Still Fails

**Check build logs for:**
- Node version mismatch (Amplify uses Node 18 by default)
- Missing dependencies
- TypeScript errors
- Build timeout

**Set Node version (if needed):**
In Amplify Console → App settings → Build image settings:
- Node version: 18

**Or add to `amplify.yml`:**
```yaml
frontend:
  phases:
    preBuild:
      commands:
        - nvm install 18
        - nvm use 18
        - npm ci
```

### Issue: Build Succeeds but 404 Still Appears

**Verify artifacts location:**
1. Check build logs for "Artifacts" section
2. Ensure it shows: `baseDirectory: dist/fiyat-hesaplama/browser`
3. Verify files are being uploaded (should see list of files)

**Check the actual output:**
```bash
# Locally verify the build
npm run build:prod
ls -la dist/fiyat-hesaplama/browser/
# Should show: index.html, main-*.js, polyfills-*.js, etc.
```

### Issue: Homepage Works but Routes Return 404

This means SPA rewrites aren't configured. Follow **Step 3** above.

### Issue: Blank Page Instead of 404

**Check browser console for errors:**
- API URL misconfiguration
- CORS errors
- Missing environment variables

**Verify environment.prod.ts:**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-actual-api-url.com'
};
```

## 📋 Quick Checklist

- [ ] `amplify.yml` file created in project root
- [ ] Build settings updated with correct `baseDirectory`
- [ ] SPA rewrites/redirects configured
- [ ] Build completed successfully (check logs)
- [ ] Environment variables set (if needed)
- [ ] Browser cache cleared
- [ ] Homepage loads successfully
- [ ] Internal routes work (SPA routing)

## 🚀 Quick Manual Deploy (Alternative)

If you just need it working now:

1. **Build locally:**
   ```bash
   npm run build:prod
   ```

2. **Create a zip of the output:**
   ```bash
   cd dist/fiyat-hesaplama/browser
   zip -r ../../../amplify-deploy.zip .
   cd ../../..
   ```

3. **Deploy via Console:**
   - Amplify Console → Your app
   - Click **Deploy without Git provider**
   - Upload `amplify-deploy.zip`
   - Wait for deployment

4. **Configure rewrites** (Step 3 above)

## 📞 Still Having Issues?

1. **Check Amplify Service Status:** https://status.aws.amazon.com/
2. **Review Build Logs** in detail - look for red errors
3. **Verify IAM permissions** for Amplify service role
4. **Try different deployment method** (S3 + CloudFront as backup)

## 🔗 Useful Links

- AWS Amplify Console: https://console.aws.amazon.com/amplify
- Amplify Docs: https://docs.amplify.aws/
- Your App: https://staging.d12wynbw2ij4ni.amplifyapp.com

---

**Most common fix:** Steps 2 + 3 (correct baseDirectory + SPA rewrites) solve 90% of 404 issues.
