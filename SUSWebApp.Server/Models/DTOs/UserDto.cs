namespace SUSWebApp.Server.Models.Dto
{
    /// <summary>
    /// ユーザー新規作成用のDTO
    /// ユーザー登録時のリクエストデータを受け取る
    /// </summary>
    public class UserCreateDto
    {
        /// <summary>
        /// 社員番号（必須）
        /// 一意の識別子、変更不可
        /// 例: "A1001", "B2002"
        /// </summary>
        public string EmployeeNo { get; set; }

        /// <summary>
        /// 氏名（オプション）
        /// 日本語の氏名
        /// 例: "山田太郎"
        /// </summary>
        public string? Name { get; set; }

        /// <summary>
        /// 氏名カナ（オプション）
        /// カタカナ表記の氏名
        /// 例: "ヤマダタロウ"
        /// </summary>
        public string? NameKana { get; set; }

        /// <summary>
        /// 所属部署（オプション）
        /// 例: "開発1課", "営業部", "管理部"
        /// </summary>
        public string? Department { get; set; }

        /// <summary>
        /// 電話番号（オプション）
        /// 例: "09012345678", "03-1234-5678"
        /// </summary>
        public string? Phone { get; set; }

        /// <summary>
        /// メールアドレス（オプション）
        /// 例: "yamada@example.com"
        /// </summary>
        public string? Email { get; set; }

        /// <summary>
        /// 年齢
        /// 数値で指定、デフォルトは0
        /// </summary>
        public int Age { get; set; }

        /// <summary>
        /// 性別（オプション）
        /// 文字列で指定："男", "女", など
        /// データベースの設計に合わせて string型を使用
        /// </summary>
        public string? Gender { get; set; }  // そのまま string

        /// <summary>
        /// 役職（オプション）
        /// 例: "一般", "課長", "部長"
        /// </summary>
        public string? Position { get; set; }

        /// <summary>
        /// PCアカウント権限（オプション）
        /// 例: "利用者", "管理者"
        /// </summary>
        public string? PcAuthority { get; set; }

        /// <summary>
        /// 登録日（オプション）
        /// 社員の登録日
        /// nullの場合は現在日時が設定される
        /// </summary>
        public DateTime? RegistrationDate { get; set; }

        /// <summary>
        /// 退職日（オプション）
        /// null: 在籍中
        /// 値あり: 退職済み
        /// </summary>
        public DateTime? RetirementDate { get; set; }
    }

    /// <summary>
    /// ユーザー更新用のDTO
    /// 既存ユーザーの情報更新リクエストを受け取る
    /// EmployeeNo（社員番号）は変更不可のため含まれない
    /// </summary>
    public class UserUpdateDto
    {
        /// <summary>
        /// 氏名（オプション）
        /// nullの場合は更新しない
        /// </summary>
        public string? Name { get; set; }

        /// <summary>
        /// 氏名カナ（オプション）
        /// nullの場合は更新しない
        /// </summary>
        public string? NameKana { get; set; }

        /// <summary>
        /// 所属部署（オプション）
        /// nullの場合は更新しない
        /// </summary>
        public string? Department { get; set; }

        /// <summary>
        /// 電話番号（オプション）
        /// nullの場合は更新しない
        /// </summary>
        public string? Phone { get; set; }

        /// <summary>
        /// メールアドレス（オプション）
        /// nullの場合は更新しない
        /// </summary>
        public string? Email { get; set; }

        /// <summary>
        /// 年齢
        /// 0の場合でも更新される
        /// </summary>
        public int Age { get; set; }

        /// <summary>
        /// 性別（オプション）
        /// nullの場合は更新しない
        /// データベースの設計に合わせて string型を使用
        /// </summary>
        public string? Gender { get; set; }  // そのまま string

        /// <summary>
        /// 役職（オプション）
        /// nullの場合は更新しない
        /// </summary>
        public string? Position { get; set; }

        /// <summary>
        /// PCアカウント権限（オプション）
        /// nullの場合は更新しない
        /// </summary>
        public string? PcAuthority { get; set; }

        /// <summary>
        /// 退職日（オプション）
        /// 退職処理時に設定
        /// nullにすると在籍中に戻る
        /// </summary>
        public DateTime? RetirementDate { get; set; }
    }
}