# 🌐 Netlify + Heroku ile Deployment

## 📋 Gereksinimler
- GitHub hesabı
- Netlify hesabı (ücretsiz)
- Heroku hesabı (ücretsiz tier kaldırıldı, paid)

## 🚀 Adım Adım Deployment

### 1. Backend'i Heroku'ya Deploy Edin

#### Heroku CLI Kurulumu:
```bash
# Windows
winget install Heroku.HerokuCLI

# veya
https://devcenter.heroku.com/articles/heroku-cli
```

#### Heroku'da App Oluşturun:
```bash
# Login
heroku login

# Backend için app oluştur
cd Backend
heroku create quickcrm-api

# PostgreSQL addon ekle
heroku addons:create heroku-postgresql:mini

# Environment variables
heroku config:set ASPNETCORE_ENVIRONMENT=Production

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### 2. Frontend'i Netlify'ye Deploy Edin

#### Netlify Dashboard'da:
1. **New site from Git**
2. GitHub repository'sini seçin
3. **Build settings**:
   - **Base directory**: `Frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `Frontend/dist`
4. **Environment variables**:
   - `VITE_API_URL`: `https://quickcrm-api.herokuapp.com`
5. **Deploy site**

## 🌐 Erişim URL'leri
- **Frontend**: https://your-app-name.netlify.app
- **Backend API**: https://quickcrm-api.herokuapp.com
- **Swagger**: https://quickcrm-api.herokuapp.com/swagger

## 💰 Maliyet
- **Netlify**: Ücretsiz (100GB bandwidth)
- **Heroku**: $7/ay (Basic plan)
- **Toplam**: $7/ay
