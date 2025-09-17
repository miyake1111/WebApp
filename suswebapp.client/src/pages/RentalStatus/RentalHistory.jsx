import React, { useState, useEffect } from 'react';
import './RentalHistory.css';

const RentalHistory = ({ assetNo, onClose }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (assetNo) {
            fetchHistory();
        }
    }, [assetNo]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/rental/history/${assetNo}`);
            if (!response.ok) throw new Error('履歴の取得に失敗しました');
            const data = await response.json();
            setHistory(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="rental-history-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>貸出履歴 - {assetNo}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {loading ? (
                        <div className="loading">読み込み中...</div>
                    ) : error ? (
                        <div className="error">{error}</div>
                    ) : history.length === 0 ? (
                        <div className="no-data">履歴がありません</div>
                    ) : (
                        <div className="history-table-wrapper">
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>貸出日</th>
                                        <th>返却日</th>
                                        <th>社員番号</th>
                                        <th>氏名</th>
                                        <th>OS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((item, index) => (
                                        <tr key={item.rentalId || index}>
                                            <td>{item.rentalDate || '-'}</td>
                                            <td>{item.returnDate || '未返却'}</td>
                                            <td>{item.employeeNo || '-'}</td>
                                            <td>{item.employeeName || '-'}</td>
                                            <td>{item.os || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RentalHistory;