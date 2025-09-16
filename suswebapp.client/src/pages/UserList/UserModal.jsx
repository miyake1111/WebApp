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
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        if (user && mode === 'edit') {
            setFormData({
                ...user,
                registrationDate: user.registrationDate ?
                    new Date(user.registrationDate).toISOString().split('T')[0] : '',
                retirementDate: user.retirementDate ?
                    new Date(user.retirementDate).toISOString().split('T')[0] : ''
            });
        } else if (mode === 'add' && isOpen) {
            // 新規登録時は毎回フォームをリセット
            setFormData({
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
            setErrors({});
        }
    }, [user, mode, isOpen]);

    // 社員番号の重複チェック
    const checkEmployeeNoDuplicate = async (employeeNo) => {
        if (mode === 'add' && employeeNo && /^[A-Z][0-9]{4}$/.test(employeeNo)) {
            setIsChecking(true);
            try {
                const response = await fetch('/api/user/list');
                const data = await response.json();
                if (data.success) {
                    const exists = data.data.some(u => u.employeeNo === employeeNo);
                    if (exists) {
                        setErrors(prev => ({ ...prev, employeeNo: 'この社員番号は既に使用されています' }));
                    } else {
                        const newErrors = { ...errors };
                        delete newErrors.employeeNo;
                        setErrors(newErrors);
                    }
                }
            } catch (error) {
                console.error('重複チェックエラー:', error);
            } finally {
                setIsChecking(false);
            }
        }
    };

    // 社員番号の入力制限（大文字アルファベット1文字＋数字4桁）
    const handleEmployeeNoChange = (e) => {
        const value = e.target.value.toUpperCase();
        if (/^[A-Z]?[0-9]{0,4}$/.test(value) || value === '') {
            setFormData({ ...formData, employeeNo: value });

            if (value && !/^[A-Z][0-9]{4}$/.test(value)) {
                setErrors({ ...errors, employeeNo: '形式: A1234（大文字1文字＋数字4桁）' });
            } else {
                checkEmployeeNoDuplicate(value);
            }
        }
    };

    // 氏名の入力制限（数字を含まない）
    const handleNameChange = (e) => {
        const value = e.target.value;
        // 数字を含まない場合のみ許可
        if (!/\d/.test(value)) {
            setFormData({ ...formData, name: value });
            const newErrors = { ...errors };
            delete newErrors.name;
            setErrors(newErrors);
        } else {
            setErrors({ ...errors, name: '氏名に数字は使用できません' });
        }
    };

    // 氏名（カナ）の入力制限（カタカナのみ）
    const handleNameKanaChange = (e) => {
        const value = e.target.value;
        // カタカナと長音符のみ許可
        if (/^[ァ-ヶー]*$/.test(value)) {
            setFormData({ ...formData, nameKana: value });
            const newErrors = { ...errors };
            delete newErrors.nameKana;
            setErrors(newErrors);
        } else {
            setErrors({ ...errors, nameKana: 'カタカナのみ入力可能です' });
        }
    };

    // 電話番号の入力制限（数字のみ）
    const handlePhoneChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setFormData({ ...formData, phone: value });

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
        if (/^[a-zA-Z0-9@.\-_]*$/.test(value)) {
            setFormData({ ...formData, email: value });

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 日付フィールドの処理を修正
        const submitData = {
            ...formData,
            age: parseInt(formData.age) || 0,
            registrationDate: formData.registrationDate || null,
            retirementDate: formData.retirementDate || null,
        };

        // 空文字を null に変換
        Object.keys(submitData).forEach(key => {
            if (submitData[key] === '') {
                submitData[key] = null;
            }
        });

        // 最終バリデーション
        const validationErrors = {};

        // 新規登録時の社員番号チェック
        if (mode === 'add') {
            if (!/^[A-Z][0-9]{4}$/.test(submitData.employeeNo)) {
                validationErrors.employeeNo = '社員番号は大文字1文字＋数字4桁で入力してください';
            }

            // 重複チェック
            if (!errors.employeeNo && submitData.employeeNo) {
                await checkEmployeeNoDuplicate(submitData.employeeNo);
                if (errors.employeeNo) {
                    validationErrors.employeeNo = errors.employeeNo;
                }
            }
        }

        // 氏名チェック
        if (/\d/.test(submitData.name)) {
            validationErrors.name = '氏名に数字は使用できません';
        }

        // カナチェック
        if (submitData.nameKana && !/^[ァ-ヶー]*$/.test(submitData.nameKana)) {
            validationErrors.nameKana = 'カタカナのみ入力可能です';
        }

        // メールアドレスの@チェック
        if (submitData.email && !submitData.email.includes('@')) {
            validationErrors.email = '@を含む正しいメールアドレスを入力してください';
        }

        // 電話番号の桁数チェック
        if (submitData.phone && submitData.phone.length < 10) {
            validationErrors.phone = '電話番号は10桁以上で入力してください';
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            alert('入力内容にエラーがあります');
            return;
        }

        onSave(submitData);

        // 新規登録成功後はフォームをクリア
        if (mode === 'add') {
            setFormData({
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
            setErrors({});
        }
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
                            {isChecking && <span className="checking-text">重複確認中...</span>}
                        </div>

                        <div className="form-group">
                            <label>氏名</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleNameChange}
                                placeholder="山田太郎"
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label>氏名（カナ）</label>
                            <input
                                type="text"
                                name="nameKana"
                                value={formData.nameKana}
                                onChange={handleNameKanaChange}
                                placeholder="ヤマダタロウ"
                            />
                            {errors.nameKana && <span className="error-text">{errors.nameKana}</span>}
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
                                placeholder="09012345678"
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

                        {/* 残りのフィールドは同じ */}
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
                        <button type="submit" className="save-btn" disabled={isChecking}>
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