import React from 'react';
import './DeleteConfirmModal.css';

/**
 * 削除確認モーダルコンポーネント
 * デバイス削除前に確認ダイアログを表示し、誤削除を防ぐ
 * 
 * @param {boolean} isOpen - モーダルの表示/非表示状態
 * @param {Function} onClose - モーダルを閉じる関数（キャンセル時）
 * @param {Function} onConfirm - 削除を確定する関数
 * @param {string} deviceName - 削除対象の資産番号
 */
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, deviceName }) => {
    // モーダルが閉じている場合は何も表示しない
    if (!isOpen) return null;

    return (
        // モーダルオーバーレイ（背景の暗幕）
        <div className="modal-overlay">
            {/* 削除確認ダイアログ本体 */}
            <div className="delete-modal-content">
                {/* 確認メッセージ */}
                <h2>本当に削除しますか？</h2>

                {/* 削除対象の資産番号を表示 */}
                <p>資産番号: {deviceName}</p>

                {/* ボタングループ */}
                <div className="delete-modal-buttons">
                    {/* はいボタン - 削除を実行 */}
                    <button className="confirm-btn" onClick={onConfirm}>
                        はい
                    </button>

                    {/* いいえボタン - 削除をキャンセル */}
                    <button className="cancel-btn" onClick={onClose}>
                        いいえ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;