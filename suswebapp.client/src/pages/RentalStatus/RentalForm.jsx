import React, { useState } from 'react';
import './RentalForm.css';

/**
 * 貸出フォームコンポーネント
 * 機器の貸出処理用フォームを提供
 * 
 * @param {Object} device - 貸出対象の機器情報
 * @param {Function} onSubmit - フォーム送信時の処理
 * @param {Function} onClose - モーダルを閉じる処理
 */
const RentalForm = ({ device, onSubmit, onClose }) => {
    // 貸出日の状態管理（デフォルトは今日の日付）
    const [rentalDate, setRentalDate] = useState(new Date().toISOString().split('T')[0]);
    // 返却締切日の状態管理
    const [dueDate, setDueDate] = useState('');
    // 備考の状態管理
    const [remarks, setRemarks] = useState('');

    /**
     * フォーム送信処理
     * バリデーション後、親コンポーネントに送信
     */
    const handleSubmit = () => {
        // 必須項目のバリデーション
        if (!dueDate) {
            alert('返却締切日を入力してください');
            return;
        }

        // 親コンポーネントのonSubmit関数を呼び出し
        onSubmit({
            assetNo: device.assetNo,                                    // 資産番号
            employeeNo: localStorage.getItem('employeeNo') || 'A1002',  // 社員番号（LocalStorageから取得）
            rentalDate: new Date(rentalDate),                          // 貸出日（Date型に変換）
            dueDate: new Date(dueDate),                                // 返却締切日（Date型に変換）
            remarks: remarks                                           // 備考
        });
    };

    return (
        // モーダルオーバーレイ - クリックで閉じる
        <div className="modal-overlay" onClick={onClose}>
            {/* モーダル本体 - クリックイベントの伝播を停止 */}
            <div className="rental-form-modal" onClick={(e) => e.stopPropagation()}>
                {/* モーダルヘッダー */}
                <div className="modal-header">
                    <h3>機器貸出 - {device.assetNo}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {/* モーダルボディ */}
                <div className="modal-body">
                    {/* デバイス情報表示 */}
                    <div className="device-info">
                        <p><strong>メーカー:</strong> {device.maker}</p>
                        <p><strong>OS:</strong> {device.os}</p>
                        <p><strong>保管場所:</strong> {device.storageLocation}</p>
                    </div>

                    {/* 貸出日入力 */}
                    <div className="form-group">
                        <label>貸出日</label>
                        <input
                            type="date"
                            value={rentalDate}
                            onChange={(e) => setRentalDate(e.target.value)}
                            required
                        />
                    </div>

                    {/* 返却締切日入力 */}
                    <div className="form-group">
                        <label>返却締切日</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            min={rentalDate}  // 貸出日以降のみ選択可能
                            required
                        />
                    </div>

                    {/* 備考入力 */}
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

                {/* モーダルフッター */}
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