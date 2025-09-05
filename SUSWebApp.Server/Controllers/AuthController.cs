using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.ComponentModel.DataAnnotations;
using System.Data;

namespace SUSWebApp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly NpgsqlConnection _connection;

        public AuthController(NpgsqlConnection connection)
        {
            _connection = connection;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                await _connection.OpenAsync();

                // AUTH_USERテーブルでパスワード確認
                string authQuery = @"
                    SELECT employee_no 
                    FROM ""AUTH_USER"" 
                    WHERE employee_no = @employeeNo AND password = @password";

                using var authCmd = new NpgsqlCommand(authQuery, _connection);
                authCmd.Parameters.AddWithValue("employeeNo", request.EmployeeNo);
                authCmd.Parameters.AddWithValue("password", request.Password);

                var authResult = await authCmd.ExecuteScalarAsync();

                if (authResult == null)
                {
                    return BadRequest(new { message = "社員番号またはパスワードが正しくありません" });
                }

                // MST_USERテーブルからユーザー詳細情報を取得（カラム名を修正）
                string userQuery = @"
                    SELECT employee_no, name, department, position, pc_account_auth 
                    FROM ""MST_USER"" 
                    WHERE employee_no = @employeeNo AND is_deleted = false";

                using var userCmd = new NpgsqlCommand(userQuery, _connection);
                userCmd.Parameters.AddWithValue("employeeNo", request.EmployeeNo);

                using var reader = await userCmd.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    var userInfo = new
                    {
                        employeeNo = reader.GetString(0),
                        name = reader.GetString(1),
                        department = reader.GetString(2),
                        position = reader.GetString(3),
                        accountLevel = reader.GetString(4)  // pc_account_auth の値
                    };

                    return Ok(new
                    {
                        success = true,
                        message = "ログイン成功",
                        user = userInfo
                    });
                }
                else
                {
                    return BadRequest(new { message = "ユーザー情報が見つかりません" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"サーバーエラー: {ex.Message}" });
            }
            finally
            {
                await _connection.CloseAsync();
            }
        }

        [HttpGet("test")]
        public async Task<IActionResult> TestConnection()
        {
            try
            {
                using var connection = new NpgsqlConnection(_connection.ConnectionString);
                await connection.OpenAsync();

                var authCountCmd = new NpgsqlCommand(@"SELECT COUNT(*) FROM ""AUTH_USER""", connection);
                var authCount = await authCountCmd.ExecuteScalarAsync();

                var userCountCmd = new NpgsqlCommand(@"SELECT COUNT(*) FROM ""MST_USER"" WHERE is_deleted = false", connection);
                var userCount = await userCountCmd.ExecuteScalarAsync();

                return Ok(new
                {
                    authUsers = authCount,
                    activeUsers = userCount,
                    message = "データベース接続成功"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"データベース接続エラー: {ex.Message}" });
            }
        }
    }

    public class LoginRequest
    {
        [Required]
        public string EmployeeNo { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
