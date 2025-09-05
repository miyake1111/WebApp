

/*
using Microsoft.AspNetCore.MvcÅG
using Npgsql;
using SUSWebApp.Server.Models.Entities;

namespace SUSWebApp.Server.Controllers;

[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{
    private readonly NpgsqlConnection _connection;

    public UserController(NpgsqlConnection connection)
    {
        _connection = connection;
    }

    [HttpGet]
    public async Task<IEnumerable<User>> Get()
    {
        var users = new List<User>();
        await _connection.OpenAsync();

        string sql = "SELECT employee_no, name, name_kana, department, tel_no, mail_adress, age, gender, position, account_level, retire_date, register_date, update_date, delete_flag FROM MST_USER;";

        await using (var cmd = new NpgsqlCommand(sql, _connection))
        await using (var reader = await cmd.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                users.Add(new User
                {
                    employee_no = reader.GetString(reader.GetOrdinal("employee_no")),
                    name = reader.GetString(reader.GetOrdinal("name")),
                    name_kana = reader.IsDBNull(reader.GetOrdinal("name_kana")) ? null : reader.GetString(reader.GetOrdinal("name_kana")),
                    department = reader.IsDBNull(reader.GetOrdinal("department")) ? null : reader.GetString(reader.GetOrdinal("department")),
                    tel_no = reader.IsDBNull(reader.GetOrdinal("tel_no")) ? null : reader.GetString(reader.GetOrdinal("tel_no")),
                    mail_adress = reader.IsDBNull(reader.GetOrdinal("mail_adress")) ? null : reader.GetString(reader.GetOrdinal("mail_adress")),
                    age = reader.IsDBNull(reader.GetOrdinal("age")) ? 0 : reader.GetInt32(reader.GetOrdinal("age")),
                    gender = reader.IsDBNull(reader.GetOrdinal("gender")) ? 0 : reader.GetInt32(reader.GetOrdinal("gender")),
                    position = reader.IsDBNull(reader.GetOrdinal("position")) ? null : reader.GetString(reader.GetOrdinal("position")),
                    account_level = reader.IsDBNull(reader.GetOrdinal("account_level")) ? null : reader.GetString(reader.GetOrdinal("account_level")),
                    retire_date = reader.IsDBNull(reader.GetOrdinal("retire_date")) ? null : reader.GetDateTime(reader.GetOrdinal("retire_date")),
                    register_date = reader.GetDateTime(reader.GetOrdinal("register_date")),
                    update_date = reader.IsDBNull(reader.GetOrdinal("update_date")) ? null : reader.GetDateTime(reader.GetOrdinal("update_date")),
                    delete_flag = reader.GetBoolean(reader.GetOrdinal("delete_flag"))
                });
            }
        }
        _connection.Close();
        return users;
    }
}
*/