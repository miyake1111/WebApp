namespace SUSWebApp.Server.Utilities
{
    /// <summary>
    /// パスワード処理用ヘルパークラス
    /// BCryptを使用したパスワードのハッシュ化と検証
    /// </summary>
    public static class PasswordHelper
    {
        /// <summary>
        /// パスワードをハッシュ化
        /// BCrypt.Netを使用してセキュアなハッシュを生成
        /// </summary>
        /// <param name="plain">平文パスワード</param>
        /// <returns>ハッシュ化されたパスワード（salt込み）</returns>
        public static string Hash(string plain) => BCrypt.Net.BCrypt.HashPassword(plain);

        /// <summary>
        /// パスワードの検証
        /// 平文パスワードとハッシュ値を比較
        /// </summary>
        /// <param name="plain">検証する平文パスワード</param>
        /// <param name="hash">保存されているハッシュ値</param>
        /// <returns>true：一致、false：不一致</returns>
        public static bool Verify(string plain, string hash) => BCrypt.Net.BCrypt.Verify(plain, hash);
    }
}