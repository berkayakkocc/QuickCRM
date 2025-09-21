# 🚀 QuickCRM - Modern Customer Management System

## 📋 Proje Özeti

QuickCRM, küçük ekipler için tasarlanmış modern ve kullanıcı dostu bir müşteri yönetim sistemidir. React + TypeScript frontend ve .NET Core 8 Web API backend ile geliştirilmiştir.

## ✨ Özellikler

- 🎯 **Müşteri Yönetimi**: Tam CRUD operasyonları
- 📊 **Dashboard**: İstatistikler ve genel bakış
- 🔍 **Arama & Filtreleme**: Aktif müşteriler, bu ay eklenenler
- 📱 **Responsive Tasarım**: Tüm cihazlarda uyumlu
- 🎨 **Modern UI/UX**: Gradient arka plan, glassmorphism efektleri
- ⚡ **Performance**: MemoryCache ile optimize edilmiş API'ler
- 🐳 **Docker Ready**: Containerized deployment

## 🏗️ Teknoloji Stack

### Frontend
- **React 19** + **TypeScript**
- **Inline CSS** (Modern UI)
- **React Router** (Navigation)
- **Vite** (Build tool)

### Backend
- **.NET Core 8** Web API
- **Entity Framework Core** (ORM)
- **SQL Server** (Database)
- **Clean Architecture** + **Repository Pattern**
- **MemoryCache** (Performance)

### Infrastructure
- **Docker** + **Docker Compose**
- **Nginx** (Reverse proxy)
- **SQL Server** (Containerized)

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Docker & Docker Compose
- .NET 8 SDK (Development için)
- Node.js 18+ (Development için)

### Production Deployment

1. **Repository'yi klonlayın:**
```bash
git clone <repository-url>
cd QuickCRM
```

2. **Docker Compose ile başlatın:**
```bash
docker-compose up -d
```

3. **Uygulamaya erişin:**
- Frontend: http://localhost
- Backend API: http://localhost:5000
- Swagger UI: http://localhost:5000/swagger

### Development Setup

#### Backend
```bash
cd Backend/QuickCRM.API
dotnet restore
dotnet run
```

#### Frontend
```bash
cd Frontend
npm install
npm run dev
```

## 📁 Proje Yapısı

```
QuickCRM/
├── Backend/                    # .NET Core 8 Web API
│   ├── QuickCRM.API/          # Web API katmanı
│   ├── QuickCRM.Core/         # Domain entities ve interfaces
│   ├── QuickCRM.Infrastructure/ # Data access ve external services
│   └── QuickCRM.Application/   # Business logic ve use cases
├── Frontend/                   # React + TypeScript
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Sayfa componentleri
│   │   └── App.tsx           # Ana uygulama
│   ├── Dockerfile            # Frontend container
│   └── nginx.conf            # Nginx konfigürasyonu
├── docker-compose.yml        # Multi-container setup
└── README.md                 # Bu dosya
```

## 🔧 API Endpoints

### Müşteri Yönetimi
- `GET /api/customers` - Tüm müşterileri listele
- `GET /api/customers/{id}` - Müşteri detayı
- `POST /api/customers` - Yeni müşteri ekle
- `PUT /api/customers/{id}` - Müşteri güncelle
- `DELETE /api/customers/{id}` - Müşteri sil
- `GET /api/customers/search?searchTerm={term}` - Müşteri ara
- `GET /api/customers/active` - Aktif müşteriler

### İstatistikler
- `GET /api/stats/dashboard` - Dashboard istatistikleri
- `GET /api/stats/customers/total` - Toplam müşteri sayısı
- `GET /api/stats/customers/active` - Aktif müşteri sayısı
- `GET /api/stats/customers/this-month` - Bu ay eklenen müşteri sayısı

### Health Check
- `GET /health` - Sistem sağlık durumu

## 🎨 UI/UX Özellikleri

- **Gradient Arka Plan**: Mavi-mor gradient geçişleri
- **Glassmorphism**: Şeffaf kartlar ve blur efektleri
- **Hover Animasyonları**: Smooth geçişler ve etkileşimler
- **Responsive Grid**: Mobil-first yaklaşım
- **Modern Typography**: Inter font family
- **Loading States**: Kullanıcı deneyimi için loading göstergeleri

## 🔒 Güvenlik

- **CORS**: Cross-origin istekler için yapılandırılmış
- **Input Validation**: Form validasyonları
- **SQL Injection**: Entity Framework ile korunma
- **XSS Protection**: Security headers ile korunma

## 📊 Performance

- **MemoryCache**: API yanıt sürelerini optimize eder
- **Database Indexing**: Hızlı sorgular için optimize edilmiş
- **Gzip Compression**: Nginx ile sıkıştırma
- **Static File Caching**: CDN benzeri önbellekleme

## 🐳 Docker Konfigürasyonu

### Servisler
- **sqlserver**: SQL Server 2022 Express
- **backend**: .NET Core 8 Web API
- **frontend**: React + Nginx

### Portlar
- **80**: Frontend (Nginx)
- **5000**: Backend API
- **1433**: SQL Server

### Volumes
- **sqlserver_data**: Veritabanı verileri

## 🔧 Environment Variables

### Backend
- `ASPNETCORE_ENVIRONMENT`: Production
- `ConnectionStrings__DefaultConnection`: Veritabanı bağlantı string'i

### Database
- `SA_PASSWORD`: SQL Server admin şifresi
- `ACCEPT_EULA`: EULA kabulü

## 📈 Monitoring

- **Health Checks**: `/health` endpoint'i
- **Logging**: Structured logging
- **Error Handling**: Global exception handling

## 🚀 Production Checklist

- [x] Docker containerization
- [x] Environment configurations
- [x] Health checks
- [x] Security headers
- [x] Performance optimization
- [x] Error handling
- [x] Logging
- [ ] SSL/HTTPS (Production domain ile)
- [ ] Domain configuration
- [ ] Monitoring setup

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Proje hakkında sorularınız için issue oluşturabilirsiniz.

---

**QuickCRM** - Modern, hızlı ve kullanıcı dostu müşteri yönetim sistemi 🚀
