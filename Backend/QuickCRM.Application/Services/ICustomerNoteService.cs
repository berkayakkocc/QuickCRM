using QuickCRM.Application.DTOs;

namespace QuickCRM.Application.Services
{
    public interface ICustomerNoteService
    {
        Task<IEnumerable<CustomerNoteDto>> GetCustomerNotesAsync(int customerId);
        Task<CustomerNoteDto?> GetCustomerNoteByIdAsync(int id);
        Task<CustomerNoteDto> CreateCustomerNoteAsync(CreateCustomerNoteDto createCustomerNoteDto);
        Task<CustomerNoteDto> UpdateCustomerNoteAsync(UpdateCustomerNoteDto updateCustomerNoteDto);
        Task DeleteCustomerNoteAsync(int id);
        Task<IEnumerable<CustomerNoteDto>> GetCustomerNotesByCreatedByAsync(int customerId, string createdBy);
        Task<int> GetCustomerNoteCountAsync(int customerId);
    }
}
