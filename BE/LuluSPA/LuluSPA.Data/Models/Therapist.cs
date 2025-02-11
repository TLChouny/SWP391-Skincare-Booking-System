using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace LuluSPA.Models;

public partial class Therapist
{
    [Key]
    public int TherapistId { get; set; }

    [StringLength(50)]
    public string UserId { get; set; } = null!;

    [StringLength(100)]
    public string? Specialization { get; set; }

    [StringLength(100)]
    public string? Experience { get; set; }

    public string? AvailabilitySchedule { get; set; }

    [Column(TypeName = "decimal(3, 2)")]
    public decimal? Rating { get; set; }

    [Column("Created_at", TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at", TypeName = "datetime")]
    public DateTime? UpdatedAt { get; set; }

    [InverseProperty("Therapist")]
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    [InverseProperty("Therapist")]
    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    [ForeignKey("UserId")]
    [InverseProperty("Therapists")]
    public virtual User User { get; set; } = null!;
}
