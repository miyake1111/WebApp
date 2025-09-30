import React from 'react';
import './RentalTable.css';

/**
 * 貸出テーブルコンポーネント
 * 貸出状況データをテーブル形式で表示
 * 
 * @param {Array} rentals - 表示する貸出データ配列
 * @param {Function} onShowDetail - 詳細表示ハンドラ
 * @param {boolean} detailView - 詳細表示モード（追加カラム表示）
 * @param {string} searchQuery - 検索クエリ（ハイライト用）
 * @param {Function} highlightText - テキストハイライト関数
 */
const RentalTable = ({
    rentals,
    onShowDetail,
    detailView,
    searchQuery,
    highlightText
}) => {

    // ハイライト関数がpropsで渡されない場合のフォールバック
    // 関数が未定義の場合はテキストをそのまま返す
    const highlight = highlightText || ((text) => text);

    // データが存在しない場合の表示
    if (!rentals || rentals.length === 0) {
        return (
            <div className="rental-table-wrapper">
                <table className="rental-table">
                    <thead>
                        <tr>
                            <th>NO</th>
                            <th>資産番号</th>
                            <th>メーカー</th>
                            <th>OS</th>
                            <th>保管場所</th>
                            <th>空き</th>
                            <th>使用者</th>
                            <th>社員氏名</th>
                            <th>貸出日</th>
                            <th>返却締切日</th>
                            {/* 詳細表示時の追加カラム */}
                            {detailView && (
                                <>
                                    <th>返却日</th>
                                    <th>棚卸日</th>
                                    <th>備考</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {/* データなしメッセージ（全カラムを結合） */}
                            <td colSpan={detailView ? 13 : 10} className="no-data">
                                データがありません
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    // データが存在する場合の通常表示
    return (
        <div className="rental-table-wrapper">
            <table className="rental-table">
                <thead>
                    <tr>
                        <th>NO</th>
                        <th>資産番号</th>
                        <th>メーカー</th>
                        <th>OS</th>
                        <th>保管場所</th>
                        <th>空き</th>
                        <th>使用者</th>
                        <th>社員氏名</th>
                        <th>貸出日</th>
                        <th>返却締切日</th>
                        {/* 詳細表示時の追加カラム */}
                        {detailView && (
                            <>
                                <th>返却日</th>
                                <th>棚卸日</th>
                                <th>備考</th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {/* 貸出データを行として表示 */}
                    {rentals.map((rental, index) => (
                        <tr
                            key={rental.rentalId || index}  // 一意のキー（rentalIdまたはインデックス）
                            className={`
                                ${rental.isOverdue ? 'overdue-row' : ''}     
                                ${rental.malfunction ? 'broken-row' : ''}
                            `}  // 期限超過や故障の場合はクラスを追加
                        >
                            {/* 連番 */}
                            <td>{index + 1}</td>

                            {/* 資産番号（クリックで詳細表示） */}
                            <td>
                                <button
                                    className="asset-link"
                                    onClick={() => onShowDetail(rental)}
                                    title="詳細を表示"
                                >
                                    {highlight(rental.assetNo, searchQuery)}
                                </button>
                            </td>

                            {/* メーカー */}
                            <td>{highlight(rental.maker || '-', searchQuery)}</td>

                            {/* OS */}
                            <td>{highlight(rental.os || '-', searchQuery)}</td>

                            {/* 保管場所 */}
                            <td>{highlight(rental.storageLocation || '-', searchQuery)}</td>

                            {/* 空き状態 */}
                            <td className="status-cell">
                                {rental.availableFlag ? (
                                    <span className="status-available">〇</span>  // 空き
                                ) : (
                                    <span className="status-rented">貸出中</span>  // 貸出中
                                )}
                            </td>

                            {/* 使用者社員番号 */}
                            <td>{highlight(rental.employeeNo || '-', searchQuery)}</td>

                            {/* 使用者氏名 */}
                            <td>{highlight(rental.employeeName || '-', searchQuery)}</td>

                            {/* 貸出日 */}
                            <td>{rental.rentalDate || '-'}</td>

                            {/* 返却締切日（期限超過の場合は赤色） */}
                            <td className={rental.isOverdue ? 'text-danger' : ''}>
                                {rental.dueDate || '-'}
                            </td>

                            {/* 詳細表示時の追加カラム */}
                            {detailView && (
                                <>
                                    {/* 返却日 */}
                                    <td>{rental.returnDate || '-'}</td>

                                    {/* 棚卸日 */}
                                    <td>{rental.inventoryDate || '-'}</td>

                                    {/* 備考（ツールチップ付き） */}
                                    <td title={rental.rentalRemarks || rental.deviceRemarks || ''}>
                                        {highlight(
                                            rental.rentalRemarks || rental.deviceRemarks || '-',
                                            searchQuery
                                        )}
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RentalTable;