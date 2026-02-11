#!/bin/bash
# Deployment Package Builder - Fiyat Hesaplama
# Bu script her deployment'ta temiz zipler oluşturur

set -e  # Exit on error

PROJECT_ROOT="/Users/gizemesmer/Desktop/personal/fiyathesaplama"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🧹 Eski zipleri temizliyorum..."
cd "$PROJECT_ROOT"
rm -f *.zip
rm -f backend/*.zip
rm -f production-builds/*.zip
rm -f dist/*.zip

echo "✅ Eski zipler temizlendi"
echo ""

echo "🏗️  Frontend build başlatılıyor..."
npm run build
echo "✅ Frontend build tamamlandı"
echo ""

echo "📦 Frontend zip oluşturuluyor..."
cd dist/fiyat-hesaplama/browser
zip -r "$PROJECT_ROOT/frontend-deploy.zip" . -q
cd "$PROJECT_ROOT"
echo "✅ Frontend zip oluşturuldu: frontend-deploy.zip"
ls -lh frontend-deploy.zip | awk '{print "   Boyut:", $5}'
echo ""

echo "📦 Backend Lambda zip oluşturuluyor..."
cd backend/lambda-deploy
npm install --production --silent 2>&1 | grep -v "^npm WARN" || true
cd ..
zip -r "$PROJECT_ROOT/backend-lambda-deploy.zip" \
  lambda-deploy/src \
  lambda-deploy/lambda.js \
  lambda-deploy/package.json \
  lambda-deploy/package-lock.json \
  lambda-deploy/node_modules \
  -q
cd "$PROJECT_ROOT"
echo "✅ Backend Lambda zip oluşturuldu: backend-lambda-deploy.zip"
ls -lh backend-lambda-deploy.zip | awk '{print "   Boyut:", $5}'
echo ""

echo "📋 Deployment Paketleri:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Frontend:  $PROJECT_ROOT/frontend-deploy.zip"
echo "Backend:   $PROJECT_ROOT/backend-lambda-deploy.zip"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Deployment paketleri hazır!"
echo ""
echo "📤 Sonraki adımlar:"
echo "1. AWS Amplify Console → staging branch → Manual deploy"
echo "   Upload: frontend-deploy.zip"
echo "2. AWS Lambda Console → gramfiyat-backend → Upload .zip"
echo "   Upload: backend-lambda-deploy.zip"
