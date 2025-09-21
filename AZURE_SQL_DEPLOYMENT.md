# 🚀 QuickCRM - Azure SQL Database + Railway Deployment

## 📋 Gereksinimler
- GitHub hesabı
- Azure hesabı (ücretsiz tier mevcut)
- Railway hesabı (ücretsiz)
- Vercel hesabı (ücretsiz)

## 🎯 Deployment Stratejisi
- **Frontend**: Vercel (ücretsiz)
- **Backend**: Railway (ücretsiz tier)
- **Database**: Azure SQL Database (ücretsiz tier)

## 🚀 Adım Adım Deployment

### 1. Azure SQL Database Kurulumu

#### Azure Portal'da:
1. **Azure Portal** → **Create a resource**
2. **Databases** → **Azure SQL**
3. **Create** butonuna tıklayın

#### Database Konfigürasyonu:
```
Subscription: Pay-as-you-go (ücretsiz tier)
Resource Group: quickcrm-rg (yeni oluşturun)
Database name: QuickCRM
Server: quickcrm-server (yeni oluşturun)
Location: West Europe (en yakın)
Authentication method: SQL authentication
Server admin login: quickcrmadmin
Password: Güçlü bir şifre (örn: QuickCRM@2024!)
```

#### Firewall Ayarları:
1. **Networking** → **Public access**
2. **Allow Azure services and resources** → **Yes**
3. **Add current client IP address** → **Yes**

### 2. Connection String Alma

#### Azure Portal'da:
1. SQL Database'inize gidin
2. **Connection strings** → **ADO.NET**
3. Connection string'i kopyalayın

#### Örnek Connection String:
```
Server=tcp:quickcrm-server.database.windows.net,1433;Initial Catalog=QuickCRM;Persist Security Info=False;User ID=quickcrmadmin;Password=QuickCRM@2024!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

### 3. Backend'i Railway'e Deploy Edin

#### Railway Dashboard'da:
1. **New Project** → **Deploy from GitHub repo**
2. QuickCRM repository'sini seçin
3. **Backend** klasörünü seçin
4. **Deploy** butonuna tıklayın

#### Environment Variables:
```
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Server=tcp:quickcrm-server.database.windows.net,1433;Initial Catalog=QuickCRM;Persist Security Info=False;User ID=quickcrmadmin;Password=QuickCRM@2024!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

### 4. Frontend'i Vercel'e Deploy Edin

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

### 5. Database Migration

Railway'de backend deploy edildikten sonra:
1. Railway logs'ları kontrol edin
2. Migration'lar otomatik olarak çalışacak
3. Seed data otomatik olarak eklenecek

## 🔧 Azure SQL Database Özel Ayarlar

### Firewall Kuralları
Azure SQL Database'e erişim için:
- **Azure services**: Otomatik olarak izin verilir
- **Railway IP**: Railway'in IP aralıklarını ekleyin
- **Your IP**: Geliştirme için kendi IP'nizi ekleyin

### Performance Tier
- **Free Tier**: 32 GB storage, 5 DTU
- **Basic Tier**: 2 GB storage, 5 DTU (ücretsiz 12 ay)
- **Standard Tier**: 250 GB storage, 10 DTU (ücretli)

### Security
- **Encryption**: Otomatik olarak etkin
- **Authentication**: SQL Server authentication
- **Firewall**: IP bazlı erişim kontrolü

## 📊 Monitoring

### Azure Portal
- **Metrics**: DTU kullanımı, storage, connections
- **Logs**: Query performance, errors
- **Alerts**: Performance ve güvenlik uyarıları

### Railway
- **Logs**: Application logs
- **Metrics**: CPU, Memory, Network
- **Health**: Health check durumu

### Vercel
- **Analytics**: Sayfa görüntüleme istatistikleri
- **Functions**: Serverless function metrikleri
- **Speed Insights**: Performance metrikleri

## 🚨 Troubleshooting

### Database Connection Sorunları
1. **Firewall**: IP adresinizi Azure'da ekleyin
2. **Connection String**: Doğru server adını kullanın
3. **Authentication**: Kullanıcı adı ve şifreyi kontrol edin
4. **SSL**: Encrypt=True ayarını kontrol edin

### Railway Deployment Sorunları
1. **Environment Variables**: Connection string'i kontrol edin
2. **Build**: .NET Core build sürecini kontrol edin
3. **Port**: Railway PORT environment variable'ını kontrol edin

### Vercel Deployment Sorunları
1. **API URL**: Railway backend URL'ini kontrol edin
2. **CORS**: Backend CORS ayarlarını kontrol edin
3. **Build**: Vite build sürecini kontrol edin

## 💰 Maliyet Analizi

### Azure SQL Database
- **Free Tier**: 32 GB, 5 DTU (süresiz ücretsiz)
- **Basic Tier**: 2 GB, 5 DTU (12 ay ücretsiz)
- **Standard Tier**: 250 GB, 10 DTU (ücretli)

### Railway
- **Hobby Plan**: $5/ay (512 MB RAM, 1 GB storage)
- **Pro Plan**: $20/ay (8 GB RAM, 100 GB storage)

### Vercel
- **Hobby Plan**: Ücretsiz (100 GB bandwidth)
- **Pro Plan**: $20/ay (1 TB bandwidth)

## 🎯 Production Checklist

- [x] Azure SQL Database kurulumu
- [x] Railway backend deployment
- [x] Vercel frontend deployment
- [x] Environment variables configuration
- [x] CORS settings
- [x] Health checks
- [x] SSL/HTTPS (otomatik)
- [ ] Domain configuration
- [ ] Performance monitoring
- [ ] Backup strategy

## 📞 Destek

Deployment sırasında sorun yaşarsanız:
1. Azure SQL Database logs'ları kontrol edin
2. Railway logs'ları kontrol edin
3. Vercel function logs'ları kontrol edin
4. Browser developer tools'da network tab'ını kontrol edin

---

**QuickCRM** - Azure SQL Database + Railway + Vercel ile production deployment 🚀
