using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.ComponentModel.DataAnnotations;

namespace SUSWebApp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly string _connectionString;

        public AuthController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ??
                throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();

                // AUTH_USER�e�[�u���Ńp�X���[�h�m�F
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
                        return BadRequest(new { message = "�Ј��ԍ���������܂���" });
                    }
                    dbPassword = authReader["password"]?.ToString();
                }

                // �p�X���[�h�̌���
                if (string.IsNullOrEmpty(dbPassword) || dbPassword != request.Password)
                {
                    return BadRequest(new { message = "�p�X���[�h������������܂���" });
                }

                // MST_USER�e�[�u�����烆�[�U�[�ڍ׏����擾�i�������J�������ɏC���j
                string userQuery = @"
            SELECT employee_no, name, department, position, pc_account_auth 
            FROM ""MST_USER"" 
            WHERE employee_no = @employeeNo 
            AND is_deleted = false";  // �� �������C��

                using var userCmd = new NpgsqlCommand(userQuery, connection);
                userCmd.Parameters.AddWithValue("@employeeNo", request.EmployeeNo);

                using var reader = await userCmd.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    var userInfo = new
                    {
                        employeeNo = reader["employee_no"]?.ToString() ?? "",
                        name = reader["name"]?.ToString() ?? "",
                        department = reader["department"]?.ToString() ?? "",
                        position = reader["position"]?.ToString() ?? "",
                        accountLevel = reader["pc_account_auth"]?.ToString() ?? ""
                    };

                    return Ok(new
                    {
                        success = true,
                        message = "���O�C������",
                        user = userInfo
                    });
                }
                else
                {
                    return BadRequest(new { message = "���[�U�[��񂪌�����܂���" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"���O�C���G���[: {ex.Message}");
                return StatusCode(500, new { message = $"�T�[�o�[�G���[: {ex.Message}" });
            }
        }

        [HttpGet("test")]
        public async Task<IActionResult> TestConnection()
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();

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

                return Ok(new
                {
                    message = "�ڑ�����",
                    existingTables = tables
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"�ڑ��G���[: {ex.Message}" });
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