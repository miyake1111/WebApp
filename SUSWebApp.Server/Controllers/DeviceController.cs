using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SUSWebApp.Server.Data;
using SUSWebApp.Server.Models.Dto;
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

        [HttpGet("list")]
        public async Task<IActionResult> GetDeviceList()
        {
            try
            {
                var devices = await _context.MstDevices
                    .Where(d => !d.IsDeleted)
                    .ToListAsync();
                // メモリ上で資産番号を解析してソート
                var sortedDevices = devices
                    .OrderBy(d => {
                        // 資産番号を分解して並び替え
                        var parts = d.AssetNo.Split('-');
                        if (parts.Length >= 3)
                        {
                            // A19-06-001 のような形式を想定
                            return $"{parts[0]}-{parts[1].PadLeft(2, '0')}-{parts[2].PadLeft(3, '0')}";
                        }
                        return d.AssetNo;
                    })
                    .Select(d => new
                    {
                        assetNo = d.AssetNo,
                        manufacturer = d.Manufacturer,
                        os = d.Os,
                        memory = d.Memory,
                        storage = d.Storage,
                        graphicsCard = d.GraphicsCard,
                        storageLocation = d.StorageLocation,
                        isBroken = d.IsBroken,
                        remarks = d.Remarks ?? ""  // NULLの場合は空文字列
                    })
                    .ToList();

                return Ok(new
                {
                    success = true,
                    data = devices
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    success = false,
                    message = "デバイス取得エラー",
                    error = ex.Message
                });
            }
        }

        // デバイス削除（論理削除）
        // デバイス削除メソッドも修正
        [HttpDelete("delete/{assetNo}")]
        public async Task<IActionResult> DeleteDevice(string assetNo)
        {
            try
            {
                var device = await _context.MstDevices
                    .FirstOrDefaultAsync(d => d.AssetNo == assetNo);

                if (device == null)
                {
                    return NotFound(new { message = "デバイスが見つかりません" });
                }

                // 論理削除
                device.IsDeleted = true;
                device.UpdateDate = DateTime.UtcNow;  // UtcNowを使用

                await _context.SaveChangesAsync();

                return Ok(new { message = "削除成功" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "削除エラー",
                    error = ex.Message
                });
            }
        }

        // デバイス新規登録
        [HttpPost("create")]
        public async Task<IActionResult> CreateDevice([FromBody] DeviceCreateDto dto)
        {
            try
            {
                var existing = await _context.MstDevices
                    .FirstOrDefaultAsync(d => d.AssetNo == dto.AssetNo);

                if (existing != null)
                {
                    return BadRequest(new { message = "この資産番号は既に存在します" });
                }

                var device = new MstDevice
                {
                    AssetNo = dto.AssetNo,
                    Manufacturer = dto.Manufacturer ?? "",
                    Os = dto.Os ?? "",
                    Memory = dto.Memory,
                    Storage = dto.Storage,
                    GraphicsCard = dto.GraphicsCard ?? "",
                    StorageLocation = dto.StorageLocation ?? "",
                    IsBroken = dto.IsBroken,
                    LeaseStartDate = dto.LeaseStartDate?.ToUniversalTime(),  // UTCに変換
                    LeaseEndDate = dto.LeaseEndDate?.ToUniversalTime(),      // UTCに変換
                    Remarks = dto.Remarks,
                    RegistrationDate = DateTime.UtcNow,  // UtcNowを使用
                    UpdateDate = DateTime.UtcNow,        // UtcNowを使用
                    IsDeleted = false
                };

                _context.MstDevices.Add(device);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "登録成功" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "登録エラー",
                    error = ex.Message
                });
            }
        }

        // デバイス更新
        [HttpPut("update/{assetNo}")]
        public async Task<IActionResult> UpdateDevice(string assetNo, [FromBody] DeviceUpdateDto dto)
        {
            try
            {
                var device = await _context.MstDevices
                    .FirstOrDefaultAsync(d => d.AssetNo == assetNo && !d.IsDeleted);

                if (device == null)
                {
                    return NotFound(new { message = "デバイスが見つかりません" });
                }

                // 更新者の社員番号を取得
                var updaterEmployeeNo = Request.Headers["X-User-EmployeeNo"].FirstOrDefault() ?? "SYSTEM";

                // 変更前の値を保存
                var histories = new List<DeviceHistory>();

                // 各項目の変更をチェック
                if (device.Manufacturer != dto.Manufacturer)
                {
                    histories.Add(new DeviceHistory
                    {
                        ChangeDate = DateTime.UtcNow,
                        UpdaterEmployeeNo = updaterEmployeeNo,
                        TargetAssetNo = assetNo,
                        ChangeField = "メーカー",
                        ChangeContent = $"{device.Manufacturer} → {dto.Manufacturer}"
                    });
                }

                if (device.Memory != dto.Memory)
                {
                    histories.Add(new DeviceHistory
                    {
                        ChangeDate = DateTime.UtcNow,
                        UpdaterEmployeeNo = updaterEmployeeNo,
                        TargetAssetNo = assetNo,
                        ChangeField = "メモリ",
                        ChangeContent = $"{device.Memory}GB → {dto.Memory}GB"
                    });
                }

                if (device.Storage != dto.Storage)
                {
                    histories.Add(new DeviceHistory
                    {
                        ChangeDate = DateTime.UtcNow,
                        UpdaterEmployeeNo = updaterEmployeeNo,
                        TargetAssetNo = assetNo,
                        ChangeField = "容量",
                        ChangeContent = $"{device.Storage}GB → {dto.Storage}GB"
                    });
                }

                if (device.StorageLocation != dto.StorageLocation)
                {
                    histories.Add(new DeviceHistory
                    {
                        ChangeDate = DateTime.UtcNow,
                        UpdaterEmployeeNo = updaterEmployeeNo,
                        TargetAssetNo = assetNo,
                        ChangeField = "保管場所",
                        ChangeContent = $"{device.StorageLocation} → {dto.StorageLocation}"
                    });
                }

                if (device.IsBroken != dto.IsBroken)
                {
                    histories.Add(new DeviceHistory
                    {
                        ChangeDate = DateTime.UtcNow,
                        UpdaterEmployeeNo = updaterEmployeeNo,
                        TargetAssetNo = assetNo,
                        ChangeField = "故障",
                        ChangeContent = $"{(device.IsBroken ? "あり" : "なし")} → {(dto.IsBroken ? "あり" : "なし")}"
                    });
                }

                // 履歴をDBに追加
                if (histories.Any())
                {
                    _context.DeviceHistories.AddRange(histories);
                }

                // デバイス情報を更新
                device.Manufacturer = dto.Manufacturer ?? device.Manufacturer;
                device.Os = dto.Os ?? device.Os;
                device.Memory = dto.Memory;
                device.Storage = dto.Storage;
                device.GraphicsCard = dto.GraphicsCard ?? device.GraphicsCard;
                device.StorageLocation = dto.StorageLocation ?? device.StorageLocation;
                device.IsBroken = dto.IsBroken;
                device.LeaseStartDate = dto.LeaseStartDate?.ToUniversalTime();
                device.LeaseEndDate = dto.LeaseEndDate?.ToUniversalTime();
                device.Remarks = dto.Remarks;
                device.UpdateDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "更新成功" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "更新エラー",
                    error = ex.Message
                });
            }
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetDeviceHistory()
        {
            try
            {
                var histories = await _context.DeviceHistories
                    .OrderByDescending(h => h.ChangeDate)
                    .Select(h => new
                    {
                        id = h.Id,
                        changeDate = h.ChangeDate.ToLocalTime().ToString("yyyy/MM/dd HH:mm"),
                        updaterEmployeeNo = h.UpdaterEmployeeNo,
                        updaterName = _context.MstUsers
                            .Where(u => u.EmployeeNo == h.UpdaterEmployeeNo)
                            .Select(u => u.Name)
                            .FirstOrDefault() ?? "不明",
                        targetAssetNo = h.TargetAssetNo,
                        targetManufacturer = _context.MstDevices
                            .Where(d => d.AssetNo == h.TargetAssetNo)
                            .Select(d => d.Manufacturer)
                            .FirstOrDefault() ?? "",
                        targetOs = _context.MstDevices
                            .Where(d => d.AssetNo == h.TargetAssetNo)
                            .Select(d => d.Os)
                            .FirstOrDefault() ?? "",
                        changeField = h.ChangeField,
                        changeContent = h.ChangeContent
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    data = histories
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "履歴取得エラー",
                    error = ex.Message
                });
            }
        }
    }
}