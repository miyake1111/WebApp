// 名前空間の定義 - 設定関連クラスを配置
namespace SUSWebApp.Server.Configuration
{
    /// <summary>
    /// JWT（JSON Web Token）認証の設定クラス
    /// appsettings.jsonから設定値を読み込むためのPOCO（Plain Old CLR Object）
    /// </summary>
    public class JwtSettings
    {
        /// <summary>
        /// トークン発行者（Issuer）
        /// トークンを発行したサーバーやサービスを識別する文字列
        /// 例: "https://localhost:61319" または "SUSWebApp"
        /// </summary>
        public string Issuer { get; set; } = string.Empty;

        /// <summary>
        /// トークン受信者（Audience）
        /// このトークンを使用することが想定されているクライアントを識別する文字列
        /// 例: "https://localhost:61317" または "SUSWebApp.Client"
        /// </summary>
        public string Audience { get; set; } = string.Empty;

        /// <summary>
        /// 秘密鍵（Secret Key）
        /// トークンの署名と検証に使用される秘密の文字列
        /// 最低256ビット（32文字）以上の複雑な文字列を推奨
        /// 本番環境では環境変数やAzure Key Vaultなどで管理すべき
        /// </summary>
        public string SecretKey { get; set; } = string.Empty;

        /// <summary>
        /// トークン有効期限（分）
        /// トークンが発行されてから有効な時間（分単位）
        /// デフォルト: 60分（1時間）
        /// セキュリティと利便性のバランスを考慮して設定
        /// </summary>
        public int ExpireMinutes { get; set; } = 60;
    }
}

/**
 * JwtSettingsクラスの使用方法：
 * 
 * 1. appsettings.jsonでの設定例:
 * {
 *   "JwtSettings": {
 *     "Issuer": "SUSWebApp",
 *     "Audience": "SUSWebApp.Client",
 *     "SecretKey": "ThisIsASecretKeyForJWTTokenGenerationMin32Chars!",
 *     "ExpireMinutes": 60
 *   }
 * }
 * 
 * 2. Program.csでの登録:
 * builder.Services.Configure<JwtSettings>(
 *     builder.Configuration.GetSection("JwtSettings"));
 * 
 * 3. 使用例（依存性注入）:
 * public class AuthService
 * {
 *     private readonly JwtSettings _jwtSettings;
 *     
 *     public AuthService(IOptions<JwtSettings> jwtSettings)
 *     {
 *         _jwtSettings = jwtSettings.Value;
 *     }
 * }
 * 
 * セキュリティ上の注意点：
 * - SecretKeyは本番環境では環境変数やシークレット管理サービスで管理
 * - 開発環境と本番環境で異なるキーを使用
 * - キーは定期的にローテーション（更新）する
 * - HTTPSでの通信を必須とする
 */

/**
 * JWTトークンの構成要素：
 * 
 * 1. ヘッダー（Header）
 *    - alg: 署名アルゴリズム（例: HS256）
 *    - typ: トークンタイプ（JWT）
 * 
 * 2. ペイロード（Payload）
 *    - iss: Issuer（発行者）
 *    - aud: Audience（受信者）
 *    - exp: Expiration Time（有効期限）
 *    - sub: Subject（ユーザーID等）
 *    - カスタムクレーム（権限、役割等）
 * 
 * 3. 署名（Signature）
 *    - SecretKeyを使用して生成
 *    - トークンの改ざんを防ぐ
 */