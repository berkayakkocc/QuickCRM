# QuickCRM Frontend

## 🚀 Sabit Portlar (Değiştirilemez)

### **Frontend:**
- **URL**: `http://localhost:3000`
- **Port**: `3000` (Sabit)

### **Backend:**
- **API URL**: `https://localhost:44305/api`
- **Swagger**: `https://localhost:44305/swagger/index.html`
- **Port**: `44305` (Sabit)

## 📋 Başlatma Komutları

### **1. Backend Başlat:**
```bash
cd Backend
dotnet run --project QuickCRM.API
```
**Çalışacak URL**: `https://localhost:44305`

### **2. Frontend Başlat:**
```bash
cd Frontend
npm run dev
```
**Çalışacak URL**: `http://localhost:3000`

## 🔧 Konfigürasyon

### **Vite Config (vite.config.ts):**
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Sabit port
    proxy: {
      '/api': {
        target: 'https://localhost:44305', // Sabit backend URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

### **API Service (src/services/api.ts):**
```typescript
const API_BASE_URL = 'https://localhost:44305/api'; // Sabit URL
```

## ⚠️ Önemli Notlar

1. **Portlar değiştirilemez** - Bu portlar proje için sabitlenmiştir
2. **HTTPS Backend** - Backend HTTPS kullanır (44305)
3. **HTTP Frontend** - Frontend HTTP kullanır (3000)
4. **Proxy Ayarları** - Vite otomatik olarak `/api` isteklerini backend'e yönlendirir

## 🧪 Test Hesapları

| Email | Password | Role |
|-------|----------|------|
| admin@quickcrm.com | Admin123! | Admin |
| manager@quickcrm.com | Manager123! | Manager |
| user@quickcrm.com | User123! | User |

## 📱 Kullanım

1. Backend'i başlatın: `https://localhost:44305`
2. Frontend'i başlatın: `http://localhost:3000`
3. Tarayıcıda `http://localhost:3000` adresine gidin
4. Test hesaplarından biriyle giriş yapın

---
**Not**: Bu portlar proje için sabitlenmiştir ve değiştirilmemelidir.

