using System.ComponentModel.DataAnnotations;

namespace SUSWebApp.Server.Models.Entities
{
    /// <summary>
    /// デバイス変更履歴エンティティ（簡易版）
    /// Entity Framework Core用のシンプルな履歴テーブル
    /// </summary>
    public class DeviceHistory
    {
        /// <summary>
        /// 履歴ID（主キー）
        /// 自動採番される一意識別子
        /// </summary>
        [Key]  // 主キーとして指定
        public int Id { get; set; }

        /// <summary>
        /// 変更日時
        /// 変更が行われた日時（UTC）
        /// </summary>
        public DateTime ChangeDate { get; set; }

        /// <summary>
        /// 更新者の社員番号
        /// 変更を実行したユーザーの識別子
        /// </summary>
        public string UpdaterEmployeeNo { get; set; }

        /// <summary>
        /// 対象機器の資産番号
        /// 変更対象となったデバイスの識別子
        /// </summary>
        public string TargetAssetNo { get; set; }

        /// <summary>
        /// 変更項目
        /// 例："メモリ", "保管場所", "故障状態"
        /// </summary>
        public string ChangeField { get; set; }

        /// <summary>
        /// 変更内容
        /// 例："8GB → 16GB", "3F倉庫 → サーバールーム"
        /// 変更前と変更後の値を記録
        /// </summary>
        public string ChangeContent { get; set; }
    }
}