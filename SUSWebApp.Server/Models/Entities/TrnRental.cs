using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SUSWebApp.Server.Models.Entities
{
    /// <summary>
    /// 貸出トランザクションエンティティ
    /// 機器の貸出状況を管理
    /// </summary>
    [Table("TRN_RENTAL")]
    public class TrnRental
    {
        /// <summary>
        /// 貸出ID（主キー）
        /// 自動採番される一意識別子
        /// </summary>
        [Key]
        [Column("rental_id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RentalId { get; set; }

        /// <summary>
        /// 資産番号
        /// 貸出対象機器の識別子
        /// </summary>
        [Column("asset_no")]
        [MaxLength(20)]
        public string AssetNo { get; set; } = string.Empty;

        /// <summary>
        /// 社員番号（オプション）
        /// 借用者の識別子
        /// null：貸出なし
        /// </summary>
        [Column("employee_no")]
        [MaxLength(20)]
        public string? EmployeeNo { get; set; }

        /// <summary>
        /// 貸出日（オプション）
        /// 機器が貸し出された日
        /// </summary>
        [Column("rental_date")]
        public DateTime? RentalDate { get; set; }

        /// <summary>
        /// 返却日（オプション）
        /// 機器が返却された日
        /// null：未返却
        /// </summary>
        [Column("return_date")]
        public DateTime? ReturnDate { get; set; }

        /// <summary>
        /// 返却予定日（オプション）
        /// 返却期限
        /// </summary>
        [Column("due_date")]
        public DateTime? DueDate { get; set; }

        /// <summary>
        /// 棚卸日（オプション）
        /// 最後に確認された日時
        /// </summary>
        [Column("inventory_date")]
        public DateTime? InventoryDate { get; set; }

        /// <summary>
        /// 備考
        /// 貸出に関する特記事項
        /// </summary>
        [Column("remarks")]
        [MaxLength(255)]
        public string Remarks { get; set; } = string.Empty;

        /// <summary>
        /// 利用可能フラグ
        /// true：貸出可能、false：貸出中
        /// </summary>
        [Column("available_flag")]
        public bool AvailableFlag { get; set; } = true;  // デフォルト：貸出可能
    }
}