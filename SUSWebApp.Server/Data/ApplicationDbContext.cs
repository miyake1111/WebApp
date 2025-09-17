using Microsoft.EntityFrameworkCore;
using SUSWebApp.Server.Models.Entities;

namespace SUSWebApp.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // 各テーブルに対応するDbSet
        public DbSet<AuthUser> AuthUsers { get; set; }
        public DbSet<MstUser> MstUsers { get; set; }
        public DbSet<MstDevice> MstDevices { get; set; }
        public DbSet<TrnRental> TrnRentals { get; set; }
        public DbSet<HstDeviceChange> HstDeviceChanges { get; set; }
        public DbSet<HstUserChange> HstUserChanges { get; set; }
        public DbSet<DeviceHistory> DeviceHistories { get; set; }
        public DbSet<RentalHistory> HstRentalChanges { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // テーブル名を明示的に大文字で指定
            modelBuilder.Entity<AuthUser>().ToTable("AUTH_USER");
            modelBuilder.Entity<MstUser>().ToTable("MST_USER");
            modelBuilder.Entity<MstDevice>().ToTable("MST_DEVICE");
            modelBuilder.Entity<TrnRental>().ToTable("TRN_RENTAL");
            modelBuilder.Entity<HstDeviceChange>().ToTable("HST_DEVICE_CHANGE");
            modelBuilder.Entity<HstUserChange>().ToTable("HST_USER_CHANGE");
            modelBuilder.Entity<RentalHistory>().ToTable("HST_RENTAL_CHANGE");

            // RentalHistory のカラムマッピング追加
            modelBuilder.Entity<RentalHistory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.RentalDate).HasColumnName("rental_date");
                entity.Property(e => e.ReturnDate).HasColumnName("return_date");
                entity.Property(e => e.EmployeeNo).HasColumnName("employee_no").HasMaxLength(20);
                entity.Property(e => e.AssetNo).HasColumnName("asset_no").HasMaxLength(20);
                entity.Property(e => e.Os).HasColumnName("os").HasMaxLength(50);
            });

            // 外部キー制約などの設定
            modelBuilder.Entity<TrnRental>()
                .HasIndex(r => r.AssetNo)
                .HasDatabaseName("IX_TRN_RENTAL_ASSET_NO");

            base.OnModelCreating(modelBuilder);
        }
    }
}