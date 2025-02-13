using LuluSPA.Repository.Repository;
using LuluSPA.RepositoryContract.Interface;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Identity.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LuluSPA.Repository
{
    public static class  DependencyInjection
    {
            public static IServiceCollection AddRepository(this IServiceCollection services)
        {

            services.AddTransient<IServiceSPARepository, ServiceSPARepository>();

            return services;
        }

    }
}
