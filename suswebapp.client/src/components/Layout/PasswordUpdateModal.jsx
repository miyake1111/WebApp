import React, { useState } from 'react';
import './PasswordUpdateModal.css';

/**
 * パスワード変更モーダルコンポーネント
 * ユーザーが新しいパスワードを設定するためのモーダルダイアログ
 * 
 * @param {boolean} isOpen - モーダルの表示/非表示状態
 * @param {Function} onClose - モーダルを閉じる時に呼ばれる関数
 * @param {string} employeeNo - パスワードを変更する対象の社員番号
 */
const PasswordUpdateModal = ({ isOpen, onClose, employeeNo }) => {
    // 新しいパスワードの入力値を管理
    const [newPassword, setNewPassword] = useState('');
    // 確認用パスワードの入力値を管理
    const [confirmPassword, setConfirmPassword] = useState('');
    // バリデーションエラーを管理するオブジェクト
    const [errors, setErrors] = useState({});
    // 送信処理中かどうかのフラグ
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * パスワードのバリデーション関数
     * パスワード要件をチェックしてエラーオブジェクトを返す
     * 
     * @param {string} value - 検証するパスワード文字列
     * @returns {Object} エラーメッセージを含むオブジェクト
     */
    const validatePassword = (value) => {
        const errors = {};

        // 長さチェック（8-16文字）
        if (value.length < 8) {
            errors.length = 'パスワードは8文字以上必要です';
        } else if (value.length > 16) {
            errors.length = 'パスワードは16文字以内にしてください';
        }

        // 文字種チェック - 各種文字が含まれているか正規表現でチェック
        const hasUpperCase = /[A-Z]/.test(value);  // 大文字
        const hasLowerCase = /[a-z]/.test(value);  // 小文字
        const hasNumber = /[0-9]/.test(value);     // 数字
        const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);  // 記号

        // いずれの文字種も含まれていない場合はエラー
        if (!hasUpperCase && !hasLowerCase && !hasNumber && !hasSymbol) {
            errors.chars = '英大文字・小文字・数字・記号のいずれかを含めてください';
        }

        return errors;
    };

    /**
     * フォーム送信処理
     * パスワードをバリデーションしてAPIに送信
     */
    const handleSubmit = async (e) => {
        e.preventDefault();  // フォームのデフォルト送信を防止

        // パスワードのバリデーション実行
        const passwordErrors = validatePassword(newPassword);
        if (Object.keys(passwordErrors).length > 0) {
            setErrors(passwordErrors);
            return;  // エラーがあれば処理を中断
        }

        // パスワード一致確認
        if (newPassword !== confirmPassword) {
            setErrors({ confirm: 'パスワードが一致しません' });
            return;
        }

        setIsSubmitting(true);  // 送信中フラグをON

        try {
            // バックエンドAPIにパスワード変更リクエストを送信
            const response = await fetch('/api/user/update-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeNo: employeeNo,
                    currentPassword: '',  // 使用しないが送る（管理者権限での変更を想定）
                    newPassword: newPassword
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert('パスワードを変更しました');
                handleClose();  // 成功したらモーダルを閉じる
            } else {
                alert('パスワード変更に失敗しました: ' + (result.message || ''));
            }
        } catch (error) {
            console.error('パスワード変更エラー:', error);
            alert('パスワード変更に失敗しました');
        } finally {
            setIsSubmitting(false);  // 送信中フラグをOFF
        }
    };

    /**
     * モーダルを閉じる処理
     * フォームの内容とエラーをリセットしてから閉じる
     */
    const handleClose = () => {
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
        onClose();  // 親コンポーネントから渡されたonClose関数を実行
    };

    // isOpenがfalseの場合は何も表示しない
    if (!isOpen) return null;

    return (
        // オーバーレイ部分 - クリックでモーダルを閉じる
        <div className="modal-overlay" onClick={handleClose}>
            {/* モーダル本体 - クリックしても閉じないようstopPropagation */}
            <div className="password-modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>パスワード変更</h2>
                <p className="modal-subtitle">
                    社員番号: {employeeNo}
                </p>

                <form onSubmit={handleSubmit}>
                    {/* 新しいパスワード入力フィールド */}
                    <div className="form-group">
                        <label>新しいパスワード *</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                                // リアルタイムバリデーション - 入力のたびにチェック
                                const validationErrors = validatePassword(e.target.value);
                                setErrors(prev => ({ ...prev, ...validationErrors }));
                            }}
                            placeholder="8-16文字"
                            required
                            maxLength="16"
                        />
                        {/* エラーメッセージ表示 */}
                        {errors.length && <span className="error-text">{errors.length}</span>}
                        {errors.chars && <span className="error-text">{errors.chars}</span>}
                    </div>

                    {/* 確認用パスワード入力フィールド */}
                    <div className="form-group">
                        <label>確認用パスワード *</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                // パスワード一致確認をリアルタイムで実行
                                if (e.target.value && e.target.value !== newPassword) {
                                    setErrors(prev => ({ ...prev, confirm: 'パスワードが一致しません' }));
                                } else {
                                    setErrors(prev => ({ ...prev, confirm: null }));
                                }
                            }}
                            placeholder="パスワードを再入力"
                            required
                        />
                        {errors.confirm && <span className="error-text">{errors.confirm}</span>}
                    </div>

                    {/* パスワード要件の視覚的表示 */}
                    <div className="password-requirements">
                        <p className="requirement-title">パスワード要件：</p>
                        <ul>
                            {/* 文字数要件 - 満たしていれば緑色で表示 */}
                            <li className={newPassword.length >= 8 && newPassword.length <= 16 ? 'valid' : ''}>
                                8文字以上16文字以内
                            </li>
                            {/* 文字種要件 - 満たしていれば緑色で表示 */}
                            <li className={/[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? 'valid' : ''}>
                                英大文字・小文字・数字・記号のいずれかを含む
                            </li>
                        </ul>
                    </div>

                    {/* フッターボタン */}
                    <div className="modal-footer">
                        <button
                            type="submit"
                            className="save-btn"
                            disabled={isSubmitting}  // 送信中は無効化
                        >
                            変更
                        </button>
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={handleClose}
                        >
                            キャンセル
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordUpdateModal;