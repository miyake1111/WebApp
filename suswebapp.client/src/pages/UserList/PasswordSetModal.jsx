import React, { useState } from 'react';
import './PasswordSetModal.css';

/**
 * パスワード設定モーダルコンポーネント
 * 新規ユーザー登録時にパスワードを設定する
 * 
 * @param {boolean} isOpen - モーダルの表示/非表示状態
 * @param {Function} onClose - モーダルを閉じる関数
 * @param {string} employeeNo - 対象社員番号
 * @param {string} employeeName - 対象社員名
 * @param {Function} onPasswordSet - パスワード設定完了時のコールバック
 */
const PasswordSetModal = ({ isOpen, onClose, employeeNo, employeeName, onPasswordSet }) => {
    // === ステート管理 ===
    const [password, setPassword] = useState('');           // パスワード
    const [confirmPassword, setConfirmPassword] = useState('');  // 確認用パスワード
    const [errors, setErrors] = useState({});              // エラーメッセージ
    const [isSubmitting, setIsSubmitting] = useState(false);     // 送信中フラグ

    /**
     * パスワードのバリデーション
     * 長さと文字種をチェック
     * 
     * @param {string} value - 検証するパスワード
     * @returns {Object} エラーオブジェクト
     */
    const validatePassword = (value) => {
        const errors = {};

        // 長さチェック（8-16文字）
        if (value.length < 8) {
            errors.length = 'パスワードは8文字以上必要です';
        } else if (value.length > 16) {
            errors.length = 'パスワードは16文字以内にしてください';
        }

        // 文字種チェック（英大文字・小文字・数字・記号のいずれか）
        const hasUpperCase = /[A-Z]/.test(value);       // 大文字
        const hasLowerCase = /[a-z]/.test(value);       // 小文字
        const hasNumber = /[0-9]/.test(value);          // 数字
        const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);  // 記号

        // いずれの文字種も含まない場合エラー
        if (!hasUpperCase && !hasLowerCase && !hasNumber && !hasSymbol) {
            errors.chars = '英大文字・小文字・数字・記号のいずれかを含めてください';
        }

        return errors;
    };

    /**
     * パスワード入力時の処理
     * リアルタイムバリデーション実行
     * 
     * @param {Event} e - 入力イベント
     */
    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);

        // バリデーション実行
        const validationErrors = validatePassword(value);
        // エラーを更新（既存エラーを保持しつつ更新）
        setErrors(prev => ({ ...prev, ...validationErrors, password: null }));
    };

    /**
     * 確認用パスワード入力時の処理
     * パスワード一致チェック
     * 
     * @param {Event} e - 入力イベント
     */
    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);

        // パスワード一致チェック
        if (value && value !== password) {
            setErrors(prev => ({ ...prev, confirm: 'パスワードが一致しません' }));
        } else {
            // エラーをクリア
            setErrors(prev => ({ ...prev, confirm: null }));
        }
    };

    /**
     * フォーム送信処理
     * バリデーション後、APIでパスワード登録
     * 
     * @param {Event} e - フォーム送信イベント
     */
    const handleSubmit = async (e) => {
        e.preventDefault();  // デフォルト送信を防止

        // 最終バリデーション
        const passwordErrors = validatePassword(password);
        if (Object.keys(passwordErrors).length > 0) {
            setErrors(passwordErrors);
            return;
        }

        // パスワード一致チェック
        if (password !== confirmPassword) {
            setErrors({ confirm: 'パスワードが一致しません' });
            return;
        }

        setIsSubmitting(true);  // 送信中状態

        try {
            // AUTH_USERテーブルに登録
            const response = await fetch('/api/user/set-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeNo: employeeNo,  // 社員番号
                    password: password       // パスワード（サーバー側でハッシュ化）
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert('パスワードを設定しました');
                onPasswordSet();  // 親コンポーネントに完了通知
                handleClose();    // モーダルを閉じる
            } else {
                alert('パスワード設定に失敗しました: ' + (result.error || ''));
            }
        } catch (error) {
            console.error('パスワード設定エラー:', error);
            alert('パスワード設定に失敗しました');
        } finally {
            setIsSubmitting(false);  // 送信中状態を解除
        }
    };

    /**
     * モーダルを閉じる処理
     * フォームをリセットして閉じる
     */
    const handleClose = () => {
        setPassword('');
        setConfirmPassword('');
        setErrors({});
        onClose();
    };

    // モーダルが閉じている場合は何も表示しない
    if (!isOpen) return null;

    return (
        // モーダルオーバーレイ - クリックで閉じる
        <div className="modal-overlay" onClick={handleClose}>
            {/* モーダル本体 - クリックイベントの伝播を停止 */}
            <div className="password-modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>パスワード設定</h2>
                {/* 対象ユーザー情報表示 */}
                <p className="modal-subtitle">
                    社員番号: {employeeNo} - {employeeName}
                </p>

                <form onSubmit={handleSubmit}>
                    {/* 新規パスワード入力 */}
                    <div className="form-group">
                        <label>新規パスワード *</label>
                        <input
                            type="password"
                            value={password}
                            onChange={handlePasswordChange}
                            placeholder="8-16文字"
                            required
                            maxLength="16"
                        />
                        {errors.length && <span className="error-text">{errors.length}</span>}
                        {errors.chars && <span className="error-text">{errors.chars}</span>}
                    </div>

                    {/* 確認用パスワード入力 */}
                    <div className="form-group">
                        <label>確認用パスワード *</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            placeholder="パスワードを再入力"
                            required
                        />
                        {errors.confirm && <span className="error-text">{errors.confirm}</span>}
                    </div>

                    {/* パスワード要件表示（リアルタイムで更新） */}
                    <div className="password-requirements">
                        <p className="requirement-title">パスワード要件：</p>
                        <ul>
                            {/* 文字数チェック（条件満たす場合はvalidクラス追加） */}
                            <li className={password.length >= 8 && password.length <= 16 ? 'valid' : ''}>
                                8文字以上16文字以内
                            </li>
                            {/* 文字種チェック */}
                            <li className={/[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'valid' : ''}>
                                英大文字・小文字・数字・記号のいずれかを含む
                            </li>
                        </ul>
                    </div>

                    {/* ボタングループ */}
                    <div className="modal-footer">
                        <button
                            type="submit"
                            className="save-btn"
                            disabled={isSubmitting}  // 送信中は無効化
                        >
                            設定
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

export default PasswordSetModal;