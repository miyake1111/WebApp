using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SUSWebApp.Server.Models.Entities
{
    /// <summary>
    /// 認証ユーザーエンティティ
    /// ログイン認証用のユーザー情報を管理
    /// </summary>
    [Table("AUTH_USER")]  // データベースのテーブル名を指定
    public class AuthUser
    {
        /// <summary>
        /// 社員番号（主キー）
        /// ユーザーの一意識別子
        /// </summary>
        [Key]                           // 主キーとして指定
        [Column("employee_no")]         // データベースのカラム名を指定
        [MaxLength(20)]                 // 最大文字数20文字
        public string EmployeeNo { get; set; } = string.Empty;  // デフォルト値：空文字列

        /// <summary>
        /// パスワード
        /// 注意：本番環境ではハッシュ化して保存すべき
        /// 現在は平文で保存（開発用）
        /// </summary>
        [Column("password")]            // データベースのカラム名を指定
        [MaxLength(50)]                 // 最大文字数50文字
        public string Password { get; set; } = string.Empty;  // デフォルト値：空文字列
    }
}