# QuickCRM Backend Production Deployment Guide

## 🚀 Production Hazırlık Checklist

### ✅ Tamamlanan Optimizasyonlar

#### 1. **Güvenlik Optimizasyonları**
- [x] Environment variables ile connection string güvenliği
- [x] Production CORS policy (sadece güvenli origin'ler)
- [x] Security headers eklendi (X-Content-Type-Options, X-Frame-Options, vb.)
- [x] Swagger UI production'da optimize edildi
- [x] Rate limiting middleware eklendi

#### 2. **Performance Optimizasyonları**
- [x] Response compression (Brotli + Gzip)
- [x] Response caching
- [x] Memory cache optimizasyonu
- [x] Database connection retry policy

#### 3. **Monitoring & Health Checks**
- [x] Gelişmiş health check endpoint'leri (`/health`, `/health/ready`, `/health/live`)
- [x] Application Insights entegrasyonu
- [x] Database ve memory health check'leri
- [x] Structured logging

#### 4. **Docker Optimizasyonları**
- [x] Multi-stage build optimizasyonu
- [x] Non-root user güvenliği
- [x] Health check eklendi
- [x] Port 8080'e geçiş (Azure App Service uyumlu)

## 🔧 Azure App Service Deployment

### 1. **Environment Variables Ayarlama**

Azure App Service'de aşağıdaki environment variables'ları ayarlayın:

```bash
# Database
AZURE_SQL_CONNECTION_STRING=Server=tcp:quickcrm-server.database.windows.net,1433;Initial Catalog=QuickCRM;Persist Security Info=False;User ID=quickcrmadmin;Password=YOUR_PASSWORD;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;

# JWT Settings (Production'da güvenli değerler kullanın)
JwtSettings__SecretKey=YOUR_PRODUCTION_SECRET_KEY_HERE
JwtSettings__Issuer=QuickCRM-API
JwtSettings__Audience=QuickCRM-Client
JwtSettings__ExpiryMinutes=60

# Application Insights
APPLICATIONINSIGHTS_CONNECTION_STRING=YOUR_APPLICATION_INSIGHTS_CONNECTION_STRING

# Azure Identity
AZURE_TENANT_ID=YOUR_TENANT_ID
AZURE_CLIENT_ID=YOUR_CLIENT_ID
AZURE_CLIENT_SECRET=YOUR_CLIENT_SECRET

# Rate Limiting
RateLimiting__EnableRateLimiting=true
RateLimiting__PermitLimit=100
RateLimiting__WindowInMinutes=1
```

### 2. **Docker Deployment**

```bash
# Docker image build
docker build -t quickcrm-backend .

# Azure Container Registry'ye push
az acr build --registry your-registry --image quickcrm-backend:latest .

# Azure App Service'e deploy
az webapp config container set --name quickcrm-backend --resource-group your-rg --docker-custom-image-name your-registry.azurecr.io/quickcrm-backend:latest
```

### 3. **Health Check Endpoints**

Production'da aşağıdaki endpoint'ler kullanılabilir:

- **`/health`** - Detaylı health check (JSON response)
- **`/health/ready`** - Readiness probe (Kubernetes/AKS için)
- **`/health/live`** - Liveness probe (Kubernetes/AKS için)

### 4. **Monitoring & Logging**

#### Application Insights
- Otomatik olarak performance metrics toplar
- Request/response tracking
- Exception tracking
- Custom telemetry eklenebilir

#### Health Check Monitoring
```bash
# Health check test
curl https://your-app.azurewebsites.net/health

# Response example:
{
  "status": "Healthy",
  "checks": [
    {
      "name": "database",
      "status": "Healthy",
      "description": "Database connection is healthy",
      "duration": 45.2
    },
    {
      "name": "memory",
      "status": "Healthy", 
      "description": "Memory usage is healthy: 45MB",
      "duration": 0.1
    }
  ],
  "totalDuration": 45.3
}
```

## 🔒 Güvenlik Notları

### 1. **CORS Policy**
Production'da sadece aşağıdaki origin'lerden istek kabul edilir:
- `https://quickcrm.vercel.app`
- `https://quickcrm-app.netlify.app`
- `https://quickcrm-frontend.azurewebsites.net`

### 2. **Rate Limiting**
- Varsayılan: 100 istek/dakika
- IP bazlı rate limiting
- `X-RateLimit-*` header'ları ile bilgilendirme

### 3. **Security Headers**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 📊 Performance Optimizasyonları

### 1. **Response Compression**
- Brotli compression (öncelikli)
- Gzip compression (fallback)
- HTTPS üzerinde compression aktif

### 2. **Caching**
- Memory cache: 1000 entry limit
- Response caching aktif
- Cache compaction: %25

### 3. **Database**
- Connection retry policy: 5 deneme
- Retry delay: 30 saniye
- Azure SQL Serverless uyumlu

## 🚨 Troubleshooting

### 1. **Yaygın Sorunlar**

#### Database Connection Failed
```bash
# Health check ile kontrol
curl https://your-app.azurewebsites.net/health

# Log kontrolü
az webapp log tail --name quickcrm-backend --resource-group your-rg
```

#### CORS Issues
- Frontend URL'inin `Cors:AllowedOrigins` listesinde olduğundan emin olun
- HTTPS kullanıldığından emin olun

#### Rate Limiting
- `X-RateLimit-*` header'larını kontrol edin
- `RateLimiting:EnableRateLimiting` ayarını kontrol edin

### 2. **Log Analysis**

```bash
# Application Insights'da log arama
# Azure Portal > Application Insights > Logs

# Örnek sorgular:
requests
| where timestamp > ago(1h)
| summarize count() by bin(timestamp, 5m)

exceptions
| where timestamp > ago(1h)
| project timestamp, outerMessage, details
```

## 📈 Monitoring Dashboard

### 1. **Key Metrics**
- Response time (ortalama, P95, P99)
- Request count (başarılı/başarısız)
- Error rate
- Memory usage
- Database connection health

### 2. **Alerts**
- Error rate > %5
- Response time > 2 saniye
- Memory usage > 80%
- Database connection failures

## 🔄 Deployment Pipeline

### 1. **CI/CD Pipeline**
```yaml
# Azure DevOps Pipeline örneği
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: Docker@2
  inputs:
    command: 'build'
    dockerfile: 'Dockerfile'
    tags: '$(Build.BuildId)'

- task: AzureContainerRegistry@1
  inputs:
    command: 'push'
    azureSubscription: 'your-subscription'
    azureContainerRegistry: 'your-registry'
    imageName: 'quickcrm-backend:$(Build.BuildId)'

- task: AzureWebAppContainer@1
  inputs:
    azureSubscription: 'your-subscription'
    appName: 'quickcrm-backend'
    imageName: 'your-registry.azurecr.io/quickcrm-backend:$(Build.BuildId)'
```

### 2. **Blue-Green Deployment**
- Staging slot kullanımı
- Zero-downtime deployment
- Rollback stratejisi

## ✅ Production Readiness Checklist

- [x] Environment variables güvenli şekilde ayarlandı
- [x] CORS policy production domain'lerine göre yapılandırıldı
- [x] Security headers eklendi
- [x] Rate limiting aktif
- [x] Health check endpoint'leri çalışıyor
- [x] Application Insights entegrasyonu tamamlandı
- [x] Docker image optimize edildi
- [x] Performance optimizasyonları uygulandı
- [x] Monitoring ve alerting yapılandırıldı
- [x] Documentation tamamlandı

## 📞 Support

Herhangi bir sorun durumunda:
1. Health check endpoint'lerini kontrol edin
2. Application Insights log'larını inceleyin
3. Azure App Service log'larını kontrol edin
4. Database connection'ı test edin

---

**Son Güncelleme**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Versiyon**: 1.0.0
**Environment**: Production

