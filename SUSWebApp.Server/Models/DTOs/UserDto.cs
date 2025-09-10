namespace SUSWebApp.Server.Models.Dto
{
    public class UserCreateDto
    {
        public string EmployeeNo { get; set; }
        public string? Name { get; set; }
        public string? NameKana { get; set; }
        public string? Department { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public int Age { get; set; }
        public string? Gender { get; set; }  // そのまま string
        public string? Position { get; set; }
        public string? PcAuthority { get; set; }
        public DateTime? RegistrationDate { get; set; }
        public DateTime? RetirementDate { get; set; }
    }

    public class UserUpdateDto
    {
        public string? Name { get; set; }
        public string? NameKana { get; set; }
        public string? Department { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public int Age { get; set; }
        public string? Gender { get; set; }  // そのまま string
        public string? Position { get; set; }
        public string? PcAuthority { get; set; }
        public DateTime? RetirementDate { get; set; }
    }
}