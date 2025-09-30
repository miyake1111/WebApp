using Microsoft.EntityFrameworkCore;
using Npgsql;
using SUSWebApp.Server.Data;
using System.Text.Json;
using System.Text.Encodings.Web;
using System.Text.Unicode;
using SUSWebApp.Server.Data;  // 重複しているが削除しない（既存コードを保持）

// ===== Webアプリケーションビルダーの作成 =====
var builder = WebApplication.CreateBuilder(args);

// ===== Entity Framework Core設定（1回目） =====
// appsettings.jsonから接続文字列を取得
// builder.Services の部分に追加
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ===== コントローラーサービスの追加 =====
// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // 日本語（UTF-8）を正しく処理するための設定
        options.JsonSerializerOptions.Encoder = JavaScriptEncoder.Create(UnicodeRanges.All);  // 全Unicode範囲をサポート
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;  // プロパティ名の大文字小文字を区別しない
    });

// ===== PostgreSQL接続文字列（ハードコード） =====
// 本番環境では環境変数や設定ファイルから取得すべき
string connString = "Host=localhost;Username=postgres;Password=ms369369;Database=postgres";

// ===== ApplicationDbContextをDIコンテナに登録（重要！）（2回目・上書き） =====
// ★ ApplicationDbContextをDIコンテナに登録（重要！）★
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connString));  // ハードコードされた接続文字列を使用

// ===== NpgsqlConnectionの登録 =====
// NpgsqlConnectionも引き続き使用可能にする
// 旧来のADO.NETスタイルの接続用
builder.Services.AddScoped<NpgsqlConnection>(_ => new NpgsqlConnection(connString));

// ===== CORS（Cross-Origin Resource Sharing）設定 =====
// CORS設定を追加
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:61317", "https://localhost:61317")  // Reactアプリのオリジンを許可
              .AllowAnyHeader()       // すべてのヘッダーを許可
              .AllowAnyMethod()       // すべてのHTTPメソッドを許可（GET, POST, PUT, DELETE等）
              .AllowCredentials();    // Cookie/認証情報の送信を許可
    });
});

// ===== Swagger設定（開発環境用API文書） =====
// Swagger追加（オプション - APIテスト用）
builder.Services.AddEndpointsApiExplorer();  // エンドポイントの探索を有効化
builder.Services.AddSwaggerGen();            // Swagger生成サービスを追加

// ===== アプリケーションのビルド =====
var app = builder.Build();

// ===== HTTPリクエストパイプラインの設定 =====
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // 開発環境でのみSwaggerを有効化
    app.UseSwagger();     // Swagger JSONエンドポイントを有効化
    app.UseSwaggerUI();   // Swagger UIを有効化
}

// ===== 静的ファイルサービング =====
app.UseDefaultFiles();   // デフォルトファイル（index.html等）の提供
app.UseStaticFiles();    // 静的ファイルの提供（CSS, JS, 画像等）

// ===== CORS ミドルウェアを有効化 =====
// CORS を有効化
app.UseCors("AllowReactApp");  // 上で定義したCORSポリシーを適用

// ===== HTTPS リダイレクト（コメントアウト） =====
// HTTPSリダイレクトを一時的に無効化（開発時のみ）
// app.UseHttpsRedirection();  // 本番環境では有効化すべき

// ===== 認可ミドルウェア =====
app.UseAuthorization();  // 認可処理を有効化（現在は実装なし）

// ===== エンドポイントのマッピング =====
app.MapControllers();                    // コントローラーのルーティングを有効化
app.MapFallbackToFile("/index.html");   // SPAのフォールバック（すべての未処理URLをindex.htmlへ）

// ===== データベース接続テスト（起動時） =====
// データベース接続テスト
using (var scope = app.Services.CreateScope())  // DIスコープを作成
{
    try
    {
        // ApplicationDbContextでの接続テスト
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await dbContext.Database.CanConnectAsync();  // 接続可能かチェック
        Console.WriteLine("ApplicationDbContext: データベース接続が正常に確立されました。");

        // NpgsqlConnectionでの接続テスト（既存のコード）
        var connection = scope.ServiceProvider.GetRequiredService<NpgsqlConnection>();
        await connection.OpenAsync();  // 接続を開く
        Console.WriteLine("NpgsqlConnection: データベース接続が正常に確立されました。");
        await connection.CloseAsync();  // 接続を閉じる
    }
    catch (Exception ex)
    {
        // エラーログ出力（接続失敗時）
        Console.WriteLine($"データベース接続エラー: {ex.Message}");
    }
}

// ===== アプリケーションの実行 =====
app.Run();  // Webサーバーを起動してリクエストの受付を開始