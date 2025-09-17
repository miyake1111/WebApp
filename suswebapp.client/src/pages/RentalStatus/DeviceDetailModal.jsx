/*
import React, { useState } from 'react';
import './DeviceDetailModal.css';

const DeviceDetailModal = ({ device, onClose, onAction, currentUser }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    if (!device) return null;

    const isRented = device.employeeNo && device.employeeNo !== '';
    const isCurrentUserRental = device.employeeNo === currentUser?.employeeNo;

    const handleRental = async () => {
        setIsProcessing(true);
        try {
            await onAction('rental', device);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReturn = async () => {
        setIsProcessing(true);
        try {
            await onAction('return', device);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>機器詳細情報</h2>
                    <button className="close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    <div className="device-info">
                        <div className="info-row">
                            <span className="label">資産番号：</span>
                            <span className="value">{device.assetNo}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">メーカー：</span>
                            <span className="value">{device.maker || '-'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">OS：</span>
                            <span className="value">{device.os || '-'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">保管場所：</span>
                            <span className="value">{device.location || '-'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">備考：</span>
                            <span className="value">{device.remarks || '-'}</span>
                        </div>
                    </div>

                    {isRented && (
                        <div className="rental-info">
                            <h3>貸出情報</h3>
                            <div className="info-row">
                                <span className="label">使用者：</span>
                                <span className="value">{device.employeeName || '-'}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">社員番号：</span>
                                <span className="value">{device.employeeNo}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">貸出日：</span>
                                <span className="value">{device.rentalDate || '-'}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">返却予定日：</span>
                                <span className="value">{device.dueDate || '-'}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {!isRented && (
                        <button
                            className="btn-rental"
                            onClick={handleRental}
                            disabled={isProcessing}
                        >
                            {isProcessing ? '処理中...' : '貸出'}
                        </button>
                    )}
                    {isRented && isCurrentUserRental && (
                        <button
                            className="btn-return"
                            onClick={handleReturn}
                            disabled={isProcessing}
                        >
                            {isProcessing ? '処理中...' : '返却'}
                        </button>
                    )}
                    <button
                        className="btn-cancel"
                        onClick={onClose}
                        disabled={isProcessing}
                    >
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeviceDetailModal;
*/