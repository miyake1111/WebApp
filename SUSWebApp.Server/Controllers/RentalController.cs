using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.Data;

namespace SUSWebApp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RentalController : ControllerBase
    {
        private readonly string _connectionString;

        public RentalController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ??
                               "Host=localhost;Database=postgres;Username=postgres;Password=ms369369";
        }

        // 貸出状況一覧を取得
        [HttpGet("status")]
        public async Task<IActionResult> GetRentalStatus()
        {
            try
            {
                var rentalList = new List<object>();

                using (var connection = new NpgsqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query = @"
                        SELECT 
                            r.rental_id,
                            r.asset_no,
                            d.manufacturer,        -- d.maker → d.manufacturer に変更
                            d.os,
                            d.storage_location,    -- d.location → d.storage_location に変更
                            r.employee_no,
                            u.name as employee_name,
                            u.department,
                            r.rental_date,
                            r.due_date,
                            r.return_date,
                            r.available_flag,
                            d.is_broken,          -- d.broken_flag → d.is_broken に変更
                            r.remarks
                        FROM ""TRN_RENTAL"" r
                        LEFT JOIN ""MST_DEVICE"" d ON r.asset_no = d.asset_no
                        LEFT JOIN ""MST_USER"" u ON r.employee_no = u.employee_no
                        WHERE r.available_flag = false
                        ORDER BY r.due_date ASC";

                    using (var cmd = new NpgsqlCommand(query, connection))
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            // 返却日の処理
                            string? returnDateStr = null;
                            if (!reader.IsDBNull(10))
                            {
                                returnDateStr = reader.GetDateTime(10).ToString("yyyy-MM-dd");
                            }

                            // 期限日の処理
                            bool isOverdue = false;
                            if (!reader.IsDBNull(9))
                            {
                                isOverdue = reader.GetDateTime(9) < DateTime.Today;
                            }

                            rentalList.Add(new
                            {
                                rentalId = reader.GetInt32(0),
                                assetNo = reader.GetString(1),
                                maker = reader.IsDBNull(2) ? "" : reader.GetString(2),
                                os = reader.IsDBNull(3) ? "" : reader.GetString(3),
                                location = reader.IsDBNull(4) ? "" : reader.GetString(4),
                                employeeNo = reader.IsDBNull(5) ? "" : reader.GetString(5),
                                employeeName = reader.IsDBNull(6) ? "" : reader.GetString(6),
                                department = reader.IsDBNull(7) ? "" : reader.GetString(7),
                                rentalDate = reader.IsDBNull(8) ? "" : reader.GetDateTime(8).ToString("yyyy-MM-dd"),
                                dueDate = reader.IsDBNull(9) ? "" : reader.GetDateTime(9).ToString("yyyy-MM-dd"),
                                returnDate = returnDateStr ?? "",
                                availableFlag = reader.GetBoolean(11),
                                brokenFlag = reader.IsDBNull(12) ? false : reader.GetBoolean(12),
                                remarks = reader.IsDBNull(13) ? "" : reader.GetString(13),
                                isOverdue = isOverdue
                            });
                        }
                    }
                }

                return Ok(new
                {
                    success = true,
                    data = rentalList,
                    totalCount = rentalList.Count,
                    message = $"貸出中の機器: {rentalList.Count}件"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"エラー: {ex.Message}" });
            }
        }

        // 全ての貸出履歴を取得（貸出中・返却済み両方）
        [HttpGet("history")]
        public async Task<IActionResult> GetRentalHistory()
        {
            try
            {
                var historyList = new List<object>();

                using (var connection = new NpgsqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query = @"
                        SELECT 
                            r.rental_id,
                            r.asset_no,
                            d.manufacturer,        -- d.maker → d.manufacturer に変更
                            d.os,
                            r.employee_no,
                            u.name as employee_name,
                            u.department,
                            r.rental_date,
                            r.due_date,
                            r.return_date,
                            r.available_flag
                        FROM ""TRN_RENTAL"" r
                        LEFT JOIN ""MST_DEVICE"" d ON r.asset_no = d.asset_no
                        LEFT JOIN ""MST_USER"" u ON r.employee_no = u.employee_no
                        ORDER BY r.rental_date DESC
                        LIMIT 100";

                    using (var cmd = new NpgsqlCommand(query, connection))
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            // 返却日の処理
                            string? returnDateStr = null;
                            if (!reader.IsDBNull(9))
                            {
                                returnDateStr = reader.GetDateTime(9).ToString("yyyy-MM-dd");
                            }

                            historyList.Add(new
                            {
                                rentalId = reader.GetInt32(0),
                                assetNo = reader.GetString(1),
                                maker = reader.IsDBNull(2) ? "" : reader.GetString(2),
                                os = reader.IsDBNull(3) ? "" : reader.GetString(3),
                                employeeNo = reader.IsDBNull(4) ? "" : reader.GetString(4),
                                employeeName = reader.IsDBNull(5) ? "" : reader.GetString(5),
                                department = reader.IsDBNull(6) ? "" : reader.GetString(6),
                                rentalDate = reader.IsDBNull(7) ? "" : reader.GetDateTime(7).ToString("yyyy-MM-dd"),
                                dueDate = reader.IsDBNull(8) ? "" : reader.GetDateTime(8).ToString("yyyy-MM-dd"),
                                returnDate = returnDateStr ?? "",
                                status = reader.GetBoolean(10) ? "返却済み" : "貸出中"
                            });
                        }
                    }
                }

                return Ok(new
                {
                    success = true,
                    data = historyList,
                    totalCount = historyList.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"エラー: {ex.Message}" });
            }
        }

        // 特定ユーザーの現在の貸出情報を取得
        [HttpGet("user/{employeeNo}")]
        public async Task<IActionResult> GetUserRentalInfo(string employeeNo)
        {
            try
            {
                using (var connection = new NpgsqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query = @"
                        SELECT 
                            r.rental_id,
                            r.asset_no,
                            r.rental_date,
                            r.due_date,
                            r.return_date
                        FROM ""TRN_RENTAL"" r
                        WHERE r.employee_no = @employeeNo 
                        AND r.available_flag = false
                        LIMIT 1";

                    using (var cmd = new NpgsqlCommand(query, connection))
                    {
                        cmd.Parameters.AddWithValue("employeeNo", employeeNo);

                        using (var reader = await cmd.ExecuteReaderAsync())
                        {
                            if (await reader.ReadAsync())
                            {
                                return Ok(new
                                {
                                    success = true,
                                    rental = new
                                    {
                                        rentalId = reader.GetInt32(0),
                                        assetNo = reader.GetString(1),
                                        rentalDate = reader.GetDateTime(2).ToString("yyyy/MM/dd"),
                                        dueDate = reader.GetDateTime(3).ToString("yyyy/MM/dd"),
                                        returnDate = reader.IsDBNull(4) ? "" : reader.GetDateTime(4).ToString("yyyy/MM/dd")
                                    }
                                });
                            }

                            return Ok(new { success = true, rental = (object?)null });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"エラー: {ex.Message}" });
            }
        }

        // 返却処理
        [HttpPost("return/{rentalId}")]
        public async Task<IActionResult> ReturnDevice(int rentalId)
        {
            try
            {
                using (var connection = new NpgsqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var query = @"
                        UPDATE ""TRN_RENTAL"" 
                        SET available_flag = true, 
                            return_date = @returnDate
                        WHERE rental_id = @rentalId";

                    using (var cmd = new NpgsqlCommand(query, connection))
                    {
                        cmd.Parameters.AddWithValue("rentalId", rentalId);
                        cmd.Parameters.AddWithValue("returnDate", DateTime.Now);

                        var affected = await cmd.ExecuteNonQueryAsync();

                        if (affected > 0)
                        {
                            return Ok(new { success = true, message = "返却処理が完了しました" });
                        }

                        return BadRequest(new { success = false, message = "返却処理に失敗しました" });
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"エラー: {ex.Message}" });
            }
        }
    }
}