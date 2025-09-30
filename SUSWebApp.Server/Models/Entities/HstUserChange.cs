using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SUSWebApp.Server.Models.Entities
{
    /// <summary>
    /// ユーザー変更履歴エンティティ
    /// ユーザー情報の変更履歴を管理
    /// </summary>
    [Table("HST_USER_CHANGE")]  // データベースのテーブル名を指定
    public class HstUserChange
    {
        /// <summary>
        /// 変更ID（主キー）
        /// 自動採番される一意識別子
        /// </summary>
        [Key]
        [Column("change_id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
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
        [MaxLength(20)]
        public string ChangedByEmployeeNo { get; set; } = string.Empty;

        /// <summary>
        /// 変更対象の社員番号
        /// 情報が変更されたユーザーの識別子
        /// </summary>
        [Column("target_employee_no")]
        [MaxLength(20)]
        public string TargetEmployeeNo { get; set; } = string.Empty;

        /// <summary>
        /// 変更フィールド名
        /// 例："氏名", "部署", "役職", "削除"
        /// </summary>
        [Column("change_field")]
        [MaxLength(100)]
        public string ChangeField { get; set; } = string.Empty;

        /// <summary>
        /// 変更内容詳細
        /// 例："営業部 → 開発部", "一般 → 課長"
        /// </summary>
        [Column("change_content")]
        [MaxLength(500)]
        public string ChangeContent { get; set; } = string.Empty;
    }
}