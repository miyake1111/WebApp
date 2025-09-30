namespace SUSWebApp.Server.Models.DTOs
{
    /// <summary>
    /// ログインリクエスト用のDTO
    /// クライアントからの認証情報を受け取る
    /// </summary>
    public class LoginRequestDto
    {
        /// <summary>
        /// 社員番号
        /// 例: "A1001", "B2002"
        /// デフォルト: 空文字列
        /// </summary>
        public string EmployeeNo { get; set; } = string.Empty;

        /// <summary>
        /// パスワード
        /// 平文で受け取るが、サーバー側でハッシュ化すべき
        /// デフォルト: 空文字列
        /// </summary>
        public string Password { get; set; } = string.Empty;
    }
}