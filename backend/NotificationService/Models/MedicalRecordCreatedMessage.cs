namespace NotificationService.Models
{
    public class MedicalRecordCreatedMessage
    {
        public Guid Id { get; set; }
        public Guid Patient_Id { get; set; }
        public string PatientEmail { get; set; } = string.Empty;
        public Guid Doctor_Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? FilePath { get; set; }
        public string? FileName { get; set; }
    }
}

