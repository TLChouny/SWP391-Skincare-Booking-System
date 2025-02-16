using LuluSPA.Data;
using LuluSPA.RepositoryContract.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace LuluSPA.Repository.Repository
{
    public class UnitOfWork : IUnitOfWork, IDisposable
    {
        private readonly ApplicationDbContext _db;
        public IUserRepository Users { get; }
        private bool _disposed = false;

        public IServiceSPARepository ServiceSPARepository { get; }

        public UnitOfWork(ApplicationDbContext context, IUserRepository userRepository)
        {
            _db = context;
            Users = userRepository;
        }
        public UnitOfWork(ApplicationDbContext db, IServiceSPARepository serviceSPARepository)
        {
            _db = db;
            ServiceSPARepository = serviceSPARepository;
        }


        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    _db.Dispose();
                }
                _disposed = true; // Move this inside disposing check
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
            _db.Dispose();
        }

        public async Task SaveChangesAsync()
        {
            await _db.SaveChangesAsync();
        }
        public async Task<int> CompleteAsync()
        {
            return await _db.SaveChangesAsync();
        }
    }
}
