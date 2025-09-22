import React, { useState, useEffect } from 'react';
import './RentalHistoryModal.css';

const RentalHistoryModal = ({ isOpen, onClose, currentUser }) => {
    const [histories, setHistories] = useState([]);
    const [filteredHistories, setFilteredHistories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMode, setFilterMode] = useState('all'); // 'all', 'mine', 'others'
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc', 'asc'

    useEffect(() => {
        if (isOpen) {
            fetchHistories();
        }
    }, [isOpen]);

    useEffect(() => {
        filterAndSortHistories();
    }, [searchQuery, histories, filterMode, sortOrder]);

    const fetchHistories = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/rental/history');
            const data = await response.json();
            if (data.success) {
                setHistories(data.data);
            }
        } catch (error) {
            console.error('履歴取得エラー:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortHistories = () => {
        let filtered = [...histories];

        // フィルターモードによる絞り込み
        if (filterMode === 'mine') {
            filtered = filtered.filter(h => h.employeeNo === currentUser?.employeeNo);
        } else if (filterMode === 'others') {
            filtered = filtered.filter(h => h.employeeNo !== currentUser?.employeeNo);
        }

        // 検索フィルタリング
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(history => {
                return (
                    history.assetNo?.toLowerCase().includes(query) ||
                    history.os?.toLowerCase().includes(query) ||
                    history.employeeName?.toLowerCase().includes(query) ||
                    history.employeeNameKana?.toLowerCase().includes(query) ||
                    history.employeeNo?.toLowerCase().includes(query)
                );
            });
        }

        // ソート（更新日順）
        filtered.sort((a, b) => {
            const dateA = new Date(a.rentalDate);
            const dateB = new Date(b.rentalDate);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        setFilteredHistories(filtered);
    };

    const handleSearch = () => {
        filterAndSortHistories();
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    };

    const highlightText = (text, query) => {
        if (!query || !text) return text;
        const lowerText = text.toString().toLowerCase();
        const lowerQuery = query.toLowerCase();
        if (!lowerText.includes(lowerQuery)) return text;
        return <span className="highlight">{text}</span>;
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="rental-history-modal">
                <h2>貸出履歴</h2>

                {/* フィルターボタン */}
                <div className="filter-controls">
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filterMode === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterMode('all')}
                        >
                            すべて
                        </button>
                        <button
                            className={`filter-btn ${filterMode === 'mine' ? 'active' : ''}`}
                            onClick={() => setFilterMode('mine')}
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

                    <button
                        className="sort-btn"
                        onClick={toggleSortOrder}
                        title={sortOrder === 'desc' ? '古い順に並び替え' : '新しい順に並び替え'}
                    >
                        {sortOrder === 'desc' ? '↓ 新しい順' : '↑ 古い順'}
                    </button>
                </div>

                {/* 検索バー */}
                <div className="search-container">
                    <button
                        className="clear-search-btn"
                        onClick={handleClearSearch}
                        title="クリア"
                    >
                        ↻
                    </button>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="履歴内を検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        className="search-btn"
                        onClick={handleSearch}
                        title="検索"
                    >
                        🔍
                    </button>
                </div>

                {loading ? (
                    <div className="loading">読み込み中...</div>
                ) : (
                    <div className="history-table-wrapper">
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>貸出日</th>
                                    <th>返却日</th>
                                    <th>社員番号</th>
                                    <th>資産番号</th>
                                    <th>OS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistories.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="no-data">
                                            履歴がありません
                                        </td>
                                    </tr>
                                ) : (
                                    filteredHistories.map((history) => (
                                        <tr key={history.id}>
                                            <td>
                                                {history.rentalDate || '-'}
                                            </td>
                                            <td>
                                                {history.returnDate || '未返却'}
                                            </td>
                                            <td>
                                                <div className="employee-info">
                                                    <div>{highlightText(history.employeeNo, searchQuery)}</div>
                                                    <div className="employee-name">
                                                        {highlightText(history.employeeName, searchQuery)}
                                                    </div>
                                                    <div className="employee-kana">
                                                        {highlightText(history.employeeNameKana, searchQuery)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{highlightText(history.assetNo, searchQuery)}</td>
                                            <td>{highlightText(history.os || '-', searchQuery)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        {filteredHistories.length > 0 && (
                            <div className="history-footer">
                                <span className="record-count">
                                    表示中：{filteredHistories.length}件
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <div className="modal-buttons">
                    <button className="cancel-btn" onClick={onClose}>
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RentalHistoryModal;