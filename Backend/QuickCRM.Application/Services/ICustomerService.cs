using QuickCRM.Application.DTOs;

namespace QuickCRM.Application.Services
{
    public interface ICustomerService
    {
        Task<IEnumerable<CustomerDto>> GetAllCustomersAsync();
        Task<CustomerDto?> GetCustomerByIdAsync(int id);
        Task<CustomerDto> CreateCustomerAsync(CreateCustomerDto createCustomerDto);
        Task<CustomerDto> UpdateCustomerAsync(UpdateCustomerDto updateCustomerDto);
        Task DeleteCustomerAsync(int id);
        Task<IEnumerable<CustomerDto>> SearchCustomersAsync(string searchTerm);
        Task<IEnumerable<CustomerDto>> GetActiveCustomersAsync();
        Task<object> GetCustomerStatsAsync();
        Task<int> GetCustomerCountAsync();
        Task<int> GetActiveCustomerCountAsync();
        Task<int> GetThisMonthCustomerCountAsync();
        
        // Customer Note methods
        Task<IEnumerable<CustomerNoteDto>> GetCustomerNotesAsync(int customerId);
        Task<CustomerNoteDto> AddCustomerNoteAsync(CreateCustomerNoteDto createCustomerNoteDto);
        Task<CustomerNoteDto> AddAdminNoteAsync(int customerId, string content);
        Task<CustomerNoteDto> AddCustomerNoteAsync(int customerId, string content);
    }
}
