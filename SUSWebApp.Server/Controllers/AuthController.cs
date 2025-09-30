using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.ComponentModel.DataAnnotations;

namespace SUSWebApp.Server.Controllers
{
    /// <summary>
    /// 認証関連のAPIコントローラー
    /// ログイン処理とデータベース接続テストを提供
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]  // URLパス: /api/auth
    public class AuthController : ControllerBase
    {
        // データベース接続文字列
        private readonly string _connectionString;

        /// <summary>
        /// コンストラクタ - 依存性注入で設定を受け取る
        /// </summary>
        /// <param name="configuration">アプリケーション設定</param>
        public AuthController(IConfiguration configuration)
        {
            // appsettings.jsonから接続文字列を取得
            _connectionString = configuration.GetConnectionString("DefaultConnection") ??
                throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        /// <summary>
        /// ログイン処理
        /// POST: /api/auth/login
        /// </summary>
        /// <param name="request">ログインリクエスト（社員番号とパスワード）</param>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                // PostgreSQLへの接続を作成
                using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();

                // ===== STEP 1: AUTH_USERテーブルでパスワード確認 =====
                string authQuery = @"
            SELECT employee_no, password 
            FROM ""AUTH_USER"" 
            WHERE employee_no = @employeeNo";

                using var authCmd = new NpgsqlCommand(authQuery, connection);
                authCmd.Parameters.AddWithValue("@employeeNo", request.EmployeeNo);

                string? dbPassword = null;
                using (var authReader = await authCmd.ExecuteReaderAsync())
                {
                    if (!await authReader.ReadAsync())
                    {
                        // ユーザーが存在しない
                        return BadRequest(new { message = "社員番号が見つかりません" });
                    }
                    dbPassword = authReader["password"]?.ToString();
                }

                // ===== STEP 2: パスワードの検証 =====
                // 注意：本番環境では必ずハッシュ化されたパスワードを使用すべき
                if (string.IsNullOrEmpty(dbPassword) || dbPassword != request.Password)
                {
                    return BadRequest(new { message = "パスワードが正しくありません" });
                }

                // ===== STEP 3: MST_USERテーブルからユーザー詳細情報を取得 =====
                string userQuery = @"
            SELECT employee_no, name, department, position, pc_account_auth 
            FROM ""MST_USER"" 
            WHERE employee_no = @employeeNo 
            AND is_deleted = false";  // 削除されていないユーザーのみ

                using var userCmd = new NpgsqlCommand(userQuery, connection);
                userCmd.Parameters.AddWithValue("@employeeNo", request.EmployeeNo);

                using var reader = await userCmd.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    // ユーザー情報を匿名型オブジェクトとして作成
                    var userInfo = new
                    {
                        employeeNo = reader["employee_no"]?.ToString() ?? "",
                        name = reader["name"]?.ToString() ?? "",
                        department = reader["department"]?.ToString() ?? "",
                        position = reader["position"]?.ToString() ?? "",
                        accountLevel = reader["pc_account_auth"]?.ToString() ?? ""  // 権限レベル
                    };

                    // ログイン成功レスポンス
                    return Ok(new
                    {
                        success = true,
                        message = "ログイン成功",
                        user = userInfo
                    });
                }
                else
                {
                    // ユーザー情報が見つからない（通常は発生しないはず）
                    return BadRequest(new { message = "ユーザー情報が見つかりません" });
                }
            }
            catch (Exception ex)
            {
                // エラーログ出力とエラーレスポンス
                Console.WriteLine($"ログインエラー: {ex.Message}");
                return StatusCode(500, new { message = $"サーバーエラー: {ex.Message}" });
            }
        }

        /// <summary>
        /// データベース接続テスト
        /// GET: /api/auth/test
        /// テーブルの存在確認に使用
        /// </summary>
        [HttpGet("test")]
        public async Task<IActionResult> TestConnection()
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();

                // AUTH_USERとMST_USERテーブルの存在を確認
                var checkTablesQuery = @"
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name IN ('AUTH_USER', 'MST_USER')";

                using var cmd = new NpgsqlCommand(checkTablesQuery, connection);
                using var reader = await cmd.ExecuteReaderAsync();

                var tables = new List<string>();
                while (await reader.ReadAsync())
                {
                    var tableName = reader["table_name"]?.ToString();
                    if (!string.IsNullOrEmpty(tableName))
                    {
                        tables.Add(tableName);
                    }
                }

                // 接続成功と存在するテーブルのリストを返す
                return Ok(new
                {
                    message = "接続成功",
                    existingTables = tables
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"接続エラー: {ex.Message}" });
            }
        }
    }

    /// <summary>
    /// ログインリクエストモデル
    /// </summary>
    public class LoginRequest
    {
        /// <summary>
        /// 社員番号（必須）
        /// </summary>
        [Required]
        public string EmployeeNo { get; set; } = string.Empty;

        /// <summary>
        /// パスワード（必須）
        /// </summary>
        [Required]
        public string Password { get; set; } = string.Empty;
    }
}