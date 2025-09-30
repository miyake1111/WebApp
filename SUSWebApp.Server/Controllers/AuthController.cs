using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.ComponentModel.DataAnnotations;

namespace SUSWebApp.Server.Controllers
{
    /// <summary>
    /// �F�؊֘A��API�R���g���[���[
    /// ���O�C�������ƃf�[�^�x�[�X�ڑ��e�X�g���
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]  // URL�p�X: /api/auth
    public class AuthController : ControllerBase
    {
        // �f�[�^�x�[�X�ڑ�������
        private readonly string _connectionString;

        /// <summary>
        /// �R���X�g���N�^ - �ˑ��������Őݒ���󂯎��
        /// </summary>
        /// <param name="configuration">�A�v���P�[�V�����ݒ�</param>
        public AuthController(IConfiguration configuration)
        {
            // appsettings.json����ڑ���������擾
            _connectionString = configuration.GetConnectionString("DefaultConnection") ??
                throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        /// <summary>
        /// ���O�C������
        /// POST: /api/auth/login
        /// </summary>
        /// <param name="request">���O�C�����N�G�X�g�i�Ј��ԍ��ƃp�X���[�h�j</param>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                // PostgreSQL�ւ̐ڑ����쐬
                using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();

                // ===== STEP 1: AUTH_USER�e�[�u���Ńp�X���[�h�m�F =====
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
                        // ���[�U�[�����݂��Ȃ�
                        return BadRequest(new { message = "�Ј��ԍ���������܂���" });
                    }
                    dbPassword = authReader["password"]?.ToString();
                }

                // ===== STEP 2: �p�X���[�h�̌��� =====
                // ���ӁF�{�Ԋ��ł͕K���n�b�V�������ꂽ�p�X���[�h���g�p���ׂ�
                if (string.IsNullOrEmpty(dbPassword) || dbPassword != request.Password)
                {
                    return BadRequest(new { message = "�p�X���[�h������������܂���" });
                }

                // ===== STEP 3: MST_USER�e�[�u�����烆�[�U�[�ڍ׏����擾 =====
                string userQuery = @"
            SELECT employee_no, name, department, position, pc_account_auth 
            FROM ""MST_USER"" 
            WHERE employee_no = @employeeNo 
            AND is_deleted = false";  // �폜����Ă��Ȃ����[�U�[�̂�

                using var userCmd = new NpgsqlCommand(userQuery, connection);
                userCmd.Parameters.AddWithValue("@employeeNo", request.EmployeeNo);

                using var reader = await userCmd.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    // ���[�U�[���𓽖��^�I�u�W�F�N�g�Ƃ��č쐬
                    var userInfo = new
                    {
                        employeeNo = reader["employee_no"]?.ToString() ?? "",
                        name = reader["name"]?.ToString() ?? "",
                        department = reader["department"]?.ToString() ?? "",
                        position = reader["position"]?.ToString() ?? "",
                        accountLevel = reader["pc_account_auth"]?.ToString() ?? ""  // �������x��
                    };

                    // ���O�C���������X�|���X
                    return Ok(new
                    {
                        success = true,
                        message = "���O�C������",
                        user = userInfo
                    });
                }
                else
                {
                    // ���[�U�[��񂪌�����Ȃ��i�ʏ�͔������Ȃ��͂��j
                    return BadRequest(new { message = "���[�U�[��񂪌�����܂���" });
                }
            }
            catch (Exception ex)
            {
                // �G���[���O�o�͂ƃG���[���X�|���X
                Console.WriteLine($"���O�C���G���[: {ex.Message}");
                return StatusCode(500, new { message = $"�T�[�o�[�G���[: {ex.Message}" });
            }
        }

        /// <summary>
        /// �f�[�^�x�[�X�ڑ��e�X�g
        /// GET: /api/auth/test
        /// �e�[�u���̑��݊m�F�Ɏg�p
        /// </summary>
        [HttpGet("test")]
        public async Task<IActionResult> TestConnection()
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();

                // AUTH_USER��MST_USER�e�[�u���̑��݂��m�F
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

                // �ڑ������Ƒ��݂���e�[�u���̃��X�g��Ԃ�
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

    /// <summary>
    /// ���O�C�����N�G�X�g���f��
    /// </summary>
    public class LoginRequest
    {
        /// <summary>
        /// �Ј��ԍ��i�K�{�j
        /// </summary>
        [Required]
        public string EmployeeNo { get; set; } = string.Empty;

        /// <summary>
        /// �p�X���[�h�i�K�{�j
        /// </summary>
        [Required]
        public string Password { get; set; } = string.Empty;
    }
}