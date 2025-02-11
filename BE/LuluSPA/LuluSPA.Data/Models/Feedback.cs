using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace LuluSPA.Models;

public partial class Feedback
{
    [Key]
    public int FeedbackId { get; set; }

    [StringLength(50)]
    public string CustomerId { get; set; } = null!;

    public int TherapistId { get; set; }

    public int ServiceId { get; set; }

    [Column(TypeName = "decimal(3, 2)")]
    public decimal Rating { get; set; }

    public string? Comment { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreateDate { get; set; }

    [ForeignKey("CustomerId")]
    [InverseProperty("Feedbacks")]
    public virtual Customer Customer { get; set; } = null!;

    [ForeignKey("ServiceId")]
    [InverseProperty("Feedbacks")]
    public virtual Service Service { get; set; } = null!;

    [ForeignKey("TherapistId")]
    [InverseProperty("Feedbacks")]
    public virtual Therapist Therapist { get; set; } = null!;
}
