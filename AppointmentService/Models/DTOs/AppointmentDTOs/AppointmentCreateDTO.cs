using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AppointmentService.Models.DTOs.AppointmentDTOs
{
    public class AppointmentCreateDTO
    {
        public Guid DoctorId { get; set; }
        public Guid PatientId { get; set; }
        public Guid ScheduleId { get; set; }
        public DateTime AppointmentTime { get; set; }
        public string? Notes { get; set; }
    }
}