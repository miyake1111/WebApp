using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SUSWebApp.Server.Models.Entities
{
    [Table("AUTH_USER")]
    public class AuthUser
    {
        [Key]
        [Column("employee_no")]
        [MaxLength(20)]
        public string EmployeeNo { get; set; } = string.Empty;

        [Column("password")]
        [MaxLength(50)]
        public string Password { get; set; } = string.Empty;
    }
}