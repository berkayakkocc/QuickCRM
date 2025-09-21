using QuickCRM.Application.DTOs;
using QuickCRM.Core.Entities;
using QuickCRM.Core.Interfaces;

namespace QuickCRM.Application.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _customerRepository;

        public CustomerService(ICustomerRepository customerRepository)
        {
            _customerRepository = customerRepository;
        }

        public async Task<IEnumerable<CustomerDto>> GetAllCustomersAsync()
        {
            var customers = await _customerRepository.GetAllAsync();
            return customers.Select(MapToDto);
        }

        public async Task<CustomerDto?> GetCustomerByIdAsync(int id)
        {
            var customer = await _customerRepository.GetByIdAsync(id);
            return customer != null ? MapToDto(customer) : null;
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

            customer.FirstName = updateCustomerDto.FirstName;
            customer.LastName = updateCustomerDto.LastName;
            customer.Email = updateCustomerDto.Email;
            customer.Phone = updateCustomerDto.Phone;
            customer.Company = updateCustomerDto.Company;
            customer.Notes = updateCustomerDto.Notes;
            customer.IsActive = updateCustomerDto.IsActive;
            customer.UpdatedAt = DateTime.UtcNow;

            await _customerRepository.UpdateAsync(customer);
            return MapToDto(customer);
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
    }
}
