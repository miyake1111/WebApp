import React from 'react';
import './RentalTable.css';

const RentalTable = ({
    rentals,
    onShowDetail,
    detailView,
    searchQuery,
    highlightText
}) => {

    // ハイライト関数がpropsで渡されない場合のフォールバック
    const highlight = highlightText || ((text) => text);

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
                            <td colSpan={detailView ? 13 : 10} className="no-data">
                                データがありません
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

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
                    {rentals.map((rental, index) => (
                        <tr
                            key={rental.rentalId || index}
                            className={`
                                ${rental.isOverdue ? 'overdue-row' : ''} 
                                ${rental.malfunction ? 'broken-row' : ''}
                            `}
                        >
                            <td>{index + 1}</td>
                            <td>
                                <button
                                    className="asset-link"
                                    onClick={() => onShowDetail(rental)}
                                    title="詳細を表示"
                                >
                                    {highlight(rental.assetNo, searchQuery)}
                                </button>
                            </td>
                            <td>{highlight(rental.maker || '-', searchQuery)}</td>
                            <td>{highlight(rental.os || '-', searchQuery)}</td>
                            <td>{highlight(rental.storageLocation || '-', searchQuery)}</td>
                            <td className="status-cell">
                                {rental.availableFlag ? (
                                    <span className="status-available">〇</span>
                                ) : (
                                    <span className="status-rented">貸出中</span>
                                )}
                            </td>
                            <td>{highlight(rental.employeeNo || '-', searchQuery)}</td>
                            <td>{highlight(rental.employeeName || '-', searchQuery)}</td>
                            <td>{rental.rentalDate || '-'}</td>
                            <td className={rental.isOverdue ? 'text-danger' : ''}>
                                {rental.dueDate || '-'}
                            </td>
                            {detailView && (
                                <>
                                    <td>{rental.returnDate || '-'}</td>
                                    <td>{rental.inventoryDate || '-'}</td>
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