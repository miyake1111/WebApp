import React, { useState } from 'react';
import './PasswordUpdateModal.css';

const PasswordUpdateModal = ({ isOpen, onClose, employeeNo }) => {
    const [newPassword, setNewPassword] = useState('');
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

        // 文字種チェック
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

        if (!hasUpperCase && !hasLowerCase && !hasNumber && !hasSymbol) {
            errors.chars = '英大文字・小文字・数字・記号のいずれかを含めてください';
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // バリデーション
        const passwordErrors = validatePassword(newPassword);
        if (Object.keys(passwordErrors).length > 0) {
            setErrors(passwordErrors);
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrors({ confirm: 'パスワードが一致しません' });
            return;
        }

        setIsSubmitting(true);

        try {
            // 新しいパスワードを設定
            const response = await fetch('/api/user/update-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeNo: employeeNo,
                    currentPassword: '',  // 使用しないが送る
                    newPassword: newPassword
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert('パスワードを変更しました');
                handleClose();
            } else {
                alert('パスワード変更に失敗しました: ' + (result.message || ''));
            }
        } catch (error) {
            console.error('パスワード変更エラー:', error);
            alert('パスワード変更に失敗しました');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="password-modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>パスワード変更</h2>
                <p className="modal-subtitle">
                    社員番号: {employeeNo}
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>新しいパスワード *</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                                const validationErrors = validatePassword(e.target.value);
                                setErrors(prev => ({ ...prev, ...validationErrors }));
                            }}
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
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
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

                    <div className="password-requirements">
                        <p className="requirement-title">パスワード要件：</p>
                        <ul>
                            <li className={newPassword.length >= 8 && newPassword.length <= 16 ? 'valid' : ''}>
                                8文字以上16文字以内
                            </li>
                            <li className={/[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? 'valid' : ''}>
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