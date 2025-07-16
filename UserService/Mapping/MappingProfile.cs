using AutoMapper;
using UserService.Models.Entities;
using UserService.Models.DTOs;

namespace UserService.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<RegisterDTO, User>()
            .ForMember(dest => dest.Password, opt => opt.MapFrom(src => src.Password));
        CreateMap<LoginDTO, User>();
        CreateMap<User, UserDTO>();
    }
}