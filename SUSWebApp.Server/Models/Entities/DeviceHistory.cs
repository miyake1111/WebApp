using System.ComponentModel.DataAnnotations;

namespace SUSWebApp.Server.Models.Entities
{
    public class DeviceHistory
    {
        [Key]
        public int Id { get; set; }

        public DateTime ChangeDate { get; set; }

        public string UpdaterEmployeeNo { get; set; }

        public string TargetAssetNo { get; set; }

        public string ChangeField { get; set; }

        public string ChangeContent { get; set; }
    }
}