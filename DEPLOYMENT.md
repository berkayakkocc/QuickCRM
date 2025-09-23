# 🚀 QuickCRM Deployment Guide

Bu dokümantasyon, QuickCRM projesinin production ortamına deploy edilmesi için gerekli adımları içerir.

## 📋 İçindekiler

- [Azure App Service Deployment](#azure-app-service-deployment)
- [Netlify Frontend Deployment](#netlify-frontend-deployment)
- [Azure SQL Database Setup](#azure-sql-database-setup)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)

---

## 🌐 Azure App Service Deployment

### 1. Azure Portal Setup

#### App Service Oluşturma
1. Azure Portal'a gidin
2. **App Services** → **Create**
3. **Resource Group**: `quickcrm-rg`
4. **Name**: `quickcrm-backend-2024`
5. **Runtime**: `.NET 9`
6. **Region**: `West Europe`
7. **Pricing Plan**: `Basic B1`

#### SQL Database Oluşturma
1. **SQL databases** → **Create**
2. **Database name**: `QuickCRM`
3. **Server**: Yeni server oluştur
4. **Server name**: `quickcrm-server`
5. **Admin username**: `quickcrmadmin`
6. **Password**: Güçlü şifre belirleyin
7. **Pricing tier**: `Basic`

### 2. Visual Studio Deployment

#### Publish Profile Oluşturma
1. Azure Portal'da App Service'e gidin
2. **Get publish profile** butonuna tıklayın
3. `.pubxml` dosyasını indirin
4. `Properties/PublishProfiles/` klasörüne koyun

#### Visual Studio'dan Deploy
1. Solution'ı açın
2. **QuickCRM.API** projesine sağ tıklayın
3. **Publish** seçin
4. **Import Profile** ile `.pubxml` dosyasını seçin
5. **Publish** butonuna tıklayın

### 3. Connection String Configuration

#### Azure Portal'da Ayarlama
1. App Service → **Configuration**
2. **Connection strings** sekmesi
3. **New connection string**:
   - **Name**: `DefaultConnection`
   - **Value**: 
     ```
     Server=tcp:quickcrm-server.database.windows.net,1433;Initial Catalog=QuickCRM;Persist Security Info=False;User ID=quickcrmadmin;Password=YOUR_PASSWORD;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=60;
     ```
   - **Type**: `SQLServer`

#### CORS Ayarları
1. **Configuration** → **CORS**
2. **Allowed origins** ekleyin:
   - `https://quickcrm-app.netlify.app`
   - `https://*.netlify.app`
   - `http://localhost:3000`
   - `http://localhost:5173`

---

## 🌐 Netlify Frontend Deployment

### 1. Netlify Setup

#### Proje Oluşturma
1. [Netlify](https://netlify.com) hesabı oluşturun
2. **New site from Git** seçin
3. GitHub repository'yi bağlayın
4. **Site settings**:
   - **Site name**: `quickcrm-app`
   - **Branch**: `main`

#### Build Settings
1. **Site settings** → **Build & deploy**
2. **Build settings**:
   - **Base directory**: `Frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `Frontend/dist`

### 2. Environment Variables

#### Netlify'da Ayarlama
1. **Site settings** → **Environment variables**
2. **Add variable**:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net`

### 3. Custom Domain (Opsiyonel)

#### Domain Ekleme
1. **Site settings** → **Domain management**
2. **Add custom domain**
3. DNS ayarlarını yapılandırın

---

## 🗄️ Azure SQL Database Setup

### 1. Database Configuration

#### Firewall Rules
1. SQL Server → **Networking**
2. **Add current client IP address**
3. **Allow Azure services** → **ON**

#### Connection String
```
Server=tcp:quickcrm-server.database.windows.net,1433;Initial Catalog=QuickCRM;Persist Security Info=False;User ID=quickcrmadmin;Password=YOUR_PASSWORD;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=60;
```

### 2. Database Migration

#### Otomatik Migration
- Uygulama başlatıldığında otomatik olarak migration'lar çalışır
- `Program.cs` içinde `context.Database.Migrate()` ile

#### Manuel Migration (Gerekirse)
```bash
cd Backend/QuickCRM.API
dotnet ef database update
```

---

## ⚙️ Environment Configuration

### Backend Environment Variables

#### appsettings.Production.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=tcp:quickcrm-server.database.windows.net,1433;Initial Catalog=QuickCRM;Persist Security Info=False;User ID=quickcrmadmin;Password=YOUR_PASSWORD;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=60;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

### Frontend Environment Variables

#### .env.production
```env
VITE_API_URL=https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net
```

---

## 🔧 Troubleshooting

### Backend Sorunları

#### 500 Internal Server Error
- **Sebep**: Connection string yanlış
- **Çözüm**: Azure Portal'da connection string'i kontrol edin

#### 40613 Database Not Available
- **Sebep**: Azure SQL Serverless auto-pause
- **Çözüm**: `EnableRetryOnFailure` ile retry policy

#### CORS Error
- **Sebep**: Frontend domain'i CORS'ta yok
- **Çözüm**: Azure Portal'da CORS ayarlarını güncelleyin

### Frontend Sorunları

#### Build Error
- **Sebep**: TypeScript hataları
- **Çözüm**: `npm run build` ile hataları kontrol edin

#### API Connection Error
- **Sebep**: Yanlış API URL
- **Çözüm**: Environment variable'ı kontrol edin

### Database Sorunları

#### Migration Error
- **Sebep**: Database bağlantı sorunu
- **Çözüm**: Connection string ve firewall ayarlarını kontrol edin

#### Seed Data Error
- **Sebep**: Tablolar oluşmamış
- **Çözüm**: Migration'ları manuel çalıştırın

---

## 📊 Monitoring

### Azure App Service
- **Log Stream**: Real-time logs
- **Metrics**: Performance monitoring
- **Health Check**: `/health` endpoint

### Netlify
- **Deploy Logs**: Build ve deploy logs
- **Analytics**: Site performance
- **Functions**: Serverless functions (opsiyonel)

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Gelecek)
```yaml
name: Deploy to Azure
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'quickcrm-backend-2024'
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
```

---

## 📈 Performance Optimization

### Backend
- **MemoryCache**: API response caching
- **Connection Pooling**: Database connection optimization
- **Retry Policies**: Transient error handling

### Frontend
- **Code Splitting**: Lazy loading
- **Image Optimization**: WebP format
- **CDN**: Static asset delivery

---

## 🔒 Security Checklist

### Backend
- [x] HTTPS enforcement
- [x] CORS configuration
- [x] Input validation
- [x] SQL injection protection
- [x] Security headers

### Frontend
- [x] HTTPS only
- [x] Input sanitization
- [x] XSS protection
- [x] Secure headers

### Database
- [x] Encrypted connections
- [x] Firewall rules
- [x] Access control
- [x] Regular backups

---

## 📞 Support

Deployment sorunları için:
- **GitHub Issues**: [Create issue](https://github.com/yourusername/QuickCRM/issues)
- **Azure Support**: Azure Portal → Help + Support
- **Netlify Support**: Netlify Dashboard → Help

---

**QuickCRM Deployment Guide** - Production'a güvenli deployment 🚀