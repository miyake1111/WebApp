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
                        gender = u.Gender,  // ← Gender == 1の比較を削除
                        position = u.Position ?? "",
                        pcAuthority = u.PcAuthority,
                        updateDate = u.UpdateDate
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
                    message = "ユーザー取得エラー",
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
                    return BadRequest(new { message = "この社員番号は既に存在します" });
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
                    Gender = dto.Gender ?? "",  // 文字列のまま
                    Position = dto.Position ?? "",
                    PcAuthority = dto.PcAuthority ?? "利用者",
                    RegistrationDate = dto.RegistrationDate?.ToUniversalTime() ?? DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    RetirementDate = dto.RetirementDate?.ToUniversalTime(),
                    IsDeleted = false
                };

                _context.MstUsers.Add(user);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "登録成功" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "登録エラー",
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
                    return NotFound(new { message = "ユーザーが見つかりません" });
                }

                user.Name = dto.Name ?? user.Name;
                user.NameKana = dto.NameKana ?? user.NameKana;
                user.Department = dto.Department ?? user.Department;
                user.Phone = dto.Phone ?? user.Phone;
                user.Email = dto.Email ?? user.Email;
                user.Age = dto.Age;
                user.Gender = dto.Gender ?? user.Gender;  // 文字列のまま
                user.Position = dto.Position ?? user.Position;
                user.PcAuthority = dto.PcAuthority ?? user.PcAuthority;
                user.RetirementDate = dto.RetirementDate?.ToUniversalTime();
                user.UpdateDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "更新成功" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "更新エラー",
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
                    return NotFound(new { message = "ユーザーが見つかりません" });
                }

                user.IsDeleted = true;
                user.RetirementDate = DateTime.UtcNow;
                user.UpdateDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "削除成功" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "削除エラー",
                    error = ex.Message
                });
            }
        }
    }
}