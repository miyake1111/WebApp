using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SUSWebApp.Server.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AUTH_USER",
                columns: table => new
                {
                    employee_no = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    password = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AUTH_USER", x => x.employee_no);
                });

            migrationBuilder.CreateTable(
                name: "HST_DEVICE_CHANGE",
                columns: table => new
                {
                    change_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    change_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    changed_by_employee_no = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    asset_no = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    change_field = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    change_content = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HST_DEVICE_CHANGE", x => x.change_id);
                });

            migrationBuilder.CreateTable(
                name: "HST_USER_CHANGE",
                columns: table => new
                {
                    change_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    change_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    changed_by_employee_no = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    target_employee_no = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    change_field = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    change_content = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HST_USER_CHANGE", x => x.change_id);
                });

            migrationBuilder.CreateTable(
                name: "MST_DEVICE",
                columns: table => new
                {
                    asset_no = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    manufacturer = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    os = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    memory = table.Column<int>(type: "integer", nullable: false),
                    storage = table.Column<int>(type: "integer", nullable: false),
                    graphics_card = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    storage_location = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    is_broken = table.Column<bool>(type: "boolean", nullable: false),
                    lease_start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    lease_end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    remarks = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    registration_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    update_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MST_DEVICE", x => x.asset_no);
                });

            migrationBuilder.CreateTable(
                name: "MST_USER",
                columns: table => new
                {
                    employee_no = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    name_kana = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    department = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    phone_number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    age = table.Column<int>(type: "integer", nullable: false),
                    gender = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    position = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    pc_account_auth = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    registration_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    update_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    retirement_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MST_USER", x => x.employee_no);
                });

            migrationBuilder.CreateTable(
                name: "TRN_RENTAL",
                columns: table => new
                {
                    rental_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    asset_no = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    employee_no = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    rental_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    return_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    due_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    inventory_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    remarks = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    available_flag = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TRN_RENTAL", x => x.rental_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TRN_RENTAL_ASSET_NO",
                table: "TRN_RENTAL",
                column: "asset_no");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AUTH_USER");

            migrationBuilder.DropTable(
                name: "HST_DEVICE_CHANGE");

            migrationBuilder.DropTable(
                name: "HST_USER_CHANGE");

            migrationBuilder.DropTable(
                name: "MST_DEVICE");

            migrationBuilder.DropTable(
                name: "MST_USER");

            migrationBuilder.DropTable(
                name: "TRN_RENTAL");
        }
    }
}
