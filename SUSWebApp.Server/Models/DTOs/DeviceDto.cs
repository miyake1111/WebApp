namespace SUSWebApp.Server.Models.Dto
{
    /// <summary>
    /// デバイス新規作成用のDTO (Data Transfer Object)
    /// クライアントからのデバイス登録リクエストを受け取る
    /// </summary>
    public class DeviceCreateDto
    {
        /// <summary>
        /// 資産番号（必須）
        /// 例: "A19-06-001"
        /// </summary>
        public string AssetNo { get; set; }

        /// <summary>
        /// メーカー名（オプション）
        /// 例: "Dell", "HP", "Lenovo"
        /// </summary>
        public string? Manufacturer { get; set; }

        /// <summary>
        /// OS名（オプション）
        /// 例: "Windows 11", "Windows 10", "macOS"
        /// </summary>
        public string? Os { get; set; }

        /// <summary>
        /// メモリ容量（GB単位）
        /// 例: 8, 16, 32
        /// </summary>
        public int Memory { get; set; }

        /// <summary>
        /// ストレージ容量（GB単位）
        /// 例: 256, 512, 1024
        /// </summary>
        public int Storage { get; set; }

        /// <summary>
        /// グラフィックカード名（オプション）
        /// 例: "NVIDIA GeForce RTX 3060", "Intel UHD Graphics"
        /// </summary>
        public string? GraphicsCard { get; set; }

        /// <summary>
        /// 保管場所（オプション）
        /// 例: "3F倉庫", "サーバールーム", "管理部"
        /// </summary>
        public string? StorageLocation { get; set; }

        /// <summary>
        /// 故障フラグ
        /// true: 故障中、false: 正常
        /// </summary>
        public bool IsBroken { get; set; }

        /// <summary>
        /// リース開始日（オプション）
        /// リース契約がある場合の開始日
        /// </summary>
        public DateTime? LeaseStartDate { get; set; }

        /// <summary>
        /// リース終了日（オプション）
        /// リース契約がある場合の終了日
        /// </summary>
        public DateTime? LeaseEndDate { get; set; }

        /// <summary>
        /// 備考（オプション）
        /// その他の特記事項
        /// </summary>
        public string? Remarks { get; set; }
    }

    /// <summary>
    /// デバイス更新用のDTO
    /// 既存デバイスの情報更新リクエストを受け取る
    /// AssetNo（資産番号）は変更不可のため含まれない
    /// </summary>
    public class DeviceUpdateDto
    {
        /// <summary>
        /// メーカー名（オプション）
        /// nullの場合は更新しない
        /// </summary>
        public string? Manufacturer { get; set; }

        /// <summary>
        /// OS名（オプション）
        /// nullの場合は更新しない
        /// </summary>
        public string? Os { get; set; }

        /// <summary>
        /// メモリ容量（GB単位）
        /// 0の場合でも更新される
        /// </summary>
        public int Memory { get; set; }

        /// <summary>
        /// ストレージ容量（GB単位）
        /// 0の場合でも更新される
        /// </summary>
        public int Storage { get; set; }

        /// <summary>
        /// グラフィックカード名（オプション）
        /// nullの場合は更新しない
        /// </summary>
        public string? GraphicsCard { get; set; }

        /// <summary>
        /// 保管場所（オプション）
        /// nullの場合は更新しない
        /// </summary>
        public string? StorageLocation { get; set; }

        /// <summary>
        /// 故障フラグ
        /// 必ず値が設定される（更新される）
        /// </summary>
        public bool IsBroken { get; set; }

        /// <summary>
        /// リース開始日（オプション）
        /// nullの場合はクリアされる
        /// </summary>
        public DateTime? LeaseStartDate { get; set; }

        /// <summary>
        /// リース終了日（オプション）
        /// nullの場合はクリアされる
        /// </summary>
        public DateTime? LeaseEndDate { get; set; }

        /// <summary>
        /// 備考（オプション）
        /// nullの場合はクリアされる
        /// </summary>
        public string? Remarks { get; set; }
    }
}