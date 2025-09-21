#!/bin/bash

# QuickCRM Deployment Script
echo "🚀 QuickCRM Deployment Başlıyor..."

# Docker Compose ile servisleri durdur
echo "📦 Mevcut servisleri durduruyor..."
docker-compose down

# Eski image'ları temizle
echo "🧹 Eski image'ları temizliyor..."
docker system prune -f

# Yeni image'ları build et
echo "🔨 Yeni image'ları build ediyor..."
docker-compose build --no-cache

# Servisleri başlat
echo "▶️ Servisleri başlatıyor..."
docker-compose up -d

# Servislerin hazır olmasını bekle
echo "⏳ Servislerin hazır olmasını bekliyor..."
sleep 30

# Health check
echo "🏥 Health check yapıyor..."
curl -f http://localhost:5000/health || echo "❌ Backend health check başarısız"
curl -f http://localhost/health || echo "❌ Frontend health check başarısız"

# Servis durumunu göster
echo "📊 Servis durumu:"
docker-compose ps

echo "✅ Deployment tamamlandı!"
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:5000"
echo "📚 Swagger UI: http://localhost:5000/swagger"
