using QuickCRM.Application.DTOs;
using QuickCRM.Core.Entities;
using QuickCRM.Core.Interfaces;

namespace QuickCRM.Application.Services
{
    public class CustomerNoteService : ICustomerNoteService
    {
        private readonly ICustomerNoteRepository _customerNoteRepository;

        public CustomerNoteService(ICustomerNoteRepository customerNoteRepository)
        {
            _customerNoteRepository = customerNoteRepository;
        }

        public async Task<IEnumerable<CustomerNoteDto>> GetCustomerNotesAsync(int customerId)
        {
            var notes = await _customerNoteRepository.GetByCustomerIdAsync(customerId);
            return notes.Select(MapToDto);
        }

        public async Task<CustomerNoteDto?> GetCustomerNoteByIdAsync(int id)
        {
            var note = await _customerNoteRepository.GetByIdAsync(id);
            return note != null ? MapToDto(note) : null;
        }

        public async Task<CustomerNoteDto> CreateCustomerNoteAsync(CreateCustomerNoteDto createCustomerNoteDto)
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
            return MapToDto(createdNote);
        }

        public async Task<CustomerNoteDto> UpdateCustomerNoteAsync(UpdateCustomerNoteDto updateCustomerNoteDto)
        {
            var note = await _customerNoteRepository.GetByIdAsync(updateCustomerNoteDto.Id);
            if (note == null)
                throw new ArgumentException("Customer note not found");

            note.Content = updateCustomerNoteDto.Content;
            note.IsActive = updateCustomerNoteDto.IsActive;
            note.UpdatedAt = DateTime.UtcNow;

            await _customerNoteRepository.UpdateAsync(note);
            return MapToDto(note);
        }

        public async Task DeleteCustomerNoteAsync(int id)
        {
            await _customerNoteRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<CustomerNoteDto>> GetCustomerNotesByCreatedByAsync(int customerId, string createdBy)
        {
            var notes = await _customerNoteRepository.GetByCustomerIdAndCreatedByAsync(customerId, createdBy);
            return notes.Select(MapToDto);
        }

        public async Task<int> GetCustomerNoteCountAsync(int customerId)
        {
            return await _customerNoteRepository.GetCountByCustomerIdAsync(customerId);
        }

        private static CustomerNoteDto MapToDto(CustomerNote note)
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
