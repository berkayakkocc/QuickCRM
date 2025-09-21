# 🐳 VPS + Docker ile Deployment

## 📋 Gereksinimler
- VPS (DigitalOcean, Linode, AWS EC2)
- Ubuntu 20.04+ veya CentOS 8+
- Domain name (opsiyonel)

## 🚀 Adım Adım Deployment

### 1. VPS Hazırlığı
```bash
# Ubuntu güncelle
sudo apt update && sudo apt upgrade -y

# Docker kurulumu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose kurulumu
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Firewall ayarları
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Projeyi VPS'e Kopyalayın
```bash
# Git ile
git clone https://github.com/yourusername/QuickCRM.git
cd QuickCRM

# veya SCP ile
scp -r ./QuickCRM user@your-vps-ip:/home/user/
```

### 3. Docker ile Deploy Edin
```bash
# Servisleri başlat
docker-compose up -d

# Logları kontrol et
docker-compose logs -f
```

### 4. Nginx Reverse Proxy (Domain için)
```bash
# Nginx kurulumu
sudo apt install nginx -y

# SSL sertifikası (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

## 🌐 Erişim URL'leri
- **Frontend**: http://your-vps-ip veya https://yourdomain.com
- **Backend API**: http://your-vps-ip:5000
- **Swagger**: http://your-vps-ip:5000/swagger

## 💰 Maliyet
- **VPS**: $5-20/ay (DigitalOcean, Linode)
- **Domain**: $10-15/yıl (opsiyonel)
- **SSL**: Ücretsiz (Let's Encrypt)
- **Toplam**: $5-20/ay
