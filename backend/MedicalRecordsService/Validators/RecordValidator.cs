using FluentValidation;
using MedicalRecordService.Models.DTOs;
using MedicalRecordsService.Models.DTOs;

namespace MedicalRecordsService.Validators
{
    public class AddRecordValidator : AbstractValidator<AddRecordDTO>
    {
        public AddRecordValidator()
        {
            RuleFor(x => x.Patient_Id)
                .NotEmpty().WithMessage("Patient ID is required");

            RuleFor(x => x.Title)
                .MaximumLength(200).WithMessage("Title must not exceed 200 characters")
                .When(x => !string.IsNullOrWhiteSpace(x.Title));

            RuleFor(x => x.Description)
                .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters")
                .When(x => !string.IsNullOrWhiteSpace(x.Description));

            RuleFor(x => x.File)
                .NotNull().WithMessage("File is required")
                .Must(file => file != null && file.Length > 0).WithMessage("File cannot be empty")
                .Must(file => file != null && file.Length <= 10 * 1024 * 1024).WithMessage("File size must not exceed 10MB")
                .When(x => x.File != null);
        }
    }

    public class UpdateRecordValidator : AbstractValidator<UpdateRecordDTO>
    {
        public UpdateRecordValidator()
        {
            RuleFor(x => x.Title)
                .MaximumLength(200).WithMessage("Title must not exceed 200 characters")
                .When(x => !string.IsNullOrWhiteSpace(x.Title));

            RuleFor(x => x.Description)
                .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters")
                .When(x => !string.IsNullOrWhiteSpace(x.Description));
        }
    }
}





