using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SUSWebApp.Server.Data;
using SUSWebApp.Server.Models.Dto;
using SUSWebApp.Server.Models.Entities;

namespace SUSWebApp.Server.Controllers
{
    /// <summary>
    /// デバイス管理APIコントローラー
    /// 機器の CRUD 操作と履歴管理を提供
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]  // URLパス: /api/device
    public class DeviceController : ControllerBase
    {
        // Entity Framework Coreのデータベースコンテキスト
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// コンストラクタ - 依存性注入でDBコンテキストを受け取る
        /// </summary>
        public DeviceController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// 全デバイス取得（貸出状況含む）
        /// GET: /api/device
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetDevices()
        {
            try
            {
                var devices = await _context.MstDevices
                    .Where(d => !d.IsDeleted)  // 削除されていないデバイスのみ
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
                        // 貸出情報を結合
                        RentalInfo = _context.TrnRentals
                            .Where(r => r.AssetNo == d.AssetNo)
                            .Select(r => new
                            {
                                r.AvailableFlag,
                                r.EmployeeNo,
                                r.RentalDate,
                                r.DueDate,
                                // ユーザー名を結合
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

        /// <summary>
        /// 特定デバイス詳細取得
        /// GET: /api/device/{assetNo}
        /// </summary>
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

                // 貸出情報を取得
                var rental = await _context.TrnRentals
                    .Where(r => r.AssetNo == assetNo)
                    .FirstOrDefaultAsync();

                // レスポンス用オブジェクトを構成
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

        /// <summary>
        /// 利用可能デバイス一覧
        /// GET: /api/device/available
        /// 故障していない＆貸出可能なデバイスのみ
        /// </summary>
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableDevices()
        {
            try
            {
                var availableDevices = await _context.MstDevices
                    .Where(d => !d.IsDeleted && !d.IsBroken)  // 削除されておらず、故障していない
                    .Where(d => _context.TrnRentals
                        .Where(r => r.AssetNo == d.AssetNo)
                        .All(r => r.AvailableFlag == true))  // 貸出可能フラグがtrue
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

        /// <summary>
        /// デバイスリスト取得（一覧画面用）
        /// GET: /api/device/list
        /// 資産番号でソート済み
        /// </summary>
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
                        // 資産番号を分解して並び替え（例：A19-06-001）
                        var parts = d.AssetNo.Split('-');
                        if (parts.Length >= 3)
                        {
                            // パディングを追加して文字列比較を正しく行う
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
                    data = sortedDevices  // 修正: sortedDevicesを返す
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

        /// <summary>
        /// デバイス削除（論理削除）
        /// DELETE: /api/device/delete/{assetNo}
        /// </summary>
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

                // 論理削除（物理削除ではない）
                device.IsDeleted = true;
                device.UpdateDate = DateTime.UtcNow;  // UTC時刻を使用

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

        /// <summary>
        /// デバイス新規登録
        /// POST: /api/device/create
        /// </summary>
        [HttpPost("create")]
        public async Task<IActionResult> CreateDevice([FromBody] DeviceCreateDto dto)
        {
            try
            {
                // 資産番号の重複チェック
                var existing = await _context.MstDevices
                    .FirstOrDefaultAsync(d => d.AssetNo == dto.AssetNo);

                if (existing != null)
                {
                    return BadRequest(new { message = "この資産番号は既に存在します" });
                }

                // 新規デバイスエンティティを作成
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
                    RegistrationDate = DateTime.UtcNow,  // 登録日時
                    UpdateDate = DateTime.UtcNow,        // 更新日時
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

        /// <summary>
        /// デバイス更新
        /// PUT: /api/device/update/{assetNo}
        /// 変更履歴も記録
        /// </summary>
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

                // 更新者の社員番号を取得（HTTPヘッダーから）
                var updaterEmployeeNo = Request.Headers["X-User-EmployeeNo"].FirstOrDefault() ?? "SYSTEM";

                // 変更履歴を保存するためのリスト
                var histories = new List<DeviceHistory>();

                // ===== 各項目の変更をチェックして履歴に記録 =====

                // メーカー変更
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

                // メモリ変更
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

                // ストレージ変更
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

                // 保管場所変更
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

                // 故障状態変更
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

        /// <summary>
        /// デバイス変更履歴取得
        /// GET: /api/device/history
        /// </summary>
        [HttpGet("history")]
        public async Task<IActionResult> GetDeviceHistory()
        {
            try
            {
                var histories = await _context.DeviceHistories
                    .OrderByDescending(h => h.ChangeDate)  // 新しい順
                    .Select(h => new
                    {
                        id = h.Id,
                        changeDate = h.ChangeDate.ToLocalTime().ToString("yyyy/MM/dd HH:mm"),
                        updaterEmployeeNo = h.UpdaterEmployeeNo,
                        // 更新者名を結合
                        updaterName = _context.MstUsers
                            .Where(u => u.EmployeeNo == h.UpdaterEmployeeNo)
                            .Select(u => u.Name)
                            .FirstOrDefault() ?? "不明",
                        targetAssetNo = h.TargetAssetNo,
                        // デバイス情報を結合
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