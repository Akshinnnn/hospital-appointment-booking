using AutoMapper;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;
using UserService.Models.DTOs;
using UserService.Models.Entities;
using UserService.Services.Repositories;

namespace UserService.Services
{
    public class DoctorService : IDoctorService
    {
        private readonly IDoctorRepository _doctorRepository;
        private readonly IDistributedCache _cache;
        private readonly ILogger<DoctorService> _logger;
        private readonly IMapper _mapper;

        public DoctorService(IDoctorRepository doctorRepository, IDistributedCache cache, ILogger<DoctorService> logger, IMapper mapper)
        {
            _doctorRepository = doctorRepository ?? throw new ArgumentNullException(nameof(doctorRepository));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        public Task CreateDoctor(CreateDoctorDTO dto)
        {
            if (dto == null)
                throw new ArgumentException("Doctor data is required");

            var doctor = _mapper.Map<User>(dto);
            
            return _doctorRepository.CreateDoctorAsync(doctor);
        }

        public async Task<List<User>> GetDoctorsBySpecialisationAsync(string specialisation)
        {
            var cacheKey = $"doctor_{specialisation.ToLower()}";

            var cachedData = await _cache.GetStringAsync(cacheKey);
            if (!string.IsNullOrEmpty(cachedData))
            {
                _logger.LogInformation("Cache hit for specialization: {Specialisation}", specialisation);
                return JsonSerializer.Deserialize<List<User>>(cachedData)!;
            }

            var doctors = await _doctorRepository.GetDoctorsBySpecialisationAsync(specialisation);

            var cacheOptions = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15)
            };
            await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(doctors), cacheOptions);

            _logger.LogInformation("Cache miss for specialization: {Specialisation}. Data stored in cache.", specialisation);

            return doctors;
        }
    }
}