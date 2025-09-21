# 🚀 QuickCRM Deployment Kılavuzu

## 📋 Gereksinimler

### Sistem Gereksinimleri
- **Docker Desktop** (Windows/Mac) veya **Docker Engine** (Linux)
- **Docker Compose** (Docker Desktop ile birlikte gelir)
- **Git** (Kod indirmek için)

### Minimum Sistem Kaynakları
- **RAM**: 4GB (8GB önerilen)
- **Disk**: 10GB boş alan
- **CPU**: 2 core (4 core önerilen)

## 🔧 Docker Kurulumu

### Windows
1. [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) indirin
2. Kurulum dosyasını çalıştırın
3. Bilgisayarı yeniden başlatın
4. Docker Desktop'ı başlatın

### macOS
1. [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/) indirin
2. DMG dosyasını açın ve Docker.app'i Applications klasörüne sürükleyin
3. Docker Desktop'ı başlatın

### Linux (Ubuntu/Debian)
```bash
# Docker kurulumu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose kurulumu
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 🚀 Deployment Adımları

### 1. Projeyi İndirin
```bash
git clone <repository-url>
cd QuickCRM
```

### 2. Docker Servislerini Başlatın

#### Windows (PowerShell)
```powershell
# Deployment script'ini çalıştırın
.\deploy.ps1
```

#### Linux/macOS
```bash
# Deployment script'ini çalıştırın
chmod +x deploy.sh
./deploy.sh
```

#### Manuel Deployment
```bash
# Servisleri durdur (varsa)
docker-compose down

# Yeni image'ları build et
docker-compose build --no-cache

# Servisleri başlat
docker-compose up -d

# Logları kontrol et
docker-compose logs -f
```

### 3. Servisleri Kontrol Edin
```bash
# Servis durumunu kontrol et
docker-compose ps

# Health check yap
curl http://localhost:5000/health
curl http://localhost/health
```

## 🌐 Erişim URL'leri

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **Swagger UI**: http://localhost:5000/swagger
- **Database**: localhost:1433

## 🔧 Yönetim Komutları

### Servisleri Durdur
```bash
docker-compose down
```

### Servisleri Yeniden Başlat
```bash
docker-compose restart
```

### Logları Görüntüle
```bash
# Tüm servisler
docker-compose logs -f

# Sadece backend
docker-compose logs -f backend

# Sadece frontend
docker-compose logs -f frontend
```

### Veritabanını Sıfırla
```bash
# Servisleri durdur
docker-compose down

# Volume'ları sil
docker volume rm quickcrm_sqlserver_data

# Servisleri yeniden başlat
docker-compose up -d
```

## 🐛 Sorun Giderme

### Port Çakışması
Eğer portlar kullanımda ise:
```bash
# Kullanılan portları kontrol et
netstat -an | findstr :80
netstat -an | findstr :5000
netstat -an | findstr :1433
```

### Docker Servisleri Çalışmıyor
```bash
# Docker servisini başlat
sudo systemctl start docker  # Linux
# veya Docker Desktop'ı başlat (Windows/Mac)
```

### Veritabanı Bağlantı Hatası
```bash
# SQL Server container'ını kontrol et
docker-compose logs sqlserver

# Container'ı yeniden başlat
docker-compose restart sqlserver
```

### Frontend Build Hatası
```bash
# Node modules'ı temizle ve yeniden yükle
docker-compose exec frontend npm ci
```

## 📊 Monitoring

### Container Durumu
```bash
docker-compose ps
```

### Kaynak Kullanımı
```bash
docker stats
```

### Disk Kullanımı
```bash
docker system df
```

## 🔒 Production Güvenlik

### Environment Variables
Production'da şu değişkenleri güncelleyin:
- `SA_PASSWORD`: Güçlü SQL Server şifresi
- `ConnectionStrings__DefaultConnection`: Production veritabanı

### SSL/HTTPS
Production'da SSL sertifikası ekleyin:
```yaml
# docker-compose.override.yml
services:
  frontend:
    volumes:
      - ./ssl:/etc/nginx/ssl
    environment:
      - SSL_CERT=/etc/nginx/ssl/cert.pem
      - SSL_KEY=/etc/nginx/ssl/key.pem
```

## 📈 Performance Optimizasyonu

### Memory Limits
```yaml
# docker-compose.override.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

### Database Optimization
```sql
-- SQL Server'da index oluştur
CREATE INDEX IX_Customers_Email ON Customers(Email);
CREATE INDEX IX_Customers_CreatedAt ON Customers(CreatedAt);
```

## 🆘 Destek

Sorun yaşıyorsanız:
1. Logları kontrol edin: `docker-compose logs`
2. GitHub Issues'da sorun bildirin
3. README.md'yi inceleyin

---

**QuickCRM** - Modern, hızlı ve güvenli müşteri yönetim sistemi 🚀
