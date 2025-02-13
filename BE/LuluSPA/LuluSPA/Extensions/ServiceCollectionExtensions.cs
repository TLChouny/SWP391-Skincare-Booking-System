using LuluSPA.Service.Services;
using LuluSPA.ServiceContract.Interface;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace LuluSPA.Extensions
{
    public static class ServiceCollectionExtensions
    {
        
        public static void AddApplicationServices(this IServiceCollection services)
        {
            // Quét toàn bộ assembly để đăng ký tất cả các service có interface
            var assembly = Assembly.GetExecutingAssembly();

            var typesWithInterfaces = assembly.GetTypes()
                .Where(t => t.IsClass && !t.IsAbstract)
                .Select(t => new
                {
                    Implementation = t,
                    Interface = t.GetInterfaces().FirstOrDefault(i => i.Name == "I" + t.Name)
                })
                .Where(t => t.Interface != null);

            foreach (var type in typesWithInterfaces)
            {
                services.AddScoped(type.Interface, type.Implementation);
            }


        }
    }
}
