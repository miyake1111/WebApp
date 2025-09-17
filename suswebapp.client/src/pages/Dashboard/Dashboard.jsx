// Dashboard.jsx の修正版

import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = ({ user }) => {
    const [rentalInfo, setRentalInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    // userがない場合のデフォルト値
    const employeeNo = user?.employeeNo || localStorage.getItem('employeeNo') || 'A1002';

    useEffect(() => {
        fetchRentalInfo();
    }, []);

    const fetchRentalInfo = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/rental/user/${employeeNo}`);
            const data = await response.json();

            if (response.ok && data.rental) {
                setRentalInfo(data.rental);
            } else {
                setRentalInfo(null);
            }
        } catch (error) {
            console.error('貸出情報の取得エラー:', error);
            setRentalInfo(null);
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async () => {
        if (!rentalInfo) return;

        if (!window.confirm('返却してよろしいですか？')) {
            return;
        }

        try {
            const response = await fetch(`/api/rental/return/${rentalInfo.rentalId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                alert('返却処理が完了しました');
                setRentalInfo(null);
                // 再度情報を取得
                fetchRentalInfo();
            } else {
                alert('返却処理に失敗しました');
            }
        } catch (error) {
            console.error('返却エラー:', error);
            alert('返却処理中にエラーが発生しました');
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-wrapper">
                <div className="rental-status-card">
                    {loading ? (
                        <p>読み込み中...</p>
                    ) : rentalInfo ? (
                        <>
                            <div className="status-header">
                                <span>貸出状態：</span>
                                <span className="status-badge rental">貸出中</span>
                            </div>
                            <div className="rental-details">
                                <p>貸出機器：{rentalInfo.assetNo}</p>
                                <p>貸出日：{rentalInfo.rentalDate}</p>
                                <p>返却締切日：{rentalInfo.dueDate}</p>
                            </div>
                            <button className="return-button" onClick={handleReturn}>
                                返却
                            </button>
                        </>
                    ) : (
                        <div className="status-header">
                            <span>貸出状態：</span>
                            <span className="status-badge available">なし</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;