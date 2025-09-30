namespace SUSWebApp.Server.Models.Entities
{
    /// <summary>
    /// 貸出履歴エンティティ
    /// 貸出履歴の簡易ビュー用
    /// ApplicationDbContext内でカラムマッピングを定義
    /// </summary>
    public class RentalHistory
    {
        /// <summary>
        /// 履歴ID（主キー）
        /// 自動採番される一意識別子
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// 貸出日
        /// 機器が貸し出された日付
        /// </summary>
        public DateTime RentalDate { get; set; }

        /// <summary>
        /// 返却日（オプション）
        /// null：未返却、日付あり：返却済み
        /// </summary>
        public DateTime? ReturnDate { get; set; }

        /// <summary>
        /// 借用者の社員番号
        /// 例："A1001"
        /// </summary>
        public string EmployeeNo { get; set; }

        /// <summary>
        /// 資産番号
        /// 貸し出された機器の識別子
        /// </summary>
        public string AssetNo { get; set; }

        /// <summary>
        /// OS名
        /// 貸し出された機器のOS
        /// </summary>
        public string Os { get; set; }
    }
}