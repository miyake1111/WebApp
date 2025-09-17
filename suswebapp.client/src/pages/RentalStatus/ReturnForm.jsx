import React, { useState } from 'react';
import './ReturnForm.css';

const ReturnForm = ({ device, onSubmit, onClose }) => {
    const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = () => {
        onSubmit({
            assetNo: device.assetNo,
            returnDate: new Date(returnDate)
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="return-form-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>機器返却 - {device.assetNo}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="device-info">
                        <p><strong>メーカー:</strong> {device.maker}</p>
                        <p><strong>OS:</strong> {device.os}</p>
                        <p><strong>使用者:</strong> {device.employeeName} ({device.employeeNo})</p>
                        <p><strong>貸出日:</strong> {device.rentalDate}</p>
                        <p><strong>返却締切日:</strong> {device.dueDate}</p>
                    </div>

                    <div className="form-group">
                        <label>返却日</label>
                        <input
                            type="date"
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-submit" onClick={handleSubmit}>
                        返却
                    </button>
                    <button className="btn-cancel" onClick={onClose}>
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReturnForm;