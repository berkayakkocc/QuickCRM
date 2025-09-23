# 📚 QuickCRM API Documentation

Bu dokümantasyon, QuickCRM backend API'sinin tüm endpoint'lerini ve kullanım örneklerini içerir.

## 🌐 Base URL

**Production**: `https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net`

**Development**: `https://localhost:7000`

---

## 🔐 Authentication

Şu anda API authentication gerektirmez. Tüm endpoint'ler public olarak erişilebilir.

---

## 📊 Response Format

Tüm API yanıtları JSON formatındadır:

### Success Response
```json
{
  "data": [...],
  "message": "Success",
  "statusCode": 200
}
```

### Error Response
```json
{
  "error": "Error message",
  "statusCode": 400
}
```

---

## 👥 Customer Endpoints

### Get All Customers
**GET** `/api/customers`

Tüm müşterileri listeler.

#### Response
```json
[
  {
    "id": 1,
    "firstName": "Ahmet",
    "lastName": "Yılmaz",
    "email": "ahmet.yilmaz@example.com",
    "phone": "0532 123 45 67",
    "company": "ABC Teknoloji",
    "notes": "Potansiyel müşteri",
    "isActive": true,
    "createdAt": "2025-09-23T00:23:38.5249555",
    "updatedAt": "2025-09-23T00:23:38.5249556"
  }
]
```

#### Example
```bash
curl -X GET "https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net/api/customers" \
  -H "accept: application/json"
```

---

### Get Customer by ID
**GET** `/api/customers/{id}`

Belirli bir müşteriyi getirir.

#### Parameters
- `id` (int, required): Müşteri ID'si

#### Response
```json
{
  "id": 1,
  "firstName": "Ahmet",
  "lastName": "Yılmaz",
  "email": "ahmet.yilmaz@example.com",
  "phone": "0532 123 45 67",
  "company": "ABC Teknoloji",
  "notes": "Potansiyel müşteri",
  "isActive": true,
  "createdAt": "2025-09-23T00:23:38.5249555",
  "updatedAt": "2025-09-23T00:23:38.5249556"
}
```

#### Example
```bash
curl -X GET "https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net/api/customers/1" \
  -H "accept: application/json"
```

---

### Create Customer
**POST** `/api/customers`

Yeni müşteri oluşturur.

#### Request Body
```json
{
  "firstName": "Mehmet",
  "lastName": "Demir",
  "email": "mehmet.demir@example.com",
  "phone": "0533 987 65 43",
  "company": "XYZ Şirketi",
  "notes": "Yeni müşteri"
}
```

#### Response
```json
{
  "id": 2,
  "firstName": "Mehmet",
  "lastName": "Demir",
  "email": "mehmet.demir@example.com",
  "phone": "0533 987 65 43",
  "company": "XYZ Şirketi",
  "notes": "Yeni müşteri",
  "isActive": true,
  "createdAt": "2025-09-23T00:30:00.0000000",
  "updatedAt": "2025-09-23T00:30:00.0000000"
}
```

#### Example
```bash
curl -X POST "https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net/api/customers" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Mehmet",
    "lastName": "Demir",
    "email": "mehmet.demir@example.com",
    "phone": "0533 987 65 43",
    "company": "XYZ Şirketi",
    "notes": "Yeni müşteri"
  }'
```

---

### Update Customer
**PUT** `/api/customers/{id}`

Mevcut müşteriyi günceller.

#### Parameters
- `id` (int, required): Müşteri ID'si

#### Request Body
```json
{
  "id": 1,
  "firstName": "Ahmet",
  "lastName": "Yılmaz",
  "email": "ahmet.yilmaz@example.com",
  "phone": "0532 123 45 67",
  "company": "ABC Teknoloji Güncellenmiş",
  "notes": "Güncellenmiş notlar",
  "isActive": true
}
```

#### Response
```json
{
  "id": 1,
  "firstName": "Ahmet",
  "lastName": "Yılmaz",
  "email": "ahmet.yilmaz@example.com",
  "phone": "0532 123 45 67",
  "company": "ABC Teknoloji Güncellenmiş",
  "notes": "Güncellenmiş notlar",
  "isActive": true,
  "createdAt": "2025-09-23T00:23:38.5249555",
  "updatedAt": "2025-09-23T00:35:00.0000000"
}
```

#### Example
```bash
curl -X PUT "https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net/api/customers/1" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "firstName": "Ahmet",
    "lastName": "Yılmaz",
    "email": "ahmet.yilmaz@example.com",
    "phone": "0532 123 45 67",
    "company": "ABC Teknoloji Güncellenmiş",
    "notes": "Güncellenmiş notlar",
    "isActive": true
  }'
```

---

### Delete Customer
**DELETE** `/api/customers/{id}`

Müşteriyi siler.

#### Parameters
- `id` (int, required): Müşteri ID'si

#### Response
```json
{
  "message": "Customer deleted successfully"
}
```

#### Example
```bash
curl -X DELETE "https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net/api/customers/1" \
  -H "accept: application/json"
```

---

### Search Customers
**GET** `/api/customers/search?searchTerm={term}`

Müşterileri arar.

#### Parameters
- `searchTerm` (string, required): Arama terimi

#### Response
```json
[
  {
    "id": 1,
    "firstName": "Ahmet",
    "lastName": "Yılmaz",
    "email": "ahmet.yilmaz@example.com",
    "phone": "0532 123 45 67",
    "company": "ABC Teknoloji",
    "notes": "Potansiyel müşteri",
    "isActive": true,
    "createdAt": "2025-09-23T00:23:38.5249555",
    "updatedAt": "2025-09-23T00:23:38.5249556"
  }
]
```

#### Example
```bash
curl -X GET "https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net/api/customers/search?searchTerm=Ahmet" \
  -H "accept: application/json"
```

---

## 📊 Statistics Endpoints

### Get Dashboard Statistics
**GET** `/api/stats/dashboard`

Dashboard için genel istatistikleri getirir.

#### Response
```json
{
  "totalCustomers": 25,
  "activeCustomers": 20,
  "thisMonthCustomers": 5
}
```

#### Example
```bash
curl -X GET "https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net/api/stats/dashboard" \
  -H "accept: application/json"
```

---

### Get Total Customers
**GET** `/api/stats/customers/total`

Toplam müşteri sayısını getirir.

#### Response
```json
{
  "totalCustomers": 25
}
```

#### Example
```bash
curl -X GET "https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net/api/stats/customers/total" \
  -H "accept: application/json"
```

---

### Get Active Customers
**GET** `/api/stats/customers/active`

Aktif müşteri sayısını getirir.

#### Response
```json
{
  "activeCustomers": 20
}
```

#### Example
```bash
curl -X GET "https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net/api/stats/customers/active" \
  -H "accept: application/json"
```

---

### Get This Month Customers
**GET** `/api/stats/customers/this-month`

Bu ay eklenen müşteri sayısını getirir.

#### Response
```json
{
  "thisMonthCustomers": 5
}
```

#### Example
```bash
curl -X GET "https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net/api/stats/customers/this-month" \
  -H "accept: application/json"
```

---

## 🏥 System Endpoints

### Health Check
**GET** `/health`

Sistem sağlık durumunu kontrol eder.

#### Response
```json
{
  "status": "Healthy",
  "checks": {
    "database": "Healthy",
    "memory": "Healthy"
  },
  "timestamp": "2025-09-23T00:40:00.0000000Z"
}
```

#### Example
```bash
curl -X GET "https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net/health" \
  -H "accept: application/json"
```

---

## 📝 Data Models

### Customer Model
```typescript
interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}
```

### Dashboard Stats Model
```typescript
interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  thisMonthCustomers: number;
}
```

---

## 🔧 Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Success |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## 📊 Rate Limiting

Şu anda API rate limiting uygulanmamaktadır. Gelecek sürümlerde eklenecektir.

---

## 🔒 Security

### CORS
API, aşağıdaki origin'lerden gelen istekleri kabul eder:
- `https://quickcrm-app.netlify.app`
- `https://*.netlify.app`
- `http://localhost:3000`
- `http://localhost:5173`

### Headers
Tüm yanıtlar aşağıdaki güvenlik başlıklarını içerir:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

---

## 📚 Swagger Documentation

API'nin interaktif dokümantasyonu için Swagger UI'yi ziyaret edin:

**Swagger UI**: [https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net/swagger](https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net/swagger)

---

## 🧪 Testing

### Postman Collection
API'yi test etmek için Postman collection'ı indirin:

[Download Postman Collection](https://github.com/yourusername/QuickCRM/blob/main/QuickCRM.postman_collection.json)

### cURL Examples
Tüm endpoint'ler için cURL örnekleri yukarıda verilmiştir.

---

## 📞 Support

API ile ilgili sorularınız için:
- **GitHub Issues**: [Create issue](https://github.com/yourusername/QuickCRM/issues)
- **Email**: api-support@quickcrm.com

---

**QuickCRM API Documentation** - Comprehensive API reference 📚
