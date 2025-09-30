namespace SUSWebApp.Models.DTOs
{
    /// <summary>
    /// ログインレスポンス用のDTO
    /// 認証成功時にクライアントに返す情報
    /// JWT認証を想定した設計
    /// </summary>
    public class LoginResponseDto
    {
        /// <summary>
        /// JWTトークン
        /// クライアントはこのトークンを使用してAPIにアクセス
        /// Authorizationヘッダーに "Bearer {Token}" として設定
        /// デフォルト: 空文字列
        /// </summary>
        public string Token { get; set; } = string.Empty;

        /// <summary>
        /// トークンの有効期限
        /// この日時を過ぎるとトークンは無効になる
        /// クライアント側で期限切れチェックに使用
        /// </summary>
        public DateTime Expiration { get; set; }

        /// <summary>
        /// ログインユーザーの社員番号
        /// クライアント側でユーザー識別に使用
        /// デフォルト: 空文字列
        /// </summary>
        public string EmployeeNo { get; set; } = string.Empty;

        /// <summary>
        /// ログインユーザーの氏名
        /// 画面表示用
        /// デフォルト: 空文字列
        /// </summary>
        public string UserName { get; set; } = string.Empty;
    }
}