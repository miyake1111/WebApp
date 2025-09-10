using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SUSWebApp.Server.Models.Entities
{
    [Table("MST_USER")]
    public class MstUser
    {
        [Key]
        [Column("employee_no")]
        [MaxLength(20)]
        public string EmployeeNo { get; set; } = string.Empty;

        [Column("name")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Column("name_kana")]
        [MaxLength(100)]
        public string NameKana { get; set; } = string.Empty;

        [Column("department")]
        [MaxLength(100)]
        public string Department { get; set; } = string.Empty;

        [Column("phone_number")]  // ← "phone" から "phone_number" に変更
        [MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        [Column("email")]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Column("age")]
        public int Age { get; set; }

        [Column("gender")]
        [MaxLength(10)]
        public string Gender { get; set; } = string.Empty;  // int から string に変更

        [Column("position")]
        [MaxLength(50)]
        public string? Position { get; set; }

        [Column("pc_account_auth")]  // ← "pc_authority" から "pc_account_auth" に変更
        [MaxLength(20)]
        public string PcAuthority { get; set; } = "利用者";

        [Column("registration_date")]
        public DateTime RegistrationDate { get; set; }

        [Column("update_date")]
        public DateTime UpdateDate { get; set; }

        [Column("retirement_date")]
        public DateTime? RetirementDate { get; set; }

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;
    }
}