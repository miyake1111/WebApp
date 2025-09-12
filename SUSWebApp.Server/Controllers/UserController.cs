using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SUSWebApp.Server.Data;
using SUSWebApp.Server.Models.Entities;
using SUSWebApp.Server.Models.Dto;

namespace SUSWebApp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetUserList()
        {
            try
            {
                var users = await _context.MstUsers
                    .Where(u => !u.IsDeleted)
                    .OrderBy(u => u.EmployeeNo)
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
                        registrationDate = u.RegistrationDate,  // �ǉ�
                        updateDate = u.UpdateDate,
                        retirementDate = u.RetirementDate  // �ǉ�
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

        [HttpPost("create")]
        public async Task<IActionResult> CreateUser([FromBody] UserCreateDto dto)
        {
            try
            {
                var existing = await _context.MstUsers
                    .FirstOrDefaultAsync(u => u.EmployeeNo == dto.EmployeeNo);

                if (existing != null)
                {
                    return BadRequest(new { message = "���̎Ј��ԍ��͊��ɑ��݂��܂�" });
                }

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
                    PcAuthority = dto.PcAuthority ?? "���p��",
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

                // �e�t�B�[���h�̕ύX���`�F�b�N���ė����ɒǉ�
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

                // ���̑��̃t�B�[���h���X�V
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

                user.IsDeleted = true;
                user.RetirementDate = DateTime.UtcNow;
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

        [HttpGet("history")]
        public async Task<IActionResult> GetUserHistory()
        {
            try
            {
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
    }
}