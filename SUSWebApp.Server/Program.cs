using Microsoft.EntityFrameworkCore;
using Npgsql;
using SUSWebApp.Server.Data;
using System.Text.Json;
using System.Text.Encodings.Web;
using System.Text.Unicode;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // 日本語（UTF-8）を正しく処理するための設定
        options.JsonSerializerOptions.Encoder = JavaScriptEncoder.Create(UnicodeRanges.All);
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

// PostgreSQL接続文字列
string connString = "Host=localhost;Username=postgres;Password=ms369369;Database=postgres";

// ★ ApplicationDbContextをDIコンテナに登録（重要！）★
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connString));

// NpgsqlConnectionも引き続き使用可能にする
builder.Services.AddScoped<NpgsqlConnection>(_ => new NpgsqlConnection(connString));

// CORS設定を追加
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:61317", "https://localhost:61317")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Swagger追加（オプション - APIテスト用）
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseDefaultFiles();
app.UseStaticFiles();

// CORS を有効化
app.UseCors("AllowReactApp");

// HTTPSリダイレクトを一時的に無効化（開発時のみ）
// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

// データベース接続テスト
using (var scope = app.Services.CreateScope())
{
    try
    {
        // ApplicationDbContextでの接続テスト
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await dbContext.Database.CanConnectAsync();
        Console.WriteLine("ApplicationDbContext: データベース接続が正常に確立されました。");

        // NpgsqlConnectionでの接続テスト（既存のコード）
        var connection = scope.ServiceProvider.GetRequiredService<NpgsqlConnection>();
        await connection.OpenAsync();
        Console.WriteLine("NpgsqlConnection: データベース接続が正常に確立されました。");
        await connection.CloseAsync();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"データベース接続エラー: {ex.Message}");
    }
}

app.Run();