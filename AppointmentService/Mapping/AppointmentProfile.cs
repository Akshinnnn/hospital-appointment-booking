using AutoMapper;
using AppointmentService.Models.DTOs;
using AppointmentService.Models.Entities;
using AppointmentService.Models.DTOs.AppointmentDTOs;

namespace AppointmentService.Mapping
{
    public class AppointmentProfile : Profile
    {
        public AppointmentProfile()
        {
            CreateMap<Appointment, AppointmentDTO>().ReverseMap();
            CreateMap<AppointmentCreateDTO, Appointment>();
        }
    }
}
