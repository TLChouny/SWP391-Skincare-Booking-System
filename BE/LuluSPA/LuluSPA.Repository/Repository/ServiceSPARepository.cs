using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LuluSPA.Data;
using LuluSPA.Models;
using LuluSPA.RepositoryContract.Interface;
 
namespace LuluSPA.Repository.Repository
{
    public class ServiceSPARepository : Repository<Service>, IServiceSPARepository
    {
        private readonly ApplicationDbContext _db;

        public ServiceSPARepository(ApplicationDbContext db) : base(db)
        {
        
            _db = db;
        }
        public async Task<IEnumerable<Service>> GetAllService()
        {
            return await GetAllAsync();
        }
    }
}
