using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UserService.Models.Entities
{
    [Table("Users")]
    public class User
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string Full_Name { get; set; }

        [Required]
        [MaxLength(100)]
        [EmailAddress]
        public string Email { get; set; }
        [Phone]
        public string? Phone_Number { get; set; }
        [Required]
        public string Password { get; set; }

        [Required]
        public UserRole Role { get; set; } = UserRole.PATIENT;

        public string? Specialisation { get; set; }

        [Required]
        public DateTime Created_At { get; set; } = DateTime.UtcNow;
        
        public ICollection<DoctorSchedule>? Availabilities { get; set; }

    }
}