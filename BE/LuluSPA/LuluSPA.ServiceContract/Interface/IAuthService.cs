
using LuluSPA.Models;

namespace LuluSPA.ServiceContract.Interface
{
    public interface IAuthService
    {
        Task<string> RegisterAsync(string user, string password, string role);
        Task<string?> LoginAsync(User user, string password);
    }
}
