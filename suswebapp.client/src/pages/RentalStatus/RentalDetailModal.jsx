import React, { useState } from 'react';
import './RentalDetailModal.css';

const RentalDetailModal = ({ device, onClose, onRent, onReturn, currentUser }) => {
    const [rentalDate, setRentalDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');

    const employeeNo = currentUser?.employeeNo || localStorage.getItem('employeeNo') || 'A1002';

    const handleRent = async () => {
        if (!rentalDate || !dueDate) {
            alert('貸出日と返却締切日を入力してください');
            return;
        }

        try {
            const currentEmployeeNo = localStorage.getItem('employeeNo') || 'A1002';

            const requestData = {
                assetNo: device.assetNo,
                employeeNo: currentEmployeeNo,
                rentalDate: rentalDate,
                dueDate: dueDate
            };

            console.log('送信データ:', requestData);

            const response = await fetch('/api/rental/rent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (response.ok) {
                alert('貸出処理が完了しました');
                if (onRent) {
                    onRent();
                }
                onClose();
            } else {
                alert(result.message || '貸出処理に失敗しました');
            }
        } catch (error) {
            console.error('貸出エラー:', error);
            alert('貸出処理中にエラーが発生しました');
        }
    };

    const handleReturn = async () => {
        if (!window.confirm('返却してよろしいですか？')) {
            return;
        }

        try {
            // まず現在のユーザーの貸出情報を取得してrental_idを取得
            const rentalResponse = await fetch(`/api/rental/user/${device.employeeNo}/all`);
            const rentalData = await rentalResponse.json();

            if (!rentalData.success || !rentalData.rentals || rentalData.rentals.length === 0) {
                alert('貸出情報が見つかりません');
                return;
            }

            // 該当する資産番号の貸出情報を探す
            const targetRental = rentalData.rentals.find(r => r.assetNo === device.assetNo);

            if (!targetRental) {
                alert('該当する貸出情報が見つかりません');
                return;
            }

            // rental_idを使って返却処理
            const returnResponse = await fetch(`/api/rental/return/${targetRental.rentalId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (returnResponse.ok) {
                alert('返却処理が完了しました');
                if (onReturn) {
                    onReturn();
                }
                onClose();
            } else {
                alert('返却処理に失敗しました');
            }
        } catch (error) {
            console.error('返却エラー:', error);
            alert('返却処理中にエラーが発生しました');
        }
    };

    const isCurrentUserRenting = device.employeeNo === employeeNo;
    const canRent = device.availableFlag && !device.malfunction;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>機器詳細情報</h2>

                {device.malfunction && (
                    <div className="malfunction-warning">
                        ⚠️ この機器は故障中です
                    </div>
                )}

                <div className="form-container">
                    <div className="form-left">
                        <div className="form-group">
                            <label>資産番号</label>
                            <input
                                type="text"
                                value={device.assetNo || '-'}
                                readOnly
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label>メーカー</label>
                            <input
                                type="text"
                                value={device.maker || '-'}
                                readOnly
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label>OS</label>
                            <input
                                type="text"
                                value={device.os || '-'}
                                readOnly
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label>メモリ (GB)</label>
                            <input
                                type="text"
                                value={device.memory ? `${device.memory}` : '-'}
                                readOnly
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label>容量 (GB)</label>
                            <input
                                type="text"
                                value={device.storage ? `${device.storage}` : '-'}
                                readOnly
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label>グラフィックボード</label>
                            <input
                                type="text"
                                value={device.graphicsCard || '-'}
                                title={device.graphicsCard}
                                readOnly
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label>故障</label>
                            <input
                                type="checkbox"
                                checked={device.malfunction || false}
                                disabled
                            />
                        </div>
                    </div>

                    <div className="form-right">
                        <div className="form-group">
                            <label>保管場所</label>
                            <input
                                type="text"
                                value={device.storageLocation || '-'}
                                readOnly
                                disabled
                            />
                        </div>

                        {!device.availableFlag && (
                            <>
                                <div className="form-group">
                                    <label>使用者 - 社員番号</label>
                                    <input
                                        type="text"
                                        value={device.employeeNo || '-'}
                                        readOnly
                                        disabled
                                        className="user-info"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>使用者 - 氏名</label>
                                    <input
                                        type="text"
                                        value={device.employeeName || '-'}
                                        readOnly
                                        disabled
                                        className="user-info"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>使用者 - 部署</label>
                                    <input
                                        type="text"
                                        value={device.department || '-'}
                                        readOnly
                                        disabled
                                        className="user-info"
                                    />
                                </div>
                            </>
                        )}

                        <div className="form-group-row">
                            <div className="form-group">
                                <label>貸出日</label>
                                {canRent ? (
                                    <input
                                        type="date"
                                        value={rentalDate}
                                        onChange={(e) => setRentalDate(e.target.value)}
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={device.rentalDate || '-'}
                                        readOnly
                                        disabled
                                    />
                                )}
                            </div>

                            <div className="form-group">
                                <label>
                                    返却締切日
                                    {canRent && ' *'}
                                    {device.isOverdue && ' (期限超過)'}
                                </label>
                                {canRent ? (
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        min={rentalDate}
                                        required
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={device.dueDate || '-'}
                                        readOnly
                                        disabled
                                        className={device.isOverdue ? 'error-text' : ''}
                                    />
                                )}
                            </div>
                        </div>

                        {device.deviceRemarks && (
                            <div className="form-group">
                                <label>備考</label>
                                <textarea
                                    value={device.deviceRemarks}
                                    readOnly
                                    disabled
                                    rows="4"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-buttons">
                    {canRent ? (
                        <button className="save-btn" onClick={handleRent}>
                            貸出
                        </button>
                    ) : isCurrentUserRenting ? (
                        <button className="return-btn" onClick={handleReturn}>
                            返却
                        </button>
                    ) : null}
                    <button className="cancel-btn" onClick={onClose}>
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RentalDetailModal;