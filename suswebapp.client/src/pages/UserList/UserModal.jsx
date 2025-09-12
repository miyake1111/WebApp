import React, { useState, useEffect } from 'react';
import './UserModal.css';

const UserModal = ({ isOpen, onClose, user, onSave, mode }) => {
    const [formData, setFormData] = useState({
        employeeNo: '',
        name: '',
        nameKana: '',
        department: '開発1課',
        phone: '',
        email: '',
        age: 20,
        gender: '男',
        position: '一般',
        pcAuthority: '利用者',
        registrationDate: new Date().toISOString().split('T')[0],
        retirementDate: null
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user && mode === 'edit') {
            setFormData({
                ...user,
                registrationDate: user.registrationDate ?
                    new Date(user.registrationDate).toISOString().split('T')[0] : '',
                retirementDate: user.retirementDate ?
                    new Date(user.retirementDate).toISOString().split('T')[0] : ''
            });
        }
    }, [user, mode]);

    // 社員番号の入力制限（大文字アルファベット1文字＋数字4桁）
    const handleEmployeeNoChange = (e) => {
        const value = e.target.value.toUpperCase();
        // 大文字アルファベットと数字のみ許可
        if (/^[A-Z]?[0-9]{0,4}$/.test(value) || value === '') {
            setFormData({ ...formData, employeeNo: value });

            // バリデーション
            if (value && !/^[A-Z][0-9]{4}$/.test(value)) {
                setErrors({ ...errors, employeeNo: '形式: A1234（大文字1文字＋数字4桁）' });
            } else {
                const newErrors = { ...errors };
                delete newErrors.employeeNo;
                setErrors(newErrors);
            }
        }
    };

    // 電話番号の入力制限（数字のみ）
    const handlePhoneChange = (e) => {
        const value = e.target.value;
        // 数字のみ許可
        if (/^\d*$/.test(value)) {
            setFormData({ ...formData, phone: value });

            // バリデーション
            if (value && value.length < 10) {
                setErrors({ ...errors, phone: '10桁以上の数字を入力してください' });
            } else {
                const newErrors = { ...errors };
                delete newErrors.phone;
                setErrors(newErrors);
            }
        }
    };

    // メールアドレスの入力制限とバリデーション
    const handleEmailChange = (e) => {
        const value = e.target.value;
        // 半角英数字と特殊文字のみ許可
        if (/^[a-zA-Z0-9@.\-_]*$/.test(value)) {
            setFormData({ ...formData, email: value });

            // @が含まれているかチェック
            if (value && !value.includes('@')) {
                setErrors({ ...errors, email: '@を含む正しいメールアドレスを入力してください' });
            } else if (value && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
                setErrors({ ...errors, email: '正しいメールアドレス形式で入力してください' });
            } else {
                const newErrors = { ...errors };
                delete newErrors.email;
                setErrors(newErrors);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 最終バリデーション
        const validationErrors = {};

        // 新規登録時の社員番号チェック
        if (mode === 'add' && !/^[A-Z][0-9]{4}$/.test(formData.employeeNo)) {
            validationErrors.employeeNo = '社員番号は大文字1文字＋数字4桁で入力してください';
        }

        // メールアドレスの@チェック
        if (formData.email && !formData.email.includes('@')) {
            validationErrors.email = '@を含む正しいメールアドレスを入力してください';
        }

        // 電話番号の桁数チェック
        if (formData.phone && formData.phone.length < 10) {
            validationErrors.phone = '電話番号は10桁以上で入力してください';
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            alert('入力内容にエラーがあります');
            return;
        }

        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{mode === 'add' ? '新規ユーザー登録' : 'ユーザー編集'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>社員番号 *</label>
                            <input
                                type="text"
                                name="employeeNo"
                                value={formData.employeeNo}
                                onChange={handleEmployeeNoChange}
                                disabled={mode === 'edit'}
                                maxLength="5"
                                placeholder="A1234"
                                required
                            />
                            {errors.employeeNo && <span className="error-text">{errors.employeeNo}</span>}
                        </div>

                        <div className="form-group">
                            <label>氏名</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>氏名（カナ）</label>
                            <input
                                type="text"
                                name="nameKana"
                                value={formData.nameKana}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>部署</label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleInputChange}
                            >
                                <option value="開発1課">開発1課</option>
                                <option value="開発2課">開発2課</option>
                                <option value="営業1課">営業1課</option>
                                <option value="情報システム部">情報システム部</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>電話番号</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                placeholder="数字のみ"
                                maxLength="15"
                            />
                            {errors.phone && <span className="error-text">{errors.phone}</span>}
                        </div>

                        <div className="form-group">
                            <label>メールアドレス</label>
                            <input
                                type="text"
                                name="email"
                                value={formData.email}
                                onChange={handleEmailChange}
                                placeholder="example@domain.com"
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label>年齢</label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleInputChange}
                                min="18"
                                max="100"
                            />
                        </div>

                        <div className="form-group">
                            <label>性別</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                            >
                                <option value="男">男</option>
                                <option value="女">女</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>役職</label>
                            <select
                                name="position"
                                value={formData.position}
                                onChange={handleInputChange}
                            >
                                <option value="一般">一般</option>
                                <option value="課長">課長</option>
                                <option value="部長">部長</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>PCアカウント権限</label>
                            <select
                                name="pcAuthority"
                                value={formData.pcAuthority}
                                onChange={handleInputChange}
                            >
                                <option value="利用者">利用者</option>
                                <option value="管理者">管理者</option>
                            </select>
                        </div>

                        {mode === 'edit' && (
                            <div className="form-group">
                                <label>退職日</label>
                                <input
                                    type="date"
                                    name="retirementDate"
                                    value={formData.retirementDate || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="submit" className="save-btn">
                            {mode === 'add' ? '登録' : '更新'}
                        </button>
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            キャンセル
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;