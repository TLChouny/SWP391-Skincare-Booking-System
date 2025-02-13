using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LuluSPA.RepositoryContract.Interface;
using LuluSPA.ServiceContract.Interface;

namespace LuluSPA.Service.Services
{
    public class ServiceSPA : IServiceSPA
    {
        private readonly IUnitOfWork _unitOfWork;

        public ServiceSPA(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

        }
        public Task<string> getAllProduct()
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<Models.Service>> GetAllService()
        {

            return _unitOfWork.ServiceSPARepository.GetAllService();
        }        

        public Task<int> getProductDetail(int id)
        {
            throw new NotImplementedException();
        }
       
    }
}
