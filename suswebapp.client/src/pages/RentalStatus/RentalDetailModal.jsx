import React, { useState } from 'react';
import './RentalDetailModal.css';

/**
 * 貸出詳細モーダルコンポーネント
 * 機器の詳細情報表示、貸出処理、返却処理を行う
 * 
 * @param {Object} device - 表示する機器情報
 * @param {Function} onClose - モーダルを閉じる関数
 * @param {Function} onRent - 貸出処理後のコールバック
 * @param {Function} onReturn - 返却処理後のコールバック
 * @param {Object} currentUser - 現在のログインユーザー情報
 */
const RentalDetailModal = ({ device, onClose, onRent, onReturn, currentUser }) => {
    // 貸出日の状態管理（デフォルトは今日）
    const [rentalDate, setRentalDate] = useState(new Date().toISOString().split('T')[0]);
    // 返却締切日の状態管理
    const [dueDate, setDueDate] = useState('');

    // 現在のユーザーの社員番号を取得（複数のソースから）
    const employeeNo = currentUser?.employeeNo || localStorage.getItem('employeeNo') || 'A1002';

    /**
     * 貸出処理を実行
     * APIを呼び出して機器を貸出状態にする
     */
    const handleRent = async () => {
        // バリデーション - 必須項目チェック
        if (!rentalDate || !dueDate) {
            alert('貸出日と返却締切日を入力してください');
            return;
        }

        try {
            // 現在のユーザーの社員番号を取得
            const currentEmployeeNo = localStorage.getItem('employeeNo') || 'A1002';

            // APIリクエスト用データの準備
            const requestData = {
                assetNo: device.assetNo,        // 資産番号
                employeeNo: currentEmployeeNo,  // 借りる人の社員番号
                rentalDate: rentalDate,         // 貸出日
                dueDate: dueDate                // 返却締切日
            };

            console.log('送信データ:', requestData);  // デバッグ用

            // 貸出APIを呼び出し
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
                // 親コンポーネントの更新処理を実行
                if (onRent) {
                    onRent();
                }
                onClose();  // モーダルを閉じる
            } else {
                alert(result.message || '貸出処理に失敗しました');
            }
        } catch (error) {
            console.error('貸出エラー:', error);
            alert('貸出処理中にエラーが発生しました');
        }
    };

    /**
     * 返却処理を実行
     * 現在借りている機器を返却する
     */
    const handleReturn = async () => {
        // 確認ダイアログ
        if (!window.confirm('返却してよろしいですか？')) {
            return;
        }

        try {
            // Step1: 現在のユーザーの貸出情報を取得してrental_idを特定
            const rentalResponse = await fetch(`/api/rental/user/${device.employeeNo}/all`);
            const rentalData = await rentalResponse.json();

            // 貸出情報の存在チェック
            if (!rentalData.success || !rentalData.rentals || rentalData.rentals.length === 0) {
                alert('貸出情報が見つかりません');
                return;
            }

            // Step2: 該当する資産番号の貸出情報を検索
            const targetRental = rentalData.rentals.find(r => r.assetNo === device.assetNo);

            if (!targetRental) {
                alert('該当する貸出情報が見つかりません');
                return;
            }

            // Step3: rental_idを使って返却処理を実行
            const returnResponse = await fetch(`/api/rental/return/${targetRental.rentalId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (returnResponse.ok) {
                alert('返却処理が完了しました');
                // 親コンポーネントの更新処理を実行
                if (onReturn) {
                    onReturn();
                }
                onClose();  // モーダルを閉じる
            } else {
                alert('返却処理に失敗しました');
            }
        } catch (error) {
            console.error('返却エラー:', error);
            alert('返却処理中にエラーが発生しました');
        }
    };

    // 現在のユーザーが借りているかどうかのフラグ
    const isCurrentUserRenting = device.employeeNo === employeeNo;
    // 貸出可能かどうかのフラグ（利用可能かつ故障していない）
    const canRent = device.availableFlag && !device.malfunction;

    return (
        // モーダルオーバーレイ - クリックで閉じる
        <div className="modal-overlay" onClick={onClose}>
            {/* モーダル本体 - クリックイベントの伝播を停止 */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>機器詳細情報</h2>

                {/* 故障警告表示（故障中の場合のみ） */}
                {device.malfunction && (
                    <div className="malfunction-warning">
                        ⚠️ この機器は故障中です
                    </div>
                )}

                {/* フォームコンテナ */}
                <div className="form-container">
                    {/* 左側カラム - 機器基本情報 */}
                    <div className="form-left">
                        {/* 資産番号 */}
                        <div className="form-group">
                            <label>資産番号</label>
                            <input
                                type="text"
                                value={device.assetNo || '-'}
                                readOnly
                                disabled
                            />
                        </div>

                        {/* メーカー */}
                        <div className="form-group">
                            <label>メーカー</label>
                            <input
                                type="text"
                                value={device.maker || '-'}
                                readOnly
                                disabled
                            />
                        </div>

                        {/* OS */}
                        <div className="form-group">
                            <label>OS</label>
                            <input
                                type="text"
                                value={device.os || '-'}
                                readOnly
                                disabled
                            />
                        </div>

                        {/* メモリ */}
                        <div className="form-group">
                            <label>メモリ (GB)</label>
                            <input
                                type="text"
                                value={device.memory ? `${device.memory}` : '-'}
                                readOnly
                                disabled
                            />
                        </div>

                        {/* ストレージ容量 */}
                        <div className="form-group">
                            <label>容量 (GB)</label>
                            <input
                                type="text"
                                value={device.storage ? `${device.storage}` : '-'}
                                readOnly
                                disabled
                            />
                        </div>

                        {/* グラフィックボード */}
                        <div className="form-group">
                            <label>グラフィックボード</label>
                            <input
                                type="text"
                                value={device.graphicsCard || '-'}
                                title={device.graphicsCard}  // ツールチップ
                                readOnly
                                disabled
                            />
                        </div>

                        {/* 故障チェックボックス */}
                        <div className="form-group">
                            <label>故障</label>
                            <input
                                type="checkbox"
                                checked={device.malfunction || false}
                                disabled
                            />
                        </div>
                    </div>

                    {/* 右側カラム - 貸出関連情報 */}
                    <div className="form-right">
                        {/* 保管場所 */}
                        <div className="form-group">
                            <label>保管場所</label>
                            <input
                                type="text"
                                value={device.storageLocation || '-'}
                                readOnly
                                disabled
                            />
                        </div>

                        {/* 貸出中の場合、使用者情報を表示 */}
                        {!device.availableFlag && (
                            <>
                                {/* 使用者の社員番号 */}
                                <div className="form-group">
                                    <label>使用者 - 社員番号</label>
                                    <input
                                        type="text"
                                        value={device.employeeNo || '-'}
                                        readOnly
                                        disabled
                                        className="user-info"  // 青色背景で強調
                                    />
                                </div>

                                {/* 使用者の氏名 */}
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

                                {/* 使用者の部署 */}
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

                        {/* 貸出日と返却締切日 */}
                        <div className="form-group-row">
                            {/* 貸出日 */}
                            <div className="form-group">
                                <label>貸出日</label>
                                {canRent ? (
                                    // 貸出可能な場合は入力可能
                                    <input
                                        type="date"
                                        value={rentalDate}
                                        onChange={(e) => setRentalDate(e.target.value)}
                                    />
                                ) : (
                                    // 貸出中の場合は表示のみ
                                    <input
                                        type="text"
                                        value={device.rentalDate || '-'}
                                        readOnly
                                        disabled
                                    />
                                )}
                            </div>

                            {/* 返却締切日 */}
                            <div className="form-group">
                                <label>
                                    返却締切日
                                    {canRent && ' *'}  {/* 必須マーク */}
                                    {device.isOverdue && ' (期限超過)'}  {/* 期限超過警告 */}
                                </label>
                                {canRent ? (
                                    // 貸出可能な場合は入力可能
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        min={rentalDate}  // 貸出日以降のみ選択可能
                                        required
                                    />
                                ) : (
                                    // 貸出中の場合は表示のみ
                                    <input
                                        type="text"
                                        value={device.dueDate || '-'}
                                        readOnly
                                        disabled
                                        className={device.isOverdue ? 'error-text' : ''}  // 期限超過は赤表示
                                    />
                                )}
                            </div>
                        </div>

                        {/* 備考（存在する場合のみ表示） */}
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

                {/* ボタングループ */}
                <div className="modal-buttons">
                    {/* 状況に応じてボタンを表示 */}
                    {canRent ? (
                        // 貸出可能な場合は貸出ボタン
                        <button className="save-btn" onClick={handleRent}>
                            貸出
                        </button>
                    ) : isCurrentUserRenting ? (
                        // 自分が借りている場合は返却ボタン
                        <button className="return-btn" onClick={handleReturn}>
                            返却
                        </button>
                    ) : null}  {/* それ以外は何も表示しない */}

                    {/* キャンセルボタンは常に表示 */}
                    <button className="cancel-btn" onClick={onClose}>
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RentalDetailModal;