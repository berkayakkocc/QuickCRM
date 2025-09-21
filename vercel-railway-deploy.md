# 🚀 Vercel + Railway ile Ücretsiz Deployment

## 📋 Gereksinimler
- GitHub hesabı
- Vercel hesabı (ücretsiz)
- Railway hesabı (ücretsiz)

## 🎯 Deployment Stratejisi
- **Frontend**: Vercel (ücretsiz)
- **Backend**: Railway (ücretsiz tier)
- **Database**: Railway PostgreSQL (ücretsiz)

## 🚀 Adım Adım Deployment

### 1. GitHub'a Push Edin
```bash
# Git repository oluşturun
git init
git add .
git commit -m "Initial commit"
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

#### Environment Variables:
```
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=<Railway PostgreSQL URL>
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
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
read_file
