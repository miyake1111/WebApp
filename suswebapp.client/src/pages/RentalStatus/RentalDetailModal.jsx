/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import './RentalDetailModal.css';

const RentalDetailModal = ({ isOpen, onClose, device, currentUser, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [rentalData, setRentalData] = useState({
        employeeNo: currentUser?.employeeNo || '',
        rentalDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        remarks: ''
    });

    if (!isOpen || !device) return null;

    const isRented = !device.availableFlag;
    const isCurrentUserRental = device.employeeNo === currentUser?.employeeNo;

    const handleRental = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/rental/rent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assetNo: device.assetNo,
                    employeeNo: rentalData.employeeNo,
                    rentalDate: rentalData.rentalDate,
                    dueDate: rentalData.dueDate,
                    remarks: rentalData.remarks
                })
            });

            const data = await response.json();
            if (data.success) {
                alert('貸出登録が完了しました');
                onSuccess();
            } else {
                alert(data.message || '貸出登録に失敗しました');
            }
        } catch (error) {
            alert('貸出処理中にエラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/rental/return/${device.rentalId}`, {
                method: 'POST'
            });

            const data = await response.json();
            if (data.success) {
                alert('返却処理が完了しました');
                onSuccess();
            } else {
                alert(data.message || '返却処理に失敗しました');
            }
        } catch (error) {
            alert('返却処理中にエラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>機器詳細情報</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <div className="device-info-section">
                        <h3>機器情報</h3>
                        <div className="info-grid">
                            <div className="info-row">
                                <span className="label">資産番号:</span>
                                <span className="value">{device.assetNo}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">メーカー:</span>
                                <span className="value">{device.maker || '-'}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">OS:</span>
                                <span className="value">{device.os || '-'}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">保管場所:</span>
                                <span className="value">{device.location || '-'}</span>
                            </div>
                            {device.brokenFlag && (
                                <div className="info-row">
                                    <span className="label">状態:</span>
                                    <span className="value text-danger">故障中</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {isRented ? (
                        <div className="rental-info-section">
                            <h3>貸出情報</h3>
                            <div className="info-grid">
                                <div className="info-row">
                                    <span className="label">使用者:</span>
                                    <span className="value">{device.employeeName || '-'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">社員番号:</span>
                                    <span className="value">{device.employeeNo}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">部署:</span>
                                    <span className="value">{device.department || '-'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">貸出日:</span>
                                    <span className="value">{device.rentalDate}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">返却予定日:</span>
                                    <span className={`value ${device.isOverdue ? 'text-danger' : ''}`}>
                                        {device.dueDate}
                                        {device.isOverdue && ' (期限超過)'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        !device.brokenFlag && (
                            <div className="rental-form-section">
                                <h3>貸出登録</h3>
                                <div className="form-group">
                                    <label>貸出日</label>
                                    <input
                                        type="date"
                                        value={rentalData.rentalDate}
                                        onChange={(e) => setRentalData({ ...rentalData, rentalDate: e.target.value })}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>返却予定日</label>
                                    <input
                                        type="date"
                                        value={rentalData.dueDate}
                                        onChange={(e) => setRentalData({ ...rentalData, dueDate: e.target.value })}
                                        min={rentalData.rentalDate}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>備考</label>
                                    <textarea
                                        value={rentalData.remarks}
                                        onChange={(e) => setRentalData({ ...rentalData, remarks: e.target.value })}
                                        rows="2"
                                        className="form-textarea"
                                    />
                                </div>
                            </div>
                        )
                    )}
                </div>

                <div className="modal-footer">
                    {!isRented && !device.brokenFlag && (
                        <button
                            className="btn-rental"
                            onClick={handleRental}
                            disabled={loading}
                        >
                            {loading ? '処理中...' : '貸出'}
                        </button>
                    )}
                    {isRented && isCurrentUserRental && (
                        <button
                            className="btn-return"
                            onClick={handleReturn}
                            disabled={loading}
                        >
                            {loading ? '処理中...' : '返却'}
                        </button>
                    )}
                    <button className="btn-cancel" onClick={onClose}>
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RentalDetailModal;