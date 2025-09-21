# QuickCRM Deployment Script (PowerShell)
Write-Host "🚀 QuickCRM Deployment Başlıyor..." -ForegroundColor Green

# Docker Compose ile servisleri durdur
Write-Host "📦 Mevcut servisleri durduruyor..." -ForegroundColor Yellow
docker-compose down

# Eski image'ları temizle
Write-Host "🧹 Eski image'ları temizliyor..." -ForegroundColor Yellow
docker system prune -f

# Yeni image'ları build et
Write-Host "🔨 Yeni image'ları build ediyor..." -ForegroundColor Yellow
docker-compose build --no-cache

# Servisleri başlat
Write-Host "▶️ Servisleri başlatıyor..." -ForegroundColor Yellow
docker-compose up -d

# Servislerin hazır olmasını bekle
Write-Host "⏳ Servislerin hazır olmasını bekliyor..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Health check
Write-Host "🏥 Health check yapıyor..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing | Out-Null
    Write-Host "✅ Backend health check başarılı" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend health check başarısız" -ForegroundColor Red
}

try {
    Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing | Out-Null
    Write-Host "✅ Frontend health check başarılı" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend health check başarısız" -ForegroundColor Red
}

# Servis durumunu göster
Write-Host "📊 Servis durumu:" -ForegroundColor Cyan
docker-compose ps

Write-Host "✅ Deployment tamamlandı!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:5000" -ForegroundColor Cyan
Write-Host "📚 Swagger UI: http://localhost:5000/swagger" -ForegroundColor Cyan
