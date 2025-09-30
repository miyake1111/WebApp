import React, { useState, useEffect } from 'react';
import './UserHistoryModal.css';

/**
 * ユーザー更新履歴モーダルコンポーネント
 * ユーザー情報の変更履歴を表示し、フィルタリング機能を提供
 * 
 * @param {boolean} isOpen - モーダルの表示/非表示状態
 * @param {Function} onClose - モーダルを閉じる関数
 */
const UserHistoryModal = ({ isOpen, onClose }) => {
    // === ステート管理 ===
    const [historyData, setHistoryData] = useState([]);      // 履歴データ
    const [filterMode, setFilterMode] = useState('all');     // フィルターモード（all/self/others）
    const [loading, setLoading] = useState(false);           // ローディング状態
    // 現在のユーザーの社員番号を取得
    const currentUserEmployeeNo = localStorage.getItem('employeeNo') || 'A1002';

    /**
     * モーダルが開かれた時に履歴データを取得
     */
    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    /**
     * APIから履歴データを取得
     */
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

    /**
     * フィルターモードに応じて履歴データをフィルタリング
     * 
     * @returns {Array} フィルタリングされた履歴データ
     */
    const getFilteredHistory = () => {
        if (filterMode === 'self') {
            // 自分の更新のみ表示
            return historyData.filter(h => h.updaterEmployeeNo === currentUserEmployeeNo);
        } else if (filterMode === 'others') {
            // 他人の更新のみ表示
            return historyData.filter(h => h.updaterEmployeeNo !== currentUserEmployeeNo);
        }
        // 全て表示
        return historyData;
    };

    /**
     * 変更内容を「変更前 → 変更後」の形式でパース
     * 
     * @param {string} content - 変更内容の文字列
     * @returns {Object} {before: 変更前, after: 変更後}
     */
    const parseChangeContent = (content) => {
        if (!content) return { before: '-', after: '-' };
        const parts = content.split(' → ');
        return {
            before: parts[0] || '-',
            after: parts[1] || '-'
        };
    };

    // モーダルが閉じている場合は何も表示しない
    if (!isOpen) return null;

    return (
        // モーダルオーバーレイ - クリックで閉じる
        <div className="modal-overlay" onClick={onClose}>
            {/* モーダル本体 - クリックイベントの伝播を停止 */}
            <div className="history-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* ヘッダー部分 */}
                <div className="history-header">
                    <h2>ユーザー情報更新履歴</h2>

                    {/* フィルターボタングループ */}
                    <div className="filter-buttons">
                        {/* 全て表示 */}
                        <button
                            className={`filter-btn ${filterMode === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterMode('all')}
                        >
                            更新順
                        </button>
                        {/* 自分の更新のみ */}
                        <button
                            className={`filter-btn ${filterMode === 'self' ? 'active' : ''}`}
                            onClick={() => setFilterMode('self')}
                        >
                            自分
                        </button>
                        {/* 他人の更新のみ */}
                        <button
                            className={`filter-btn ${filterMode === 'others' ? 'active' : ''}`}
                            onClick={() => setFilterMode('others')}
                        >
                            他人
                        </button>
                    </div>
                </div>

                {/* history-table-containerで全体をラップ（デザイン統一） */}
                <div className="history-table-container">
                    <div className="history-table-wrapper">
                        {loading ? (
                            // ローディング中表示
                            <div className="loading">読み込み中...</div>
                        ) : (
                            // 履歴テーブル
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>更新日時</th>
                                        <th>更新者</th>
                                        <th>対象社員</th>
                                        <th>変更項目</th>
                                        <th>変更前</th>
                                        <th>変更後</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFilteredHistory().length > 0 ? (
                                        // 履歴データ表示
                                        getFilteredHistory().map((history) => {
                                            // 変更内容をパース
                                            const { before, after } = parseChangeContent(history.changeContent);
                                            return (
                                                <tr key={history.id}>
                                                    {/* 更新日時 */}
                                                    <td>{history.changeDate}</td>

                                                    {/* 更新者情報 */}
                                                    <td className="employee-info-cell">
                                                        <div>{history.updaterEmployeeNo}</div>
                                                        <div>{history.updaterName}</div>
                                                        <div className="kana">{history.updaterNameKana}</div>
                                                    </td>

                                                    {/* 対象社員情報 */}
                                                    <td className="employee-info-cell">
                                                        <div>{history.targetEmployeeNo}</div>
                                                        <div>{history.targetName}</div>
                                                        <div className="kana">{history.targetNameKana}</div>
                                                    </td>

                                                    {/* 変更項目 */}
                                                    <td>{history.changeField}</td>

                                                    {/* 変更前の値 */}
                                                    <td>{before}</td>

                                                    {/* 変更後の値 */}
                                                    <td>{after}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        // データなし表示
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

                    {/* history-footerをcontainerの中に配置 */}
                    <div className="history-footer">
                        <span className="record-count">
                            表示中：{getFilteredHistory().length}件
                        </span>
                    </div>
                </div>

                {/* modal-footerはcontainerの外 */}
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