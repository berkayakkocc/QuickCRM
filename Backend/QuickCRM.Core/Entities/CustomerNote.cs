using System.ComponentModel.DataAnnotations;

namespace QuickCRM.Core.Entities
{
    public class CustomerNote
    {
        public int Id { get; set; }
        
        [Required]
        public int CustomerId { get; set; }
        
        [Required]
        [MaxLength(1000)]
        public string Content { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(20)]
        public string CreatedBy { get; set; } = string.Empty; // "customer" veya "admin"
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsActive { get; set; } = true;
        
        // Navigation property
        public Customer? Customer { get; set; }
    }
}
