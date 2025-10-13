using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;
using UserService.Models.Entities;
using UserService.Services.Repositories;

namespace UserService.Services
{
    public class DoctorService : IDoctorService
    {
        private readonly IDoctorRepository _doctorRepository;
        private readonly IDistributedCache _cache;
        private readonly ILogger<DoctorService> _logger;

        public DoctorService(IDoctorRepository doctorRepository, IDistributedCache cache, ILogger<DoctorService> logger)
        {
            _doctorRepository = doctorRepository ?? throw new ArgumentNullException(nameof(doctorRepository));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<List<User>> GetDoctorsBySpecialisationAsync(string specialisation)
        {
            var cacheKey = $"{specialisation.ToLower()}";

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