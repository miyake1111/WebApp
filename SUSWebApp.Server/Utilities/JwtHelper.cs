/*

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SUSWebApp.Server.Configuration;
using SUSWebApp.Server.Models.Entities;

namespace SUSWebApp.Server.Utilities
{
    public class JwtHelper
    {
        private readonly JwtSettings _settings;
        private readonly SymmetricSecurityKey _key;

        public JwtHelper(IOptions<JwtSettings> options)
        {
            _settings = options.Value;
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey));
        }

        public string GenerateToken(AuthUser user)
        {
            var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.EmployeeNo),
                new(JwtRegisteredClaimNames.UniqueName, user.UserName ?? user.EmployeeNo),
                new(ClaimTypes.NameIdentifier, user.EmployeeNo),
                new(ClaimTypes.Name, user.UserName ?? user.EmployeeNo),
            };

            if (!string.IsNullOrWhiteSpace(user.Role))
            {
                claims.Add(new Claim(ClaimTypes.Role, user.Role));
            }

            var token = new JwtSecurityToken(
                issuer: _settings.Issuer,
                audience: _settings.Audience,
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: DateTime.UtcNow.AddMinutes(_settings.ExpireMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
*/