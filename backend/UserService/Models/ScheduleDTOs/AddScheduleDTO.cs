namespace UserService.Models.ScheduleDTOs
{
    public class AddScheduleDTO
    {
        public Guid Doctor_Id { get; set; }
        public DateTime Start_Time { get; set; }

        public DateTime End_Time { get; set; } 
    }
}