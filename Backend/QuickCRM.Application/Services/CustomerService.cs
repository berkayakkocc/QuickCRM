using QuickCRM.Application.DTOs;
using QuickCRM.Core.Entities;
using QuickCRM.Core.Interfaces;

namespace QuickCRM.Application.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly ICustomerNoteRepository _customerNoteRepository;

        public CustomerService(ICustomerRepository customerRepository, ICustomerNoteRepository customerNoteRepository)
        {
            _customerRepository = customerRepository;
            _customerNoteRepository = customerNoteRepository;
        }

        public async Task<IEnumerable<CustomerDto>> GetAllCustomersAsync()
        {
            var customers = await _customerRepository.GetAllAsync();
            return customers.Select(MapToDto);
        }

        public async Task<CustomerDto?> GetCustomerByIdAsync(int id)
        {
            var customer = await _customerRepository.GetByIdAsync(id);
            if (customer == null) return null;
            
            var customerDto = MapToDto(customer);
            var notes = await GetCustomerNotesAsync(id);
            customerDto.CustomerNotes = notes.ToList();
            return customerDto;
        }

        public async Task<CustomerDto> CreateCustomerAsync(CreateCustomerDto createCustomerDto)
        {
            var customer = new Customer
            {
                FirstName = createCustomerDto.FirstName,
                LastName = createCustomerDto.LastName,
                Email = createCustomerDto.Email,
                Phone = createCustomerDto.Phone,
                Company = createCustomerDto.Company,
                Notes = createCustomerDto.Notes,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var createdCustomer = await _customerRepository.AddAsync(customer);
            return MapToDto(createdCustomer);
        }

        public async Task<CustomerDto> UpdateCustomerAsync(UpdateCustomerDto updateCustomerDto)
        {
            var customer = await _customerRepository.GetByIdAsync(updateCustomerDto.Id);
            if (customer == null)
                throw new ArgumentException("Customer not found");

            // Güncelleme yap
            customer.FirstName = updateCustomerDto.FirstName;
            customer.LastName = updateCustomerDto.LastName;
            customer.Email = updateCustomerDto.Email;
            customer.Phone = updateCustomerDto.Phone;
            customer.Company = updateCustomerDto.Company;
            customer.Notes = updateCustomerDto.Notes;
            customer.IsActive = updateCustomerDto.IsActive;
            customer.UpdatedAt = DateTime.UtcNow;

            // Veritabanına kaydet
            await _customerRepository.UpdateAsync(customer);
            
            // Güncellenmiş customer'ı tekrar getir (veritabanından fresh data)
            var updatedCustomer = await _customerRepository.GetByIdAsync(updateCustomerDto.Id);
            if (updatedCustomer == null)
                throw new InvalidOperationException("Customer not found after update");

            var mappedDto = MapToDto(updatedCustomer);
            Console.WriteLine($"CustomerService - Updated DTO: Id={mappedDto.Id}, FirstName={mappedDto.FirstName}, LastName={mappedDto.LastName}, Notes={mappedDto.Notes}");
            
            return mappedDto;
        }

        public async Task DeleteCustomerAsync(int id)
        {
            await _customerRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<CustomerDto>> SearchCustomersAsync(string searchTerm)
        {
            var customers = await _customerRepository.SearchAsync(searchTerm);
            return customers.Select(MapToDto);
        }

        public async Task<IEnumerable<CustomerDto>> GetActiveCustomersAsync()
        {
            var customers = await _customerRepository.GetActiveCustomersAsync();
            return customers.Select(MapToDto);
        }

        public async Task<object> GetCustomerStatsAsync()
        {
            var totalCustomers = await _customerRepository.GetCountAsync();
            var activeCustomers = await _customerRepository.GetActiveCountAsync();
            var thisMonthCustomers = await _customerRepository.GetThisMonthCountAsync();

            return new
            {
                TotalCustomers = totalCustomers,
                ActiveCustomers = activeCustomers,
                ThisMonthCustomers = thisMonthCustomers
            };
        }

        public async Task<int> GetCustomerCountAsync()
        {
            return await _customerRepository.GetCountAsync();
        }

        public async Task<int> GetActiveCustomerCountAsync()
        {
            return await _customerRepository.GetActiveCountAsync();
        }

        public async Task<int> GetThisMonthCustomerCountAsync()
        {
            return await _customerRepository.GetThisMonthCountAsync();
        }

        // Customer Note methods
        public async Task<IEnumerable<CustomerNoteDto>> GetCustomerNotesAsync(int customerId)
        {
            var notes = await _customerNoteRepository.GetByCustomerIdAsync(customerId);
            return notes.Select(MapNoteToDto);
        }

        public async Task<CustomerNoteDto> AddCustomerNoteAsync(CreateCustomerNoteDto createCustomerNoteDto)
        {
            var customerNote = new CustomerNote
            {
                CustomerId = createCustomerNoteDto.CustomerId,
                Content = createCustomerNoteDto.Content,
                CreatedBy = createCustomerNoteDto.CreatedBy,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var createdNote = await _customerNoteRepository.AddAsync(customerNote);
            return MapNoteToDto(createdNote);
        }

        public async Task<CustomerNoteDto> AddAdminNoteAsync(int customerId, string content)
        {
            var customerNote = new CustomerNote
            {
                CustomerId = customerId,
                Content = content,
                CreatedBy = "admin",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var createdNote = await _customerNoteRepository.AddAsync(customerNote);
            return MapNoteToDto(createdNote);
        }

        public async Task<CustomerNoteDto> AddCustomerNoteAsync(int customerId, string content)
        {
            var customerNote = new CustomerNote
            {
                CustomerId = customerId,
                Content = content,
                CreatedBy = "customer",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var createdNote = await _customerNoteRepository.AddAsync(customerNote);
            return MapNoteToDto(createdNote);
        }

        private static CustomerDto MapToDto(Customer customer)
        {
            return new CustomerDto
            {
                Id = customer.Id,
                FirstName = customer.FirstName,
                LastName = customer.LastName,
                Email = customer.Email,
                Phone = customer.Phone,
                Company = customer.Company,
                Notes = customer.Notes,
                CreatedAt = customer.CreatedAt,
                UpdatedAt = customer.UpdatedAt,
                IsActive = customer.IsActive
            };
        }

        private static CustomerNoteDto MapNoteToDto(CustomerNote note)
        {
            return new CustomerNoteDto
            {
                Id = note.Id,
                CustomerId = note.CustomerId,
                Content = note.Content,
                CreatedBy = note.CreatedBy,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt,
                IsActive = note.IsActive
            };
        }
    }
}
