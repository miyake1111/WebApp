using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SUSWebApp.Server.Models.Entities
{
    /// <summary>
    /// デバイス変更履歴エンティティ（正式版）
    /// より詳細な履歴管理用テーブル
    /// </summary>
    [Table("HST_DEVICE_CHANGE")]  // データベースのテーブル名を指定
    public class HstDeviceChange
    {
        /// <summary>
        /// 変更ID（主キー）
        /// 自動採番される一意識別子
        /// </summary>
        [Key]                                                    // 主キーとして指定
        [Column("change_id")]                                   // データベースのカラム名を指定
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]   // 自動採番設定
        public int ChangeId { get; set; }

        /// <summary>
        /// 変更日時
        /// 変更が行われた日時（UTC）
        /// </summary>
        [Column("change_date")]
        public DateTime ChangeDate { get; set; }

        /// <summary>
        /// 変更実行者の社員番号
        /// 変更を行ったユーザーの識別子
        /// </summary>
        [Column("changed_by_employee_no")]
        [MaxLength(20)]                                        // 最大文字数20文字
        public string ChangedByEmployeeNo { get; set; } = string.Empty;

        /// <summary>
        /// 資産番号
        /// 変更対象のデバイス識別子
        /// </summary>
        [Column("asset_no")]
        [MaxLength(20)]                                        // 最大文字数20文字
        public string AssetNo { get; set; } = string.Empty;

        /// <summary>
        /// 変更フィールド名
        /// 変更された項目名
        /// </summary>
        [Column("change_field")]
        [MaxLength(100)]                                       // 最大文字数100文字
        public string ChangeField { get; set; } = string.Empty;

        /// <summary>
        /// 変更内容詳細
        /// 変更前後の値や変更理由などを記録
        /// </summary>
        [Column("change_content")]
        [MaxLength(500)]                                       // 最大文字数500文字
        public string ChangeContent { get; set; } = string.Empty;
    }
}