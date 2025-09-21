# 🚀 QuickCRM - Railway + Vercel Deployment Rehberi

## 📋 Gereksinimler
- GitHub hesabı
- Railway hesabı (ücretsiz)
- Vercel hesabı (ücretsiz)

## 🎯 Deployment Stratejisi
- **Frontend**: Vercel (ücretsiz)
- **Backend**: Railway (ücretsiz tier)
- **Database**: Azure SQL Database (ücretsiz tier)

## 🚀 Adım Adım Deployment

### 1. GitHub'a Push Edin
```bash
# Git repository oluşturun
git init
git add .
git commit -m "Railway deployment hazırlığı"
git branch -M main
git remote add origin https://github.com/yourusername/QuickCRM.git
git push -u origin main
```

### 2. Backend'i Railway'e Deploy Edin

#### Railway Dashboard'da:
1. **New Project** → **Deploy from GitHub repo**
2. QuickCRM repository'sini seçin
3. **Backend** klasörünü seçin
4. **Deploy** butonuna tıklayın

#### Azure SQL Database Bağlantısı:
1. Azure Portal'da SQL Database oluşturun (detaylar için AZURE_SQL_DEPLOYMENT.md'ye bakın)
2. Connection string'i alın

#### Environment Variables:
```
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Server=tcp:your-server.database.windows.net,1433;Initial Catalog=QuickCRM;Persist Security Info=False;User ID=your-username;Password=your-password;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

### 3. Frontend'i Vercel'e Deploy Edin

#### Vercel Dashboard'da:
1. **New Project** → **Import Git Repository**
2. QuickCRM repository'sini seçin
3. **Root Directory**: `Frontend` olarak ayarlayın
4. **Framework Preset**: `Vite` seçin
5. **Deploy** butonuna tıklayın

#### Environment Variables:
```
VITE_API_URL=https://your-railway-backend.railway.app
```

### 4. Frontend API URL'ini Güncelleyin

Frontend'de API çağrıları nginx proxy ile çalışacak şekilde ayarlanmış. Vercel'de environment variable olarak Railway backend URL'ini ayarlayın.

### 5. CORS Ayarlarını Güncelleyin

Railway backend'inizde CORS ayarlarını Vercel domain'inize göre güncelleyin:
- `https://your-app.vercel.app`
- `https://*.vercel.app`

## 🔧 Railway Özel Ayarlar

### Port Konfigürasyonu
Railway otomatik olarak PORT environment variable'ını sağlar. Backend'inizde bu port'u dinleyecek şekilde ayarlanmış.

### Health Check
Railway `/health` endpoint'ini kullanarak servisinizin sağlığını kontrol eder.

### Database Migration
Railway'de backend deploy edildikten sonra migration'lar otomatik olarak çalışacak.

## 📊 Monitoring

### Railway
- **Logs**: Railway dashboard'da real-time logları görüntüleyin
- **Metrics**: CPU, Memory, Network kullanımı
- **Health**: Health check durumu

### Vercel
- **Analytics**: Sayfa görüntüleme istatistikleri
- **Functions**: Serverless function metrikleri
- **Speed Insights**: Performance metrikleri

## 🚨 Troubleshooting

### Backend Sorunları
1. **Database Connection**: PostgreSQL URL'ini kontrol edin
2. **CORS**: Frontend domain'ini CORS ayarlarına ekleyin
3. **Port**: Railway PORT environment variable'ını kontrol edin

### Frontend Sorunları
1. **API URL**: Vercel environment variable'ını kontrol edin
2. **Build**: Vite build sürecini kontrol edin
3. **Routing**: Vercel routing konfigürasyonunu kontrol edin

## 🎯 Production Checklist

- [x] Railway backend deployment
- [x] Vercel frontend deployment
- [x] PostgreSQL database setup
- [x] Environment variables configuration
- [x] CORS settings
- [x] Health checks
- [ ] SSL/HTTPS (otomatik)
- [ ] Domain configuration
- [ ] Performance monitoring

## 📞 Destek

Deployment sırasında sorun yaşarsanız:
1. Railway logs'ları kontrol edin
2. Vercel function logs'ları kontrol edin
3. Browser developer tools'da network tab'ını kontrol edin
4. GitHub issues'da sorun bildirin

---

**QuickCRM** - Railway + Vercel ile ücretsiz production deployment 🚀
