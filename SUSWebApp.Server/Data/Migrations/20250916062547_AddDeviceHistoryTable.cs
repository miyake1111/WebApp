using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SUSWebApp.Server.Migrations
{
    /// <summary>
    /// デバイス履歴テーブル追加マイグレーション
    /// 作成日: 2025/09/16 06:25:47
    /// 一部カラムの制約も変更
    /// </summary>
    public partial class AddDeviceHistoryTable : Migration
    {
        /// <summary>
        /// マイグレーション適用時の処理
        /// </summary>
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ===== 既存テーブルのカラム定義変更 =====

            // MST_USER.position を NULL許可に変更
            migrationBuilder.AlterColumn<string>(
                name: "position",
                table: "MST_USER",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,  // NULL許可に変更
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            // MST_USER.pc_account_auth の長さを50から20に短縮
            migrationBuilder.AlterColumn<string>(
                name: "pc_account_auth",
                table: "MST_USER",
                type: "character varying(20)",  // 20文字に短縮
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            // MST_USER.email の長さを200から255に拡張
            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "MST_USER",
                type: "character varying(255)",  // 255文字に拡張
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            // MST_DEVICE.remarks を NULL許可に変更
            migrationBuilder.AlterColumn<string>(
                name: "remarks",
                table: "MST_DEVICE",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,  // NULL許可に変更
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            // ===== 新規テーブル作成: DeviceHistories =====
            // Entity Framework用の簡易版デバイス履歴テーブル
            migrationBuilder.CreateTable(
                name: "DeviceHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),  // 自動採番
                    ChangeDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),        // 変更日時
                    UpdaterEmployeeNo = table.Column<string>(type: "text", nullable: false),                      // 更新者社員番号
                    TargetAssetNo = table.Column<string>(type: "text", nullable: false),                         // 対象資産番号
                    ChangeField = table.Column<string>(type: "text", nullable: false),                           // 変更項目
                    ChangeContent = table.Column<string>(type: "text", nullable: false)                          // 変更内容
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceHistories", x => x.Id);
                });
        }

        /// <summary>
        /// マイグレーションロールバック時の処理
        /// </summary>
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // DeviceHistoriesテーブルを削除
            migrationBuilder.DropTable(name: "DeviceHistories");

            // ===== カラム定義を元に戻す =====

            // MST_USER.position を NOT NULL に戻す
            migrationBuilder.AlterColumn<string>(
                name: "position",
                table: "MST_USER",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",  // デフォルト値設定
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            // MST_USER.pc_account_auth を50文字に戻す
            migrationBuilder.AlterColumn<string>(
                name: "pc_account_auth",
                table: "MST_USER",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            // MST_USER.email を200文字に戻す
            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "MST_USER",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            // MST_DEVICE.remarks を NOT NULL に戻す
            migrationBuilder.AlterColumn<string>(
                name: "remarks",
                table: "MST_DEVICE",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "",  // デフォルト値設定
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true);
        }
    }
}