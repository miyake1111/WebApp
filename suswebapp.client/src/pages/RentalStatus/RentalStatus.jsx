import React, { useState, useEffect } from 'react';
import './RentalStatus.css';
import DeviceDetailModal from './DeviceDetailModal';  // コメントを外す

const RentalStatus = ({ onBack, user }) => {
    const [rentalList, setRentalList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // 貸出状況データを取得
    useEffect(() => {
        fetchRentalStatus();
    }, [showHistory]);

    const fetchRentalStatus = async () => {
        setIsLoading(true);
        try {
            const endpoint = showHistory ? 'history' : 'status';
            const response = await fetch(`/api/rental/${endpoint}`);
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

    // 表示切替時の処理
    const handleToggleView = () => {
        setShowHistory(!showHistory);
    };

    // 日付フォーマット関数
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return dateString;
    };

    // 期限超過チェック
    const isOverdue = (dueDate) => {
        if (!dueDate) return false;
        const due = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return due < today;
    };

    // 資産番号クリックハンドラ
    const handleAssetClick = (rental) => {
        console.log('クリックされた機器:', rental);
        setSelectedDevice(rental);
        setShowDetailModal(true);
    };

    // モーダルアクションハンドラ
    const handleModalAction = async (action, device) => {
        try {
            if (action === 'rental') {
                // 貸出処理のAPI呼び出し
                const response = await fetch('/api/rental/rent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        assetNo: device.assetNo,
                        employeeNo: user.employeeNo,
                        rentalDate: new Date().toISOString().split('T')[0],
                        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    })
                });

                if (response.ok) {
                    alert('貸出処理が完了しました');
                    setShowDetailModal(false);
                    fetchRentalStatus();
                } else {
                    throw new Error('貸出処理に失敗しました');
                }
            } else if (action === 'return') {
                // 返却処理のAPI呼び出し
                const response = await fetch(`/api/rental/return/${device.rentalId}`, {
                    method: 'POST'
                });

                if (response.ok) {
                    alert('返却処理が完了しました');
                    setShowDetailModal(false);
                    fetchRentalStatus();
                } else {
                    throw new Error('返却処理に失敗しました');
                }
            }
        } catch (error) {
            console.error('処理エラー:', error);
            alert('処理に失敗しました: ' + error.message);
        }
    };

    return (
        <div className="rental-status-container">
            <div className="rental-status-header">
                <h2>貸出状況一覧</h2>
                <div className="header-controls">
                    <button
                        className="toggle-btn"
                        onClick={handleToggleView}
                    >
                        {showHistory ? '貸出中のみ表示' : '履歴を表示'}
                    </button>
                    <button className="back-btn" onClick={onBack}>
                        メニューに戻る
                    </button>
                </div>
            </div>

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
                    {rentalList.length === 0 ? (
                        <div className="no-data">
                            {showHistory ? '貸出履歴がありません' : '現在貸出中の機器はありません'}
                        </div>
                    ) : (
                        <table className="rental-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>資産番号</th>
                                    <th>メーカー</th>
                                    <th>OS</th>
                                    <th>保管場所</th>
                                    <th>使用者</th>
                                    <th>社員番号</th>
                                    <th>所属</th>
                                    <th>貸出日</th>
                                    <th>返却予定日</th>
                                    {showHistory && <th>返却日</th>}
                                    <th>状態</th>
                                    <th>備考</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rentalList.map((rental, index) => (
                                    <tr
                                        key={rental.rentalId}
                                        className={rental.isOverdue ? 'overdue-row' : ''}
                                    >
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
                                        <td className="employee-name">{rental.employeeName || '-'}</td>
                                        <td>{rental.employeeNo || '-'}</td>
                                        <td>{rental.department || '-'}</td>
                                        <td>{formatDate(rental.rentalDate)}</td>
                                        <td className={isOverdue(rental.dueDate) ? 'overdue-date' : ''}>
                                            {formatDate(rental.dueDate)}
                                        </td>
                                        {showHistory && (
                                            <td>{formatDate(rental.returnDate)}</td>
                                        )}
                                        <td>
                                            {showHistory ? (
                                                <span className={rental.status === '貸出中' ? 'status-rental' : 'status-returned'}>
                                                    {rental.status}
                                                </span>
                                            ) : (
                                                <span className={rental.isOverdue ? 'status-overdue' : 'status-rental'}>
                                                    {rental.isOverdue ? '期限超過' : '貸出中'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="remarks">{rental.remarks || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    <div className="table-footer">
                        <span className="record-count">
                            {showHistory ? '履歴' : '貸出中'}: {rentalList.length}件
                        </span>
                    </div>
                </div>
            )}

            {/* DeviceDetailModalコンポーネント */}
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