import React, { useState, useEffect } from 'react';
import './UserHistoryModal.css';

const UserHistoryModal = ({ isOpen, onClose }) => {
    const [historyData, setHistoryData] = useState([]);
    const [filterMode, setFilterMode] = useState('all'); // all, self, others
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/user/history');
            const data = await response.json();
            if (data.success) {
                setHistoryData(data.data);
            }
        } catch (error) {
            console.error('履歴取得エラー:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredHistory = () => {
        if (filterMode === 'self') {
            // 自分の更新のみ（実装時は現在のユーザーIDと比較）
            return historyData.filter(h => h.updatedBy === 'current_user');
        } else if (filterMode === 'others') {
            // 他人の更新のみ
            return historyData.filter(h => h.updatedBy !== 'current_user');
        }
        return historyData;
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="history-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="history-header">
                    <h2>ユーザー情報更新履歴</h2>
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filterMode === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterMode('all')}
                        >
                            更新順
                        </button>
                        <button
                            className={`filter-btn ${filterMode === 'self' ? 'active' : ''}`}
                            onClick={() => setFilterMode('self')}
                        >
                            自分
                        </button>
                        <button
                            className={`filter-btn ${filterMode === 'others' ? 'active' : ''}`}
                            onClick={() => setFilterMode('others')}
                        >
                            他人
                        </button>
                    </div>
                </div>

                <div className="history-table-wrapper">
                    {loading ? (
                        <div className="loading">読み込み中...</div>
                    ) : (
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>更新日時</th>
                                    <th>更新者</th>
                                    <th>対象社員番号</th>
                                    <th>変更項目</th>
                                    <th>変更前</th>
                                    <th>変更後</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getFilteredHistory().length > 0 ? (
                                    getFilteredHistory().map((history, index) => (
                                        <tr key={index}>
                                            <td>{new Date(history.updateDate).toLocaleString('ja-JP')}</td>
                                            <td>{history.updatedBy}</td>
                                            <td>{history.targetEmployeeNo}</td>
                                            <td>{history.changedField}</td>
                                            <td>{history.oldValue || '-'}</td>
                                            <td>{history.newValue || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="no-data">
                                            履歴データがありません
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserHistoryModal;