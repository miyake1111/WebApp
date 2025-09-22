import React, { useState } from 'react';
import './PasswordSetModal.css';

const PasswordSetModal = ({ isOpen, onClose, employeeNo, employeeName, onPasswordSet }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validatePassword = (value) => {
        const errors = {};

        // 長さチェック（8-16文字）
        if (value.length < 8) {
            errors.length = 'パスワードは8文字以上必要です';
        } else if (value.length > 16) {
            errors.length = 'パスワードは16文字以内にしてください';
        }

        // 文字種チェック（英大文字・小文字・数字・記号のいずれか）
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

        if (!hasUpperCase && !hasLowerCase && !hasNumber && !hasSymbol) {
            errors.chars = '英大文字・小文字・数字・記号のいずれかを含めてください';
        }

        return errors;
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);

        const validationErrors = validatePassword(value);
        setErrors(prev => ({ ...prev, ...validationErrors, password: null }));
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);

        if (value && value !== password) {
            setErrors(prev => ({ ...prev, confirm: 'パスワードが一致しません' }));
        } else {
            setErrors(prev => ({ ...prev, confirm: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // バリデーション
        const passwordErrors = validatePassword(password);
        if (Object.keys(passwordErrors).length > 0) {
            setErrors(passwordErrors);
            return;
        }

        if (password !== confirmPassword) {
            setErrors({ confirm: 'パスワードが一致しません' });
            return;
        }

        setIsSubmitting(true);

        try {
            // AUTH_USERテーブルに登録
            const response = await fetch('/api/user/set-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeNo: employeeNo,
                    password: password
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert('パスワードを設定しました');
                onPasswordSet();
                handleClose();
            } else {
                alert('パスワード設定に失敗しました: ' + (result.error || ''));
            }
        } catch (error) {
            console.error('パスワード設定エラー:', error);
            alert('パスワード設定に失敗しました');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setPassword('');
        setConfirmPassword('');
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="password-modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>パスワード設定</h2>
                <p className="modal-subtitle">
                    社員番号: {employeeNo} - {employeeName}
                </p>

                <form onSubmit={handleSubmit}>
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

                    <div className="password-requirements">
                        <p className="requirement-title">パスワード要件：</p>
                        <ul>
                            <li className={password.length >= 8 && password.length <= 16 ? 'valid' : ''}>
                                8文字以上16文字以内
                            </li>
                            <li className={/[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'valid' : ''}>
                                英大文字・小文字・数字・記号のいずれかを含む
                            </li>
                        </ul>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="submit"
                            className="save-btn"
                            disabled={isSubmitting}
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