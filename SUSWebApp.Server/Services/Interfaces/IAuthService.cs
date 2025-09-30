using SUSWebApp.Models.DTOs;
using SUSWebApp.Server.Models.DTOs;

namespace SUSWebApp.Services.Interfaces
{
    /// <summary>
    /// 認証サービスのインターフェース
    /// 認証処理の契約を定義
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// 非同期認証メソッド
        /// ユーザーの認証を行い、成功時はトークンを含むレスポンスを返す
        /// </summary>
        /// <param name="employeeNo">社員番号</param>
        /// <param name="password">パスワード（平文）</param>
        /// <returns>
        /// 認証成功時：LoginResponseDto（トークン、有効期限等）
        /// 認証失敗時：null
        /// </returns>
        Task<LoginResponseDto?> AuthenticateAsync(string employeeNo, string password);
    }
}