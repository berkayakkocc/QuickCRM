namespace QuickCRM.Application.DTOs
{
    public class CustomerNoteDto
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string Content { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty; // "customer" veya "admin"
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateCustomerNoteDto
    {
        public int CustomerId { get; set; }
        public string Content { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty; // "customer" veya "admin"
    }

    public class UpdateCustomerNoteDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}
