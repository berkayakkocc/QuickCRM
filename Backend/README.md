# QuickCRM Backend

A comprehensive CRM (Customer Relationship Management) backend API built with .NET 9.0, Entity Framework Core, and JWT Authentication.

## 🚀 Features

- **JWT Authentication** - Secure user authentication with JWT tokens
- **Role-based Authorization** - Admin, Manager, and User roles
- **Customer Management** - Full CRUD operations for customers
- **Statistics Dashboard** - Business analytics and reporting
- **Clean Architecture** - Separation of concerns with Core, Application, Infrastructure, and API layers
- **Entity Framework Core** - Database operations with SQL Server
- **Swagger Documentation** - Interactive API documentation
- **Health Checks** - Application monitoring and status
- **Docker Support** - Containerized deployment
- **Azure SQL Database** - Cloud database integration

## 🛠️ Technology Stack

- **.NET 9.0** - Latest .NET framework
- **ASP.NET Core Web API** - RESTful API framework
- **Entity Framework Core 9.0** - ORM for database operations
- **SQL Server** - Primary database
- **JWT Bearer Authentication** - Token-based authentication
- **BCrypt** - Password hashing
- **Swagger/OpenAPI** - API documentation
- **Docker** - Containerization
- **Azure SQL Database** - Cloud database

## 📋 Prerequisites

- .NET 9.0 SDK
- SQL Server (Local or Azure)
- Visual Studio 2022 or VS Code
- Docker (Optional)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/berkaycan/QuickCRM.git
cd QuickCRM/Backend
```

### 2. Restore Dependencies

```bash
dotnet restore
```

### 3. Database Setup

#### Local Development
Update `appsettings.Development.json` with your local SQL Server connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=QuickCRM;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

#### Azure SQL Database
Update `appsettings.Production.json` with your Azure SQL connection details:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=tcp:${AZURE_SQL_SERVER}.database.windows.net,1433;Initial Catalog=${AZURE_SQL_DATABASE};Persist Security Info=False;User ID=${AZURE_SQL_USER};Password=${AZURE_SQL_PASSWORD};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  }
}
```

### 4. Run Migrations

```bash
dotnet ef database update --project QuickCRM.Infrastructure --startup-project QuickCRM.API
```

### 5. Run the Application

```bash
dotnet run --project QuickCRM.API
```

The API will be available at:
- **HTTP**: `http://localhost:5186`
- **HTTPS**: `https://localhost:44305`
- **Swagger UI**: `https://localhost:44305/swagger/index.html`

## 🔐 Default Users

The application comes with pre-configured default users for testing:

| Email | Username | Password | Role | Description |
|-------|----------|----------|------|-------------|
| admin@quickcrm.com | admin | Admin123! | Admin | Full system access |
| manager@quickcrm.com | manager | Manager123! | Manager | Customer management access |
| user@quickcrm.com | user | User123! | User | Basic user access |
| demo@quickcrm.com | demo | Demo123! | User | Demo account |

### Login Endpoint
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@quickcrm.com",
  "password": "Admin123!"
}
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/validate` - Validate credentials

### Customers (Requires Authentication)
- `GET /api/customers` - Get all customers
- `GET /api/customers/{id}` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer (Admin/Manager only)
- `GET /api/customers/search?searchTerm={term}` - Search customers
- `GET /api/customers/active` - Get active customers only

### Customer Notes (Requires Authentication)
- `GET /api/customernotes/customer/{customerId}` - Get all notes for a customer
- `GET /api/customernotes/{id}` - Get specific note by ID
- `POST /api/customernotes` - Create new note
- `PUT /api/customernotes/{id}` - Update note (own notes only)
- `DELETE /api/customernotes/{id}` - Delete note (own notes only)
- `GET /api/customernotes/customer/{customerId}/by/{createdBy}` - Get notes by creator type
- `GET /api/customernotes/customer/{customerId}/count` - Get note count for customer

### Statistics (Requires Authentication)
- `GET /api/stats/dashboard` - Get dashboard statistics
- `GET /api/stats/customers/total` - Get total customer count
- `GET /api/stats/customers/active` - Get active customer count
- `GET /api/stats/customers/this-month` - Get this month's new customers

### Health Check
- `GET /health` - Application health status

## 🔒 Authentication

The API uses JWT Bearer authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

1. **Login** using the `/api/auth/login` endpoint
2. **Copy** the token from the response
3. **Add** it to the Authorization header in Swagger or your API client

## 🏗️ Project Structure

```
QuickCRM.Backend/
├── QuickCRM.API/                 # Web API layer
│   ├── Controllers/              # API controllers
│   ├── Data/                     # Seed data
│   └── Program.cs               # Application startup
├── QuickCRM.Application/         # Application layer
│   ├── DTOs/                     # Data transfer objects
│   └── Services/                 # Business logic services
├── QuickCRM.Core/               # Core layer
│   ├── Entities/                 # Domain entities
│   ├── Interfaces/               # Repository interfaces
│   └── Models/                   # Configuration models
├── QuickCRM.Infrastructure/     # Infrastructure layer
│   ├── Data/                     # Database context
│   ├── Migrations/               # EF migrations
│   └── Repositories/             # Repository implementations
└── Dockerfile                   # Docker configuration
```

## 🐳 Docker Support

### Build Docker Image

```bash
docker build -t quickcrm-api .
```

### Run with Docker

```bash
docker run -p 8080:80 quickcrm-api
```

## 🚀 Deployment

### Azure App Service
1. Configure environment variables
2. Deploy using Azure CLI or Visual Studio
3. Set up Azure SQL Database connection

### Railway
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

## 🔧 Configuration

### JWT Settings
Configure JWT settings in `appsettings.json`:

```json
{
  "JwtSettings": {
    "SecretKey": "your-secret-key-here",
    "Issuer": "QuickCRM-API",
    "Audience": "QuickCRM-Client",
    "ExpiryMinutes": 60
  }
}
```

### CORS Settings
CORS is configured to allow only the Netlify frontend domain:
- **Allowed Origin**: `https://quickcrm-app.netlify.app`
- **Methods**: All HTTP methods
- **Headers**: All headers

Configure CORS origins in `Program.cs` if you need to add additional domains.

## 📊 Database Schema

### Users Table
- Id (Primary Key)
- Username (Unique)
- Email (Unique)
- PasswordHash
- Role
- CreatedAt
- LastLoginAt

### Customers Table
- Id (Primary Key)
- FirstName
- LastName
- Email (Unique)
- Phone
- Company
- Notes
- IsActive
- CreatedAt
- UpdatedAt

### CustomerNotes Table
- Id (Primary Key)
- CustomerId (Foreign Key)
- Content
- CreatedBy (admin/customer)
- CreatedAt
- UpdatedAt

## 🧪 Testing

### Using Swagger UI
1. Navigate to `https://localhost:44305/swagger/index.html`
2. Click "Authorize" button
3. Enter your JWT token
4. Test the endpoints

### Using Postman/Insomnia
1. Login to get JWT token
2. Add token to Authorization header
3. Test protected endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🌐 Live Demo

- **Frontend**: [https://quickcrm-app.netlify.app](https://quickcrm-app.netlify.app)
- **Backend API**: [https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net](https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net)
- **API Documentation**: [https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net/swagger](https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net/swagger)

## 🆘 Support

For support and questions:
- Email: support@quickcrm.com
- Documentation: [API Documentation](https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net/swagger)

---

**QuickCRM Backend** - Built with ❤️ using .NET 9.0
