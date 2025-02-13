using LuluSPA.Data;
using LuluSPA.RepositoryContract.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace LuluSPA.Repository.Repository
{
    public class Repository<T> : IRepository<T> where T : class
    {
        private readonly ApplicationDbContext _db;
        internal DbSet<T> dbSet;
        public Repository(ApplicationDbContext db)
        {
            _db = db;
            dbSet = db.Set<T>();
        }

        public async Task<T> AddAsync(T entity)
        {
            await _db.AddAsync(entity);
            return entity;
            throw new NotImplementedException();
        }

        public async Task<T> DeleteAsync(T entity)
        {
            _db.Remove(entity);
            await _db.SaveChangesAsync(); 
            return entity;
        }

        public async Task<IEnumerable<T>> GetAllAsync(Expression<Func<T, bool>>? filter = null, string? includeProperties = null)
        {
            IQueryable<T> query = dbSet;

            if (filter != null)
            {
                query = query.Where(filter);
            }
            if (includeProperties != null)
            {
                foreach (var includeProp in includeProperties.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
                {
                    query = query.Include(includeProp.Trim());
                }
            }

            return await query.ToListAsync();
        }

        public async Task<T> GetAsync(Expression<Func<T, bool>> filter, string? includeProperties = null)
        {
            IQueryable<T> query = dbSet;

            if (!string.IsNullOrWhiteSpace(includeProperties))
            {
                foreach (var includeProp in includeProperties.Split(',', StringSplitOptions.RemoveEmptyEntries))
                {
                    query = query.Include(includeProp.Trim());
                }
            }

            return await query.FirstOrDefaultAsync()!;
        }


        public async Task<T> UpdateAsync(T entity)
        {
             _db.Update(entity);
            await _db.SaveChangesAsync();
            return entity;
        }
    }
}
