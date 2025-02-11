using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace LuluSPA.Models;

[Table("Blog")]
public partial class Blog
{
    [Key]
    public int BlogId { get; set; }

    [StringLength(255)]
    public string Title { get; set; } = null!;

    public string Content { get; set; } = null!;

    [StringLength(50)]
    public string AuthorId { get; set; } = null!;

    [Column(TypeName = "datetime")]
    public DateTime? CreateDate { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdateDate { get; set; }

    [ForeignKey("AuthorId")]
    [InverseProperty("Blogs")]
    public virtual User Author { get; set; } = null!;
}
