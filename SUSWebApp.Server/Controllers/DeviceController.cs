using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SUSWebApp.Server.Data;
using SUSWebApp.Server.Models.Entities;

namespace SUSWebApp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DeviceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DeviceController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 全デバイス取得（貸出状況含む）
        [HttpGet]
        public async Task<IActionResult> GetDevices()
        {
            try
            {
                var devices = await _context.MstDevices
                    .Where(d => !d.IsDeleted)
                    .Select(d => new
                    {
                        d.AssetNo,
                        d.Manufacturer,
                        d.Os,
                        d.Memory,
                        d.Storage,
                        d.GraphicsCard,
                        d.StorageLocation,
                        d.IsBroken,
                        d.Remarks,
                        RentalInfo = _context.TrnRentals
                            .Where(r => r.AssetNo == d.AssetNo)
                            .Select(r => new
                            {
                                r.AvailableFlag,
                                r.EmployeeNo,
                                r.RentalDate,
                                r.DueDate,
                                UserName = r.EmployeeNo != null ?
                                    _context.MstUsers
                                        .Where(u => u.EmployeeNo == r.EmployeeNo)
                                        .Select(u => u.Name)
                                        .FirstOrDefault() : null
                            })
                            .FirstOrDefault()
                    })
                    .ToListAsync();

                return Ok(devices);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "デバイス取得エラー",
                    error = ex.Message
                });
            }
        }

        // 特定デバイス詳細取得
        [HttpGet("{assetNo}")]
        public async Task<IActionResult> GetDevice(string assetNo)
        {
            try
            {
                var device = await _context.MstDevices
                    .Where(d => d.AssetNo == assetNo && !d.IsDeleted)
                    .FirstOrDefaultAsync();

                if (device == null)
                {
                    return NotFound(new { message = "デバイスが見つかりません" });
                }

                var rental = await _context.TrnRentals
                    .Where(r => r.AssetNo == assetNo)
                    .FirstOrDefaultAsync();

                var result = new
                {
                    Device = device,
                    RentalInfo = rental,
                    UserName = rental?.EmployeeNo != null ?
                        await _context.MstUsers
                            .Where(u => u.EmployeeNo == rental.EmployeeNo)
                            .Select(u => u.Name)
                            .FirstOrDefaultAsync() : null
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "デバイス詳細取得エラー",
                    error = ex.Message
                });
            }
        }

        // 利用可能デバイス一覧
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableDevices()
        {
            try
            {
                var availableDevices = await _context.MstDevices
                    .Where(d => !d.IsDeleted && !d.IsBroken)
                    .Where(d => _context.TrnRentals
                        .Where(r => r.AssetNo == d.AssetNo)
                        .All(r => r.AvailableFlag == true))
                    .Select(d => new
                    {
                        d.AssetNo,
                        d.Manufacturer,
                        d.Os,
                        d.Memory,
                        d.Storage,
                        d.StorageLocation
                    })
                    .ToListAsync();

                return Ok(availableDevices);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "利用可能デバイス取得エラー",
                    error = ex.Message
                });
            }
        }
    }
}