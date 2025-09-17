import React, { useState, useEffect } from 'react';
import './RentalStatus.css';
import RentalDetailModal from './RentalDetailModal';
import RentalHistoryModal from './RentalHistoryModal';

const RentalStatus = ({ onBack, user }) => {
    const [rentals, setRentals] = useState([]);
    const [filteredRentals, setFilteredRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [detailView, setDetailView] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMode, setFilterMode] = useState('all'); // 'all', 'rented', 'available'

    useEffect(() => {
        fetchRentalStatus();
    }, []);

    useEffect(() => {
        // フィルターと検索を適用
        let filtered = [...rentals];

        // フィルターモードの適用
        if (filterMode === 'rented') {
            filtered = filtered.filter(rental => !rental.availableFlag);
        } else if (filterMode === 'available') {
            filtered = filtered.filter(rental => rental.availableFlag);
        }

        // 検索フィルタリング
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(rental => {
                return (
                    rental.assetNo?.toLowerCase().includes(query) ||
                    rental.maker?.toLowerCase().includes(query) ||
                    rental.os?.toLowerCase().includes(query) ||
                    rental.location?.toLowerCase().includes(query) ||
                    rental.employeeNo?.toLowerCase().includes(query) ||
                    rental.employeeName?.toLowerCase().includes(query) ||
                    rental.department?.toLowerCase().includes(query)
                );
            });
        }

        setFilteredRentals(filtered);
    }, [searchQuery, rentals, filterMode]);

    const fetchRentalStatus = async () => {
        try {
            const response = await fetch('/api/rental/status');
            const data = await response.json();
            if (data.success) {
                setRentals(data.data);
                setFilteredRentals(data.data);
            }
        } catch (error) {
            console.error('貸出状況の取得エラー:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssetClick = (device) => {
        setSelectedDevice(device);
        setShowDetailModal(true);
    };

    const handleDetailModalSuccess = () => {
        setShowDetailModal(false);
        fetchRentalStatus();
    };

    const handleSearch = () => {
        // searchQueryの変更でuseEffectが動作
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const toggleDetailView = () => {
        setDetailView(!detailView);
    };

    const highlightText = (text, query) => {
        if (!query || !text) return text;
        const lowerText = text.toString().toLowerCase();
        const lowerQuery = query.toLowerCase();
        if (!lowerText.includes(lowerQuery)) return text;
        return <span className="highlight">{text}</span>;
    };

    // 件数を計算
    const allCount = rentals.length;
    const rentedCount = rentals.filter(r => !r.availableFlag).length;
    const availableCount = rentals.filter(r => r.availableFlag).length;

    return (
        <div className="rental-status-container">
            <div className="rental-status-header">
                <h2>貸出状況一覧</h2>
                <div className="header-buttons">
                    {/* フィルターボタングループ */}
                    <div className="filter-button-group">
                        <button
                            className={`filter-button ${filterMode === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterMode('all')}
                        >
                            No順 ({allCount})
                        </button>
                        <button
                            className={`filter-button ${filterMode === 'rented' ? 'active' : ''}`}
                            onClick={() => setFilterMode('rented')}
                        >
                            貸出中 ({rentedCount})
                        </button>
                        <button
                            className={`filter-button ${filterMode === 'available' ? 'active' : ''}`}
                            onClick={() => setFilterMode('available')}
                        >
                            空き ({availableCount})
                        </button>
                    </div>
                    <button className="back-btn" onClick={onBack}>
                        メニューに戻る
                    </button>
                </div>
            </div>

            {/* コントロール部分 */}
            <div className="controls-container">
                <div className="search-group">
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
                        placeholder="検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />

                    <div className="search-history-buttons">
                        <button
                            className="history-btn"
                            onClick={() => setShowHistoryModal(true)}
                            title="貸出履歴"
                        >
                            🕐
                        </button>
                        <button
                            className="search-btn"
                            onClick={handleSearch}
                            title="検索"
                        >
                            🔍
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading">読み込み中...</div>
            ) : (
                <>
                    <div className="rental-table-container">
                        <div className={`rental-table-wrapper ${detailView ? 'detail-view' : ''}`}>
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
                                                <th>備考</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRentals.map((rental, index) => {
                                        const isRented = !rental.availableFlag;
                                        const rowClass = rental.isOverdue ? 'overdue-row' :
                                            rental.brokenFlag ? 'broken-row' : '';

                                        return (
                                            <tr key={rental.assetNo} className={rowClass}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <span
                                                        className="asset-link"
                                                        onClick={() => handleAssetClick(rental)}
                                                    >
                                                        {highlightText(rental.assetNo, searchQuery)}
                                                    </span>
                                                </td>
                                                <td>{highlightText(rental.maker || '-', searchQuery)}</td>
                                                <td>{highlightText(rental.os || '-', searchQuery)}</td>
                                                <td>{highlightText(rental.location || '-', searchQuery)}</td>
                                                <td>
                                                    {isRented ?
                                                        <span className="status-rented">貸出中</span> :
                                                        <span className="status-available">◯</span>
                                                    }
                                                </td>
                                                <td>{highlightText(rental.employeeNo || '-', searchQuery)}</td>
                                                <td>{highlightText(rental.employeeName || '-', searchQuery)}</td>
                                                <td>{rental.rentalDate || '-'}</td>
                                                <td className={rental.isOverdue ? 'text-danger' : ''}>
                                                    {rental.dueDate || '-'}
                                                </td>
                                                {detailView && (
                                                    <>
                                                        <td>{rental.returnDate || '-'}</td>
                                                        <td>{highlightText(rental.remarks || '-', searchQuery)}</td>
                                                    </>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="table-footer">
                            <span className="record-count">
                                表示中：{filteredRentals.length}件
                            </span>
                        </div>
                    </div>

                    <div className="detail-button-container">
                        <button
                            className="detail-toggle-btn"
                            onClick={toggleDetailView}
                            title={detailView ? "簡略表示" : "詳細表示"}
                        >
                            •••
                        </button>
                    </div>
                </>
            )}

            {showDetailModal && (
                <RentalDetailModal
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    device={selectedDevice}
                    currentUser={user}
                    onSuccess={handleDetailModalSuccess}
                />
            )}

            <RentalHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                currentUser={user}
            />
        </div>
    );
};

export default RentalStatus;