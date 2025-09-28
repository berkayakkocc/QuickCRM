using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using QuickCRM.Application.DTOs;
using QuickCRM.Application.Services;
using System.Security.Claims;

namespace QuickCRM.API.Controllers
{
    /// <summary>
    /// Customer Notes controller for managing customer notes with role-based permissions
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Tüm endpoint'ler için authentication gerekli
    [Produces("application/json")]
    public class CustomerNotesController : ControllerBase
    {
        private readonly ICustomerNoteService _customerNoteService;
        private readonly ILogger<CustomerNotesController> _logger;

        public CustomerNotesController(
            ICustomerNoteService customerNoteService, 
            ILogger<CustomerNotesController> logger)
        {
            _customerNoteService = customerNoteService ?? throw new ArgumentNullException(nameof(customerNoteService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Gets all notes for a specific customer
        /// </summary>
        /// <param name="customerId">Customer ID</param>
        /// <returns>List of customer notes</returns>
        /// <response code="200">Returns customer notes</response>
        /// <response code="404">Customer not found</response>
        [HttpGet("customer/{customerId}")]
        [ProducesResponseType(typeof(IEnumerable<CustomerNoteDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<CustomerNoteDto>>> GetCustomerNotes(int customerId)
        {
            try
            {
                _logger.LogInformation("Getting notes for customer {CustomerId}", customerId);
                
                var notes = await _customerNoteService.GetCustomerNotesAsync(customerId);
                return Ok(notes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notes for customer {CustomerId}", customerId);
                return StatusCode(500, new { message = "An error occurred while retrieving customer notes" });
            }
        }

        /// <summary>
        /// Gets a specific customer note by ID
        /// </summary>
        /// <param name="id">Note ID</param>
        /// <returns>Customer note details</returns>
        /// <response code="200">Returns customer note</response>
        /// <response code="404">Note not found</response>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(CustomerNoteDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<CustomerNoteDto>> GetCustomerNote(int id)
        {
            try
            {
                var note = await _customerNoteService.GetCustomerNoteByIdAsync(id);
                if (note == null)
                    return NotFound();

                return Ok(note);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting note {NoteId}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the note" });
            }
        }

        /// <summary>
        /// Creates a new customer note
        /// </summary>
        /// <param name="createCustomerNoteDto">Note creation data</param>
        /// <returns>Created customer note</returns>
        /// <response code="201">Note created successfully</response>
        /// <response code="400">Invalid request data</response>
        [HttpPost]
        [ProducesResponseType(typeof(CustomerNoteDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<CustomerNoteDto>> CreateCustomerNote(CreateCustomerNoteDto createCustomerNoteDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Create note attempt with invalid model state");
                return BadRequest(ModelState);
            }

            try
            {
                // Set createdBy based on user role
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "customer";
                createCustomerNoteDto.CreatedBy = userRole;

                _logger.LogInformation("Creating note for customer {CustomerId} by {CreatedBy}", 
                    createCustomerNoteDto.CustomerId, createCustomerNoteDto.CreatedBy);

                var note = await _customerNoteService.CreateCustomerNoteAsync(createCustomerNoteDto);
                
                return CreatedAtAction(nameof(GetCustomerNote), new { id = note.Id }, note);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument when creating note for customer {CustomerId}", 
                    createCustomerNoteDto.CustomerId);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating note for customer {CustomerId}", 
                    createCustomerNoteDto.CustomerId);
                return StatusCode(500, new { message = "An error occurred while creating the note" });
            }
        }

        /// <summary>
        /// Updates an existing customer note
        /// </summary>
        /// <param name="id">Note ID</param>
        /// <param name="updateCustomerNoteDto">Note update data</param>
        /// <returns>No content</returns>
        /// <response code="204">Note updated successfully</response>
        /// <response code="400">Invalid request data</response>
        /// <response code="403">Insufficient permissions</response>
        /// <response code="404">Note not found</response>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateCustomerNote(int id, UpdateCustomerNoteDto updateCustomerNoteDto)
        {
            if (id != updateCustomerNoteDto.Id)
            {
                _logger.LogWarning("ID mismatch in update request: {UrlId} vs {DtoId}", id, updateCustomerNoteDto.Id);
                return BadRequest("ID mismatch");
            }

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Update note attempt with invalid model state");
                return BadRequest(ModelState);
            }

            try
            {
                // Check if user has permission to update this note
                var note = await _customerNoteService.GetCustomerNoteByIdAsync(id);
                if (note == null)
                {
                    _logger.LogWarning("Note {NoteId} not found for update", id);
                    return NotFound();
                }

                var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "customer";
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                // Admin can update any note, users can only update their own notes
                if (userRole != "admin" && note.CreatedBy != "customer")
                {
                    _logger.LogWarning("User {UserId} attempted to update note {NoteId} without permission", userId, id);
                    return Forbid("You can only update your own notes");
                }

                _logger.LogInformation("Updating note {NoteId} by user {UserId}", id, userId);

                await _customerNoteService.UpdateCustomerNoteAsync(updateCustomerNoteDto);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument when updating note {NoteId}", id);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating note {NoteId}", id);
                return StatusCode(500, new { message = "An error occurred while updating the note" });
            }
        }

        /// <summary>
        /// Deletes a customer note
        /// </summary>
        /// <param name="id">Note ID</param>
        /// <returns>No content</returns>
        /// <response code="204">Note deleted successfully</response>
        /// <response code="403">Insufficient permissions</response>
        /// <response code="404">Note not found</response>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteCustomerNote(int id)
        {
            try
            {
                // Check if user has permission to delete this note
                var note = await _customerNoteService.GetCustomerNoteByIdAsync(id);
                if (note == null)
                {
                    _logger.LogWarning("Note {NoteId} not found for deletion", id);
                    return NotFound();
                }

                var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "customer";
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                // Admin can delete any note, users can only delete their own notes
                if (userRole != "admin" && note.CreatedBy != "customer")
                {
                    _logger.LogWarning("User {UserId} attempted to delete note {NoteId} without permission", userId, id);
                    return Forbid("You can only delete your own notes");
                }

                _logger.LogInformation("Deleting note {NoteId} by user {UserId}", id, userId);

                await _customerNoteService.DeleteCustomerNoteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting note {NoteId}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the note" });
            }
        }

        /// <summary>
        /// Gets notes created by a specific user for a customer
        /// </summary>
        /// <param name="customerId">Customer ID</param>
        /// <param name="createdBy">Creator type (admin/customer)</param>
        /// <returns>List of notes created by specified user</returns>
        /// <response code="200">Returns filtered notes</response>
        [HttpGet("customer/{customerId}/by/{createdBy}")]
        [ProducesResponseType(typeof(IEnumerable<CustomerNoteDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<CustomerNoteDto>>> GetCustomerNotesByCreatedBy(int customerId, string createdBy)
        {
            try
            {
                _logger.LogInformation("Getting notes for customer {CustomerId} created by {CreatedBy}", 
                    customerId, createdBy);

                var notes = await _customerNoteService.GetCustomerNotesByCreatedByAsync(customerId, createdBy);
                return Ok(notes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notes for customer {CustomerId} by {CreatedBy}", 
                    customerId, createdBy);
                return StatusCode(500, new { message = "An error occurred while retrieving filtered notes" });
            }
        }

        /// <summary>
        /// Gets the count of notes for a specific customer
        /// </summary>
        /// <param name="customerId">Customer ID</param>
        /// <returns>Note count</returns>
        /// <response code="200">Returns note count</response>
        [HttpGet("customer/{customerId}/count")]
        [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
        public async Task<ActionResult<int>> GetCustomerNoteCount(int customerId)
        {
            try
            {
                var count = await _customerNoteService.GetCustomerNoteCountAsync(customerId);
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting note count for customer {CustomerId}", customerId);
                return StatusCode(500, new { message = "An error occurred while retrieving note count" });
            }
        }
    }
}


