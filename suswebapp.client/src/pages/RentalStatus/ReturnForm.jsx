import React, { useState } from 'react';
import './ReturnForm.css';

/**
 * 返却フォームコンポーネント
 * 貸出中の機器を返却する際のフォームを提供
 * 
 * @param {Object} device - 返却対象の機器情報
 * @param {Function} onSubmit - フォーム送信時の処理
 * @param {Function} onClose - モーダルを閉じる処理
 */
const ReturnForm = ({ device, onSubmit, onClose }) => {
    // 返却日の状態管理（デフォルトは今日の日付）
    const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);

    /**
     * フォーム送信処理
     * 返却データを親コンポーネントに送信
     */
    const handleSubmit = () => {
        // 親コンポーネントのonSubmit関数を呼び出し
        onSubmit({
            assetNo: device.assetNo,           // 資産番号
            returnDate: new Date(returnDate)   // 返却日（Date型に変換）
        });
    };

    return (
        // モーダルオーバーレイ - クリックで閉じる
        <div className="modal-overlay" onClick={onClose}>
            {/* モーダル本体 - クリックイベントの伝播を停止 */}
            <div className="return-form-modal" onClick={(e) => e.stopPropagation()}>
                {/* モーダルヘッダー */}
                <div className="modal-header">
                    <h3>機器返却 - {device.assetNo}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {/* モーダルボディ */}
                <div className="modal-body">
                    {/* デバイス情報表示エリア */}
                    <div className="device-info">
                        <p><strong>メーカー:</strong> {device.maker}</p>
                        <p><strong>OS:</strong> {device.os}</p>
                        <p><strong>使用者:</strong> {device.employeeName} ({device.employeeNo})</p>
                        <p><strong>貸出日:</strong> {device.rentalDate}</p>
                        <p><strong>返却締切日:</strong> {device.dueDate}</p>
                    </div>

                    {/* 返却日入力フィールド */}
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

                {/* モーダルフッター */}
                <div className="modal-footer">
                    {/* 返却ボタン */}
                    <button className="btn-submit" onClick={handleSubmit}>
                        返却
                    </button>
                    {/* キャンセルボタン */}
                    <button className="btn-cancel" onClick={onClose}>
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReturnForm;