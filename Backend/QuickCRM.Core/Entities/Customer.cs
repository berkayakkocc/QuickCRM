using System.ComponentModel.DataAnnotations;

namespace QuickCRM.Core.Entities
{
    public class Customer
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string LastName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [MaxLength(20)]
        public string? Phone { get; set; }
        
        [MaxLength(100)]
        public string? Company { get; set; }
        
        [MaxLength(500)]
        public string? Notes { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsActive { get; set; } = true;
    }
}
