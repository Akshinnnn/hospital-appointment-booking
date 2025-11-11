using FluentValidation;
using UserService.Models.DTOs;

namespace UserService.Validators
{
    public class RegisterValidator : AbstractValidator<RegisterDTO>
    {
        public RegisterValidator()
        {
            RuleFor(x => x.Full_Name).NotEmpty().MinimumLength(3);
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        }
    }

    public class LoginValidator : AbstractValidator<LoginDTO>
    {
        public LoginValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress();
            RuleFor(x => x.Password).NotEmpty();
        }
    }

    public class UpdateValidator : AbstractValidator<UpdateDTO>
    {
        public UpdateValidator()
        {
            RuleFor(x => x.Full_Name).NotEmpty();
            RuleFor(x => x.Phone_Number).Matches(@"^\+?\d{7,15}$")
                .When(x => !string.IsNullOrWhiteSpace(x.Phone_Number));
        }
    }
}
