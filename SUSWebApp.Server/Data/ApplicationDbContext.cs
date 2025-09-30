using Microsoft.EntityFrameworkCore;
using SUSWebApp.Server.Models.Entities;

namespace SUSWebApp.Server.Data
{
    /// <summary>
    /// Entity Framework Coreのデータベースコンテキストクラス
    /// データベースとの接続とエンティティのマッピングを管理
    /// </summary>
    public class ApplicationDbContext : DbContext
    {
        /// <summary>
        /// コンストラクタ
        /// </summary>
        /// <param name="options">データベース接続オプション（Startup.csで設定）</param>
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // ===== 各テーブルに対応するDbSetプロパティ =====
        // これらのプロパティを通じてデータベースにアクセス

        /// <summary>認証ユーザーテーブル</summary>
        public DbSet<AuthUser> AuthUsers { get; set; }

        /// <summary>ユーザーマスタテーブル</summary>
        public DbSet<MstUser> MstUsers { get; set; }

        /// <summary>デバイスマスタテーブル</summary>
        public DbSet<MstDevice> MstDevices { get; set; }

        /// <summary>貸出トランザクションテーブル</summary>
        public DbSet<TrnRental> TrnRentals { get; set; }

        /// <summary>デバイス変更履歴テーブル</summary>
        public DbSet<HstDeviceChange> HstDeviceChanges { get; set; }

        /// <summary>ユーザー変更履歴テーブル</summary>
        public DbSet<HstUserChange> HstUserChanges { get; set; }

        /// <summary>デバイス履歴テーブル（簡易版）</summary>
        public DbSet<DeviceHistory> DeviceHistories { get; set; }

        /// <summary>貸出変更履歴テーブル</summary>
        public DbSet<RentalHistory> HstRentalChanges { get; set; }

        /// <summary>
        /// モデル構築時のカスタマイズ
        /// テーブル名やカラム名のマッピング設定
        /// </summary>
        /// <param name="modelBuilder">モデルビルダー</param>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // ===== テーブル名を明示的に大文字で指定 =====
            // PostgreSQLでは大文字のテーブル名を使用
            modelBuilder.Entity<AuthUser>().ToTable("AUTH_USER");
            modelBuilder.Entity<MstUser>().ToTable("MST_USER");
            modelBuilder.Entity<MstDevice>().ToTable("MST_DEVICE");
            modelBuilder.Entity<TrnRental>().ToTable("TRN_RENTAL");
            modelBuilder.Entity<HstDeviceChange>().ToTable("HST_DEVICE_CHANGE");
            modelBuilder.Entity<HstUserChange>().ToTable("HST_USER_CHANGE");
            modelBuilder.Entity<RentalHistory>().ToTable("HST_RENTAL_CHANGE");

            // ===== RentalHistory のカラムマッピング詳細設定 =====
            modelBuilder.Entity<RentalHistory>(entity =>
            {
                // 主キー設定
                entity.HasKey(e => e.Id);

                // カラム名マッピング（C#プロパティ名 → DBカラム名）
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.RentalDate).HasColumnName("rental_date");
                entity.Property(e => e.ReturnDate).HasColumnName("return_date");
                entity.Property(e => e.EmployeeNo)
                    .HasColumnName("employee_no")
                    .HasMaxLength(20);  // 最大長20文字
                entity.Property(e => e.AssetNo)
                    .HasColumnName("asset_no")
                    .HasMaxLength(20);  // 最大長20文字
                entity.Property(e => e.Os)
                    .HasColumnName("os")
                    .HasMaxLength(50);  // 最大長50文字
            });

            // ===== インデックス設定 =====
            // TRN_RENTALテーブルの資産番号インデックス（検索高速化）
            modelBuilder.Entity<TrnRental>()
                .HasIndex(r => r.AssetNo)
                .HasDatabaseName("IX_TRN_RENTAL_ASSET_NO");

            // 基底クラスのメソッドを呼び出し
            base.OnModelCreating(modelBuilder);
        }
    }
}