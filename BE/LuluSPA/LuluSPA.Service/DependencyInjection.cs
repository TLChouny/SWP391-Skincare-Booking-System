using LuluSPA.Repository.Repository;
using LuluSPA.RepositoryContract.Interface;
using LuluSPA.Service.Services;
using LuluSPA.ServiceContract.Interface;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LuluSPA.Service
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddService(this IServiceCollection services)
        {
            // DI Services
            services.AddTransient<IUnitOfWork, UnitOfWork>();
            services.AddTransient<IServiceSPA, ServiceSPA>();
            return services;
        }
    }
}
