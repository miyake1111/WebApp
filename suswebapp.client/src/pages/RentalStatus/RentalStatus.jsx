/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import './RentalStatus.css';
import DeviceDetailModal from './DeviceDetailModal';

const RentalStatus = ({ onBack, user }) => {
    const [rentalList, setRentalList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [displayMode, setDisplayMode] = useState('all');
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // デバッグ：userプロップの確認
    console.log('RentalStatus - user prop:', user);
    console.log('RentalStatus - user.employeeNo:', user?.employeeNo);

    // 貸出状況データを取得
    useEffect(() => {
        fetchRentalStatus();
    }, []);

    const fetchRentalStatus = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/rental/status');
            if (!response.ok) {
                throw new Error('データ取得に失敗しました');
            }

            const data = await response.json();

            if (data.success) {
                setRentalList(data.data);
                setError('');
            } else {
                setError(data.message || 'データ取得に失敗しました');
            }
        } catch (err) {
            console.error('Error fetching rental data:', err);
            setError('サーバーとの通信に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    // 表示モード切替
    const handleDisplayModeChange = () => {
        if (displayMode === 'all') {
            setDisplayMode('available');
        } else if (displayMode === 'available') {
            setDisplayMode('rented');
        } else {
            setDisplayMode('all');
        }
    };

    // 表示モードに応じたボタンテキスト
    const getDisplayModeText = () => {
        switch (displayMode) {
            case 'available':
                return '空きのみ表示';
            case 'rented':
                return '貸出中のみ表示';
            default:
                return 'No順';
        }
    };

    // フィルタリング
    const getFilteredList = () => {
        switch (displayMode) {
            case 'available':
                return rentalList.filter(item => !item.employeeNo || item.employeeNo === '');
            case 'rented':
                return rentalList.filter(item => item.employeeNo && item.employeeNo !== '');
            default:
                return rentalList;
        }
    };

    // 日付フォーマット
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return dateString;
    };

    // 資産番号クリック
    const handleAssetClick = (rental) => {
        setSelectedDevice(rental);
        setShowDetailModal(true);
    };

    // モーダルアクション
    const handleModalAction = async (action, device) => {
        console.log('handleModalAction called with:', { action, device, user });

        try {
            if (action === 'rental') {
                // ユーザー情報の確認
                if (!user || !user.employeeNo) {
                    console.error('User info missing:', user);
                    alert('ユーザー情報が取得できません。再度ログインしてください。');
                    return;
                }

                const requestData = {
                    assetNo: device.assetNo,
                    employeeNo: user.employeeNo,
                    rentalDate: new Date().toISOString().split('T')[0],
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    remarks: ''
                };

                console.log('Sending rental request:', requestData);

                const response = await fetch('/api/rental/rent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestData)
                });

                const result = await response.json();
                console.log('Rental response:', result);

                if (response.ok && result.success) {
                    alert('貸出処理が完了しました');
                    setShowDetailModal(false);
                    fetchRentalStatus();
                } else {
                    console.error('Rental failed:', result);
                    alert(result.message || '貸出処理に失敗しました');
                }
            } else if (action === 'return') {
                if (!device.rentalId) {
                    alert('返却情報が見つかりません');
                    return;
                }

                console.log('Returning device:', device.rentalId);

                const response = await fetch(`/api/rental/return/${device.rentalId}`, {
                    method: 'POST'
                });

                const result = await response.json();
                console.log('Return response:', result);

                if (response.ok && result.success) {
                    alert('返却処理が完了しました');
                    setShowDetailModal(false);
                    fetchRentalStatus();
                } else {
                    console.error('Return failed:', result);
                    alert(result.message || '返却処理に失敗しました');
                }
            }
        } catch (error) {
            console.error('処理エラー:', error);
            alert('処理に失敗しました: ' + error.message);
        }
    };

    const filteredList = getFilteredList();

    return (
        <div className="rental-status-container">
            <div className="rental-status-header">
                <h2>貸出状況一覧</h2>
                <div className="header-controls">
                    <button
                        className="toggle-btn"
                        onClick={handleDisplayModeChange}
                    >
                        {getDisplayModeText()}
                    </button>
                    <button className="back-btn" onClick={onBack}>
                        メニューに戻る
                    </button>
                </div>
            </div>

            {/* デバッグ情報表示（開発時のみ） */}
            {/*process.env.NODE_ENV === 'development' && (
                <div style={{ padding: '10px', background: '#f0f0f0', margin: '10px' }}>
                    <strong>Debug Info:</strong><br />
                    User: {user ? JSON.stringify(user) : 'null'}<br />
                    EmployeeNo: {user?.employeeNo || 'undefined'}
                </div>
            )*/}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="loading">
                    データを読み込み中...
                </div>
            ) : (
                <div className="rental-table-container">
                    <div className="rental-table-wrapper">
                        <table className="rental-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>資産番号</th>
                                    <th>メーカー</th>
                                    <th>OS</th>
                                    <th>保管場所</th>
                                    <th>状態</th>
                                    <th>使用者名</th>
                                    <th>社員番号</th>
                                    <th>部署</th>
                                    <th>貸出日</th>
                                    <th>返却予定日</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredList.length === 0 ? (
                                    <tr>
                                        <td colSpan="11" style={{ textAlign: 'center' }}>
                                            データがありません
                                        </td>
                                    </tr>
                                ) : (
                                    filteredList.map((rental, index) => (
                                        <tr key={rental.rentalId || rental.assetNo}>
                                            <td>{index + 1}</td>
                                            <td
                                                className="asset-no clickable"
                                                onClick={() => handleAssetClick(rental)}
                                                style={{
                                                    color: '#2196F3',
                                                    cursor: 'pointer',
                                                    textDecoration: 'underline'
                                                }}
                                            >
                                                {rental.assetNo}
                                            </td>
                                            <td>{rental.maker || rental.manufacturer || '-'}</td>
                                            <td>{rental.os || '-'}</td>
                                            <td>{rental.location || rental.storageLocation || '-'}</td>
                                            <td>
                                                <span className={rental.employeeNo ? 'status-rental' : 'status-available'}>
                                                    {rental.employeeNo ? '貸出中' : '空き'}
                                                </span>
                                            </td>
                                            <td>{rental.employeeName || '-'}</td>
                                            <td>{rental.employeeNo || '-'}</td>
                                            <td>{rental.department || '-'}</td>
                                            <td>{rental.rentalDate ? formatDate(rental.rentalDate) : '-'}</td>
                                            <td>{rental.dueDate ? formatDate(rental.dueDate) : '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="table-footer">
                        <span className="record-count">
                            表示中: {filteredList.length}件
                        </span>
                    </div>
                </div>
            )}

            {showDetailModal && (
                <DeviceDetailModal
                    device={selectedDevice}
                    onClose={() => setShowDetailModal(false)}
                    onAction={handleModalAction}
                    currentUser={user}
                />
            )}
        </div>
    );
};

export default RentalStatus;