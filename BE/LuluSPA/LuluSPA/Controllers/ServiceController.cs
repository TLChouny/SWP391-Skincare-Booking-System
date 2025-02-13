using LuluSPA.ServiceContract.Interface;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace LuluSPA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceController : ControllerBase
    {
        private readonly IServiceSPA _serviceSPA;

        public ServiceController(IServiceSPA serviceSPA)
        {
            _serviceSPA = serviceSPA ?? throw new ArgumentNullException(nameof(serviceSPA));
        }

        // Lấy danh sách dịch vụ thông qua service layer (tốt hơn)
        [HttpGet("all")]
        public async Task<IActionResult> GetAllServicesAsync()
        {
            var allServices = await _serviceSPA.GetAllService();
            return Ok(allServices);
        }
    }
}
