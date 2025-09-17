namespace SUSWebApp.Server.Models.Entities
{
    public class RentalHistory
    {
        public int Id { get; set; }
        public DateTime RentalDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public string EmployeeNo { get; set; }
        public string AssetNo { get; set; }
        public string Os { get; set; }
    }
}