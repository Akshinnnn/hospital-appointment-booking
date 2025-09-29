using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UserService.Models.Entities
{
    [Table("Slots")]
    public class Slot
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid DoctorId { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public bool IsAvailable { get; set; }
    }
}
