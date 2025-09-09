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

        // 貸出状況一覧を取得（全機器：空き・貸出中両方）
        [HttpGet("status")]
        public async Task<IActionResult> GetRentalStatus()
        {
            try
            {
                var rentalList = new List<object>();

                using (var connection = new NpgsqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    // 全機器を取得し、貸出情報があれば結合
                    var query = @"
                        SELECT 
                            d.asset_no,
                            d.manufacturer,
                            d.os,
                            d.storage_location,
                            r.rental_id,
                            r.employee_no,
                            u.name as employee_name,
                            u.department,
                            r.rental_date,
                            r.due_date,
                            r.return_date,
                            r.available_flag,
                            d.is_broken,
                            r.remarks
                        FROM ""MST_DEVICE"" d
                        LEFT JOIN ""TRN_RENTAL"" r ON d.asset_no = r.asset_no AND r.available_flag = false
                        LEFT JOIN ""MST_USER"" u ON r.employee_no = u.employee_no
                        WHERE d.is_deleted = false
                        ORDER BY d.asset_no ASC";

                    using (var cmd = new NpgsqlCommand(query, connection))
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            // 期限超過チェック
                            bool isOverdue = false;
                            if (!reader.IsDBNull(9))
                            {
                                isOverdue = reader.GetDateTime(9) < DateTime.Today;
                            }

                            rentalList.Add(new
                            {
                                assetNo = reader.GetString(0),
                                maker = reader.IsDBNull(1) ? "" : reader.GetString(1),
                                os = reader.IsDBNull(2) ? "" : reader.GetString(2),
                                location = reader.IsDBNull(3) ? "" : reader.GetString(3),
                                rentalId = reader.IsDBNull(4) ? (int?)null : reader.GetInt32(4),
                                employeeNo = reader.IsDBNull(5) ? "" : reader.GetString(5),
                                employeeName = reader.IsDBNull(6) ? "" : reader.GetString(6),
                                department = reader.IsDBNull(7) ? "" : reader.GetString(7),
                                rentalDate = reader.IsDBNull(8) ? "" : reader.GetDateTime(8).ToString("yyyy-MM-dd"),
                                dueDate = reader.IsDBNull(9) ? "" : reader.GetDateTime(9).ToString("yyyy-MM-dd"),
                                returnDate = reader.IsDBNull(10) ? "" : reader.GetDateTime(10).ToString("yyyy-MM-dd"),
                                availableFlag = reader.IsDBNull(11) ? true : reader.GetBoolean(11),
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
                    message = $"全機器: {rentalList.Count}件"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"エラー: {ex.Message}" });
            }
        }

        // 貸出処理
        [HttpPost("rent")]
        public async Task<IActionResult> RentDevice([FromBody] RentalRequest request)
        {
            try
            {
                using (var connection = new NpgsqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    // トランザクション開始
                    using (var transaction = await connection.BeginTransactionAsync())
                    {
                        try
                        {
                            // まず機器が貸出可能か確認（返却されていない貸出レコードがあるか）
                            var checkQuery = @"
                                SELECT COUNT(*) 
                                FROM ""TRN_RENTAL"" 
                                WHERE asset_no = @assetNo 
                                AND (return_date IS NULL OR available_flag = false)";

                            using (var checkCmd = new NpgsqlCommand(checkQuery, connection, transaction))
                            {
                                checkCmd.Parameters.AddWithValue("assetNo", request.AssetNo);
                                var count = Convert.ToInt32(await checkCmd.ExecuteScalarAsync());

                                if (count > 0)
                                {
                                    await transaction.RollbackAsync();
                                    return BadRequest(new { success = false, message = "この機器は既に貸出中です" });
                                }
                            }

                            // 貸出登録（rental_idは自動生成）
                            var insertQuery = @"
                                INSERT INTO ""TRN_RENTAL"" 
                                (asset_no, employee_no, rental_date, due_date, available_flag, remarks)
                                VALUES 
                                (@assetNo, @employeeNo, @rentalDate, @dueDate, false, @remarks)
                                RETURNING rental_id";

                            using (var cmd = new NpgsqlCommand(insertQuery, connection, transaction))
                            {
                                cmd.Parameters.AddWithValue("assetNo", request.AssetNo);
                                cmd.Parameters.AddWithValue("employeeNo", request.EmployeeNo);
                                cmd.Parameters.AddWithValue("rentalDate", DateTime.Parse(request.RentalDate));
                                cmd.Parameters.AddWithValue("dueDate", DateTime.Parse(request.DueDate));
                                cmd.Parameters.AddWithValue("remarks", string.IsNullOrEmpty(request.Remarks) ? "" : request.Remarks);

                                var rentalId = await cmd.ExecuteScalarAsync();

                                await transaction.CommitAsync();

                                return Ok(new
                                {
                                    success = true,
                                    message = "貸出処理が完了しました",
                                    rentalId = rentalId
                                });
                            }
                        }
                        catch
                        {
                            await transaction.RollbackAsync();
                            throw;
                        }
                    }
                }
            }
            catch (NpgsqlException npgEx) when (npgEx.SqlState == "23505")  // 重複キーエラー
            {
                return BadRequest(new
                {
                    success = false,
                    message = "この機器は既に貸出処理中です。画面を更新してください。"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = $"貸出処理でエラーが発生しました: {ex.Message}"
                });
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
    }

    // リクエストモデル
    public class RentalRequest
    {
        public string AssetNo { get; set; }
        public string EmployeeNo { get; set; }
        public string RentalDate { get; set; }
        public string DueDate { get; set; }
        public string? Remarks { get; set; }
    }
}