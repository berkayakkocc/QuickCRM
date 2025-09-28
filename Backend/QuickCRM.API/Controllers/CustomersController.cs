using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using QuickCRM.Application.DTOs;
using QuickCRM.Application.Services;
using System.Text.Json;

namespace QuickCRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Tüm endpoint'ler için authentication gerekli
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerService _customerService;

        public CustomersController(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CustomerDto>>> GetCustomers()
        {
            var customers = await _customerService.GetAllCustomersAsync();
            return Ok(customers);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CustomerDto>> GetCustomer(int id)
        {
            var customer = await _customerService.GetCustomerByIdAsync(id);
            if (customer == null)
                return NotFound();

            return Ok(customer);
        }

        [HttpPost]
        public async Task<ActionResult<CustomerDto>> CreateCustomer(CreateCustomerDto createCustomerDto)
        {
            try
            {
                var customer = await _customerService.CreateCustomerAsync(createCustomerDto);
                return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<CustomerDto>> UpdateCustomer(int id, UpdateCustomerDto updateCustomerDto)
        {
            if (id != updateCustomerDto.Id)
                return BadRequest("ID mismatch");

            try
            {
                var updatedCustomer = await _customerService.UpdateCustomerAsync(updateCustomerDto);
                
                // JSON serialization debug
                var jsonString = JsonSerializer.Serialize(updatedCustomer, new JsonSerializerOptions 
                { 
                    WriteIndented = true 
                });
                Console.WriteLine($"Controller - Updated Customer JSON: {jsonString}");
                
                // Her zaman 200 OK + JSON döndür
                return Ok(updatedCustomer);
            }
            catch (ArgumentException ex)
            {
                Console.WriteLine($"Controller - ArgumentException: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine($"Controller - InvalidOperationException: {ex.Message}");
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Controller - Unexpected error: {ex.Message}");
                return StatusCode(500, "An unexpected error occurred");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Manager")] // Sadece Admin ve Manager silebilir
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            try
            {
                await _customerService.DeleteCustomerAsync(id);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<CustomerDto>>> SearchCustomers([FromQuery] string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return BadRequest("Search term is required");

            var customers = await _customerService.SearchCustomersAsync(searchTerm);
            return Ok(customers);
        }

        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<CustomerDto>>> GetActiveCustomers()
        {
            var customers = await _customerService.GetActiveCustomersAsync();
            return Ok(customers);
        }

    }
}
