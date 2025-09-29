using AutoMapper;
using MassTransit;
using MedicalRecordService.Models;
using MedicalRecordService.Models.DTOs;
using MedicalRecordsService.Models.DTOs;

namespace MedicalRecordService.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<AddRecordDTO, Record>().ReverseMap();
        CreateMap<UpdateRecordDTO, Record>().ReverseMap();
    }
}