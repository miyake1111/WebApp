using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;

namespace SUSWebApp.Server.Controllers
{
    /// <summary>
    /// 貸出管理APIコントローラー
    /// 機器の貸出・返却処理と履歴管理を提供
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]  // URLパス: /api/rental
    public class RentalController : ControllerBase
    {
        // データベース接続文字列
        private readonly string _connectionString;

        /// <summary>
        /// コンストラクタ - 依存性注入で設定を受け取る
        /// </summary>
        public RentalController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        /// <summary>
        /// 機器貸出処理
        /// POST: /api/rental/rent
        /// </summary>
        [HttpPost("rent")]
        public IActionResult RentDevice([FromBody] RentalRequest request)
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                connection.Open();

                // トランザクション開始（貸出処理の整合性を保証）
                using var transaction = connection.BeginTransaction();

                try
                {
                    // ===== STEP 1: 機器が貸出可能か確認 =====
                    var checkAvailabilityQuery = @"
                SELECT available_flag 
                FROM ""TRN_RENTAL""
                WHERE asset_no = @AssetNo";

                    bool isAvailable = false;
                    using (var cmd = new NpgsqlCommand(checkAvailabilityQuery, connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("@AssetNo", request.AssetNo);
                        var result = cmd.ExecuteScalar();
                        if (result != null)
                        {
                            isAvailable = Convert.ToBoolean(result);
                        }
                    }

                    if (!isAvailable)
                    {
                        transaction.Rollback();
                        return BadRequest(new { success = false, message = "この機器は貸出できません" });
                    }

                    // ===== STEP 2: TRN_RENTALテーブルを更新 =====
                    var updateQuery = @"
                UPDATE ""TRN_RENTAL""
                SET employee_no = @EmployeeNo,
                    rental_date = CURRENT_DATE,        -- 貸出日は今日
                    due_date = @DueDate::date,         -- 返却予定日
                    return_date = NULL,                -- 返却日はクリア
                    available_flag = FALSE              -- 貸出中フラグ
                WHERE asset_no = @AssetNo 
                AND available_flag = TRUE";

                    using (var cmd = new NpgsqlCommand(updateQuery, connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("@AssetNo", request.AssetNo);
                        cmd.Parameters.AddWithValue("@EmployeeNo", request.EmployeeNo);
                        cmd.Parameters.AddWithValue("@DueDate", request.DueDate);

                        var updateResult = cmd.ExecuteNonQuery();
                        if (updateResult == 0)
                        {
                            transaction.Rollback();
                            return BadRequest(new { success = false, message = "貸出処理に失敗しました" });
                        }
                    }

                    transaction.Commit();
                    return Ok(new { success = true, message = "貸出処理が完了しました" });
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    Console.WriteLine($"貸出エラー: {ex.Message}");
                    throw;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"貸出処理エラー: {ex.Message}");
                return StatusCode(500, new { success = false, message = $"エラー: {ex.Message}" });
            }
        }

        /// <summary>
        /// 機器返却処理
        /// POST: /api/rental/return
        /// </summary>
        [HttpPost("return")]
        public IActionResult ReturnDevice([FromBody] ReturnRequest request)
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                connection.Open();

                using var transaction = connection.BeginTransaction();

                try
                {
                    // ===== STEP 1: 現在の貸出情報を取得 =====
                    string employeeNo = null;
                    string employeeName = null;
                    DateTime? rentalDate = null;
                    DateTime? dueDate = null;

                    var getCurrentRentalQuery = @"
                SELECT r.employee_no, r.rental_date, r.due_date, u.name as employee_name
                FROM ""TRN_RENTAL"" r
                LEFT JOIN ""MST_USER"" u ON r.employee_no = u.employee_no
                WHERE r.asset_no = @AssetNo 
                AND r.available_flag = FALSE      -- 貸出中
                AND r.return_date IS NULL"; //未返却

                    using (var cmd = new NpgsqlCommand(getCurrentRentalQuery, connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("@AssetNo", request.AssetNo);
                        using var reader = cmd.ExecuteReader();
                        if (reader.Read())
                        {
                            employeeNo = reader["employee_no"]?.ToString();
                            employeeName = reader["employee_name"]?.ToString();
                            rentalDate = reader["rental_date"] as DateTime?;
                            dueDate = reader["due_date"] as DateTime?;
                        }
                        else
                        {
                            return BadRequest(new { success = false, message = "貸出中の機器が見つかりません" });
                        }
                    }

                    // ===== STEP 2: TRN_RENTALを更新（返却処理） =====
                    var updateQuery = @"
                UPDATE ""TRN_RENTAL""
                SET available_flag = TRUE,         -- 貸出可能にする
                    return_date = CURRENT_DATE     -- 返却日を今日に設定
                WHERE asset_no = @AssetNo 
                AND available_flag = FALSE
                AND return_date IS NULL";

                    using (var cmd = new NpgsqlCommand(updateQuery, connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("@AssetNo", request.AssetNo);

                        var updateResult = cmd.ExecuteNonQuery();
                        if (updateResult == 0)
                        {
                            transaction.Rollback();
                            return BadRequest(new { success = false, message = "返却処理に失敗しました" });
                        }
                    }

                    // ===== STEP 3: 履歴テーブルに記録 =====
                    var changeHistoryQuery = @"
                INSERT INTO ""HST_RENTAL_CHANGE"" 
                (change_date, change_type, asset_no, employee_no_before, employee_no_after, 
                 rental_date_before, rental_date_after, due_date_before, due_date_after,
                 return_date_after, changed_by_employee_no)
                VALUES 
                (CURRENT_TIMESTAMP, '返却', @AssetNo, @EmployeeNoBefore, @EmployeeNoBefore,
                 @RentalDateBefore, @RentalDateBefore, @DueDateBefore, @DueDateBefore,
                 CURRENT_DATE, @ChangedBy)";

                    using (var cmd = new NpgsqlCommand(changeHistoryQuery, connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("@AssetNo", request.AssetNo);
                        cmd.Parameters.AddWithValue("@EmployeeNoBefore", (object)employeeNo ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@RentalDateBefore", (object)rentalDate ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@DueDateBefore", (object)dueDate ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@ChangedBy", request.EmployeeNo ?? "SYSTEM");

                        cmd.ExecuteNonQuery();
                    }

                    transaction.Commit();

                    // 返却完了情報を返す
                    return Ok(new
                    {
                        success = true,
                        message = "返却処理が完了しました",
                        returnInfo = new
                        {
                            assetNo = request.AssetNo,
                            returnDate = DateTime.Now.ToString("yyyy-MM-dd"),
                            returnedBy = employeeNo,
                            returnedByName = employeeName
                        }
                    });
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    Console.WriteLine($"返却エラー詳細: {ex.Message}");
                    throw;
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"エラー: {ex.Message}" });
            }
        }

        /// <summary>
        /// 貸出状況一覧取得
        /// GET: /api/rental/status
        /// </summary>
        [HttpGet("status")]
        public IActionResult GetRentalStatus()
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                connection.Open();

                // 貸出状況を取得する複雑なクエリ
                var query = @"
            SELECT 
                r.rental_id,
                r.asset_no,
                d.manufacturer as maker,
                d.os,
                d.memory,
                d.storage,
                d.graphics_card as graphicsCard,
                d.storage_location as storageLocation,
                d.is_broken as malfunction,
                r.available_flag as availableFlag,
                r.employee_no as employeeNo,
                u.name as employeeName,
                u.department,
                TO_CHAR(r.rental_date, 'YYYY-MM-DD') as rentalDate,
                TO_CHAR(r.due_date, 'YYYY-MM-DD') as dueDate,
                TO_CHAR(r.return_date, 'YYYY-MM-DD') as returnDate,
                TO_CHAR(r.inventory_date, 'YYYY-MM-DD HH24:MI:SS') as inventoryDate,
                r.remarks as rentalRemarks,
                d.remarks as deviceRemarks,
                -- 延滞フラグの計算
                CASE 
                    WHEN r.available_flag = FALSE AND r.due_date < CURRENT_DATE 
                    THEN true 
                    ELSE false 
                END as isOverdue
            FROM ""TRN_RENTAL"" r
            INNER JOIN ""MST_DEVICE"" d ON r.asset_no = d.asset_no
            LEFT JOIN ""MST_USER"" u ON r.employee_no = u.employee_no
            WHERE d.is_deleted = FALSE
            ORDER BY r.asset_no";

                var rentals = new List<object>();

                using (var cmd = new NpgsqlCommand(query, connection))
                {
                    using var reader = cmd.ExecuteReader();
                    while (reader.Read())
                    {
                        rentals.Add(new
                        {
                            rentalId = reader["rental_id"],
                            assetNo = reader["asset_no"]?.ToString(),
                            maker = reader["maker"]?.ToString(),
                            os = reader["os"]?.ToString(),
                            memory = reader["memory"],
                            storage = reader["storage"],
                            graphicsCard = reader["graphicsCard"]?.ToString(),
                            storageLocation = reader["storageLocation"]?.ToString(),
                            malfunction = Convert.ToBoolean(reader["malfunction"]),
                            availableFlag = Convert.ToBoolean(reader["availableFlag"]),
                            employeeNo = reader["employeeNo"]?.ToString(),
                            employeeName = reader["employeeName"]?.ToString(),
                            department = reader["department"]?.ToString(),
                            rentalDate = reader["rentalDate"]?.ToString(),
                            dueDate = reader["dueDate"]?.ToString(),
                            returnDate = reader["returnDate"]?.ToString(),
                            inventoryDate = reader["inventoryDate"]?.ToString(),
                            rentalRemarks = reader["rentalRemarks"]?.ToString(),
                            deviceRemarks = reader["deviceRemarks"]?.ToString(),
                            isOverdue = Convert.ToBoolean(reader["isOverdue"])  // 延滞フラグ
                        });
                    }
                }

                return Ok(rentals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// 特定ユーザーの貸出情報を取得（単一）
        /// GET: /api/rental/user/{employeeNo}
        /// </summary>
        [HttpGet("user/{employeeNo}")]
        public IActionResult GetUserRentalInfo(string employeeNo)
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                connection.Open();

                var query = @"
            SELECT 
                r.rental_id as rentalId,
                r.asset_no as assetNo,
                r.rental_date as rentalDate,
                r.due_date as dueDate,
                r.return_date as returnDate
            FROM ""TRN_RENTAL"" r
            WHERE r.employee_no = @EmployeeNo
            AND r.available_flag = FALSE    -- 貸出中
            AND r.return_date IS NULL        -- 未返却
            LIMIT 1"; //1件のみ取得

                using var cmd = new NpgsqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@EmployeeNo", employeeNo);

                using var reader = cmd.ExecuteReader();
                if (reader.Read())
                {
                    var rental = new
                    {
                        rentalId = Convert.ToInt32(reader["rentalId"]),
                        assetNo = reader["assetNo"]?.ToString(),
                        rentalDate = reader["rentalDate"] != DBNull.Value
                            ? Convert.ToDateTime(reader["rentalDate"]).ToString("yyyy/MM/dd")
                            : null,
                        dueDate = reader["dueDate"] != DBNull.Value
                            ? Convert.ToDateTime(reader["dueDate"]).ToString("yyyy/MM/dd")
                            : null
                    };

                    return Ok(new { rental = rental });
                }

                return Ok(new { rental = (object)null });  // 貸出なし
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// 特定ユーザーの貸出情報を取得（複数）
        /// GET: /api/rental/user/{employeeNo}/all
        /// </summary>
        [HttpGet("user/{employeeNo}/all")]
        public IActionResult GetUserRentalsAll(string employeeNo)
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                connection.Open();

                var query = @"
            SELECT 
                r.rental_id as rentalId,
                r.asset_no as assetNo,
                r.rental_date as rentalDate,
                r.due_date as dueDate
            FROM ""TRN_RENTAL"" r
            WHERE r.employee_no = @EmployeeNo
            AND r.available_flag = FALSE
            AND r.return_date IS NULL
            ORDER BY r.rental_date DESC";    // 新しい順

                var rentals = new List<object>();
                using var cmd = new NpgsqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@EmployeeNo", employeeNo);

                using var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    rentals.Add(new
                    {
                        rentalId = Convert.ToInt32(reader["rentalId"]),
                        assetNo = reader["assetNo"]?.ToString(),
                        rentalDate = reader["rentalDate"] != DBNull.Value
                            ? Convert.ToDateTime(reader["rentalDate"]).ToString("yyyy/MM/dd")
                            : "-",
                        dueDate = reader["dueDate"] != DBNull.Value
                            ? Convert.ToDateTime(reader["dueDate"]).ToString("yyyy/MM/dd")
                            : "-"
                    });
                }

                return Ok(new { success = true, rentals = rentals });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        /// <summary>
        /// 返却処理（IDベース）
        /// POST: /api/rental/return/{rentalId}
        /// </summary>
        [HttpPost("return/{rentalId}")]
        public IActionResult ReturnDeviceById(int rentalId)
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                connection.Open();

                using var transaction = connection.BeginTransaction();

                try
                {
                    // ===== STEP 1: 該当レコードの情報を取得 =====
                    var getInfoQuery = @"
                SELECT asset_no, employee_no, rental_date, due_date
                FROM ""TRN_RENTAL""
                WHERE rental_id = @RentalId
                AND available_flag = FALSE
                AND return_date IS NULL";

                    string assetNo = null;
                    string employeeNo = null;
                    DateTime? rentalDate = null;
                    DateTime? dueDate = null;

                    using (var cmd = new NpgsqlCommand(getInfoQuery, connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("@RentalId", rentalId);
                        using var reader = cmd.ExecuteReader();
                        if (reader.Read())
                        {
                            assetNo = reader["asset_no"]?.ToString();
                            employeeNo = reader["employee_no"]?.ToString();
                            rentalDate = reader["rental_date"] as DateTime?;
                            dueDate = reader["due_date"] as DateTime?;
                        }
                        else
                        {
                            return BadRequest(new { success = false, message = "貸出情報が見つかりません" });
                        }
                    }

                    // ===== STEP 2: 返却処理 =====
                    var updateQuery = @"
                UPDATE ""TRN_RENTAL""
                SET available_flag = TRUE,
                    return_date = CURRENT_DATE
                WHERE rental_id = @RentalId";

                    using (var cmd = new NpgsqlCommand(updateQuery, connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("@RentalId", rentalId);
                        var result = cmd.ExecuteNonQuery();

                        if (result == 0)
                        {
                            transaction.Rollback();
                            return BadRequest(new { success = false, message = "返却処理に失敗しました" });
                        }
                    }

                    // ===== STEP 3: 履歴に記録 =====
                    var changeHistoryQuery = @"
                INSERT INTO ""HST_RENTAL_CHANGE"" 
                (change_date, change_type, asset_no, employee_no_before, employee_no_after, 
                 rental_date_before, rental_date_after, due_date_before, due_date_after,
                 return_date_after, changed_by_employee_no)
                VALUES 
                (CURRENT_TIMESTAMP, '返却', @AssetNo, @EmployeeNo, @EmployeeNo,
                 @RentalDate, @RentalDate, @DueDate, @DueDate,
                 CURRENT_DATE, @EmployeeNo)";

                    using (var cmd = new NpgsqlCommand(changeHistoryQuery, connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("@AssetNo", assetNo);
                        cmd.Parameters.AddWithValue("@EmployeeNo", (object)employeeNo ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@RentalDate", (object)rentalDate ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@DueDate", (object)dueDate ?? DBNull.Value);

                        cmd.ExecuteNonQuery();
                    }

                    transaction.Commit();
                    return Ok(new { success = true, message = "返却処理が完了しました" });
                }
                catch
                {
                    transaction.Rollback();
                    throw;
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"エラー: {ex.Message}" });
            }
        }

        /// <summary>
        /// 全貸出履歴取得
        /// GET: /api/rental/history
        /// </summary>
        [HttpGet("history")]
        public IActionResult GetAllRentalHistory()
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                connection.Open();

                var query = @"
            SELECT 
                r.rental_id as id,
                r.asset_no as assetNo,
                TO_CHAR(r.rental_date, 'YYYY-MM-DD') as rentalDate,
                TO_CHAR(r.return_date, 'YYYY-MM-DD') as returnDate,
                r.employee_no as employeeNo,
                u.name as employeeName,
                u.name_kana as employeeNameKana,
                d.os
            FROM ""TRN_RENTAL"" r
            LEFT JOIN ""MST_USER"" u ON r.employee_no = u.employee_no
            LEFT JOIN ""MST_DEVICE"" d ON r.asset_no = d.asset_no
            WHERE r.rental_date IS NOT NULL
            ORDER BY r.rental_date DESC";

                var histories = new List<object>();
                using (var cmd = new NpgsqlCommand(query, connection))
                {
                    using var reader = cmd.ExecuteReader();
                    while (reader.Read())
                    {
                        histories.Add(new
                        {
                            id = reader["id"],
                            assetNo = reader["assetNo"]?.ToString(),
                            rentalDate = reader["rentalDate"]?.ToString(),
                            returnDate = reader["returnDate"]?.ToString(),
                            employeeNo = reader["employeeNo"]?.ToString(),
                            employeeName = reader["employeeName"]?.ToString(),
                            employeeNameKana = reader["employeeNameKana"]?.ToString(),
                            os = reader["os"]?.ToString()
                        });
                    }
                }

                return Ok(new { success = true, data = histories });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        /// <summary>
        /// 特定資産の履歴取得
        /// GET: /api/rental/history/{assetNo}
        /// </summary>
        [HttpGet("history/{assetNo}")]
        public IActionResult GetAssetRentalHistory(string assetNo)
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                connection.Open();

                var query = @"
            SELECT 
                r.rental_id as rentalId,
                TO_CHAR(r.rental_date, 'YYYY-MM-DD') as rentalDate,
                TO_CHAR(r.return_date, 'YYYY-MM-DD') as returnDate,
                r.employee_no as employeeNo,
                u.name as employeeName,
                d.os
            FROM ""TRN_RENTAL"" r
            LEFT JOIN ""MST_USER"" u ON r.employee_no = u.employee_no
            LEFT JOIN ""MST_DEVICE"" d ON r.asset_no = d.asset_no
            WHERE r.asset_no = @AssetNo
            AND r.rental_date IS NOT NULL
            ORDER BY r.rental_date DESC";

                var histories = new List<object>();
                using (var cmd = new NpgsqlCommand(query, connection))
                {
                    cmd.Parameters.AddWithValue("@AssetNo", assetNo);
                    using var reader = cmd.ExecuteReader();
                    while (reader.Read())
                    {
                        histories.Add(new
                        {
                            rentalId = reader["rentalId"],
                            rentalDate = reader["rentalDate"]?.ToString(),
                            returnDate = reader["returnDate"]?.ToString(),
                            employeeNo = reader["employeeNo"]?.ToString(),
                            employeeName = reader["employeeName"]?.ToString(),
                            os = reader["os"]?.ToString()
                        });
                    }
                }

                return Ok(histories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    // ===== リクエストクラスの定義 =====

    /// <summary>
    /// 貸出リクエストモデル
    /// </summary>
    public class RentalRequest
    {
        public string AssetNo { get; set; }        // 資産番号
        public string EmployeeNo { get; set; }     // 社員番号
        public DateTime? RentalDate { get; set; }  // 貸出日（通常は自動設定）
        public DateTime DueDate { get; set; }      // 返却予定日
    }

    /// <summary>
    /// 返却リクエストモデル
    /// </summary>
    public class ReturnRequest
    {
        public string AssetNo { get; set; }       // 資産番号
        public string EmployeeNo { get; set; }    // 現在のユーザーの社員番号
        public DateTime? ReturnDate { get; set; } // 返却日（通常は自動設定）
    }
}