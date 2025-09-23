# 🚀 QuickCRM - Modern Customer Management System

<div align="center">

![QuickCRM Logo](https://img.shields.io/badge/QuickCRM-Customer%20Management-blue?style=for-the-badge&logo=react&logoColor=white)

[![.NET](https://img.shields.io/badge/.NET-9.0-purple?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Azure](https://img.shields.io/badge/Azure-Cloud-orange?style=flat-square&logo=microsoft-azure)](https://azure.microsoft.com/)
[![Netlify](https://img.shields.io/badge/Netlify-Hosting-green?style=flat-square&logo=netlify)](https://netlify.com/)

**Modern, hızlı ve kullanıcı dostu müşteri yönetim sistemi**

[🌐 Live Demo](https://quickcrm-app.netlify.app) | [📚 API Docs](https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net/swagger) | [📖 Documentation](#-documentation)

</div>

---

## 📋 Proje Özeti

QuickCRM, küçük ve orta ölçekli işletmeler için tasarlanmış modern bir müşteri yönetim sistemidir. React + TypeScript frontend ve .NET 9 Web API backend ile geliştirilmiştir. Azure App Service ve Netlify üzerinde production'da çalışmaktadır.

### 🎯 Ana Özellikler

- **📊 Dashboard**: Gerçek zamanlı istatistikler ve genel bakış
- **👥 Müşteri Yönetimi**: Tam CRUD operasyonları ile müşteri bilgileri
- **🔍 Gelişmiş Arama**: İsim, email, şirket bazında arama
- **📱 Responsive Tasarım**: Tüm cihazlarda mükemmel deneyim
- **🎨 Modern UI/UX**: Glassmorphism ve gradient tasarım
- **⚡ Yüksek Performans**: MemoryCache ile optimize edilmiş API'ler
- **☁️ Cloud Ready**: Azure ve Netlify üzerinde production'da

---

## 🏗️ Teknoloji Stack

### Frontend
- **React 19** + **TypeScript** - Modern UI framework
- **Vite** - Hızlı build tool ve dev server
- **React Router** - Client-side routing
- **Inline CSS** - Modern styling approach
- **Netlify** - Hosting ve CI/CD

### Backend
- **.NET 9** Web API - Modern web framework
- **Entity Framework Core** - ORM ve database management
- **Azure SQL Database** - Cloud database
- **Clean Architecture** - Maintainable code structure
- **Repository Pattern** - Data access abstraction
- **MemoryCache** - Performance optimization

### Infrastructure
- **Azure App Service** - Backend hosting
- **Azure SQL Database** - Cloud database
- **Netlify** - Frontend hosting
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline

---

## 🌐 Live Demo

### 🎯 Production URLs
- **Frontend**: [https://quickcrm-app.netlify.app](https://quickcrm-app.netlify.app)
- **Backend API**: [https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net](https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net)
- **API Documentation**: [https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net/swagger](https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net/swagger)
- **Health Check**: [https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net/health](https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net/health)

---

## 📱 Ekran Görüntüleri

### 🏠 Dashboard - Ana Sayfa
![Dashboard](https://i.hizliresim.com/5x27150.png)

**Özellikler:**
- **📊 İstatistik Kartları**: Toplam müşteri, aktif müşteri ve bu ay eklenen müşteri sayıları
- **👥 Son Eklenen Müşteriler**: En son eklenen 5 müşterinin listesi
- **🎨 Modern Tasarım**: Gradient arka plan ve glassmorphism efektleri
- **📱 Responsive**: Tüm cihazlarda mükemmel görünüm

**İstatistikler:**
- Toplam Müşteri: 3
- Aktif Müşteri: 2  
- Bu Ay Eklenen: 2

---

### 👥 Müşteriler - Müşteri Listesi
![Customers](https://hizliresim.com/kbklzmc)

**Özellikler:**
- **🔍 Gelişmiş Arama**: İsim, email, şirket bazında arama
- **📋 Detaylı Liste**: Müşteri bilgileri, iletişim ve durum bilgileri
- **⚡ Hızlı İşlemler**: Düzenleme ve silme butonları
- **🎯 Durum Göstergeleri**: Aktif/Pasif durumu görsel olarak
- **➕ Yeni Müşteri**: Hızlı ekleme butonu

**Müşteri Bilgileri:**
- Avatar (İsim baş harfleri)
- Ad Soyad ve Şirket
- Email ve Telefon
- Aktif/Pasif Durumu
- Düzenleme/Silme İşlemleri

---

### ➕ Yeni Müşteri - Müşteri Ekleme Formu
![New Customer](https://hizliresim.com/rrq96bs)

**Özellikler:**
- **📝 Kapsamlı Form**: Tüm gerekli müşteri bilgileri
- **✅ Form Validasyonu**: Zorunlu alanlar ve format kontrolü
- **🎨 Modern UI**: Temiz ve kullanıcı dostu arayüz
- **📱 Responsive**: Mobil ve masaüstünde uyumlu
- **💾 Kolay Kaydetme**: Tek tıkla kaydetme işlemi

**Form Alanları:**
- **Ad*** (Zorunlu)
- **Soyad*** (Zorunlu)  
- **E-posta*** (Zorunlu)
- **Telefon** (Opsiyonel)
- **Şirket** (Opsiyonel)
- **Notlar** (Opsiyonel)

---

## 🚀 Hızlı Başlangıç

### Gereksinimler
- **.NET 9 SDK** - Backend development için
- **Node.js 18+** - Frontend development için
- **Docker** (Opsiyonel) - Containerized deployment için
- **Azure CLI** (Opsiyonel) - Azure deployment için

### Development Setup

#### 1. Repository'yi klonlayın
```bash
git clone https://github.com/yourusername/QuickCRM.git
cd QuickCRM
```

#### 2. Backend Setup
```bash
cd Backend/QuickCRM.API
dotnet restore
dotnet run
```
Backend: `https://localhost:7000`

#### 3. Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```
Frontend: `http://localhost:5173`

### Production Deployment

#### Azure App Service (Backend)
1. Azure Portal'da App Service oluşturun
2. SQL Database oluşturun
3. Connection string'i yapılandırın
4. Visual Studio ile publish edin

#### Netlify (Frontend)
1. GitHub repository'yi Netlify'a bağlayın
2. Build settings'i yapılandırın:
   - **Base directory**: `Frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `Frontend/dist`

---

## 📁 Proje Yapısı

```
QuickCRM/
├── 📁 Backend/                          # .NET 9 Web API
│   ├── 📁 QuickCRM.API/                 # Web API katmanı
│   │   ├── 📁 Controllers/              # API Controllers
│   │   ├── 📁 Data/                     # Seed data
│   │   ├── 📄 Program.cs                # Startup configuration
│   │   └── 📄 appsettings.json          # Configuration
│   ├── 📁 QuickCRM.Core/                # Domain entities
│   │   ├── 📁 Entities/                 # Customer, User entities
│   │   └── 📁 Interfaces/               # Repository interfaces
│   ├── 📁 QuickCRM.Infrastructure/      # Data access layer
│   │   ├── 📁 Data/                     # DbContext
│   │   ├── 📁 Migrations/               # EF Core migrations
│   │   └── 📁 Repositories/             # Repository implementations
│   └── 📁 QuickCRM.Application/         # Business logic
│       ├── 📁 Services/                 # Business services
│       └── 📁 DTOs/                     # Data transfer objects
├── 📁 Frontend/                         # React + TypeScript
│   ├── 📁 src/
│   │   ├── 📁 components/               # Reusable components
│   │   ├── 📁 pages/                    # Page components
│   │   ├── 📄 App.tsx                   # Main application
│   │   └── 📄 main.tsx                  # Entry point
│   ├── 📄 package.json                  # Dependencies
│   ├── 📄 vite.config.ts                # Vite configuration
│   └── 📄 tsconfig.json                 # TypeScript config
├── 📄 docker-compose.yml                # Multi-container setup
├── 📄 README.md                         # This file
└── 📄 .gitignore                        # Git ignore rules
```

---

## 🔧 API Endpoints

### Müşteri Yönetimi
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/api/customers` | Tüm müşterileri listele |
| `GET` | `/api/customers/{id}` | Müşteri detayı |
| `POST` | `/api/customers` | Yeni müşteri ekle |
| `PUT` | `/api/customers/{id}` | Müşteri güncelle |
| `DELETE` | `/api/customers/{id}` | Müşteri sil |
| `GET` | `/api/customers/search?searchTerm={term}` | Müşteri ara |

### İstatistikler
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/api/stats/dashboard` | Dashboard istatistikleri |
| `GET` | `/api/stats/customers/total` | Toplam müşteri sayısı |
| `GET` | `/api/stats/customers/active` | Aktif müşteri sayısı |
| `GET` | `/api/stats/customers/this-month` | Bu ay eklenen müşteri sayısı |

### Sistem
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/health` | Sistem sağlık durumu |
| `GET` | `/swagger` | API dokümantasyonu |

---

## 🎨 UI/UX Özellikleri

### Modern Tasarım
- **🌈 Gradient Arka Plan**: Mavi-mor gradient geçişleri
- **🔮 Glassmorphism**: Şeffaf kartlar ve blur efektleri
- **✨ Hover Animasyonları**: Smooth geçişler ve etkileşimler
- **📱 Responsive Grid**: Mobil-first yaklaşım
- **🔤 Modern Typography**: Inter font family
- **⏳ Loading States**: Kullanıcı deneyimi için loading göstergeleri

### Kullanıcı Deneyimi
- **🎯 Intuitive Navigation**: Kolay kullanım
- **🔍 Real-time Search**: Anlık arama sonuçları
- **📊 Data Visualization**: Görsel istatistikler
- **📱 Mobile Responsive**: Tüm cihazlarda uyumlu
- **⚡ Fast Loading**: Optimize edilmiş performans

---

## 🔒 Güvenlik

### Backend Güvenlik
- **🔐 CORS**: Cross-origin istekler için yapılandırılmış
- **✅ Input Validation**: Form validasyonları
- **🛡️ SQL Injection Protection**: Entity Framework ile korunma
- **🔒 Security Headers**: XSS ve diğer saldırılara karşı korunma
- **🔑 Azure SQL**: Güvenli cloud database

### Frontend Güvenlik
- **🔒 HTTPS**: Tüm iletişim şifrelenmiş
- **✅ Input Sanitization**: XSS koruması
- **🔐 Secure Headers**: Güvenlik başlıkları

---

## 📊 Performance

### Backend Optimizasyonları
- **⚡ MemoryCache**: API yanıt sürelerini optimize eder
- **🗄️ Database Indexing**: Hızlı sorgular için optimize edilmiş
- **🔄 Connection Pooling**: Veritabanı bağlantı yönetimi
- **📈 Retry Policies**: Transient hatalar için otomatik retry

### Frontend Optimizasyonları
- **⚡ Vite**: Hızlı build ve hot reload
- **📦 Code Splitting**: Lazy loading ile performans
- **🗜️ Gzip Compression**: Dosya boyutu optimizasyonu
- **💾 Browser Caching**: Static dosyalar için önbellekleme

---

## 🐳 Docker Konfigürasyonu

### Development
```bash
# Tüm servisleri başlat
docker-compose up -d

# Sadece backend
docker-compose up backend

# Sadece frontend
docker-compose up frontend
```

### Production
```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d
```

### Servisler
- **sqlserver**: SQL Server 2022 Express
- **backend**: .NET 9 Web API
- **frontend**: React + Nginx

---

## 🔧 Environment Variables

### Backend (.NET)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=tcp:quickcrm-server.database.windows.net,1433;Initial Catalog=QuickCRM;..."
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

### Frontend (Vite)
```env
VITE_API_URL=https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net
```

---

## 📈 Monitoring & Logging

### Health Checks
- **Backend Health**: `/health` endpoint
- **Database Health**: Connection status
- **Memory Usage**: System resources

### Logging
- **Structured Logging**: JSON format
- **Log Levels**: Information, Warning, Error
- **Azure Log Stream**: Real-time monitoring

---

## 🚀 Deployment Status

### ✅ Completed
- [x] Backend deployment to Azure App Service
- [x] Frontend deployment to Netlify
- [x] Database setup on Azure SQL
- [x] CORS configuration
- [x] Health checks implementation
- [x] Error handling
- [x] Performance optimization
- [x] Security headers



## 🤝 Katkıda Bulunma

1. **Fork** yapın
2. **Feature branch** oluşturun (`git checkout -b feature/amazing-feature`)
3. **Commit** yapın (`git commit -m 'Add amazing feature'`)
4. **Push** yapın (`git push origin feature/amazing-feature`)
5. **Pull Request** oluşturun

### Development Guidelines
- Clean code principles
- TypeScript strict mode
- Unit tests (planned)
- Code reviews

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 📞 İletişim & Destek

- **Email**: berkayakkocc6@gmail.com
- **LinkedIn**: [Berkay Can Akkoc](https://www.linkedin.com/in/berkaycanakkoc/)

---

## 🙏 Teşekkürler

- **React Team** - Amazing frontend framework
- **Microsoft** - .NET ve Azure ecosystem
- **Netlify** - Excellent hosting platform
- **Vite Team** - Fast build tool

---

<div align="center">

**QuickCRM** - Modern, hızlı ve kullanıcı dostu müşteri yönetim sistemi 🚀

[![GitHub stars](https://img.shields.io/github/stars/yourusername/QuickCRM?style=social)](https://github.com/yourusername/QuickCRM)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/QuickCRM?style=social)](https://github.com/yourusername/QuickCRM)
[![GitHub watchers](https://img.shields.io/github/watchers/yourusername/QuickCRM?style=social)](https://github.com/yourusername/QuickCRM)

</div>