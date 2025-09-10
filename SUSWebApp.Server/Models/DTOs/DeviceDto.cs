namespace SUSWebApp.Server.Models.Dto
{
    public class DeviceCreateDto
    {
        public string AssetNo { get; set; }
        public string? Manufacturer { get; set; }
        public string? Os { get; set; }
        public int Memory { get; set; }
        public int Storage { get; set; }
        public string? GraphicsCard { get; set; }
        public string? StorageLocation { get; set; }
        public bool IsBroken { get; set; }
        public DateTime? LeaseStartDate { get; set; }
        public DateTime? LeaseEndDate { get; set; }
        public string? Remarks { get; set; }
    }

    public class DeviceUpdateDto
    {
        public string? Manufacturer { get; set; }
        public string? Os { get; set; }
        public int Memory { get; set; }
        public int Storage { get; set; }
        public string? GraphicsCard { get; set; }
        public string? StorageLocation { get; set; }
        public bool IsBroken { get; set; }
        public DateTime? LeaseStartDate { get; set; }
        public DateTime? LeaseEndDate { get; set; }
        public string? Remarks { get; set; }
    }
}