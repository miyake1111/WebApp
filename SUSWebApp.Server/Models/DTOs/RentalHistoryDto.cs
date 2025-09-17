namespace SUSWebApp.Server.Models.DTOs
{
    public class RentalHistoryDto
    {
        public int Id { get; set; }
        public DateTime RentalDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public string EmployeeNo { get; set; }
        public string EmployeeName { get; set; }
        public string EmployeeNameKana { get; set; }
        public string AssetNo { get; set; }
        public string Os { get; set; }
    }
}