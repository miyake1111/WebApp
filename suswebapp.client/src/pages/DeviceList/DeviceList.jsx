import React, { useState, useEffect } from 'react';
import './DeviceList.css';
import DeviceModal from './DeviceModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import DeviceHistoryModal from './DeviceHistoryModal';

/**
 * デバイス一覧コンポーネント
 * 機器の一覧表示、検索、CRUD操作を提供するメインコンポーネント
 * 
 * @param {Function} onBack - メニューに戻る関数（親コンポーネントから渡される）
 */
const DeviceList = ({ onBack }) => {
    // === ステート管理 ===
    // デバイス関連
    const [devices, setDevices] = useState([]);                    // 全デバイスデータ
    const [filteredDevices, setFilteredDevices] = useState([]);    // フィルタリング後のデバイス
    const [loading, setLoading] = useState(true);                  // ローディング状態

    // モーダル表示制御
    const [showAddModal, setShowAddModal] = useState(false);       // 新規登録モーダル表示状態
    const [showEditModal, setShowEditModal] = useState(false);     // 編集モーダル表示状態
    const [showDeleteModal, setShowDeleteModal] = useState(false); // 削除確認モーダル表示状態
    const [showHistoryModal, setShowHistoryModal] = useState(false); // 履歴モーダル表示状態

    // 選択・操作対象
    const [selectedDevice, setSelectedDevice] = useState(null);    // 編集対象デバイス
    const [deleteTarget, setDeleteTarget] = useState(null);        // 削除対象デバイス

    // モード管理
    const [editMode, setEditMode] = useState(false);               // 編集モード（インライン編集ボタン表示）
    const [deleteMode, setDeleteMode] = useState(false);           // 削除モード（インライン削除ボタン表示）
    const [detailView, setDetailView] = useState(false);           // 詳細表示モード（追加カラム表示）

    // 検索
    const [searchQuery, setSearchQuery] = useState('');            // 検索クエリ

    /**
     * コンポーネントマウント時にデバイス一覧を取得
     */
    useEffect(() => {
        fetchDevices();
    }, []);

    /**
     * 検索クエリに基づいてデバイスをフィルタリング
     * 複数のフィールドを検索し、一致度でソート
     */
    useEffect(() => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const filtered = devices.filter(device => {
                // 各フィールドで検索文字列と一致するかチェック
                const matchCount = Object.values(device).filter(value =>
                    value && value.toString().toLowerCase().includes(query)
                ).length;
                return matchCount > 0;
            }).sort((a, b) => {
                // マッチ数の多い順にソート（関連度順）
                const aCount = Object.values(a).filter(value =>
                    value && value.toString().toLowerCase().includes(query)
                ).length;
                const bCount = Object.values(b).filter(value =>
                    value && value.toString().toLowerCase().includes(query)
                ).length;
                return bCount - aCount;
            });
            setFilteredDevices(filtered);
        } else {
            setFilteredDevices(devices);
        }
    }, [searchQuery, devices]);

    /**
     * ストレージ容量をGB/TB形式でフォーマット
     * 1000GB以上はTB表示に変換
     * 
     * @param {number} gb - ギガバイト単位の容量
     * @returns {string} フォーマットされた容量文字列
     */
    const formatStorage = (gb) => {
        if (!gb) return '-';
        if (gb >= 1000) {
            const tb = (gb / 1000).toFixed(1);
            // .0の場合は整数表示
            return tb.endsWith('.0') ? `${Math.floor(gb / 1000)}TB` : `${tb}TB`;
        }
        return `${gb}GB`;
    };

    /**
     * APIからデバイス一覧を取得し、資産番号でソート
     * 資産番号の形式: A19-2024-01
     */
    const fetchDevices = async () => {
        try {
            const response = await fetch('/api/device/list');
            const data = await response.json();
            if (data.success) {
                // 資産番号でソート（数値部分を考慮した自然順ソート）
                const sortedDevices = data.data.sort((a, b) => {
                    const aParts = a.assetNo.split('-');
                    const bParts = b.assetNo.split('-');

                    // 各パートを比較
                    for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
                        const aNum = parseInt(aParts[i]);
                        const bNum = parseInt(bParts[i]);

                        // 両方が数値の場合は数値として比較
                        if (!isNaN(aNum) && !isNaN(bNum)) {
                            if (aNum !== bNum) return aNum - bNum;
                        } else {
                            // それ以外は文字列として比較
                            const comp = aParts[i].localeCompare(bParts[i]);
                            if (comp !== 0) return comp;
                        }
                    }
                    return aParts.length - bParts.length;
                });

                setDevices(sortedDevices);
                setFilteredDevices(sortedDevices);
            }
        } catch (error) {
            console.error('機器一覧の取得エラー:', error);
        } finally {
            setLoading(false);
        }
    };

    // === イベントハンドラ ===

    /**
     * 検索処理（現在はsearchQueryの変更でuseEffectが動作するため空）
     */
    const handleSearch = () => {
        // searchQueryの変更でuseEffectが動作
    };

    /**
     * 検索クエリをクリア
     */
    const handleClearSearch = () => {
        setSearchQuery('');
    };

    /**
     * 詳細表示モードの切り替え
     * リース情報、備考、登録日などの追加カラムを表示/非表示
     */
    const toggleDetailView = () => {
        setDetailView(!detailView);
    };

    /**
     * 新規登録モーダルを開く
     */
    const handleAdd = () => {
        setSelectedDevice(null);  // 選択デバイスをクリア
        setShowAddModal(true);
    };

    /**
     * 編集モードの切り替え
     * 編集モードON時は削除モードをOFF
     */
    const toggleEditMode = () => {
        setEditMode(!editMode);
        setDeleteMode(false);  // 削除モードは解除
    };

    /**
     * 削除モードの切り替え
     * 削除モードON時は編集モードをOFF
     */
    const toggleDeleteMode = () => {
        setDeleteMode(!deleteMode);
        setEditMode(false);  // 編集モードは解除
    };

    /**
     * 編集モーダルを開く
     * 
     * @param {Object} device - 編集対象のデバイス
     */
    const handleEdit = (device) => {
        setSelectedDevice(device);
        setShowEditModal(true);
    };

    /**
     * 削除確認モーダルを開く
     * 
     * @param {Object} device - 削除対象のデバイス
     */
    const handleDeleteClick = (device) => {
        setDeleteTarget(device);
        setShowDeleteModal(true);
    };

    /**
     * 削除実行処理
     * 削除確認モーダルからの確認後に実行
     */
    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;

        try {
            const currentUserEmployeeNo = localStorage.getItem('employeeNo') || 'A1002';

            // 削除APIを呼び出し（論理削除）
            const response = await fetch(`/api/device/delete/${deleteTarget.assetNo}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-EmployeeNo': currentUserEmployeeNo  // 削除実行者の記録用
                }
            });

            if (response.ok) {
                alert('削除しました');
                fetchDevices();  // 一覧を再取得
            } else {
                alert('削除に失敗しました');
            }
        } catch (error) {
            console.error('削除エラー:', error);
            alert('削除に失敗しました');
        }
        setShowDeleteModal(false);
        setDeleteTarget(null);
    };

    /**
     * デバイス情報の保存（新規登録/更新）
     * 
     * @param {Object} formData - フォームデータ
     */
    const handleSave = async (formData) => {
        try {
            const currentUserEmployeeNo = localStorage.getItem('employeeNo') || 'A1002';

            // モードに応じてURL/メソッドを決定
            const url = showEditModal
                ? `/api/device/update/${formData.assetNo}`  // 更新
                : '/api/device/create';                      // 新規作成

            const method = showEditModal ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-EmployeeNo': currentUserEmployeeNo  // 更新者の記録用
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert(showEditModal ? '更新しました' : '登録しました');
                fetchDevices();  // 一覧を再取得
                setShowAddModal(false);
                setShowEditModal(false);
                setSelectedDevice(null);
            } else {
                const errorData = await response.text();
                console.error('エラー詳細:', errorData);
                alert('保存に失敗しました');
            }
        } catch (error) {
            console.error('保存エラー:', error);
            alert('保存に失敗しました');
        }
    };

    /**
     * 検索文字列のハイライト処理
     * 検索にマッチした項目を黄色背景でハイライト
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

        // マッチした場合はハイライトクラスを適用
        return <span className="highlight">{text}</span>;
    };

    return (
        <div className="device-list-container">
            {/* ヘッダー部分 */}
            <div className="device-list-header">
                <h2>機器一覧</h2>
                <button className="back-btn" onClick={onBack}>
                    メニューに戻る
                </button>
            </div>

            {/* コントロール部分 - すべてを1行に配置 */}
            <div className="controls-container">
                {/* 左側：モードボタン（追加・削除・編集） */}
                <div className="mode-buttons-group">
                    {/* 新規登録ボタン */}
                    <button
                        className="mode-btn add-mode-btn"
                        onClick={handleAdd}
                        title="新規登録"
                    >
                        <span className="icon-plus">+</span>
                    </button>
                    {/* 削除モードボタン */}
                    <button
                        className={`mode-btn delete-mode-btn ${deleteMode ? 'active' : ''}`}
                        onClick={toggleDeleteMode}
                        title="削除モード"
                    >
                        <span className="icon-minus">−</span>
                    </button>
                    {/* 編集モードボタン */}
                    <button
                        className={`mode-btn edit-mode-btn ${editMode ? 'active' : ''}`}
                        onClick={toggleEditMode}
                        title="編集モード"
                    >
                        <span className="icon-pen">✎</span>
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
                        {/* 更新履歴ボタン */}
                        <button
                            className="history-btn"
                            onClick={() => setShowHistoryModal(true)}
                            title="更新履歴"
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
                <>
                    {/* デバイステーブル */}
                    <div className="device-table-container">
                        <div className={`device-table-wrapper ${detailView ? 'detail-view' : ''}`}>
                            <table className="device-table">
                                <thead>
                                    <tr>
                                        <th>資産番号</th>
                                        <th>メーカー</th>
                                        <th>OS</th>
                                        <th>メモリ</th>
                                        <th>容量</th>
                                        <th>グラフィックボード</th>
                                        <th>保管場所</th>
                                        <th>故障</th>
                                        {/* 詳細表示時の追加カラム */}
                                        {detailView && (
                                            <>
                                                <th>リース開始日</th>
                                                <th>リース期限日</th>
                                                <th>備考</th>
                                                <th>登録日</th>
                                                <th>更新日</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDevices.map((device) => {
                                        // リース期限チェック
                                        const isLeaseExpired = device.leaseEndDate &&
                                            new Date(device.leaseEndDate) < new Date();

                                        // 行のクラス名を決定（リース期限切れ or 故障）
                                        const rowClassName = isLeaseExpired ? 'lease-expired' :
                                            device.isBroken ? 'broken-device' : '';

                                        return (
                                            <tr key={device.assetNo} className={rowClassName}>
                                                <td>
                                                    <div className="asset-no-cell">
                                                        {/* 編集モード時のインライン編集ボタン */}
                                                        {editMode && (
                                                            <button
                                                                className="inline-edit-btn"
                                                                onClick={() => handleEdit(device)}
                                                                title="編集"
                                                            >
                                                                ✎
                                                            </button>
                                                        )}
                                                        {/* 削除モード時のインライン削除ボタン */}
                                                        {deleteMode && (
                                                            <button
                                                                className="inline-delete-btn"
                                                                onClick={() => handleDeleteClick(device)}
                                                                title="削除"
                                                            >
                                                                −
                                                            </button>
                                                        )}
                                                        <span>{highlightText(device.assetNo, searchQuery)}</span>
                                                    </div>
                                                </td>
                                                <td>{highlightText(device.manufacturer || '-', searchQuery)}</td>
                                                <td>{highlightText(device.os || '-', searchQuery)}</td>
                                                <td>{device.memory ? `${highlightText(device.memory.toString(), searchQuery)}GB` : '-'}</td>
                                                <td>{formatStorage(device.storage)}</td>
                                                <td>{highlightText(device.graphicsCard || '-', searchQuery)}</td>
                                                <td>{highlightText(device.storageLocation || '-', searchQuery)}</td>
                                                <td>
                                                    {device.isBroken ? (
                                                        <span className="status-broken">◯</span>
                                                    ) : (
                                                        <span>-</span>
                                                    )}
                                                </td>
                                                {/* 詳細表示時の追加データ */}
                                                {detailView && (
                                                    <>
                                                        <td>{device.leaseStartDate ? new Date(device.leaseStartDate).toLocaleDateString('ja-JP') : '-'}</td>
                                                        <td>{device.leaseEndDate ? new Date(device.leaseEndDate).toLocaleDateString('ja-JP') : '-'}</td>
                                                        <td>{highlightText(device.remarks || '-', searchQuery)}</td>
                                                        <td>{device.registrationDate ? new Date(device.registrationDate).toLocaleDateString('ja-JP') : '-'}</td>
                                                        <td>{device.updateDate ? new Date(device.updateDate).toLocaleDateString('ja-JP') : '-'}</td>
                                                    </>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* 表示件数のみテーブル内に固定 */}
                        <div className="table-footer">
                            <span className="record-count">
                                表示中：{filteredDevices.length}件
                            </span>
                        </div>
                    </div>

                    {/* 詳細ボタンはテーブルの外 */}
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

            {/* 新規登録モーダル */}
            <DeviceModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                device={null}
                onSave={handleSave}
                mode="add"
            />

            {/* 編集モーダル */}
            <DeviceModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                device={selectedDevice}
                onSave={handleSave}
                mode="edit"
            />

            {/* 削除確認モーダル */}
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                deviceName={deleteTarget?.assetNo}
            />

            {/* 履歴モーダル */}
            <DeviceHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
            />
        </div>
    );
};

export default DeviceList;