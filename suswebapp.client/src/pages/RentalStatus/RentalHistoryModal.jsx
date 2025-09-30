import React, { useState, useEffect } from 'react';
import './RentalHistoryModal.css';

/**
 * 貸出履歴モーダルコンポーネント
 * 過去の貸出・返却履歴を表示し、フィルタリング・検索機能を提供
 * 
 * @param {boolean} isOpen - モーダルの表示/非表示状態
 * @param {Function} onClose - モーダルを閉じる関数
 * @param {Object} currentUser - 現在のログインユーザー情報
 */
const RentalHistoryModal = ({ isOpen, onClose, currentUser }) => {
    // === ステート管理 ===
    const [histories, setHistories] = useState([]);              // 全履歴データ
    const [filteredHistories, setFilteredHistories] = useState([]);  // フィルタリング後の履歴
    const [loading, setLoading] = useState(false);              // ローディング状態
    const [searchQuery, setSearchQuery] = useState('');         // 検索クエリ
    const [filterMode, setFilterMode] = useState('all');        // フィルターモード（'all', 'mine', 'others'）
    const [sortOrder, setSortOrder] = useState('desc');         // ソート順（'desc': 新しい順, 'asc': 古い順）

    /**
     * モーダルが開かれた時に履歴データを取得
     */
    useEffect(() => {
        if (isOpen) {
            fetchHistories();
        }
    }, [isOpen]);

    /**
     * 検索・フィルター・ソート条件が変更された時にデータを再処理
     */
    useEffect(() => {
        filterAndSortHistories();
    }, [searchQuery, histories, filterMode, sortOrder]);

    /**
     * APIから履歴データを取得
     */
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

    /**
     * 履歴データのフィルタリングとソート処理
     */
    const filterAndSortHistories = () => {
        let filtered = [...histories];  // 元データをコピー

        // フィルターモードによる絞り込み
        if (filterMode === 'mine') {
            // 自分の貸出履歴のみ
            filtered = filtered.filter(h => h.employeeNo === currentUser?.employeeNo);
        } else if (filterMode === 'others') {
            // 他人の貸出履歴のみ
            filtered = filtered.filter(h => h.employeeNo !== currentUser?.employeeNo);
        }
        // 'all'の場合はフィルタリングなし

        // 検索クエリによるフィルタリング
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(history => {
                return (
                    history.assetNo?.toLowerCase().includes(query) ||        // 資産番号
                    history.os?.toLowerCase().includes(query) ||             // OS
                    history.employeeName?.toLowerCase().includes(query) ||   // 従業員名
                    history.employeeNameKana?.toLowerCase().includes(query) ||  // 従業員名カナ
                    history.employeeNo?.toLowerCase().includes(query)        // 社員番号
                );
            });
        }

        // 日付でソート（貸出日順）
        filtered.sort((a, b) => {
            const dateA = new Date(a.rentalDate);
            const dateB = new Date(b.rentalDate);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;  // 降順または昇順
        });

        setFilteredHistories(filtered);
    };

    /**
     * 検索処理（現在は自動で動作するため実質不要）
     */
    const handleSearch = () => {
        filterAndSortHistories();
    };

    /**
     * 検索クエリをクリア
     */
    const handleClearSearch = () => {
        setSearchQuery('');
    };

    /**
     * ソート順を切り替え（新しい順 ⇔ 古い順）
     */
    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
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

    // モーダルが閉じている場合は何も表示しない
    if (!isOpen) return null;

    return (
        // モーダルオーバーレイ
        <div className="modal-overlay">
            {/* 貸出履歴モーダル本体 */}
            <div className="rental-history-modal">
                <h2>貸出履歴</h2>

                {/* フィルターボタンとソートボタン */}
                <div className="filter-controls">
                    {/* フィルターボタングループ */}
                    <div className="filter-buttons">
                        {/* すべて表示 */}
                        <button
                            className={`filter-btn ${filterMode === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterMode('all')}
                        >
                            すべて
                        </button>
                        {/* 自分の履歴のみ */}
                        <button
                            className={`filter-btn ${filterMode === 'mine' ? 'active' : ''}`}
                            onClick={() => setFilterMode('mine')}
                        >
                            自分
                        </button>
                        {/* 他人の履歴のみ */}
                        <button
                            className={`filter-btn ${filterMode === 'others' ? 'active' : ''}`}
                            onClick={() => setFilterMode('others')}
                        >
                            他人
                        </button>
                    </div>

                    {/* ソート順切替ボタン */}
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
                        placeholder="履歴内を検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}  // Enterキーで検索
                    />
                    {/* 検索ボタン */}
                    <button
                        className="search-btn"
                        onClick={handleSearch}
                        title="検索"
                    >
                        🔍
                    </button>
                </div>

                {loading ? (
                    // ローディング中表示
                    <div className="loading">読み込み中...</div>
                ) : (
                    // 履歴テーブル
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
                                    // データなし表示
                                    <tr>
                                        <td colSpan="5" className="no-data">
                                            履歴がありません
                                        </td>
                                    </tr>
                                ) : (
                                    // 履歴データ表示
                                    filteredHistories.map((history) => (
                                        <tr key={history.id}>
                                            {/* 貸出日 */}
                                            <td>
                                                {history.rentalDate || '-'}
                                            </td>
                                            {/* 返却日（未返却の場合は"未返却"と表示） */}
                                            <td>
                                                {history.returnDate || '未返却'}
                                            </td>
                                            {/* 社員情報（番号、名前、カナ） */}
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
                                            {/* 資産番号 */}
                                            <td>{highlightText(history.assetNo, searchQuery)}</td>
                                            {/* OS */}
                                            <td>{highlightText(history.os || '-', searchQuery)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        {/* 件数表示（データがある場合のみ） */}
                        {filteredHistories.length > 0 && (
                            <div className="history-footer">
                                <span className="record-count">
                                    表示中：{filteredHistories.length}件
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* モーダルボタン */}
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