using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SUSWebApp.Server.Models.Entities
{
    /// <summary>
    /// デバイスマスタエンティティ
    /// 管理対象の機器情報を保持
    /// </summary>
    [Table("MST_DEVICE")]
    public class MstDevice
    {
        /// <summary>
        /// 資産番号（主キー）
        /// 例："A19-06-001"
        /// </summary>
        [Key]
        [Column("asset_no")]
        [MaxLength(20)]
        public string AssetNo { get; set; } = string.Empty;

        /// <summary>
        /// メーカー名
        /// 例："Dell", "HP", "Lenovo"
        /// </summary>
        [Column("manufacturer")]
        [MaxLength(100)]
        public string Manufacturer { get; set; } = string.Empty;

        /// <summary>
        /// OS名
        /// 例："Windows 11", "Windows 10"
        /// </summary>
        [Column("os")]
        [MaxLength(100)]
        public string Os { get; set; } = string.Empty;

        /// <summary>
        /// メモリ容量（GB）
        /// 例：8, 16, 32
        /// </summary>
        [Column("memory")]
        public int Memory { get; set; }

        /// <summary>
        /// ストレージ容量（GB）
        /// 例：256, 512, 1024
        /// </summary>
        [Column("storage")]
        public int Storage { get; set; }

        /// <summary>
        /// グラフィックカード名
        /// 例："NVIDIA RTX 3060", "Intel UHD"
        /// </summary>
        [Column("graphics_card")]
        [MaxLength(100)]
        public string GraphicsCard { get; set; } = string.Empty;

        /// <summary>
        /// 保管場所
        /// 例："3F倉庫", "サーバールーム"
        /// </summary>
        [Column("storage_location")]
        [MaxLength(100)]
        public string StorageLocation { get; set; } = string.Empty;

        /// <summary>
        /// 故障フラグ
        /// true：故障中、false：正常
        /// </summary>
        [Column("is_broken")]
        public bool IsBroken { get; set; } = false;  // デフォルト：正常

        /// <summary>
        /// リース開始日（オプション）
        /// リース契約がある場合の開始日
        /// </summary>
        [Column("lease_start_date")]
        public DateTime? LeaseStartDate { get; set; }

        /// <summary>
        /// リース終了日（オプション）
        /// リース契約がある場合の終了日
        /// </summary>
        [Column("lease_end_date")]
        public DateTime? LeaseEndDate { get; set; }

        /// <summary>
        /// 備考（オプション）
        /// その他の特記事項
        /// null許可に変更（?を追加）
        /// </summary>
        [Column("remarks")]
        [MaxLength(255)]
        public string? Remarks { get; set; }  // ← null許可に変更（?を追加）

        /// <summary>
        /// 登録日時
        /// レコード作成時に設定
        /// </summary>
        [Column("registration_date")]
        public DateTime RegistrationDate { get; set; }

        /// <summary>
        /// 更新日時
        /// レコード更新時に更新
        /// </summary>
        [Column("update_date")]
        public DateTime UpdateDate { get; set; }

        /// <summary>
        /// 削除フラグ（論理削除）
        /// true：削除済み、false：有効
        /// </summary>
        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;  // デフォルト：有効
    }
}