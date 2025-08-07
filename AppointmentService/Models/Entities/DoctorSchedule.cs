using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppointmentService.Models.Entities
{
    [Table("Doctor_Schedules")]
    public class DoctorSchedule
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid Doctor_Id { get; set; }

        [Required]
        public DayOfWeek Day_Of_Week { get; set; } 

        [Required]
        public TimeSpan Start_Time { get; set; }

        [Required]
        public TimeSpan End_Time { get; set; } 
    }
}
