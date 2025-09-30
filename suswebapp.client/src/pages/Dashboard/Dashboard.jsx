import React, { useState, useEffect } from 'react';
import './Dashboard.css';

/**
 * ダッシュボードコンポーネント
 * ユーザーの貸出状況を表示し、返却処理を行うメイン画面
 * 
 * @param {Object} user - ログインユーザー情報
 */
const Dashboard = ({ user }) => {
    // 貸出情報の配列を管理（複数の機器を借りている場合に対応）
    const [rentals, setRentals] = useState([]);
    // データ読み込み中フラグ
    const [loading, setLoading] = useState(true);

    // 社員番号を取得（複数のソースから取得を試みる）
    const employeeNo = user?.employeeNo || localStorage.getItem('employeeNo') || 'A1002';
    // 社員名を取得（複数のプロパティ名に対応）
    const employeeName = user?.name || user?.employeeName || localStorage.getItem('userName') || 'ユーザー名';

    /**
     * コンポーネントマウント時に貸出情報を取得
     */
    useEffect(() => {
        fetchRentalInfo();
    }, []);  // 空配列で初回のみ実行

    /**
     * 貸出情報をAPIから取得する関数
     * ユーザーが借りている全ての機器情報を取得
     */
    const fetchRentalInfo = async () => {
        try {
            setLoading(true);
            // バックエンドAPIを呼び出し（社員番号で検索）
            const response = await fetch(`/api/rental/user/${employeeNo}/all`);
            const data = await response.json();

            if (response.ok && data.rentals) {
                setRentals(data.rentals);  // 貸出情報を配列でセット
            } else {
                setRentals([]);  // エラー時は空配列
            }
        } catch (error) {
            console.error('貸出情報の取得エラー:', error);
            setRentals([]);
        } finally {
            setLoading(false);  // ローディング終了
        }
    };

    /**
     * 返却期限が超過しているかチェックする関数
     * 
     * @param {string} dueDate - 返却期限日（yyyy/MM/dd形式）
     * @returns {boolean} 期限超過の場合true
     */
    const isOverdue = (dueDate) => {
        // 日付が無効な場合はfalse
        if (!dueDate || dueDate === '-') return false;

        // 日付形式を変換（yyyy/MM/dd → yyyy-MM-dd）
        const due = new Date(dueDate.replace(/\//g, '-'));
        const today = new Date();
        // 時間部分をリセットして日付のみで比較
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);

        return due < today;  // 期限日が今日より前なら超過
    };

    /**
     * 返却処理を実行する関数
     * 
     * @param {number} rentalId - 貸出ID
     * @param {string} assetNo - 資産番号
     */
    const handleReturn = async (rentalId, assetNo) => {
        // 確認ダイアログを表示
        if (!window.confirm(`${assetNo}を返却してよろしいですか？`)) {
            return;
        }

        try {
            // 返却APIを呼び出し
            const response = await fetch(`/api/rental/return/${rentalId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                alert('返却処理が完了しました');
                fetchRentalInfo();  // 返却後、最新情報を再取得
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
                    // ローディング中の表示
                    <div className="rental-status-card">
                        <div className="employee-name">{employeeName}</div>
                        <p>読み込み中...</p>
                    </div>
                ) : rentals.length > 0 ? (
                    // 貸出機器がある場合 - グリッドレイアウトで表示
                    <div className="rentals-grid">
                        {rentals.map((rental) => (
                            // 各貸出機器のカード
                            <div key={rental.rentalId} className="rental-status-card">
                                {/* 社員名 */}
                                <div className="employee-name">{employeeName}</div>

                                {/* ステータス表示 */}
                                <div className="status-header">
                                    <span>貸出状態：</span>
                                    <span className="status-badge rental">貸出中</span>
                                </div>

                                {/* 貸出詳細情報 */}
                                <div className="rental-details">
                                    <p>貸出機器：{rental.assetNo}</p>
                                    <p>貸出日：{rental.rentalDate}</p>
                                    {/* 期限超過の場合は赤文字で表示 */}
                                    <p className={isOverdue(rental.dueDate) ? 'overdue-text' : ''}>
                                        返却締切日：{rental.dueDate}
                                        {isOverdue(rental.dueDate) && ' (期限超過)'}
                                    </p>
                                </div>

                                {/* 返却ボタン */}
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
                    // 貸出機器がない場合の表示
                    <div className="rental-status-card">
                        <div className="employee-name">{employeeName}</div>
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