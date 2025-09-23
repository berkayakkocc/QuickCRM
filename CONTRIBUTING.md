# 🤝 Contributing to QuickCRM

QuickCRM projesine katkıda bulunmak için teşekkürler! Bu dokümantasyon, projeye nasıl katkıda bulunabileceğinizi açıklar.

## 📋 İçindekiler

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Coding Standards](#coding-standards)

---

## 📜 Code of Conduct

Bu proje, tüm katkıda bulunanlar için açık ve kapsayıcı bir ortam sağlamayı taahhüt eder. Katılımınız, [Contributor Covenant](https://www.contributor-covenant.org/) davranış kurallarına uygun olmalıdır.

### Beklentiler
- Kapsayıcı ve hoşgörülü dil kullanın
- Farklı görüşlere saygı gösterin
- Yapıcı eleştiri yapın
- Topluluk için en iyisini düşünün

---

## 🚀 Getting Started

### 1. Repository'yi Fork Edin
1. GitHub'da [QuickCRM repository](https://github.com/yourusername/QuickCRM)'sine gidin
2. **Fork** butonuna tıklayın
3. Fork edilen repository'yi local'inize klonlayın

```bash
git clone https://github.com/YOUR_USERNAME/QuickCRM.git
cd QuickCRM
```

### 2. Upstream Remote Ekleyin
```bash
git remote add upstream https://github.com/yourusername/QuickCRM.git
```

### 3. Branch Oluşturun
```bash
git checkout -b feature/your-feature-name
```

---

## 🛠️ Development Setup

### Backend Setup

#### Gereksinimler
- .NET 9 SDK
- Visual Studio 2022 veya VS Code
- SQL Server (Local veya Docker)

#### Kurulum
```bash
cd Backend/QuickCRM.API
dotnet restore
dotnet run
```

#### Database Setup
```bash
# Migration'ları çalıştır
dotnet ef database update

# Seed data'yı ekle
dotnet run --seed
```

### Frontend Setup

#### Gereksinimler
- Node.js 18+
- npm veya yarn

#### Kurulum
```bash
cd Frontend
npm install
npm run dev
```

### Docker Setup (Opsiyonel)
```bash
# Tüm servisleri başlat
docker-compose up -d

# Sadece backend
docker-compose up backend

# Sadece frontend
docker-compose up frontend
```

---

## 📝 Contributing Guidelines

### 1. Issue Oluşturma

#### Bug Report
```markdown
**Bug Description**
Açık ve özlü bir açıklama

**Steps to Reproduce**
1. '...' sayfasına git
2. '...' butonuna tıkla
3. '...' hatası görünür

**Expected Behavior**
Ne olması gerektiği

**Screenshots**
Varsa ekran görüntüleri

**Environment**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Version: [e.g. 1.0.0]
```

#### Feature Request
```markdown
**Feature Description**
Açık ve özlü bir açıklama

**Use Case**
Bu özellik neden gerekli?

**Proposed Solution**
Önerdiğiniz çözüm

**Alternatives**
Düşündüğünüz alternatifler
```

### 2. Development Workflow

#### Branch Naming
- `feature/feature-name` - Yeni özellikler
- `bugfix/bug-description` - Bug düzeltmeleri
- `hotfix/critical-fix` - Kritik düzeltmeler
- `refactor/refactor-description` - Kod refactoring
- `docs/documentation-update` - Dokümantasyon güncellemeleri

#### Commit Messages
```
type(scope): description

feat(api): add customer search endpoint
fix(ui): resolve mobile responsive issue
docs(readme): update installation guide
refactor(backend): optimize database queries
```

#### Types
- `feat`: Yeni özellik
- `fix`: Bug düzeltmesi
- `docs`: Dokümantasyon
- `style`: Formatting, semicolons, etc.
- `refactor`: Kod refactoring
- `test`: Test ekleme/düzeltme
- `chore`: Build process, auxiliary tools

---

## 🔄 Pull Request Process

### 1. PR Oluşturma Öncesi
- [ ] Kodunuzu test edin
- [ ] Unit testleri yazın (varsa)
- [ ] Dokümantasyonu güncelleyin
- [ ] Code review yapın

### 2. PR Template
```markdown
## Description
Bu PR ne yapıyor?

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Before/After screenshots

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

### 3. Review Process
1. **Automated Checks**: CI/CD pipeline çalışır
2. **Code Review**: Maintainer'lar kodu inceler
3. **Testing**: Manual test yapılır
4. **Approval**: En az 1 approval gerekli
5. **Merge**: PR merge edilir

---

## 🐛 Issue Guidelines

### Bug Report Template
```markdown
**Describe the bug**
Açık ve özlü bir açıklama

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
Ne olması gerektiği

**Screenshots**
Varsa ekran görüntüleri

**Desktop (please complete the following information):**
- OS: [e.g. iOS]
- Browser [e.g. chrome, safari]
- Version [e.g. 22]

**Smartphone (please complete the following information):**
- Device: [e.g. iPhone6]
- OS: [e.g. iOS8.1]
- Browser [e.g. stock browser, safari]
- Version [e.g. 22]

**Additional context**
Diğer bilgiler
```

### Feature Request Template
```markdown
**Is your feature request related to a problem? Please describe.**
Açık ve özlü bir açıklama

**Describe the solution you'd like**
Ne istediğinizi açıklayın

**Describe alternatives you've considered**
Düşündüğünüz alternatifler

**Additional context**
Diğer bilgiler
```

---

## 📏 Coding Standards

### Backend (.NET)

#### Code Style
```csharp
// Good
public class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _customerRepository;
    
    public CustomerService(ICustomerRepository customerRepository)
    {
        _customerRepository = customerRepository ?? throw new ArgumentNullException(nameof(customerRepository));
    }
    
    public async Task<Customer> GetCustomerAsync(int id)
    {
        if (id <= 0)
            throw new ArgumentException("Invalid customer ID", nameof(id));
            
        return await _customerRepository.GetByIdAsync(id);
    }
}
```

#### Naming Conventions
- **Classes**: PascalCase (`CustomerService`)
- **Methods**: PascalCase (`GetCustomerAsync`)
- **Properties**: PascalCase (`FirstName`)
- **Fields**: camelCase (`_customerRepository`)
- **Constants**: PascalCase (`MaxRetryCount`)

#### Documentation
```csharp
/// <summary>
/// Müşteri bilgilerini getirir
/// </summary>
/// <param name="id">Müşteri ID'si</param>
/// <returns>Müşteri bilgileri</returns>
/// <exception cref="ArgumentException">Geçersiz ID</exception>
public async Task<Customer> GetCustomerAsync(int id)
```

### Frontend (React/TypeScript)

#### Code Style
```typescript
// Good
interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

const CustomerCard: React.FC<{ customer: Customer }> = ({ customer }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleEdit = useCallback(async () => {
    setIsLoading(true);
    try {
      // Edit logic
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return (
    <div className="customer-card">
      <h3>{customer.firstName} {customer.lastName}</h3>
      <p>{customer.email}</p>
    </div>
  );
};
```

#### Naming Conventions
- **Components**: PascalCase (`CustomerCard`)
- **Functions**: camelCase (`handleEdit`)
- **Variables**: camelCase (`isLoading`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Interfaces**: PascalCase (`Customer`)

#### File Structure
```
src/
├── components/
│   ├── CustomerCard.tsx
│   └── Layout.tsx
├── pages/
│   ├── Dashboard.tsx
│   └── Customers.tsx
├── types/
│   └── index.ts
└── utils/
    └── api.ts
```

---

## 🧪 Testing Guidelines

### Backend Testing
```csharp
[Test]
public async Task GetCustomerAsync_ValidId_ReturnsCustomer()
{
    // Arrange
    var customerId = 1;
    var expectedCustomer = new Customer { Id = customerId, FirstName = "Test" };
    _mockRepository.Setup(x => x.GetByIdAsync(customerId))
                   .ReturnsAsync(expectedCustomer);
    
    // Act
    var result = await _customerService.GetCustomerAsync(customerId);
    
    // Assert
    Assert.That(result, Is.EqualTo(expectedCustomer));
}
```

### Frontend Testing
```typescript
import { render, screen } from '@testing-library/react';
import { CustomerCard } from './CustomerCard';

describe('CustomerCard', () => {
  it('renders customer information', () => {
    const customer = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      isActive: true
    };
    
    render(<CustomerCard customer={customer} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
});
```

---

## 📚 Documentation

### Code Documentation
- Tüm public method'ları XML documentation ile dokümante edin
- Complex logic'leri comment'lerle açıklayın
- README dosyalarını güncel tutun

### API Documentation
- Swagger/OpenAPI annotations kullanın
- Endpoint'leri detaylı açıklayın
- Request/Response örnekleri verin

---

## 🔧 Development Tools

### Recommended VS Code Extensions
- **C#**: C# extension
- **TypeScript**: TypeScript extension
- **React**: ES7+ React/Redux/React-Native snippets
- **Prettier**: Code formatter
- **ESLint**: JavaScript/TypeScript linter

### Git Hooks
```bash
# Pre-commit hook
npm run lint
npm run test
```

---

## 📞 Getting Help

### Community
- **GitHub Discussions**: Genel sorular
- **GitHub Issues**: Bug reports ve feature requests
- **Discord**: Real-time chat (coming soon)

### Maintainers
- **@yourusername**: Lead maintainer
- **@contributor1**: Backend maintainer
- **@contributor2**: Frontend maintainer

---

## 🎉 Recognition

Katkıda bulunanlar:
- **Contributors**: [All Contributors](https://github.com/yourusername/QuickCRM/graphs/contributors)
- **Special Thanks**: Özel teşekkürler

---

## 📄 License

Bu proje MIT lisansı altında lisanslanmıştır. Katkıda bulunarak, kodunuzun da MIT lisansı altında lisanslanacağını kabul etmiş olursunuz.

---

**QuickCRM Contributing Guide** - Open source'a katkıda bulunun 🤝
