using LuluSPA.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LuluSPA.ServiceContract.Interface
{
    public interface IServiceSPA
    {
        Task<String> getAllProduct();
        Task<int> getProductDetail(int id);
        Task<IEnumerable<Models.Service>> GetAllService();

    }
}
