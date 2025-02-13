using LuluSPA.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LuluSPA.RepositoryContract.Interface
{
    public interface IServiceSPARepository
    {
        Task<IEnumerable<Service>> GetAllService();
    }
}
