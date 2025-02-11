using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace LuluSPA.Models;

public partial class Booking
{
    [Key]
    public int BookingId { get; set; }

    [StringLength(50)]
    public string CustomerId { get; set; } = null!;

    public int ServiceId { get; set; }

    public int TherapistId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime StartTime { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime EndTime { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = null!;

    public string? Result { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreateDate { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdateDate { get; set; }

    [ForeignKey("CustomerId")]
    [InverseProperty("Bookings")]
    public virtual Customer Customer { get; set; } = null!;

    [InverseProperty("Booking")]
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    [ForeignKey("ServiceId")]
    [InverseProperty("Bookings")]
    public virtual Service Service { get; set; } = null!;

    [ForeignKey("TherapistId")]
    [InverseProperty("Bookings")]
    public virtual Therapist Therapist { get; set; } = null!;
}
