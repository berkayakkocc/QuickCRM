# QuickCRM Production Setup Guide

Bu doküman QuickCRM uygulamasının production ortamında nasıl deploy edileceğini açıklar.

## 🚀 Hızlı Başlangıç

### 1. Gereksinimler
- Docker ve Docker Compose
- En az 2GB RAM
- En az 10GB disk alanı
- Linux/Unix işletim sistemi

### 2. Kurulum
```bash
# Repository'yi klonla
git clone https://github.com/your-username/QuickCRM.git
cd QuickCRM/Frontend

# Environment dosyasını oluştur
cp env.production.template .env.production

# Environment değişkenlerini düzenle
nano .env.production

# Deploy et
./scripts/deploy.sh production
```

## 📋 Environment Konfigürasyonu

### Gerekli Environment Değişkenleri

```bash
# Database
DB_CONNECTION_STRING=Host=database;Port=5432;Database=quickcrm;Username=quickcrm_user;Password=your_secure_password
DB_NAME=quickcrm
DB_USER=quickcrm_user
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET_KEY=your_super_secret_jwt_key_here_minimum_32_characters
JWT_ISSUER=QuickCRM
JWT_AUDIENCE=QuickCRM-Users

# SSL
SSL_EMAIL=admin@quickcrm.com
DOMAIN_NAME=quickcrm.com

# API
API_URL=https://api.quickcrm.com
FRONTEND_URL=https://quickcrm.com
```

## 🐳 Docker Services

### Frontend Service
- **Port**: 80, 443
- **Image**: Custom nginx + React build
- **Health Check**: `/health` endpoint

### Backend Service
- **Port**: 5000
- **Image**: .NET Core API
- **Health Check**: `/health` endpoint

### Database Service
- **Port**: 5432
- **Image**: PostgreSQL 15
- **Volume**: `postgres-data`

### Redis Service
- **Port**: 6379
- **Image**: Redis 7
- **Volume**: `redis-data`

## 📊 Monitoring

### Health Check
```bash
# Tüm servislerin durumunu kontrol et
./scripts/health-check.sh
```

### Monitoring Stack
```bash
# Monitoring servislerini başlat
cd monitoring
docker-compose -f docker-compose.monitoring.yml up -d
```

**Monitoring URLs:**
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001
- Node Exporter: http://localhost:9100

## 💾 Backup ve Restore

### Backup Oluştur
```bash
./scripts/backup.sh
```

### Backup İçeriği
- Database dump (SQL)
- Application files
- Docker volumes
- Configuration files

### Restore
```bash
# Backup dosyalarını restore et
# Detaylar backup manifest dosyasında
```

## 🔧 Maintenance

### Logları Görüntüle
```bash
# Tüm servislerin logları
docker-compose -f docker-compose.prod.yml logs -f

# Belirli bir servisin logları
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Servisleri Yeniden Başlat
```bash
# Tüm servisleri yeniden başlat
docker-compose -f docker-compose.prod.yml restart

# Belirli bir servisi yeniden başlat
docker-compose -f docker-compose.prod.yml restart frontend
```

### Servisleri Güncelle
```bash
# Yeni image'ları çek ve yeniden başlat
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## 🔒 Security

### Güvenlik Özellikleri
- **Rate Limiting**: API endpoint'leri için
- **Security Headers**: XSS, CSRF koruması
- **HTTPS**: SSL/TLS şifreleme
- **Non-root User**: Container'lar non-root kullanıcı ile çalışır
- **Input Validation**: Tüm input'lar validate edilir

### SSL Sertifikası
```bash
# Let's Encrypt ile SSL sertifikası
./scripts/ssl-setup.sh
```

## 📈 Performance

### Optimizasyonlar
- **Gzip Compression**: Nginx ile
- **Static File Caching**: 1 yıl cache
- **Database Indexing**: Optimize edilmiş sorgular
- **CDN Ready**: Static dosyalar için CDN desteği

### Resource Limits
```yaml
# Docker Compose'da resource limits
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
```

## 🚨 Troubleshooting

### Yaygın Sorunlar

#### 1. Servis Başlamıyor
```bash
# Logları kontrol et
docker-compose -f docker-compose.prod.yml logs

# Container durumunu kontrol et
docker-compose -f docker-compose.prod.yml ps
```

#### 2. Database Bağlantı Hatası
```bash
# Database container'ını kontrol et
docker exec -it quickcrm-database psql -U quickcrm_user -d quickcrm

# Connection string'i kontrol et
echo $DB_CONNECTION_STRING
```

#### 3. Port Çakışması
```bash
# Port kullanımını kontrol et
netstat -tulpn | grep :80
netstat -tulpn | grep :5000
```

### Log Analizi
```bash
# Error logları
docker-compose -f docker-compose.prod.yml logs | grep -i error

# Access logları
docker exec quickcrm-frontend tail -f /var/log/nginx/access.log
```

## 📞 Support

### Destek Kanalları
- **GitHub Issues**: Bug raporları ve feature request'ler
- **Documentation**: Bu doküman ve inline kod yorumları
- **Health Check**: Otomatik sistem durumu kontrolü

### Yararlı Komutlar
```bash
# Sistem durumu
./scripts/health-check.sh

# Backup oluştur
./scripts/backup.sh

# Monitoring başlat
./scripts/monitoring-setup.sh

# Deploy
./scripts/deploy.sh production
```

## 🔄 Updates

### Güncelleme Süreci
1. Backup oluştur
2. Yeni kodu çek
3. Environment değişkenlerini kontrol et
4. Deploy et
5. Health check yap

```bash
# Otomatik güncelleme
git pull
./scripts/backup.sh
./scripts/deploy.sh production
./scripts/health-check.sh
```

---

**Not**: Bu doküman production ortamı için hazırlanmıştır. Development ortamı için farklı konfigürasyonlar gerekebilir.

