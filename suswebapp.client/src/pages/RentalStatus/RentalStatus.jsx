import React, { useState, useEffect } from 'react';
import './RentalStatus.css';
import RentalTable from './RentalTable';
import RentalHistoryModal from './RentalHistoryModal';
import RentalDetailModal from './RentalDetailModal';
import RentalForm from './RentalForm';
import ReturnForm from './ReturnForm';

/**
 * 貸出状況一覧コンポーネント
 * 機器の貸出状況を一覧表示し、貸出・返却処理を管理
 * 
 * @param {Function} onBack - メニューに戻る関数（親コンポーネントから渡される）
 */
const RentalStatus = ({ onBack }) => {
    // === ステート管理 ===
    const [rentals, setRentals] = useState([]);                    // 全貸出データ
    const [filteredRentals, setFilteredRentals] = useState([]);    // フィルタリング後のデータ
    const [loading, setLoading] = useState(true);                  // ローディング状態
    const [filter, setFilter] = useState('all');                   // フィルターモード（all/available/rented/overdue）
    const [searchQuery, setSearchQuery] = useState('');            // 検索クエリ
    const [showHistoryModal, setShowHistoryModal] = useState(false);  // 履歴モーダル表示状態
    const [showDetailModal, setShowDetailModal] = useState(false);    // 詳細モーダル表示状態
    const [showRentalForm, setShowRentalForm] = useState(false);     // 貸出フォーム表示状態
    const [showReturnForm, setShowReturnForm] = useState(false);     // 返却フォーム表示状態
    const [selectedDevice, setSelectedDevice] = useState(null);       // 選択中のデバイス
    const [detailView, setDetailView] = useState(false);             // 詳細表示モード

    // 現在のユーザー情報（LocalStorageから取得）
    const currentUser = {
        employeeNo: localStorage.getItem('employeeNo') || 'A1002',    // 社員番号
        name: localStorage.getItem('userName') || ''                  // ユーザー名
    };

    /**
     * コンポーネントマウント時に貸出状況データを取得
     */
    useEffect(() => {
        fetchRentalStatus();
    }, []);

    /**
     * APIから貸出状況一覧を取得
     * エラーハンドリングを含む堅牢な実装
     */
    const fetchRentalStatus = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/rental/status');

            if (!response.ok) {
                throw new Error('データの取得に失敗しました');
            }

            const data = await response.json();
            // データが配列であることを確認（防御的プログラミング）
            const rentalData = Array.isArray(data) ? data : [];

            // 資産番号でソート（自然順ソート）
            const sortedRentals = rentalData.sort((a, b) => {
                if (!a.assetNo || !b.assetNo) return 0;
                return a.assetNo.localeCompare(b.assetNo);
            });

            setRentals(sortedRentals);
            setFilteredRentals(sortedRentals);
        } catch (error) {
            console.error('貸出状況の取得エラー:', error);
            // エラー時は空配列を設定
            setRentals([]);
            setFilteredRentals([]);
        } finally {
            setLoading(false);
        }
    };

    /**
     * フィルターと検索条件が変更された時にデータを再フィルタリング
     */
    useEffect(() => {
        let filtered = [...rentals];  // 元データをコピー

        // フィルターモードによる絞り込み
        if (filter === 'available') {
            // 空き機器のみ
            filtered = filtered.filter(r => r.availableFlag === true);
        } else if (filter === 'rented') {
            // 貸出中のみ
            filtered = filtered.filter(r => r.availableFlag === false);
        } else if (filter === 'overdue') {
            // 期限超過のみ
            filtered = filtered.filter(r => r.isOverdue === true);
        }
        // 'all'の場合はフィルタリングなし

        // 検索クエリによるフィルタリング
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(rental => {
                // 任意のフィールドが検索クエリを含むかチェック
                return Object.values(rental).some(value =>
                    value && value.toString().toLowerCase().includes(query)
                );
            });
        }

        setFilteredRentals(filtered);
    }, [filter, searchQuery, rentals]);

    /**
     * 検索処理（現在は自動で動作するため実質不要）
     */
    const handleSearch = () => { };

    /**
     * 検索クエリをクリア
     */
    const handleClearSearch = () => {
        setSearchQuery('');
    };

    /**
     * 履歴モーダルを表示（未使用だが将来の拡張用）
     * 
     * @param {Object} rental - 対象の貸出データ
     */
    const handleShowHistory = (rental) => {
        setSelectedDevice(rental);
        setShowHistoryModal(true);
    };

    /**
     * 詳細モーダルを表示
     * 
     * @param {Object} rental - 対象の貸出データ
     */
    const handleShowDetail = (rental) => {
        setSelectedDevice(rental);
        setShowDetailModal(true);
    };

    /**
     * 詳細表示モードの切り替え
     * 追加カラム（返却日、棚卸日、備考）の表示/非表示
     */
    const toggleDetailView = () => {
        setDetailView(!detailView);
    };

    /**
     * 検索文字列のハイライト処理
     * 
     * @param {string} text - 表示テキスト
     * @param {string} query - 検索クエリ
     * @returns {JSX.Element|string} ハイライト付きテキスト
     */
    const highlightText = (text, query) => {
        if (!query || !text) return text;
        const lowerText = text.toString().toLowerCase();
        const lowerQuery = query.toLowerCase();
        if (!lowerText.includes(lowerQuery)) return text;
        // マッチした場合は黄色背景でハイライト
        return <span className="highlight">{text}</span>;
    };

    /**
     * 貸出処理を実行
     * 
     * @param {Object} formData - 貸出フォームデータ
     */
    const handleRent = async (formData) => {
        try {
            const response = await fetch('/api/rental/rent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    assetNo: formData.assetNo,          // 資産番号
                    employeeNo: formData.employeeNo,    // 社員番号
                    rentalDate: formData.rentalDate,    // 貸出日
                    dueDate: formData.dueDate           // 返却締切日
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert('貸出処理が完了しました');
                fetchRentalStatus();  // データを再取得
                setShowDetailModal(false);
            } else {
                alert(result.message || '貸出処理に失敗しました');
            }
        } catch (error) {
            console.error('貸出エラー:', error);
            alert('貸出処理に失敗しました');
        }
    };

    /**
     * 返却処理を実行
     * 
     * @param {Object} formData - 返却フォームデータ
     */
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
                fetchRentalStatus();  // データを再取得
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
            {/* ヘッダー部分 */}
            <div className="rental-status-header">
                <h2>貸出状況一覧</h2>
                <button className="back-btn" onClick={onBack}>
                    メニューに戻る
                </button>
            </div>

            {/* コントロール部分（フィルターと検索） */}
            <div className="controls-container">
                {/* 左側：フィルターボタングループ */}
                <div className="filter-buttons-group">
                    {/* すべて表示 */}
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        すべて
                    </button>
                    {/* 空き機器のみ */}
                    <button
                        className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
                        onClick={() => setFilter('available')}
                    >
                        空き
                    </button>
                    {/* 貸出中のみ */}
                    <button
                        className={`filter-btn ${filter === 'rented' ? 'active' : ''}`}
                        onClick={() => setFilter('rented')}
                    >
                        貸出中
                    </button>
                    {/* 期限超過のみ */}
                    <button
                        className={`filter-btn ${filter === 'overdue' ? 'active' : ''}`}
                        onClick={() => setFilter('overdue')}
                    >
                        期限超過
                    </button>
                </div>

                {/* 右側：検索関連 */}
                <div className="search-group">
                    {/* 検索クリアボタン */}
                    <button
                        className="clear-search-btn"
                        onClick={handleClearSearch}
                        title="クリア"
                    >
                        ↻
                    </button>

                    {/* 検索入力フィールド */}
                    <input
                        type="text"
                        className="search-input"
                        placeholder="検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />

                    {/* 履歴と検索ボタン（縦配置） */}
                    <div className="search-history-buttons">
                        {/* 貸出履歴ボタン */}
                        <button
                            className="history-btn"
                            onClick={() => setShowHistoryModal(true)}
                            title="貸出履歴"
                        >
                            🕐
                        </button>
                        {/* 検索ボタン */}
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
                // ローディング中表示
                <div className="loading">読み込み中...</div>
            ) : (
                <div>
                    {/* テーブルコンテナ */}
                    <div className="rental-table-container">
                        <div className={`rental-table-wrapper ${detailView ? 'detail-view' : ''}`}>
                            {/* 貸出テーブルコンポーネント */}
                            <RentalTable
                                rentals={filteredRentals}           // フィルタリング後のデータ
                                onShowHistory={handleShowHistory}   // 履歴表示ハンドラ
                                onShowDetail={handleShowDetail}     // 詳細表示ハンドラ
                                onRent={handleRent}                // 貸出処理ハンドラ
                                onReturn={handleReturn}            // 返却処理ハンドラ
                                detailView={detailView}            // 詳細表示モード
                                searchQuery={searchQuery}          // 検索クエリ
                                highlightText={highlightText}      // ハイライト関数
                            />
                        </div>

                        {/* 件数表示 */}
                        <div className="table-footer">
                            <span className="record-count">
                                表示中：{filteredRentals.length}件
                            </span>
                        </div>
                    </div>

                    {/* 詳細表示切替ボタン */}
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

            {/* 貸出履歴モーダル */}
            {showHistoryModal && (
                <RentalHistoryModal
                    isOpen={showHistoryModal}
                    onClose={() => setShowHistoryModal(false)}
                    currentUser={currentUser}
                />
            )}

            {/* 機器詳細モーダル */}
            {showDetailModal && selectedDevice && (
                <RentalDetailModal
                    device={selectedDevice}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedDevice(null);
                    }}
                    onRent={() => {
                        fetchRentalStatus();  // データ再取得
                        setShowDetailModal(false);
                        setSelectedDevice(null);
                    }}
                    onReturn={() => {
                        fetchRentalStatus();  // データ再取得
                        setShowDetailModal(false);
                        setSelectedDevice(null);
                    }}
                    currentUser={currentUser}
                />
            )}

            {/* 貸出フォーム（未使用だが拡張用） */}
            {showRentalForm && selectedDevice && (
                <RentalForm
                    device={selectedDevice}
                    onSubmit={handleRent}
                    onClose={() => setShowRentalForm(false)}
                />
            )}

            {/* 返却フォーム（未使用だが拡張用） */}
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