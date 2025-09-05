using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SUSWebApp.Server.Models.Entities
{
    [Table("HST_USER_CHANGE")]
    public class HstUserChange
    {
        [Key]
        [Column("change_id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ChangeId { get; set; }

        [Column("change_date")]
        public DateTime ChangeDate { get; set; }

        [Column("changed_by_employee_no")]
        [MaxLength(20)]
        public string ChangedByEmployeeNo { get; set; } = string.Empty;

        [Column("target_employee_no")]
        [MaxLength(20)]
        public string TargetEmployeeNo { get; set; } = string.Empty;

        [Column("change_field")]
        [MaxLength(100)]
        public string ChangeField { get; set; } = string.Empty;

        [Column("change_content")]
        [MaxLength(500)]
        public string ChangeContent { get; set; } = string.Empty;
    }
}