namespace SUSWebApp.Server.Models.DTOs
{
    public class LoginRequestDto
    {
        public string EmployeeNo { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
