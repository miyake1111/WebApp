using Npgsql;
using System.Text.Json;
using System.Text.Encodings.Web;
using System.Text.Unicode;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // ���{��iUTF-8�j�𐳂����������邽�߂̐ݒ�
        options.JsonSerializerOptions.Encoder = JavaScriptEncoder.Create(UnicodeRanges.All);
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

// PostgreSQL�ڑ��T�[�r�X��ǉ�
string connString = "Host=localhost;Username=postgres;Password=ms369369;Database=postgres";
builder.Services.AddScoped<NpgsqlConnection>(_ => new NpgsqlConnection(connString));

// CORS�ݒ��ǉ�
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

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseDefaultFiles();
app.UseStaticFiles();

// CORS ��L����
app.UseCors("AllowReactApp");

// HTTPS���_�C���N�g���ꎞ�I�ɖ������i�J�����̂݁j
// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

// �f�[�^�x�[�X�ڑ��e�X�g
using (var scope = app.Services.CreateScope())
{
    try
    {
        var connection = scope.ServiceProvider.GetRequiredService<NpgsqlConnection>();
        await connection.OpenAsync();
        Console.WriteLine("�f�[�^�x�[�X�ڑ�������Ɋm������܂����B");
        await connection.CloseAsync();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"�f�[�^�x�[�X�ڑ��G���[: {ex.Message}");
    }
}

app.Run();