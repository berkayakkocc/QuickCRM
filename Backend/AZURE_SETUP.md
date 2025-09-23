# Azure SQL Database Kurulum Rehberi

## 1. Azure Portal'da SQL Database Oluşturma

### Adım 1: Azure Portal'a Giriş
1. [Azure Portal](https://portal.azure.com) adresine gidin
2. Azure hesabınızla giriş yapın

### Adım 2: SQL Database Oluşturma
1. **"Create a resource"** butonuna tıklayın
2. **"SQL Database"** arayın ve seçin
3. **"Create"** butonuna tıklayın

### Adım 3: Temel Ayarlar
- **Subscription**: Mevcut aboneliğinizi seçin
- **Resource Group**: Yeni oluşturun veya mevcut olanı seçin
- **Database name**: `QuickCRM`
- **Server**: Yeni server oluşturun
  - **Server name**: `quickcrm-server` (benzersiz olmalı)
  - **Location**: Size en yakın bölgeyi seçin
  - **Authentication method**: SQL authentication
  - **Server admin login**: `quickcrmadmin`
  - **Password**: Güçlü bir şifre oluşturun
- **Want to use SQL elastic pool**: No
- **Compute + storage**: Basic (5 DTU) - Geliştirme için yeterli

### Adım 4: Networking
- **Connectivity method**: Public endpoint
- **Allow Azure services and resources to access this server**: Yes
- **Add current client IP address**: Yes

### Adım 5: Security
- **Enable Microsoft Defender for SQL**: No (geliştirme için)
- **Backup storage redundancy**: Locally-redundant backup storage

### Adım 6: Review + Create
- Ayarları kontrol edin
- **"Create"** butonuna tıklayın

## 2. Environment Variables Ayarlama

 ### Azure App Service'de Environment Variables:
```
AZURE_SQL_SERVER=quickcrm-server
AZURE_SQL_DATABASE=QuickCRM
AZURE_SQL_USER=quickcrmadmin
AZURE_SQL_PASSWORD=your-password-here
```

### Azure Tenant ID Bulma:
1. Azure Portal'da **"Azure Active Directory"** gidin
2. **"Overview"** sayfasında **"Tenant ID"** bulun

### Azure App Registration (Service Principal):
1. **"Azure Active Directory"** > **"App registrations"**
2. **"New registration"** tıklayın
3. **Name**: `QuickCRM-API`
4. **Supported account types**: Single tenant
5. **"Register"** tıklayın
6. **"Overview"** sayfasında **"Application (client) ID"** kopyalayın
7. **"Certificates & secrets"** > **"New client secret"**
8. **Description**: `QuickCRM-API-Secret`
9. **Expires**: 24 months
10. **"Add"** tıklayın ve **Value**'yu kopyalayın

## 3. Database Migration

### Local'de Migration Oluşturma:
```bash
dotnet ef migrations add InitialCreate --project QuickCRM.Infrastructure --startup-project QuickCRM.API
```

### Azure SQL Database'e Migration Uygulama:
```bash
dotnet ef database update --project QuickCRM.Infrastructure --startup-project QuickCRM.API
```

## 4. Connection String Test

### Test Connection String:
```bash
# Local'de test
dotnet run --project QuickCRM.API --environment Production
```

### Health Check:
```bash
curl https://your-app-url.azurewebsites.net/health
```

## 5. Güvenlik Notları

- **Firewall Rules**: Sadece gerekli IP'leri ekleyin
- **SSL/TLS**: Otomatik olarak etkin
- **Authentication**: Azure Identity kullanılıyor
- **Backup**: Otomatik backup etkin
- **Monitoring**: Azure Monitor ile izleyebilirsiniz

## 6. Troubleshooting

### Yaygın Hatalar:
1. **Connection Timeout**: Firewall rules kontrol edin
2. **Authentication Failed**: Service Principal permissions kontrol edin
3. **Database Not Found**: Migration'ları uyguladığınızdan emin olun

### Log Kontrolü:
```bash
# Azure App Service logs
az webapp log tail --name your-app-name --resource-group your-resource-group

# Local logs
dotnet run --project QuickCRM.API --environment Production --verbosity detailed
```
