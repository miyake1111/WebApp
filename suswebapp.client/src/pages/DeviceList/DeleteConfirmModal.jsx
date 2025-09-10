import React from 'react';
import './DeleteConfirmModal.css';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, deviceName }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="delete-modal-content">
                <h2>本当に削除しますか？</h2>
                <p>資産番号: {deviceName}</p>
                <div className="delete-modal-buttons">
                    <button className="confirm-btn" onClick={onConfirm}>
                        はい
                    </button>
                    <button className="cancel-btn" onClick={onClose}>
                        いいえ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;