using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SUSWebApp.Server.Models.Entities
{
    [Table("MST_DEVICE")]
    public class MstDevice
    {
        [Key]
        [Column("asset_no")]
        [MaxLength(20)]
        public string AssetNo { get; set; } = string.Empty;

        [Column("manufacturer")]
        [MaxLength(100)]
        public string Manufacturer { get; set; } = string.Empty;

        [Column("os")]
        [MaxLength(100)]
        public string Os { get; set; } = string.Empty;

        [Column("memory")]
        public int Memory { get; set; }

        [Column("storage")]
        public int Storage { get; set; }

        [Column("graphics_card")]
        [MaxLength(100)]
        public string GraphicsCard { get; set; } = string.Empty;

        [Column("storage_location")]
        [MaxLength(100)]
        public string StorageLocation { get; set; } = string.Empty;

        [Column("is_broken")]
        public bool IsBroken { get; set; } = false;

        [Column("lease_start_date")]
        public DateTime? LeaseStartDate { get; set; }

        [Column("lease_end_date")]
        public DateTime? LeaseEndDate { get; set; }

        [Column("remarks")]
        [MaxLength(255)]
        public string Remarks { get; set; } = string.Empty;

        [Column("registration_date")]
        public DateTime RegistrationDate { get; set; }

        [Column("update_date")]
        public DateTime UpdateDate { get; set; }

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;
    }
}