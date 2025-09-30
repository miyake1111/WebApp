using Microsoft.EntityFrameworkCore;
using Npgsql;
using SUSWebApp.Server.Data;
using System.Text.Json;
using System.Text.Encodings.Web;
using System.Text.Unicode;
using SUSWebApp.Server.Data;  // �d�����Ă��邪�폜���Ȃ��i�����R�[�h��ێ��j

// ===== Web�A�v���P�[�V�����r���_�[�̍쐬 =====
var builder = WebApplication.CreateBuilder(args);

// ===== Entity Framework Core�ݒ�i1��ځj =====
// appsettings.json����ڑ���������擾
// builder.Services �̕����ɒǉ�
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ===== �R���g���[���[�T�[�r�X�̒ǉ� =====
// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // ���{��iUTF-8�j�𐳂����������邽�߂̐ݒ�
        options.JsonSerializerOptions.Encoder = JavaScriptEncoder.Create(UnicodeRanges.All);  // �SUnicode�͈͂��T�|�[�g
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;  // �v���p�e�B���̑啶������������ʂ��Ȃ�
    });

// ===== PostgreSQL�ڑ�������i�n�[�h�R�[�h�j =====
// �{�Ԋ��ł͊��ϐ���ݒ�t�@�C������擾���ׂ�
string connString = "Host=localhost;Username=postgres;Password=ms369369;Database=postgres";

// ===== ApplicationDbContext��DI�R���e�i�ɓo�^�i�d�v�I�j�i2��ځE�㏑���j =====
// �� ApplicationDbContext��DI�R���e�i�ɓo�^�i�d�v�I�j��
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connString));  // �n�[�h�R�[�h���ꂽ�ڑ���������g�p

// ===== NpgsqlConnection�̓o�^ =====
// NpgsqlConnection�����������g�p�\�ɂ���
// ������ADO.NET�X�^�C���̐ڑ��p
builder.Services.AddScoped<NpgsqlConnection>(_ => new NpgsqlConnection(connString));

// ===== CORS�iCross-Origin Resource Sharing�j�ݒ� =====
// CORS�ݒ��ǉ�
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:61317", "https://localhost:61317")  // React�A�v���̃I���W��������
              .AllowAnyHeader()       // ���ׂẴw�b�_�[������
              .AllowAnyMethod()       // ���ׂĂ�HTTP���\�b�h�����iGET, POST, PUT, DELETE���j
              .AllowCredentials();    // Cookie/�F�؏��̑��M������
    });
});

// ===== Swagger�ݒ�i�J�����pAPI�����j =====
// Swagger�ǉ��i�I�v�V���� - API�e�X�g�p�j
builder.Services.AddEndpointsApiExplorer();  // �G���h�|�C���g�̒T����L����
builder.Services.AddSwaggerGen();            // Swagger�����T�[�r�X��ǉ�

// ===== �A�v���P�[�V�����̃r���h =====
var app = builder.Build();

// ===== HTTP���N�G�X�g�p�C�v���C���̐ݒ� =====
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // �J�����ł̂�Swagger��L����
    app.UseSwagger();     // Swagger JSON�G���h�|�C���g��L����
    app.UseSwaggerUI();   // Swagger UI��L����
}

// ===== �ÓI�t�@�C���T�[�r���O =====
app.UseDefaultFiles();   // �f�t�H���g�t�@�C���iindex.html���j�̒�
app.UseStaticFiles();    // �ÓI�t�@�C���̒񋟁iCSS, JS, �摜���j

// ===== CORS �~�h���E�F�A��L���� =====
// CORS ��L����
app.UseCors("AllowReactApp");  // ��Œ�`����CORS�|���V�[��K�p

// ===== HTTPS ���_�C���N�g�i�R�����g�A�E�g�j =====
// HTTPS���_�C���N�g���ꎞ�I�ɖ������i�J�����̂݁j
// app.UseHttpsRedirection();  // �{�Ԋ��ł͗L�������ׂ�

// ===== �F�~�h���E�F�A =====
app.UseAuthorization();  // �F������L�����i���݂͎����Ȃ��j

// ===== �G���h�|�C���g�̃}�b�s���O =====
app.MapControllers();                    // �R���g���[���[�̃��[�e�B���O��L����
app.MapFallbackToFile("/index.html");   // SPA�̃t�H�[���o�b�N�i���ׂĂ̖�����URL��index.html�ցj

// ===== �f�[�^�x�[�X�ڑ��e�X�g�i�N�����j =====
// �f�[�^�x�[�X�ڑ��e�X�g
using (var scope = app.Services.CreateScope())  // DI�X�R�[�v���쐬
{
    try
    {
        // ApplicationDbContext�ł̐ڑ��e�X�g
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await dbContext.Database.CanConnectAsync();  // �ڑ��\���`�F�b�N
        Console.WriteLine("ApplicationDbContext: �f�[�^�x�[�X�ڑ�������Ɋm������܂����B");

        // NpgsqlConnection�ł̐ڑ��e�X�g�i�����̃R�[�h�j
        var connection = scope.ServiceProvider.GetRequiredService<NpgsqlConnection>();
        await connection.OpenAsync();  // �ڑ����J��
        Console.WriteLine("NpgsqlConnection: �f�[�^�x�[�X�ڑ�������Ɋm������܂����B");
        await connection.CloseAsync();  // �ڑ������
    }
    catch (Exception ex)
    {
        // �G���[���O�o�́i�ڑ����s���j
        Console.WriteLine($"�f�[�^�x�[�X�ڑ��G���[: {ex.Message}");
    }
}

// ===== �A�v���P�[�V�����̎��s =====
app.Run();  // Web�T�[�o�[���N�����ă��N�G�X�g�̎�t���J�n