using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LuluSPA.RepositoryContract.Interface
{
    public interface IUnitOfWork : IDisposable
    {
        IServiceSPARepository ServiceSPARepository { get; }

        Task SaveChangesAsync();

    }
}
