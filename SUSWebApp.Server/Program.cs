using Microsoft.EntityFrameworkCore;
using Npgsql;
using SUSWebApp.Server.Data;
using System.Text.Json;
using System.Text.Encodings.Web;
using System.Text.Unicode;
using SUSWebApp.Server.Data;

var builder = WebApplication.CreateBuilder(args);

// builder.Services �̕����ɒǉ�
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // ���{��iUTF-8�j�𐳂����������邽�߂̐ݒ�
        options.JsonSerializerOptions.Encoder = JavaScriptEncoder.Create(UnicodeRanges.All);
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

// PostgreSQL�ڑ�������
string connString = "Host=localhost;Username=postgres;Password=ms369369;Database=postgres";

// �� ApplicationDbContext��DI�R���e�i�ɓo�^�i�d�v�I�j��
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connString));

// NpgsqlConnection�����������g�p�\�ɂ���
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

// Swagger�ǉ��i�I�v�V���� - API�e�X�g�p�j
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
        // ApplicationDbContext�ł̐ڑ��e�X�g
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await dbContext.Database.CanConnectAsync();
        Console.WriteLine("ApplicationDbContext: �f�[�^�x�[�X�ڑ�������Ɋm������܂����B");

        // NpgsqlConnection�ł̐ڑ��e�X�g�i�����̃R�[�h�j
        var connection = scope.ServiceProvider.GetRequiredService<NpgsqlConnection>();
        await connection.OpenAsync();
        Console.WriteLine("NpgsqlConnection: �f�[�^�x�[�X�ڑ�������Ɋm������܂����B");
        await connection.CloseAsync();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"�f�[�^�x�[�X�ڑ��G���[: {ex.Message}");
    }
}

app.Run();