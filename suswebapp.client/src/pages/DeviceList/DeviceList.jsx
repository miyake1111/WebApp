import React, { useState, useEffect } from 'react';
import './DeviceList.css';

const DeviceList = ({ onBack }) => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingDevice, setEditingDevice] = useState(null);

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            const response = await fetch('/api/device/list');
            const data = await response.json();
            if (data.success) {
                setDevices(data.data);
            }
        } catch (error) {
            console.error('機器一覧の取得エラー:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (assetNo) => {
        if (!window.confirm('本当に削除しますか？')) return;

        try {
            const response = await fetch(`/api/device/delete/${assetNo}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                alert('削除しました');
                fetchDevices();
            }
        } catch (error) {
            console.error('削除エラー:', error);
        }
    };

    return (
        <div className="device-list-container">
            <div className="device-list-header">
                <h2>機器一覧</h2>
                <div className="header-buttons">
                    <button className="add-btn" onClick={() => setShowAddModal(true)}>
                        + 新規登録
                    </button>
                    <button className="back-btn" onClick={onBack}>
                        メニューに戻る
                    </button>
                </div>
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
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devices.map((device) => (
                                <tr key={device.assetNo}>
                                    <td>{device.assetNo}</td>
                                    <td>{device.manufacturer}</td>
                                    <td>{device.os}</td>
                                    <td>{device.memory}GB</td>
                                    <td>{device.storage}GB</td>
                                    <td>{device.graphicsCard || '-'}</td>
                                    <td>{device.storageLocation}</td>
                                    <td>
                                        {device.isBroken ? (
                                            <span className="status-broken">◯</span>
                                        ) : (
                                            <span>-</span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            className="edit-btn"
                                            onClick={() => setEditingDevice(device)}
                                        >
                                            編集
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(device.assetNo)}
                                        >
                                            削除
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DeviceList;s