
/*

using Microsoft.EntityFrameworkCore;
using SUSWebApp.Data;
using SUSWebApp.Models.DTOs;
using SUSWebApp.Server.Data;
using SUSWebApp.Server.Utilities;
using SUSWebApp.Services.Interfaces;
using SUSWebApp.Utilities;

namespace SUSWebApp.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtHelper _jwtHelper;

        public AuthService(ApplicationDbContext context, JwtHelper jwtHelper)
        {
            _context = context;
            _jwtHelper = jwtHelper;
        }

        public async Task<LoginResponseDto?> AuthenticateAsync(string employeeNo, string password)
        {
            // AUTH_USER からログインユーザを取得
            var authUser = await _context.AuthUsers
                .FirstOrDefaultAsync(u => u.EmployeeNo == employeeNo);

            if (authUser == null) return null;

            // パスワード照合
            if (!PasswordHelper.VerifyPassword(password, authUser.PasswordHash))
                return null;

            // ユーザー基本情報を MST_USER から取得
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.EmployeeNo == employeeNo);

            if (user == null) return null;

            // JWT発行
            var token = _jwtHelper.GenerateToken(user);

            return new LoginResponseDto
            {
                Token = token,
                Expiration = DateTime.UtcNow.AddHours(1),
                EmployeeNo = user.EmployeeNo,
                UserName = user.Name
            };
        }
    }
}
*/