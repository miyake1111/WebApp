using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using SUSWebApp.Server.Data;
using SUSWebApp.Server.Models.Dto;
using SUSWebApp.Server.Models.Entities;

namespace SUSWebApp.Server.Controllers
{
    /// <summary>
    /// ���[�U�[�Ǘ�API�R���g���[���[
    /// ���[�U�[��CRUD����A�p�X���[�h�Ǘ��A�����Ǘ����
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]  // URL�p�X: /api/user
    public class UserController : ControllerBase
    {
        // Entity Framework Core�̃f�[�^�x�[�X�R���e�L�X�g
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// �R���X�g���N�^ - �ˑ���������DB�R���e�L�X�g���󂯎��
        /// </summary>
        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// ���[�U�[�ꗗ�擾
        /// GET: /api/user/list
        /// </summary>
        [HttpGet("list")]
        public async Task<IActionResult> GetUserList()
        {
            try
            {
                var users = await _context.MstUsers
                    .Where(u => !u.IsDeleted)  // �폜����Ă��Ȃ����[�U�[�̂�
                    .OrderBy(u => u.EmployeeNo)  // �Ј��ԍ���
                    .Select(u => new
                    {
                        employeeNo = u.EmployeeNo,
                        name = u.Name,
                        nameKana = u.NameKana,
                        department = u.Department,
                        phone = u.Phone,
                        email = u.Email,
                        age = u.Age,
                        gender = u.Gender,
                        position = u.Position ?? "",
                        pcAuthority = u.PcAuthority,
                        registrationDate = u.RegistrationDate,  // �o�^��
                        updateDate = u.UpdateDate,              // �X�V��
                        retirementDate = u.RetirementDate       // �ސE��
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    data = users
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    success = false,
                    message = "���[�U�[�擾�G���[",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// ���[�U�[�V�K�쐬
        /// POST: /api/user/create
        /// </summary>
        [HttpPost("create")]
        public async Task<IActionResult> CreateUser([FromBody] UserCreateDto dto)
        {
            try
            {
                // �Ј��ԍ��̏d���`�F�b�N
                var existing = await _context.MstUsers
                    .FirstOrDefaultAsync(u => u.EmployeeNo == dto.EmployeeNo);

                if (existing != null)
                {
                    return BadRequest(new { message = "���̎Ј��ԍ��͊��ɑ��݂��܂�" });
                }

                // �V�K���[�U�[�G���e�B�e�B���쐬
                var user = new MstUser
                {
                    EmployeeNo = dto.EmployeeNo,
                    Name = dto.Name ?? "",
                    NameKana = dto.NameKana ?? "",
                    Department = dto.Department ?? "",
                    Phone = dto.Phone ?? "",
                    Email = dto.Email ?? "",
                    Age = dto.Age,
                    Gender = dto.Gender ?? "",
                    Position = dto.Position ?? "",
                    PcAuthority = dto.PcAuthority ?? "���p��",  // �f�t�H���g����
                    RegistrationDate = dto.RegistrationDate?.ToUniversalTime() ?? DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    RetirementDate = dto.RetirementDate?.ToUniversalTime(),
                    IsDeleted = false
                };

                _context.MstUsers.Add(user);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "�o�^����" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "�o�^�G���[",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// ���[�U�[���X�V
        /// PUT: /api/user/update/{employeeNo}
        /// �ύX�������L�^
        /// </summary>
        [HttpPut("update/{employeeNo}")]
        public async Task<IActionResult> UpdateUser(string employeeNo, [FromBody] UserUpdateDto dto)
        {
            try
            {
                var user = await _context.MstUsers
                    .FirstOrDefaultAsync(u => u.EmployeeNo == employeeNo && !u.IsDeleted);

                if (user == null)
                {
                    return NotFound(new { message = "���[�U�[��������܂���" });
                }

                // ���N�G�X�g�w�b�_�[���烍�O�C�����[�U�[�̎Ј��ԍ����擾
                var currentUserEmployeeNo = Request.Headers["X-User-EmployeeNo"].ToString();
                if (string.IsNullOrEmpty(currentUserEmployeeNo))
                {
                    currentUserEmployeeNo = "SYSTEM";
                }

                // �ύX�������L�^���邽�߂̃��X�g
                var changes = new List<HstUserChange>();

                // ===== �e�t�B�[���h�̕ύX���`�F�b�N���ė����ɒǉ� =====

                // �����̕ύX
                if (dto.Name != null && dto.Name != user.Name)
                {
                    changes.Add(new HstUserChange
                    {
                        ChangeDate = DateTime.UtcNow,
                        ChangedByEmployeeNo = currentUserEmployeeNo,
                        TargetEmployeeNo = employeeNo,
                        ChangeField = "����",
                        ChangeContent = $"{user.Name} �� {dto.Name}"
                    });
                    user.Name = dto.Name;
                }

                // �����i�J�i�j�̕ύX
                if (dto.NameKana != null && dto.NameKana != user.NameKana)
                {
                    changes.Add(new HstUserChange
                    {
                        ChangeDate = DateTime.UtcNow,
                        ChangedByEmployeeNo = currentUserEmployeeNo,
                        TargetEmployeeNo = employeeNo,
                        ChangeField = "�����i�J�i�j",
                        ChangeContent = $"{user.NameKana} �� {dto.NameKana}"
                    });
                    user.NameKana = dto.NameKana;
                }

                // �����̕ύX
                if (dto.Department != null && dto.Department != user.Department)
                {
                    changes.Add(new HstUserChange
                    {
                        ChangeDate = DateTime.UtcNow,
                        ChangedByEmployeeNo = currentUserEmployeeNo,
                        TargetEmployeeNo = employeeNo,
                        ChangeField = "����",
                        ChangeContent = $"{user.Department} �� {dto.Department}"
                    });
                    user.Department = dto.Department;
                }

                // �d�b�ԍ��̕ύX
                if (dto.Phone != null && dto.Phone != user.Phone)
                {
                    changes.Add(new HstUserChange
                    {
                        ChangeDate = DateTime.UtcNow,
                        ChangedByEmployeeNo = currentUserEmployeeNo,
                        TargetEmployeeNo = employeeNo,
                        ChangeField = "�d�b�ԍ�",
                        ChangeContent = $"{user.Phone} �� {dto.Phone}"
                    });
                    user.Phone = dto.Phone;
                }

                // ���[���A�h���X�̕ύX
                if (dto.Email != null && dto.Email != user.Email)
                {
                    changes.Add(new HstUserChange
                    {
                        ChangeDate = DateTime.UtcNow,
                        ChangedByEmployeeNo = currentUserEmployeeNo,
                        TargetEmployeeNo = employeeNo,
                        ChangeField = "���[���A�h���X",
                        ChangeContent = $"{user.Email} �� {dto.Email}"
                    });
                    user.Email = dto.Email;
                }

                // ��E�̕ύX
                if (dto.Position != null && dto.Position != user.Position)
                {
                    changes.Add(new HstUserChange
                    {
                        ChangeDate = DateTime.UtcNow,
                        ChangedByEmployeeNo = currentUserEmployeeNo,
                        TargetEmployeeNo = employeeNo,
                        ChangeField = "��E",
                        ChangeContent = $"{user.Position ?? "�Ȃ�"} �� {dto.Position}"
                    });
                    user.Position = dto.Position;
                }

                // PC�A�J�E���g�����̕ύX
                if (dto.PcAuthority != null && dto.PcAuthority != user.PcAuthority)
                {
                    changes.Add(new HstUserChange
                    {
                        ChangeDate = DateTime.UtcNow,
                        ChangedByEmployeeNo = currentUserEmployeeNo,
                        TargetEmployeeNo = employeeNo,
                        ChangeField = "PC�A�J�E���g����",
                        ChangeContent = $"{user.PcAuthority} �� {dto.PcAuthority}"
                    });
                    user.PcAuthority = dto.PcAuthority;
                }

                // ���̑��̃t�B�[���h���X�V�i�����L�^�Ȃ��j
                user.Age = dto.Age;
                user.Gender = dto.Gender ?? user.Gender;
                user.RetirementDate = dto.RetirementDate?.ToUniversalTime();
                user.UpdateDate = DateTime.UtcNow;

                // �ύX�������f�[�^�x�[�X�ɒǉ�
                if (changes.Any())
                {
                    _context.HstUserChanges.AddRange(changes);
                }

                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "�X�V����" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "�X�V�G���[",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// ���[�U�[�폜�i�_���폜�j
        /// DELETE: /api/user/delete/{employeeNo}
        /// </summary>
        [HttpDelete("delete/{employeeNo}")]
        public async Task<IActionResult> DeleteUser(string employeeNo)
        {
            try
            {
                var user = await _context.MstUsers
                    .FirstOrDefaultAsync(u => u.EmployeeNo == employeeNo);

                if (user == null)
                {
                    return NotFound(new { message = "���[�U�[��������܂���" });
                }

                // ���N�G�X�g�w�b�_�[���烍�O�C�����[�U�[�̎Ј��ԍ����擾
                var currentUserEmployeeNo = Request.Headers["X-User-EmployeeNo"].ToString();
                if (string.IsNullOrEmpty(currentUserEmployeeNo))
                {
                    currentUserEmployeeNo = "SYSTEM";  // �w�b�_�[���Ȃ��ꍇ�̃f�t�H���g
                }

                // �폜�������L�^
                var deleteHistory = new HstUserChange
                {
                    ChangeDate = DateTime.UtcNow,
                    ChangedByEmployeeNo = currentUserEmployeeNo,
                    TargetEmployeeNo = employeeNo,
                    ChangeField = "�폜",
                    ChangeContent = $"���[�U�[�폜: {user.Name}"
                };

                _context.HstUserChanges.Add(deleteHistory);

                // �_���폜����
                user.IsDeleted = true;
                user.RetirementDate = DateTime.UtcNow;  // �폜���ɑސE�����ݒ�
                user.UpdateDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "�폜����" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "�폜�G���[",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// ���[�U�[�ύX�����擾
        /// GET: /api/user/history
        /// </summary>
        [HttpGet("history")]
        public async Task<IActionResult> GetUserHistory()
        {
            try
            {
                // �����f�[�^���擾�i�V�������j
                var history = await _context.HstUserChanges
                    .OrderByDescending(h => h.ChangeDate)
                    .ToListAsync();

                var result = new List<object>();
                foreach (var h in history)
                {
                    // �X�V�҂̏����擾
                    var updater = await _context.MstUsers
                        .Where(u => u.EmployeeNo == h.ChangedByEmployeeNo)
                        .Select(u => new { u.EmployeeNo, u.Name, u.NameKana })
                        .FirstOrDefaultAsync();

                    // �Ώێ҂̏����擾
                    var target = await _context.MstUsers
                        .Where(u => u.EmployeeNo == h.TargetEmployeeNo)
                        .Select(u => new { u.EmployeeNo, u.Name, u.NameKana })
                        .FirstOrDefaultAsync();

                    result.Add(new
                    {
                        id = h.ChangeId,
                        changeDate = h.ChangeDate.ToLocalTime().ToString("yyyy/MM/dd HH:mm"),
                        updaterEmployeeNo = updater?.EmployeeNo ?? h.ChangedByEmployeeNo,
                        updaterName = updater?.Name ?? "�s��",
                        updaterNameKana = updater?.NameKana ?? "",
                        targetEmployeeNo = target?.EmployeeNo ?? h.TargetEmployeeNo,
                        targetName = target?.Name ?? "�s��",
                        targetNameKana = target?.NameKana ?? "",
                        changeField = h.ChangeField,
                        changeContent = h.ChangeContent
                    });
                }

                return Ok(new
                {
                    success = true,
                    data = result
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    success = false,
                    message = "�����擾�G���[",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// �p�X���[�h�ݒ�i�V�K�o�^���j
        /// POST: /api/user/set-password
        /// AUTH_USER�e�[�u���Ƀp�X���[�h��o�^
        /// </summary>
        [HttpPost("set-password")]
        public async Task<IActionResult> SetPassword([FromBody] PasswordSetRequest request)
        {
            try
            {
                // Entity Framework�̐ڑ���������擾
                var connectionString = _context.Database.GetConnectionString();

                using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync();

                // AUTH_USER�e�[�u���ɓo�^�iUPSERT�����j
                var query = @"
            INSERT INTO ""AUTH_USER"" (employee_no, password)
            VALUES (@EmployeeNo, @Password)
            ON CONFLICT (employee_no)              -- �Ј��ԍ������ɑ��݂���ꍇ
            DO UPDATE SET password = @Password"; //�p�X���[�h���X�V

                using var cmd = new NpgsqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@EmployeeNo", request.EmployeeNo);
                cmd.Parameters.AddWithValue("@Password", request.Password);
                // ���ӁF�{�Ԋ��ł̓p�X���[�h�͕K���n�b�V�������ׂ�

                var result = await cmd.ExecuteNonQueryAsync();

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        /// <summary>
        /// �p�X���[�h�X�V
        /// POST: /api/user/update-password
        /// �����p�X���[�h�̕ύX
        /// </summary>
        [HttpPost("update-password")]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordRequest request)
        {
            try
            {
                var connectionString = _context.Database.GetConnectionString();

                using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync();

                // �p�X���[�h���X�V
                var query = @"
            UPDATE ""AUTH_USER"" 
            SET password = @NewPassword
            WHERE employee_no = @EmployeeNo";

                using var cmd = new NpgsqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@EmployeeNo", request.EmployeeNo);
                cmd.Parameters.AddWithValue("@NewPassword", request.NewPassword);
                // ���ӁF�{�Ԋ��ł͌��݂̃p�X���[�h�m�F���K�v

                var result = await cmd.ExecuteNonQueryAsync();

                if (result > 0)
                {
                    return Ok(new { success = true });
                }
                else
                {
                    return Ok(new { success = false, message = "�X�V�Ώۂ�������܂���" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        /// <summary>
        /// �p�X���[�h�X�V���N�G�X�g���f��
        /// </summary>
        public class UpdatePasswordRequest
        {
            public string EmployeeNo { get; set; }      // �Ј��ԍ�
            public string CurrentPassword { get; set; } // ���݂̃p�X���[�h�i���ؗp�j
            public string NewPassword { get; set; }     // �V�����p�X���[�h
        }

        /// <summary>
        /// �p�X���[�h�ݒ胊�N�G�X�g���f��
        /// </summary>
        public class PasswordSetRequest
        {
            public string EmployeeNo { get; set; }     // �Ј��ԍ�
            public string Password { get; set; }       // �p�X���[�h
        }
    }
}