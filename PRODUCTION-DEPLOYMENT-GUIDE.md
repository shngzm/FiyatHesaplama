# Production Deployment Guide
**Generated: February 10, 2026**

## 📦 Package Information

### Frontend Package
- **File:** `production-builds/frontend-production.zip`
- **Size:** 188 KB
- **Contents:** 
  - Compiled Angular application (dist/fiyat-hesaplama)
  - Production-optimized bundles
  - Static assets (images, icons)
  - HTML, CSS, and JavaScript files

### Backend Package  
- **File:** `production-builds/backend-production.zip`
- **Size:** 4.5 MB
- **Contents:**
  - Backend source code (backend/src)
  - All production dependencies (node_modules)
  - Configuration files (package.json, package-lock.json)

---

## 🚀 Deployment Options

### Option 1: Traditional Server Deployment

#### Frontend Deployment (Nginx/Apache)

1. **Extract the frontend package:**
   ```bash
   unzip frontend-production.zip
   ```

2. **Configure web server (Nginx example):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/dist/fiyat-hesaplama/browser;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

3. **Copy files to server:**
   ```bash
   scp -r dist/fiyat-hesaplama/browser/* user@server:/var/www/html/
   ```

#### Backend Deployment (Node.js Server)

1. **Extract the backend package:**
   ```bash
   unzip backend-production.zip
   ```

2. **Set environment variables:**
   ```bash
   export NODE_ENV=production
   export PORT=3000
   export JWT_SECRET=your-secure-secret
   export AWS_REGION=your-region
   export AWS_ACCESS_KEY_ID=your-access-key
   export AWS_SECRET_ACCESS_KEY=your-secret-key
   ```

3. **Start the server:**
   ```bash
   cd backend
   npm start
   # or with PM2
   pm2 start src/server.js --name gramfiyat-api
   ```

---

### Option 2: AWS Deployment

#### Frontend (S3 + CloudFront)

1. **Create S3 bucket:**
   ```bash
   aws s3 mb s3://gramfiyat-frontend
   ```

2. **Upload frontend files:**
   ```bash
   unzip frontend-production.zip
   aws s3 sync dist/fiyat-hesaplama/browser/ s3://gramfiyat-frontend/ \
       --acl public-read \
       --cache-control "max-age=31536000,public"
   ```

3. **Configure S3 for static hosting:**
   ```bash
   aws s3 website s3://gramfiyat-frontend/ \
       --index-document index.html \
       --error-document index.html
   ```

4. **Set up CloudFront distribution** for HTTPS and CDN benefits

#### Backend (Lambda + API Gateway)

1. **Use the existing Lambda deployment:**
   ```bash
   cd backend/lambda-deploy
   npm install
   # Deploy using serverless framework or SAM
   ```

2. **Or deploy to EC2/ECS:**
   ```bash
   # Copy backend-production.zip to EC2 instance
   ssh -i key.pem ec2-user@instance
   unzip backend-production.zip
   cd backend
   pm2 start src/server.js
   ```

---

### Option 3: Docker Deployment

#### Create Dockerfiles

**Frontend Dockerfile:**
```dockerfile
FROM nginx:alpine
COPY dist/fiyat-hesaplama/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
COPY backend/src ./src
RUN npm ci --only=production
EXPOSE 3000
CMD ["node", "src/server.js"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
```

---

## 🔧 Environment Configuration

### Frontend Environment
Update `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.your-domain.com', // Your backend URL
};
```

### Backend Environment Variables
Required variables in production:
```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secure-jwt-secret-min-32-chars
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
CORS_ORIGIN=https://your-frontend-domain.com
```

---

## 🔒 Security Checklist

- [ ] Set strong JWT_SECRET (minimum 32 characters)
- [ ] Configure CORS to allow only your frontend domain
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up rate limiting (already configured in backend)
- [ ] Configure security headers (Helmet is installed)
- [ ] Review and update AWS IAM permissions
- [ ] Enable CloudWatch logging for monitoring
- [ ] Set up backup strategy for DynamoDB tables

---

## 📊 Post-Deployment Verification

### Frontend Health Check
1. Visit your domain
2. Check browser console for errors
3. Test all routes and navigation
4. Verify API calls are working

### Backend Health Check
```bash
# Check server status
curl https://api.your-domain.com/health

# Test authentication
curl -X POST https://api.your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'
```

---

## 🔄 Update Procedure

To deploy updates:

1. **Build new production packages:**
   ```bash
   npm run build:prod  # Frontend
   cd backend && npm install --production  # Backend
   ```

2. **Create new zip files:**
   ```bash
   zip -r production-builds/frontend-production-v2.zip dist/fiyat-hesaplama
   zip -r production-builds/backend-production-v2.zip backend/src backend/package*.json backend/node_modules
   ```

3. **Deploy using your chosen method above**

---

## 📞 Support & Monitoring

### Monitoring Setup
- Set up CloudWatch alarms for:
  - API error rates
  - Response times
  - DynamoDB read/write capacity
  - Lambda function errors (if using Lambda)

### Logs Location
- **Frontend:** Browser console and CloudFront logs
- **Backend:** PM2 logs or CloudWatch Logs
  ```bash
  pm2 logs gramfiyat-api
  # or
  aws logs tail /aws/lambda/gramfiyat-api --follow
  ```

---

## 📝 Notes

- The frontend build is optimized with tree-shaking and minification
- Backend includes all production dependencies pre-installed
- No development dependencies are included in the packages
- Both packages are ready for immediate deployment
- The backend uses compression and security middleware (Helmet)
- Rate limiting is configured at 100 requests per 15 minutes per IP

---

## 🆘 Troubleshooting

### Common Issues

**Frontend not loading:**
- Check web server configuration (ensure SPA routing)
- Verify API URL in environment.prod.ts
- Check CORS settings on backend

**Backend API errors:**
- Verify all environment variables are set
- Check DynamoDB table creation and permissions
- Review CloudWatch logs for detailed errors
- Ensure AWS credentials are valid

**CORS errors:**
- Update CORS_ORIGIN in backend environment
- Verify frontend domain is whitelisted

---

For additional deployment support or questions, refer to:
- [AWS-DEPLOYMENT-STEPS.md](./AWS-DEPLOYMENT-STEPS.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- Backend API documentation in `backend/src/`
