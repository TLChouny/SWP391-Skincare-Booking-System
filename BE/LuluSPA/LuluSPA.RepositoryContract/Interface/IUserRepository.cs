
using LuluSPA.Models;

namespace LuluSPA.RepositoryContract.Interface
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task AddAsync(User user);
    }
}
