using Microsoft.AspNetCore.Mvc;
using SUSWebApp.Models;

namespace SUSWebApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        // 今は簡単な仮の認証ロジックを実装します
        if (request.EmployeeNo == "user" && request.Password == "password")
        {
            // 認証成功
            return Ok(new { message = "ログインに成功しました" });
        }
        else
        {
            // 認証失敗
            return Unauthorized(new { message = "社員番号またはパスワードが正しくありません" });
        }
    }
}

public class LoginRequest
{
    public string EmployeeNo { get; set; }
    public string Password { get; set; }
}
