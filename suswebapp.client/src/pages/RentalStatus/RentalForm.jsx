import React, { useState } from 'react';
import './RentalForm.css';

const RentalForm = ({ device, onSubmit, onClose }) => {
    const [rentalDate, setRentalDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [remarks, setRemarks] = useState('');

    const handleSubmit = () => {
        if (!dueDate) {
            alert('返却締切日を入力してください');
            return;
        }

        onSubmit({
            assetNo: device.assetNo,
            employeeNo: localStorage.getItem('employeeNo') || 'A1002',
            rentalDate: new Date(rentalDate),
            dueDate: new Date(dueDate),
            remarks: remarks
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="rental-form-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>機器貸出 - {device.assetNo}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="device-info">
                        <p><strong>メーカー:</strong> {device.maker}</p>
                        <p><strong>OS:</strong> {device.os}</p>
                        <p><strong>保管場所:</strong> {device.storageLocation}</p>
                    </div>

                    <div className="form-group">
                        <label>貸出日</label>
                        <input
                            type="date"
                            value={rentalDate}
                            onChange={(e) => setRentalDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>返却締切日</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            min={rentalDate}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>備考</label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            rows="3"
                            placeholder="必要に応じて入力してください"
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-submit" onClick={handleSubmit}>
                        貸出
                    </button>
                    <button className="btn-cancel" onClick={onClose}>
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RentalForm;