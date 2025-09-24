import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = ({ user }) => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);

    const employeeNo = user?.employeeNo || localStorage.getItem('employeeNo') || 'A1002';

    useEffect(() => {
        fetchRentalInfo();
    }, []);

    const fetchRentalInfo = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/rental/user/${employeeNo}/all`);
            const data = await response.json();

            if (response.ok && data.rentals) {
                setRentals(data.rentals);
            } else {
                setRentals([]);
            }
        } catch (error) {
            console.error('貸出情報の取得エラー:', error);
            setRentals([]);
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async (rentalId, assetNo) => {
        if (!window.confirm(`${assetNo}を返却してよろしいですか？`)) {
            return;
        }

        try {
            const response = await fetch(`/api/rental/return/${rentalId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                alert('返却処理が完了しました');
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
                {loading ? (
                    <div className="rental-status-card">
                        <p>読み込み中...</p>
                    </div>
                ) : rentals.length > 0 ? (
                    <div className="rentals-grid">
                        {rentals.map((rental) => (
                            <div key={rental.rentalId} className="rental-status-card">
                                <div className="status-header">
                                    <span>貸出状態：</span>
                                    <span className="status-badge rental">貸出中</span>
                                </div>
                                <div className="rental-details">
                                    <p>貸出機器：{rental.assetNo}</p>
                                    <p>貸出日：{rental.rentalDate}</p>
                                    <p>返却締切日：{rental.dueDate}</p>
                                </div>
                                <button
                                    className="return-button"
                                    onClick={() => handleReturn(rental.rentalId, rental.assetNo)}
                                >
                                    返却
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rental-status-card">
                        <div className="status-header">
                            <span>貸出状態：</span>
                            <span className="status-badge available">なし</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;