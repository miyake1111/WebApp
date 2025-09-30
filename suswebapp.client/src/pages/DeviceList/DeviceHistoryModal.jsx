import React, { useState, useEffect } from 'react';
import './DeviceHistoryModal.css';

/**
 * デバイス更新履歴モーダルコンポーネント
 * 機器情報の変更履歴を表示し、フィルタリング機能を提供
 * 
 * @param {boolean} isOpen - モーダルの表示/非表示状態
 * @param {Function} onClose - モーダルを閉じる関数
 */
const DeviceHistoryModal = ({ isOpen, onClose }) => {
    // 履歴データを管理
    const [historyData, setHistoryData] = useState([]);
    // フィルターモード（all: 全て, self: 自分の更新, others: 他人の更新）
    const [filterMode, setFilterMode] = useState('all');
    // ローディング状態
    const [loading, setLoading] = useState(false);
    // 現在のユーザーの社員番号を取得（LocalStorageから）
    const currentUserEmployeeNo = localStorage.getItem('employeeNo') || 'A1002';

    /**
     * モーダルが開かれた時に履歴データを取得
     * isOpenがtrueになったタイミングで実行
     */
    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    /**
     * APIから履歴データを取得する関数
     * バックエンドの/api/device/historyエンドポイントを呼び出し
     */
    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/device/history');
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
            // 自分の更新のみ表示（現在のユーザーの社員番号と一致）
            return historyData.filter(h => h.updaterEmployeeNo === currentUserEmployeeNo);
        } else if (filterMode === 'others') {
            // 他人の更新のみ表示（現在のユーザーの社員番号と不一致）
            return historyData.filter(h => h.updaterEmployeeNo !== currentUserEmployeeNo);
        }
        // 全て表示（フィルタリングなし）
        return historyData;
    };

    /**
     * 変更内容を「変更前 → 変更後」の形式でパース
     * データベースに保存された文字列を分解
     * 
     * @param {string} content - 変更内容の文字列（例: "Windows10 → Windows11"）
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
        // オーバーレイ - クリックでモーダルを閉じる
        <div className="modal-overlay" onClick={onClose}>
            {/* モーダル本体 - クリックイベントの伝播を停止 */}
            <div className="history-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* ヘッダー部分 */}
                <div className="history-header">
                    <h2>機器情報更新履歴</h2>

                    {/* フィルターボタングループ */}
                    <div className="filter-buttons">
                        {/* 全て表示ボタン */}
                        <button
                            className={`filter-btn ${filterMode === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterMode('all')}
                        >
                            更新順
                        </button>
                        {/* 自分の更新のみ表示ボタン */}
                        <button
                            className={`filter-btn ${filterMode === 'self' ? 'active' : ''}`}
                            onClick={() => setFilterMode('self')}
                        >
                            自分
                        </button>
                        {/* 他人の更新のみ表示ボタン */}
                        <button
                            className={`filter-btn ${filterMode === 'others' ? 'active' : ''}`}
                            onClick={() => setFilterMode('others')}
                        >
                            他人
                        </button>
                    </div>
                </div>

                {/* テーブルコンテナ */}
                <div className="history-table-container">
                    <div className="history-table-wrapper">
                        {loading ? (
                            // ローディング中の表示
                            <div className="loading">読み込み中...</div>
                        ) : (
                            // 履歴テーブル
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>更新日時</th>
                                        <th>更新者</th>
                                        <th>対象機器</th>
                                        <th>変更項目</th>
                                        <th>変更前</th>
                                        <th>変更後</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFilteredHistory().length > 0 ? (
                                        // 履歴データが存在する場合
                                        getFilteredHistory().map((history) => {
                                            // 変更内容をパース
                                            const { before, after } = parseChangeContent(history.changeContent);
                                            return (
                                                <tr key={history.id}>
                                                    {/* 更新日時 */}
                                                    <td>{history.changeDate}</td>
                                                    {/* 更新者情報（社員番号と名前） */}
                                                    <td className="employee-info-cell">
                                                        <div>{history.updaterEmployeeNo}</div>
                                                        <div>{history.updaterName}</div>
                                                    </td>
                                                    {/* 対象機器情報（資産番号、メーカー、OS） */}
                                                    <td className="device-info-cell">
                                                        <div>{history.targetAssetNo}</div>
                                                        <div>{history.targetManufacturer}</div>
                                                        <div className="sub-info">{history.targetOs}</div>
                                                    </td>
                                                    {/* 変更項目（メモリ、ストレージなど） */}
                                                    <td>{history.changeField}</td>
                                                    {/* 変更前の値 */}
                                                    <td>{before}</td>
                                                    {/* 変更後の値 */}
                                                    <td>{after}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        // 履歴データが存在しない場合
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

                    {/* フッター - 件数表示 */}
                    <div className="history-footer">
                        <span className="record-count">
                            表示中：{getFilteredHistory().length}件
                        </span>
                    </div>
                </div>

                {/* モーダルフッター */}
                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeviceHistoryModal;