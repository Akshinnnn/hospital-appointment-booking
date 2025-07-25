namespace UserService.Models.ScheduleDTOs
{
    public class AddScheduleDTO
    {
        public Guid Doctor_Id { get; set; }
        public DayOfWeek Day_Of_Week { get; set; } 

        public TimeSpan Start_Time { get; set; }

        public TimeSpan End_Time { get; set; } 
    }
}