using AutoMapper;
using UserService.Models.Entities;
using UserService.Models.DTOs;
using UserService.Models.ScheduleDTOs;

namespace UserService.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<RegisterDTO, User>()
            .ForMember(dest => dest.Password, opt => opt.MapFrom(src => src.Password)).ReverseMap();
        CreateMap<LoginDTO, User>().ReverseMap();
        CreateMap<UpdateDTO, User>().ReverseMap();
        CreateMap<User, UserDTO>().ReverseMap();

        CreateMap<ScheduleDTO, DoctorSchedule>().ReverseMap();
        CreateMap<AddScheduleDTO, DoctorSchedule>().ReverseMap();

        CreateMap<Slot, TimeSlotDTO>().ReverseMap();
    }
}