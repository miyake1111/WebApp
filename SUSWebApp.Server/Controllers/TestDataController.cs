using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SUSWebApp.Server.Data;
using SUSWebApp.Server.Models.Entities;

namespace SUSWebApp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestDataController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TestDataController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("create-sample-data")]
        public async Task<IActionResult> CreateSampleData()
        {
            try
            {
                // 既存データをクリア（開発時のみ）
                _context.TrnRentals.RemoveRange(_context.TrnRentals);
                _context.MstDevices.RemoveRange(_context.MstDevices);
                _context.MstUsers.RemoveRange(_context.MstUsers);
                _context.AuthUsers.RemoveRange(_context.AuthUsers);
                await _context.SaveChangesAsync();

                // サンプル認証ユーザー
                var authUsers = new[]
                {
                    new AuthUser { EmployeeNo = "A1001", Password = "password" },
                    new AuthUser { EmployeeNo = "A1002", Password = "password" },
                    new AuthUser { EmployeeNo = "B1003", Password = "password" },
                    new AuthUser { EmployeeNo = "2025", Password = "password" }
                };
                _context.AuthUsers.AddRange(authUsers);

                // サンプルユーザー
                var mstUsers = new[]
                {
                    new MstUser
                    {
                        EmployeeNo = "A1001",
                        Name = "田中太郎",
                        NameKana = "タナカタロウ",
                        Department = "開発1課",
                        PhoneNumber = "03-1234-5678",
                        Email = "tanaka@example.com",
                        Age = 30,
                        Gender = "男性",
                        Position = "一般",
                        PcAccountAuth = "利用者",
                        RegistrationDate = DateTime.Now,
                        UpdateDate = DateTime.Now
                    },
                    new MstUser
                    {
                        EmployeeNo = "A1002",
                        Name = "佐藤花子",
                        NameKana = "サトウハナコ",
                        Department = "開発1課",
                        PhoneNumber = "03-1234-5679",
                        Email = "sato@example.com",
                        Age = 28,
                        Gender = "女性",
                        Position = "主任",
                        PcAccountAuth = "管理者",
                        RegistrationDate = DateTime.Now,
                        UpdateDate = DateTime.Now
                    },
                    new MstUser
                    {
                        EmployeeNo = "2025",
                        Name = "研修生",
                        NameKana = "ケンシュウセイ",
                        Department = "開発1課",
                        PhoneNumber = "03-1234-5680",
                        Email = "trainee@example.com",
                        Age = 22,
                        Gender = "男性",
                        Position = "研修生",
                        PcAccountAuth = "利用者",
                        RegistrationDate = DateTime.Now,
                        UpdateDate = DateTime.Now
                    }
                };
                _context.MstUsers.AddRange(mstUsers);

                // サンプルデバイス
                var mstDevices = new[]
                {
                    new MstDevice
                    {
                        AssetNo = "PC001",
                        Manufacturer = "DELL",
                        Os = "Windows 11",
                        Memory = 16,
                        Storage = 512,
                        GraphicsCard = "Intel UHD",
                        StorageLocation = "事務所1F",
                        RegistrationDate = DateTime.Now,
                        UpdateDate = DateTime.Now
                    },
                    new MstDevice
                    {
                        AssetNo = "PC002",
                        Manufacturer = "HP",
                        Os = "Windows 11",
                        Memory = 8,
                        Storage = 256,
                        GraphicsCard = "Intel HD",
                        StorageLocation = "事務所1F",
                        RegistrationDate = DateTime.Now,
                        UpdateDate = DateTime.Now
                    },
                    new MstDevice
                    {
                        AssetNo = "PC003",
                        Manufacturer = "Lenovo",
                        Os = "Windows 10",
                        Memory = 16,
                        Storage = 1024,
                        GraphicsCard = "NVIDIA GTX",
                        StorageLocation = "事務所2F",
                        RegistrationDate = DateTime.Now,
                        UpdateDate = DateTime.Now
                    }
                };
                _context.MstDevices.AddRange(mstDevices);

                // サンプル貸出データ
                var trnRentals = new[]
                {
                    new TrnRental
                    {
                        AssetNo = "PC001",
                        EmployeeNo = "A1001",
                        RentalDate = DateTime.Now.AddDays(-5),
                        DueDate = DateTime.Now.AddDays(25),
                        AvailableFlag = false // 貸出中
                    },
                    new TrnRental
                    {
                        AssetNo = "PC002",
                        AvailableFlag = true // 利用可能
                    },
                    new TrnRental
                    {
                        AssetNo = "PC003",
                        AvailableFlag = true // 利用可能
                    }
                };
                _context.TrnRentals.AddRange(trnRentals);

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "サンプルデータを作成しました",
                    authUsers = authUsers.Length,
                    mstUsers = mstUsers.Length,
                    devices = mstDevices.Length,
                    rentals = trnRentals.Length
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "サンプルデータ作成エラー",
                    error = ex.Message
                });
            }
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetStatus()
        {
            var authUserCount = await _context.AuthUsers.CountAsync();
            var mstUserCount = await _context.MstUsers.CountAsync();
            var deviceCount = await _context.MstDevices.CountAsync();
            var rentalCount = await _context.TrnRentals.CountAsync();

            return Ok(new
            {
                authUsers = authUserCount,
                mstUsers = mstUserCount,
                devices = deviceCount,
                rentals = rentalCount
            });
        }
    }
}