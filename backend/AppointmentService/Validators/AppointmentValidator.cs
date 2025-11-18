using FluentValidation;
using AppointmentService.Models.DTOs.AppointmentDTOs;

namespace AppointmentService.Validators
{
    public class AppointmentCreateValidator : AbstractValidator<AppointmentCreateDTO>
    {
        public AppointmentCreateValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required")
                .MinimumLength(3).WithMessage("Full name must be at least 3 characters");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format");

            RuleFor(x => x.DoctorId)
                .NotEmpty().WithMessage("Doctor ID is required");

            RuleFor(x => x.AppointmentTime)
                .NotEmpty().WithMessage("Appointment time is required")
                .Must(BeInFuture).WithMessage("Appointment time must be in the future");

            RuleFor(x => x.Notes)
                .MaximumLength(500).WithMessage("Notes must not exceed 500 characters")
                .When(x => !string.IsNullOrWhiteSpace(x.Notes));
        }

        private bool BeInFuture(DateTime dateTime)
        {
            return dateTime > DateTime.UtcNow;
        }
    }
}






