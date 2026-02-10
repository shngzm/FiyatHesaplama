#!/bin/bash

echo "🔧 Lambda handler hatası düzeltiliyor..."
echo ""

cd backend

# Node modules kontrolü
if [ ! -d "node_modules" ]; then
    echo "📦 Dependencies yükleniyor..."
    npm install --production
fi

# Lambda paketi oluştur
echo "📦 Lambda deployment paketi oluşturuluyor..."
echo ""

# Temiz bir paket için eski zip'i sil
rm -f lambda-deployment.zip

# Paket oluştur - lambda.js ve src/ klasörünü dahil et
zip -r lambda-deployment.zip lambda.js src/ node_modules/ package.json package-lock.json \
    -x "node_modules/aws-sdk/*" \
    -x "*.git*" \
    -x "*.DS_Store" \
    -x "*/test/*" \
    -x "*/tests/*" \
    -x "*/.env*" \
    -x "*/dynamodb-local/*" \
    -x "*/lambda-deploy/*"

if [ ! -f "lambda-deployment.zip" ]; then
    echo "❌ Zip oluşturulamadı!"
    exit 1
fi

echo ""
echo "✅ Zip oluşturuldu: $(du -h lambda-deployment.zip | cut -f1)"
echo ""

# Lambda'yı güncelle
echo "🚀 Lambda fonksiyonu güncelleniyor..."
aws lambda update-function-code \
  --function-name fiyat-hesaplama-auth \
  --zip-file fileb://lambda-deployment.zip \
  --region eu-central-1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Lambda code başarıyla güncellendi!"
    echo ""
    
    # Handler'ı düzelt
    echo "🔧 Handler ayarı güncelleniyor..."
    aws lambda update-function-configuration \
      --function-name fiyat-hesaplama-auth \
      --handler lambda.handler \
      --runtime nodejs20.x \
      --timeout 30 \
      --memory-size 256 \
      --region eu-central-1
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Lambda configuration güncellendi!"
        echo ""
        echo "🎯 Handler: lambda.handler"
        echo "⚙️  Runtime: nodejs20.x"
        echo "⏱️  Timeout: 30 seconds"
        echo "💾 Memory: 256 MB"
        echo ""
        echo "✅ TAMAMLANDI!"
        echo ""
        echo "⏳ 10 saniye bekleyin ve giriş yapmayı tekrar deneyin..."
        echo "🌐 URL: https://staging.d12wynbw2ij4ni.amplifyapp.com"
    else
        echo ""
        echo "⚠️  Lambda code güncellendi ama configuration güncellenemedi."
        echo "📝 Manuel olarak AWS Console'dan handler'ı 'lambda.handler' olarak ayarlayın."
    fi
else
    echo ""
    echo "❌ Lambda güncellemesi başarısız!"
    echo "📝 AWS CLI credentials'ları kontrol edin:"
    echo "   aws configure"
    exit 1
fi

echo ""
echo "📦 Deployment paketi: backend/lambda-deployment.zip"

cd ..
