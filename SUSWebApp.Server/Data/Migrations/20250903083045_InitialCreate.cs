using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SUSWebApp.Server.Migrations
{
    /// <summary>
    /// 初期マイグレーション - データベースの初期構造を作成
    /// 作成日: 2025/09/03 08:30:45
    /// </summary>
    public partial class InitialCreate : Migration
    {
        /// <summary>
        /// マイグレーション適用時の処理
        /// テーブル作成とインデックスの設定
        /// </summary>
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ===== AUTH_USER テーブル（認証用） =====
            migrationBuilder.CreateTable(
                name: "AUTH_USER",
                columns: table => new
                {
                    employee_no = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),  // 社員番号（主キー）
                    password = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)      // パスワード
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AUTH_USER", x => x.employee_no);  // 社員番号を主キーに設定
                });

            // ===== HST_DEVICE_CHANGE テーブル（デバイス変更履歴） =====
            migrationBuilder.CreateTable(
                name: "HST_DEVICE_CHANGE",
                columns: table => new
                {
                    change_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),  // 自動採番
                    change_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),      // 変更日時
                    changed_by_employee_no = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),  // 変更者
                    asset_no = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),  // 資産番号
                    change_field = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),  // 変更項目
                    change_content = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false)  // 変更内容
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HST_DEVICE_CHANGE", x => x.change_id);
                });

            // ===== HST_USER_CHANGE テーブル（ユーザー変更履歴） =====
            migrationBuilder.CreateTable(
                name: "HST_USER_CHANGE",
                columns: table => new
                {
                    change_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),  // 自動採番
                    change_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),      // 変更日時
                    changed_by_employee_no = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),  // 変更者
                    target_employee_no = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),  // 対象社員
                    change_field = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),  // 変更項目
                    change_content = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false)  // 変更内容
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HST_USER_CHANGE", x => x.change_id);
                });

            // ===== MST_DEVICE テーブル（デバイスマスタ） =====
            migrationBuilder.CreateTable(
                name: "MST_DEVICE",
                columns: table => new
                {
                    asset_no = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),  // 資産番号（主キー）
                    manufacturer = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),  // メーカー
                    os = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),      // OS
                    memory = table.Column<int>(type: "integer", nullable: false),                                   // メモリ（GB）
                    storage = table.Column<int>(type: "integer", nullable: false),                                  // ストレージ（GB）
                    graphics_card = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),  // グラフィックカード
                    storage_location = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),  // 保管場所
                    is_broken = table.Column<bool>(type: "boolean", nullable: false),                              // 故障フラグ
                    lease_start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),    // リース開始日
                    lease_end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),      // リース終了日
                    remarks = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),  // 備考
                    registration_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),  // 登録日
                    update_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),        // 更新日
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false)                              // 削除フラグ
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MST_DEVICE", x => x.asset_no);
                });

            // ===== MST_USER テーブル（ユーザーマスタ） =====
            migrationBuilder.CreateTable(
                name: "MST_USER",
                columns: table => new
                {
                    employee_no = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),  // 社員番号（主キー）
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),       // 氏名
                    name_kana = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),  // 氏名カナ
                    department = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false), // 部署
                    phone_number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false), // 電話番号
                    email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),      // メール
                    age = table.Column<int>(type: "integer", nullable: false),                                         // 年齢
                    gender = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),       // 性別
                    position = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),     // 役職
                    pc_account_auth = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),  // PC権限
                    registration_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),      // 登録日
                    update_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),            // 更新日
                    retirement_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),         // 退職日
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false)                                  // 削除フラグ
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MST_USER", x => x.employee_no);
                });

            // ===== TRN_RENTAL テーブル（貸出トランザクション） =====
            migrationBuilder.CreateTable(
                name: "TRN_RENTAL",
                columns: table => new
                {
                    rental_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),  // 自動採番
                    asset_no = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),     // 資産番号
                    employee_no = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),   // 社員番号
                    rental_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),             // 貸出日
                    return_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),             // 返却日
                    due_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),                // 返却予定日
                    inventory_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),          // 棚卸日
                    remarks = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),    // 備考
                    available_flag = table.Column<bool>(type: "boolean", nullable: false)                               // 利用可能フラグ
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TRN_RENTAL", x => x.rental_id);
                });

            // インデックス作成 - 資産番号での検索を高速化
            migrationBuilder.CreateIndex(
                name: "IX_TRN_RENTAL_ASSET_NO",
                table: "TRN_RENTAL",
                column: "asset_no");
        }

        /// <summary>
        /// マイグレーションロールバック時の処理
        /// 作成したテーブルを削除
        /// </summary>
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "AUTH_USER");
            migrationBuilder.DropTable(name: "HST_DEVICE_CHANGE");
            migrationBuilder.DropTable(name: "HST_USER_CHANGE");
            migrationBuilder.DropTable(name: "MST_DEVICE");
            migrationBuilder.DropTable(name: "MST_USER");
            migrationBuilder.DropTable(name: "TRN_RENTAL");
        }
    }
}