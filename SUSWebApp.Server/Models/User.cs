namespace SUSWebApp.Models; // プロジェクト名に合わせて変更してください

public class User
{
    public string employee_no { get; set; }
    public string name { get; set; }
    public string name_kana { get; set; }
    public string department { get; set; }
    public string tel_no { get; set; }
    public string mail_adress { get; set; }
    public int age { get; set; }
    public int gender { get; set; }
    public string position { get; set; }
    public string account_level { get; set; }
    public DateTime? retire_date { get; set; }
    public DateTime register_date { get; set; }
    public DateTime? update_date { get; set; }
    public bool delete_flag { get; set; }
}
