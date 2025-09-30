namespace SUSWebApp.Server.Models.DTOs
{
    /// <summary>
    /// 貸出履歴用のDTO
    /// 貸出履歴一覧画面で使用するデータモデル
    /// </summary>
    public class RentalHistoryDto
    {
        /// <summary>
        /// 履歴ID（主キー）
        /// データベースで自動採番される一意の識別子
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// 貸出日
        /// デバイスが貸し出された日付
        /// </summary>
        public DateTime RentalDate { get; set; }

        /// <summary>
        /// 返却日（オプション）
        /// null: 未返却（貸出中）
        /// 値あり: 返却済み
        /// </summary>
        public DateTime? ReturnDate { get; set; }

        /// <summary>
        /// 借用者の社員番号
        /// 例: "A1001"
        /// </summary>
        public string EmployeeNo { get; set; }

        /// <summary>
        /// 借用者の氏名
        /// 表示用の日本語名
        /// 例: "山田太郎"
        /// </summary>
        public string EmployeeName { get; set; }

        /// <summary>
        /// 借用者の氏名（カナ）
        /// カタカナ表記の氏名
        /// 例: "ヤマダタロウ"
        /// </summary>
        public string EmployeeNameKana { get; set; }

        /// <summary>
        /// 資産番号
        /// 貸し出されたデバイスの識別番号
        /// 例: "A19-06-001"
        /// </summary>
        public string AssetNo { get; set; }

        /// <summary>
        /// OS名
        /// 貸し出されたデバイスのOS
        /// 例: "Windows 11", "Windows 10"
        /// </summary>
        public string Os { get; set; }
    }
}