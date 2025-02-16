using LuluSPA.Models;
using LuluSPA.ServiceContract;
using LuluSPA.ServiceContract.Interface;
using Microsoft.AspNetCore.Mvc;

namespace LuluSPA.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController(IAuthService authService) : ControllerBase
    {
        private readonly IAuthService _authService = authService;

        [HttpPost("register")]
        public async Task<IActionResult> Register(string user, string password, string role)
        {
            var result = await _authService.RegisterAsync(user, password, role);
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(User email, string password)
        {
            var token = await _authService.LoginAsync(email, password);
            if (token == null) return Unauthorized("Invalid credentials");
            return Ok(new { token });
        }
    }
}
