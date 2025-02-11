using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace LuluSPA.Models;

public partial class Service
{
    [Key]
    [Column("service_id")]
    public int ServiceId { get; set; }

    [Column("name")]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [Column("description")]
    public string? Description { get; set; }

    [Column("price", TypeName = "decimal(10, 2)")]
    public decimal Price { get; set; }

    [Column("duration")]
    public int Duration { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreateDate { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdateDate { get; set; }

    [InverseProperty("Service")]
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    [InverseProperty("Service")]
    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
}
