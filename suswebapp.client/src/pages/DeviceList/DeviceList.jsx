import React, { useState, useEffect } from 'react';
import './DeviceList.css';
import DeviceModal from './DeviceModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const DeviceList = ({ onBack }) => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [deleteMode, setDeleteMode] = useState(false);

    useEffect(() => {
        fetchDevices();
    }, []);

    // GBかTBか判断する関数
    const formatStorage = (gb) => {
        if (gb >= 1000) {
            const tb = (gb / 1000).toFixed(1);
            // 小数点が.0の場合は整数表示
            return tb.endsWith('.0') ? `${Math.floor(gb / 1000)}TB` : `${tb}TB`;
        }
        return `${gb}GB`;
    };

    const fetchDevices = async () => {
        try {
            const response = await fetch('/api/device/list');
            const data = await response.json();
            if (data.success) {
                // 資産番号の自然順ソート
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
            }
        } catch (error) {
            console.error('機器一覧の取得エラー:', error);
        } finally {
            setLoading(false);
        }
    };

    // 新規登録
    const handleAdd = () => {
        setSelectedDevice(null);
        setShowAddModal(true);
    };

    // 編集モード切替
    const toggleEditMode = () => {
        setEditMode(!editMode);
        setDeleteMode(false); // 削除モードを解除
    };

    // 削除モード切替
    const toggleDeleteMode = () => {
        setDeleteMode(!deleteMode);
        setEditMode(false); // 編集モードを解除
    };

    // 編集
    const handleEdit = (device) => {
        setSelectedDevice(device);
        setShowEditModal(true);
    };

    // 削除確認
    const handleDeleteClick = (device) => {
        setDeleteTarget(device);
        setShowDeleteModal(true);
    };

    // 削除実行
    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;

        try {
            const response = await fetch(`/api/device/delete/${deleteTarget.assetNo}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                alert('削除しました');
                fetchDevices();
                // 削除モードは維持
            }
        } catch (error) {
            console.error('削除エラー:', error);
            alert('削除に失敗しました');
        }
        setShowDeleteModal(false);
        setDeleteTarget(null);
    };

    // 保存（新規・編集共通）
    const handleSave = async (formData) => {
        try {
            const url = showEditModal
                ? `/api/device/update/${formData.assetNo}`
                : '/api/device/create';

            const method = showEditModal ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert(showEditModal ? '更新しました' : '登録しました');
                fetchDevices();
                setShowAddModal(false);
                setShowEditModal(false);
                setSelectedDevice(null);
                // 編集モードは維持
            } else {
                alert('エラーが発生しました');
            }
        } catch (error) {
            console.error('保存エラー:', error);
            alert('保存に失敗しました');
        }
    };

    return (
        <div className="device-list-container">
            <div className="device-list-header">
                <h2>機器一覧</h2>
                <button className="back-btn" onClick={onBack}>
                    メニューに戻る
                </button>
            </div>

            {/* モードボタン */}
            <div className="mode-buttons">
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

            {loading ? (
                <div className="loading">読み込み中...</div>
            ) : (
                <div className="device-table-wrapper">
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
                            </tr>
                        </thead>
                            <tbody>
                                {devices.map((device) => (
                                    <tr key={device.assetNo}>
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
                                                <span>{device.assetNo}</span>
                                            </div>
                                        </td>
                                        <td>{device.manufacturer}</td>
                                        <td>{device.os}</td>
                                        <td>{device.memory}GB</td>
                                        <td>{formatStorage(device.storage)}</td>
                                        <td>{device.graphicsCard || '-'}</td>
                                        <td>{device.storageLocation}</td>
                                        <td>
                                            {device.isBroken ? (
                                                <span className="status-broken">◯</span>
                                            ) : (
                                                <span>-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                    </table>
                </div>
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
        </div>
    );
};

export default DeviceList;