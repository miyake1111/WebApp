using SUSWebApp.Models.DTOs;
using SUSWebApp.Server.Models.DTOs;

namespace SUSWebApp.Services.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> AuthenticateAsync(string employeeNo, string password);
    }
}
