import React, { useState } from 'react';
import './RentalDetailModal.css';

const RentalDetailModal = ({ device, onClose, onRent, onReturn, currentUser }) => {
    const [rentalDate, setRentalDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');

    const employeeNo = currentUser || localStorage.getItem('employeeNo') || 'A1002';

    const handleRent = () => {
        if (!dueDate) {
            alert('返却締切日を入力してください');
            return;
        }

        const rentalData = {
            assetNo: device.assetNo,
            employeeNo: employeeNo,
            rentalDate: rentalDate,
            dueDate: dueDate
        };

        console.log('送信する貸出データ:', rentalData);
        onRent(rentalData);
        onClose();
    };

    const handleReturn = () => {
        if (!window.confirm('返却してよろしいですか？')) {
            return;
        }

        const returnData = {
            assetNo: device.assetNo,
            employeeNo: device.employeeNo,
            returnDate: new Date().toISOString().split('T')[0]
        };

        onReturn(returnData);
        onClose();
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