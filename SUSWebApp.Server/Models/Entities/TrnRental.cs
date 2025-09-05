using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SUSWebApp.Server.Models.Entities
{
    [Table("TRN_RENTAL")]
    public class TrnRental
    {
        [Key]
        [Column("rental_id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RentalId { get; set; }

        [Column("asset_no")]
        [MaxLength(20)]
        public string AssetNo { get; set; } = string.Empty;

        [Column("employee_no")]
        [MaxLength(20)]
        public string? EmployeeNo { get; set; }

        [Column("rental_date")]
        public DateTime? RentalDate { get; set; }

        [Column("return_date")]
        public DateTime? ReturnDate { get; set; }

        [Column("due_date")]
        public DateTime? DueDate { get; set; }

        [Column("inventory_date")]
        public DateTime? InventoryDate { get; set; }

        [Column("remarks")]
        [MaxLength(255)]
        public string Remarks { get; set; } = string.Empty;

        [Column("available_flag")]
        public bool AvailableFlag { get; set; } = true;
    }
}