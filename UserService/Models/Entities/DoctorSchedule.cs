using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UserService.Models.Entities
{
    [Table("Doctor_Schedules")]
    public class DoctorSchedule
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid Doctor_Id { get; set; }

        [ForeignKey(nameof(Doctor_Id))]
        public User? Doctor { get; set; }

        [Required]
        public DateTime Start_Time { get; set; }

        [Required]
        public DateTime End_Time { get; set; } 
    }
}
