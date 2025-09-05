namespace SUSWebApp.Models.DTOs
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public DateTime Expiration { get; set; }
        public string EmployeeNo { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
    }
}
