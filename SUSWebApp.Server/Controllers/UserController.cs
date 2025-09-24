using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using SUSWebApp.Server.Data;
using SUSWebApp.Server.Models.Dto;
using SUSWebApp.Server.Models.Entities;

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
                        registrationDate = u.RegistrationDate,  // 追加
                        updateDate = u.UpdateDate,
                        retirementDate = u.RetirementDate  // 追加
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
                    Gender = dto.Gender ?? "",
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

                // リクエストヘッダーからログインユーザーの社員番号を取得
                var currentUserEmployeeNo = Request.Headers["X-User-EmployeeNo"].ToString();
                if (string.IsNullOrEmpty(currentUserEmployeeNo))
                {
                    currentUserEmployeeNo = "SYSTEM";
                }

                // 変更履歴を記録するためのリスト
                var changes = new List<HstUserChange>();

                // 各フィールドの変更をチェックして履歴に追加
                if (dto.Name != null && dto.Name != user.Name)
                {
                    changes.Add(new HstUserChange
                    {
                        ChangeDate = DateTime.UtcNow,
                        ChangedByEmployeeNo = currentUserEmployeeNo,
                        TargetEmployeeNo = employeeNo,
                        ChangeField = "氏名",
                        ChangeContent = $"{user.Name} → {dto.Name}"
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
                        ChangeField = "氏名（カナ）",
                        ChangeContent = $"{user.NameKana} → {dto.NameKana}"
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
                        ChangeField = "部署",
                        ChangeContent = $"{user.Department} → {dto.Department}"
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
                        ChangeField = "電話番号",
                        ChangeContent = $"{user.Phone} → {dto.Phone}"
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
                        ChangeField = "メールアドレス",
                        ChangeContent = $"{user.Email} → {dto.Email}"
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
                        ChangeField = "役職",
                        ChangeContent = $"{user.Position ?? "なし"} → {dto.Position}"
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
                        ChangeField = "PCアカウント権限",
                        ChangeContent = $"{user.PcAuthority} → {dto.PcAuthority}"
                    });
                    user.PcAuthority = dto.PcAuthority;
                }

                // その他のフィールドも更新
                user.Age = dto.Age;
                user.Gender = dto.Gender ?? user.Gender;
                user.RetirementDate = dto.RetirementDate?.ToUniversalTime();
                user.UpdateDate = DateTime.UtcNow;

                // 変更履歴をデータベースに追加
                if (changes.Any())
                {
                    _context.HstUserChanges.AddRange(changes);
                }

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

                // リクエストヘッダーからログインユーザーの社員番号を取得
                var currentUserEmployeeNo = Request.Headers["X-User-EmployeeNo"].ToString();
                if (string.IsNullOrEmpty(currentUserEmployeeNo))
                {
                    currentUserEmployeeNo = "SYSTEM";  // ヘッダーがない場合のデフォルト
                }

                // 削除履歴を記録
                var deleteHistory = new HstUserChange
                {
                    ChangeDate = DateTime.UtcNow,
                    ChangedByEmployeeNo = currentUserEmployeeNo,
                    TargetEmployeeNo = employeeNo,
                    ChangeField = "削除",
                    ChangeContent = $"ユーザー削除: {user.Name}"
                };

                _context.HstUserChanges.Add(deleteHistory);

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
                    // 更新者の情報を取得
                    var updater = await _context.MstUsers
                        .Where(u => u.EmployeeNo == h.ChangedByEmployeeNo)
                        .Select(u => new { u.EmployeeNo, u.Name, u.NameKana })
                        .FirstOrDefaultAsync();

                    // 対象者の情報を取得
                    var target = await _context.MstUsers
                        .Where(u => u.EmployeeNo == h.TargetEmployeeNo)
                        .Select(u => new { u.EmployeeNo, u.Name, u.NameKana })
                        .FirstOrDefaultAsync();

                    result.Add(new
                    {
                        id = h.ChangeId,
                        changeDate = h.ChangeDate.ToLocalTime().ToString("yyyy/MM/dd HH:mm"),
                        updaterEmployeeNo = updater?.EmployeeNo ?? h.ChangedByEmployeeNo,
                        updaterName = updater?.Name ?? "不明",
                        updaterNameKana = updater?.NameKana ?? "",
                        targetEmployeeNo = target?.EmployeeNo ?? h.TargetEmployeeNo,
                        targetName = target?.Name ?? "不明",
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
                    message = "履歴取得エラー",
                    error = ex.Message
                });
            }
        }

        [HttpPost("set-password")]
        public async Task<IActionResult> SetPassword([FromBody] PasswordSetRequest request)
        {
            try
            {
                // Entity Frameworkの接続文字列を取得
                var connectionString = _context.Database.GetConnectionString();

                using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync();

                // AUTH_USERテーブルに登録
                var query = @"
            INSERT INTO ""AUTH_USER"" (employee_no, password)
            VALUES (@EmployeeNo, @Password)
            ON CONFLICT (employee_no) 
            DO UPDATE SET password = @Password";

                using var cmd = new NpgsqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@EmployeeNo", request.EmployeeNo);
                cmd.Parameters.AddWithValue("@Password", request.Password);

                var result = await cmd.ExecuteNonQueryAsync();

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpPost("update-password")]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordRequest request)
        {
            try
            {
                var connectionString = _context.Database.GetConnectionString();

                using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync();

                // パスワードを更新
                var query = @"
            UPDATE ""AUTH_USER"" 
            SET password = @NewPassword
            WHERE employee_no = @EmployeeNo";

                using var cmd = new NpgsqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@EmployeeNo", request.EmployeeNo);
                cmd.Parameters.AddWithValue("@NewPassword", request.NewPassword);

                var result = await cmd.ExecuteNonQueryAsync();

                if (result > 0)
                {
                    return Ok(new { success = true });
                }
                else
                {
                    return Ok(new { success = false, message = "更新対象が見つかりません" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        public class UpdatePasswordRequest
        {
            public string EmployeeNo { get; set; }
            public string CurrentPassword { get; set; }  // 使わないけど一応
            public string NewPassword { get; set; }
        }

        // リクエストクラスを追加（クラスの最後に）
        public class PasswordSetRequest
        {
            public string EmployeeNo { get; set; }
            public string Password { get; set; }
        }
    }
}