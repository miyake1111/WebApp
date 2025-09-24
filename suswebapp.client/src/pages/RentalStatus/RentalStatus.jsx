import React, { useState, useEffect } from 'react';
import './RentalStatus.css';
import RentalTable from './RentalTable';
import RentalHistoryModal from './RentalHistoryModal';
import RentalDetailModal from './RentalDetailModal';
import RentalForm from './RentalForm';
import ReturnForm from './ReturnForm';

const RentalStatus = ({ onBack }) => {
    const [rentals, setRentals] = useState([]);
    const [filteredRentals, setFilteredRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRentalForm, setShowRentalForm] = useState(false);
    const [showReturnForm, setShowReturnForm] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [detailView, setDetailView] = useState(false);

    const currentUser = {
        employeeNo: localStorage.getItem('employeeNo') || 'A1002',
        name: localStorage.getItem('userName') || ''
    };

    useEffect(() => {
        fetchRentalStatus();
    }, []);

    const fetchRentalStatus = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/rental/status');

            if (!response.ok) {
                throw new Error('データの取得に失敗しました');
            }

            const data = await response.json();
            const rentalData = Array.isArray(data) ? data : [];

            const sortedRentals = rentalData.sort((a, b) => {
                if (!a.assetNo || !b.assetNo) return 0;
                return a.assetNo.localeCompare(b.assetNo);
            });

            setRentals(sortedRentals);
            setFilteredRentals(sortedRentals);
        } catch (error) {
            console.error('貸出状況の取得エラー:', error);
            setRentals([]);
            setFilteredRentals([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = [...rentals];

        if (filter === 'available') {
            filtered = filtered.filter(r => r.availableFlag === true);
        } else if (filter === 'rented') {
            filtered = filtered.filter(r => r.availableFlag === false);
        } else if (filter === 'overdue') {
            filtered = filtered.filter(r => r.isOverdue === true);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(rental => {
                return Object.values(rental).some(value =>
                    value && value.toString().toLowerCase().includes(query)
                );
            });
        }

        setFilteredRentals(filtered);
    }, [filter, searchQuery, rentals]);

    const handleSearch = () => { };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handleShowHistory = (rental) => {
        setSelectedDevice(rental);
        setShowHistoryModal(true);
    };

    const handleShowDetail = (rental) => {
        setSelectedDevice(rental);
        setShowDetailModal(true);
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

    const handleRent = async (formData) => {
        try {
            const response = await fetch('/api/rental/rent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    assetNo: formData.assetNo,
                    employeeNo: formData.employeeNo,
                    rentalDate: formData.rentalDate,
                    dueDate: formData.dueDate
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert('貸出処理が完了しました');
                fetchRentalStatus();
                setShowDetailModal(false);
            } else {
                alert(result.message || '貸出処理に失敗しました');
            }
        } catch (error) {
            console.error('貸出エラー:', error);
            alert('貸出処理に失敗しました');
        }
    };

    const handleReturn = async (formData) => {
        try {
            const response = await fetch('/api/rental/return', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('返却処理が完了しました');
                fetchRentalStatus();
                setShowReturnForm(false);
                setShowDetailModal(false);
            }
        } catch (error) {
            console.error('返却エラー:', error);
            alert('返却処理に失敗しました');
        }
    };

    return (
        <div className="rental-status-container">
            <div className="rental-status-header">
                <h2>貸出状況一覧</h2>
                <button className="back-btn" onClick={onBack}>
                    メニューに戻る
                </button>
            </div>

            <div className="controls-container">
                <div className="filter-buttons-group">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        すべて
                    </button>
                    <button
                        className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
                        onClick={() => setFilter('available')}
                    >
                        空き
                    </button>
                    <button
                        className={`filter-btn ${filter === 'rented' ? 'active' : ''}`}
                        onClick={() => setFilter('rented')}
                    >
                        貸出中
                    </button>
                    <button
                        className={`filter-btn ${filter === 'overdue' ? 'active' : ''}`}
                        onClick={() => setFilter('overdue')}
                    >
                        期限超過
                    </button>
                </div>

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
                <div>
                    <div className="rental-table-container">
                        <div className={`rental-table-wrapper ${detailView ? 'detail-view' : ''}`}>
                            <RentalTable
                                rentals={filteredRentals}
                                onShowHistory={handleShowHistory}
                                onShowDetail={handleShowDetail}
                                onRent={handleRent}
                                onReturn={handleReturn}
                                detailView={detailView}
                                searchQuery={searchQuery}
                                highlightText={highlightText}
                            />
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
                </div>
            )}

            {showHistoryModal && (
                <RentalHistoryModal
                    isOpen={showHistoryModal}
                    onClose={() => setShowHistoryModal(false)}
                    currentUser={currentUser}
                />
            )}

            {showDetailModal && selectedDevice && (
                <RentalDetailModal
                    device={selectedDevice}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedDevice(null);
                    }}
                    onRent={() => {
                        fetchRentalStatus();
                        setShowDetailModal(false);
                        setSelectedDevice(null);
                    }}
                    onReturn={() => {
                        fetchRentalStatus();
                        setShowDetailModal(false);
                        setSelectedDevice(null);
                    }}
                    currentUser={currentUser}
                />
            )}

            {showRentalForm && selectedDevice && (
                <RentalForm
                    device={selectedDevice}
                    onSubmit={handleRent}
                    onClose={() => setShowRentalForm(false)}
                />
            )}

            {showReturnForm && selectedDevice && (
                <ReturnForm
                    device={selectedDevice}
                    onSubmit={handleReturn}
                    onClose={() => setShowReturnForm(false)}
                />
            )}
        </div>
    );
};

export default RentalStatus;