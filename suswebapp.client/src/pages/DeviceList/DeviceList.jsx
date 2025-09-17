import React, { useState, useEffect } from 'react';
import './DeviceList.css';
import DeviceModal from './DeviceModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import DeviceHistoryModal from './DeviceHistoryModal';

const DeviceList = ({ onBack }) => {
    const [devices, setDevices] = useState([]);
    const [filteredDevices, setFilteredDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [deleteMode, setDeleteMode] = useState(false);
    const [detailView, setDetailView] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchDevices();
    }, []);

    // 検索フィルタリング
    useEffect(() => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const filtered = devices.filter(device => {
                const matchCount = Object.values(device).filter(value =>
                    value && value.toString().toLowerCase().includes(query)
                ).length;
                return matchCount > 0;
            }).sort((a, b) => {
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

    // GBかTBか判断する関数
    const formatStorage = (gb) => {
        if (!gb) return '-';
        if (gb >= 1000) {
            const tb = (gb / 1000).toFixed(1);
            return tb.endsWith('.0') ? `${Math.floor(gb / 1000)}TB` : `${tb}TB`;
        }
        return `${gb}GB`;
    };

    const fetchDevices = async () => {
        try {
            const response = await fetch('/api/device/list');
            const data = await response.json();
            if (data.success) {
                const sortedDevices = data.data.sort((a, b) => {
                    const aParts = a.assetNo.split('-');
                    const bParts = b.assetNo.split('-');

                    for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
                        const aNum = parseInt(aParts[i]);
                        const bNum = parseInt(bParts[i]);

                        if (!isNaN(aNum) && !isNaN(bNum)) {
                            if (aNum !== bNum) return aNum - bNum;
                        } else {
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

    // 検索処理
    const handleSearch = () => {
        // searchQueryの変更でuseEffectが動作
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    // 詳細表示切り替え
    const toggleDetailView = () => {
        setDetailView(!detailView);
    };

    const handleAdd = () => {
        setSelectedDevice(null);
        setShowAddModal(true);
    };

    const toggleEditMode = () => {
        setEditMode(!editMode);
        setDeleteMode(false);
    };

    const toggleDeleteMode = () => {
        setDeleteMode(!deleteMode);
        setEditMode(false);
    };

    const handleEdit = (device) => {
        setSelectedDevice(device);
        setShowEditModal(true);
    };

    const handleDeleteClick = (device) => {
        setDeleteTarget(device);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;

        try {
            const currentUserEmployeeNo = localStorage.getItem('employeeNo') || 'A1002';

            const response = await fetch(`/api/device/delete/${deleteTarget.assetNo}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-EmployeeNo': currentUserEmployeeNo
                }
            });

            if (response.ok) {
                alert('削除しました');
                fetchDevices();
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

    const handleSave = async (formData) => {
        try {
            const currentUserEmployeeNo = localStorage.getItem('employeeNo') || 'A1002';

            const url = showEditModal
                ? `/api/device/update/${formData.assetNo}`
                : '/api/device/create';

            const method = showEditModal ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-EmployeeNo': currentUserEmployeeNo
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert(showEditModal ? '更新しました' : '登録しました');
                fetchDevices();
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

    // 検索文字のハイライト
    const highlightText = (text, query) => {
        if (!query || !text) return text;
        const lowerText = text.toString().toLowerCase();
        const lowerQuery = query.toLowerCase();
        if (!lowerText.includes(lowerQuery)) return text;

        return <span className="highlight">{text}</span>;
    };

    return (
        <div className="device-list-container">
            <div className="device-list-header">
                <h2>機器一覧</h2>
                <button className="back-btn" onClick={onBack}>
                    メニューに戻る
                </button>
            </div>

            {/* すべてを1行に配置 */}
            <div className="controls-container">
                {/* 左側：モードボタン */}
                <div className="mode-buttons-group">
                    <button
                        className="mode-btn add-mode-btn"
                        onClick={handleAdd}
                        title="新規登録"
                    >
                        <span className="icon-plus">+</span>
                    </button>
                    <button
                        className={`mode-btn delete-mode-btn ${deleteMode ? 'active' : ''}`}
                        onClick={toggleDeleteMode}
                        title="削除モード"
                    >
                        <span className="icon-minus">−</span>
                    </button>
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
                            title="更新履歴"
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

                                        // 行のクラス名を決定
                                        const rowClassName = isLeaseExpired ? 'lease-expired' :
                                            device.isBroken ? 'broken-device' : '';

                                        return (
                                            <tr key={device.assetNo} className={rowClassName}>
                                                <td>
                                                    <div className="asset-no-cell">
                                                        {editMode && (
                                                            <button
                                                                className="inline-edit-btn"
                                                                onClick={() => handleEdit(device)}
                                                                title="編集"
                                                            >
                                                                ✎
                                                            </button>
                                                        )}
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

            <DeviceModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                device={null}
                onSave={handleSave}
                mode="add"
            />

            <DeviceModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                device={selectedDevice}
                onSave={handleSave}
                mode="edit"
            />

            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                deviceName={deleteTarget?.assetNo}
            />

            <DeviceHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
            />
        </div>
    );
};

export default DeviceList;