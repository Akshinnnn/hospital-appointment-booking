using Microsoft.EntityFrameworkCore;
using UserService.Data;
using UserService.Models.Entities;

namespace UserService.Services.Repositories
{
    public interface ISlotRepository
    {
        Task AddSlotsAsync(List<Slot> slots);
        Task<List<Slot>> GetSlots(Guid doctorId, DateTime date);
        Task<Slot?> GetSlot(Guid doctorId, DateTime startTime);
        Task UpdateSlotAsync(Slot slot);
    }

    public class SlotRepository : ISlotRepository
    {
        private readonly UsersDbContext _dbContext;

        public SlotRepository(UsersDbContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }

        public async Task<List<Slot>> GetSlots(Guid doctorId, DateTime date)
        {
            var utcDate = date.ToUniversalTime();
            return await _dbContext.Slots
                .Where(s => s.DoctorId == doctorId && s.Start.Date == utcDate.Date)
                .OrderBy(s => s.Start)
                .ToListAsync();
        }

        public async Task UpdateSlotAsync(Slot slot)
        {
            _dbContext.Slots.Update(slot);
            await _dbContext.SaveChangesAsync();
        }

        public async Task AddSlotsAsync(List<Slot> slots)
        {
            foreach (var slot in slots)
            {
                slot.Start = DateTime.SpecifyKind(slot.Start, DateTimeKind.Utc);
                slot.End = DateTime.SpecifyKind(slot.End, DateTimeKind.Utc);
            }

            await _dbContext.Slots.AddRangeAsync(slots);
            await _dbContext.SaveChangesAsync();
        }

        public async Task<Slot?> GetSlot(Guid doctorId, DateTime startTime)
        {
            return await _dbContext.Slots
                .FirstOrDefaultAsync(s => s.DoctorId == doctorId && s.Start == startTime);
        }
    }
}