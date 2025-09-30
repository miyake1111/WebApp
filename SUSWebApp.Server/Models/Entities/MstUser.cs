using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SUSWebApp.Server.Models.Entities
{
    /// <summary>
    /// ユーザーマスタエンティティ
    /// システムユーザーの情報を管理
    /// </summary>
    [Table("MST_USER")]
    public class MstUser
    {
        /// <summary>
        /// 社員番号（主キー）
        /// 例："A1001", "B2002"
        /// </summary>
        [Key]
        [Column("employee_no")]
        [MaxLength(20)]
        public string EmployeeNo { get; set; } = string.Empty;

        /// <summary>
        /// 氏名
        /// 例："山田太郎"
        /// </summary>
        [Column("name")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// 氏名（カナ）
        /// 例："ヤマダタロウ"
        /// </summary>
        [Column("name_kana")]
        [MaxLength(100)]
        public string NameKana { get; set; } = string.Empty;

        /// <summary>
        /// 所属部署
        /// 例："開発1課", "営業部"
        /// </summary>
        [Column("department")]
        [MaxLength(100)]
        public string Department { get; set; } = string.Empty;

        /// <summary>
        /// 電話番号
        /// プロパティ名はPhoneだがDB列名はphone_number
        /// </summary>
        [Column("phone_number")]  // ← "phone" から "phone_number" に変更
        [MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        /// <summary>
        /// メールアドレス
        /// 例："yamada@example.com"
        /// </summary>
        [Column("email")]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// 年齢
        /// 数値で管理
        /// </summary>
        [Column("age")]
        public int Age { get; set; }

        /// <summary>
        /// 性別
        /// "男", "女"などの文字列で管理
        /// int から string に変更
        /// </summary>
        [Column("gender")]
        [MaxLength(10)]
        public string Gender { get; set; } = string.Empty;  // int から string に変更

        /// <summary>
        /// 役職（オプション）
        /// 例："一般", "課長", "部長"
        /// null許可
        /// </summary>
        [Column("position")]
        [MaxLength(50)]
        public string? Position { get; set; }

        /// <summary>
        /// PCアカウント権限
        /// 例："利用者", "管理者"
        /// プロパティ名はPcAuthorityだがDB列名はpc_account_auth
        /// </summary>
        [Column("pc_account_auth")]  // ← "pc_authority" から "pc_account_auth" に変更
        [MaxLength(20)]
        public string PcAuthority { get; set; } = "利用者";  // デフォルト：利用者

        /// <summary>
        /// 登録日
        /// 社員登録日
        /// </summary>
        [Column("registration_date")]
        public DateTime RegistrationDate { get; set; }

        /// <summary>
        /// 更新日時
        /// 最終更新日時
        /// </summary>
        [Column("update_date")]
        public DateTime UpdateDate { get; set; }

        /// <summary>
        /// 退職日（オプション）
        /// null：在籍中、日付あり：退職済み
        /// </summary>
        [Column("retirement_date")]
        public DateTime? RetirementDate { get; set; }

        /// <summary>
        /// 削除フラグ（論理削除）
        /// true：削除済み、false：有効
        /// </summary>
        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;  // デフォルト：有効
    }
}