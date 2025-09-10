import React, { useState, useEffect } from 'react';
import './UserModal.css';

const UserModal = ({ isOpen, onClose, user, onSave, mode }) => {
    const [formData, setFormData] = useState({
        employeeNo: '',
        name: '',
        nameKana: '',
        department: '',
        phone: '',
        email: '',
        age: '',
        gender: '',
        position: '',
        pcAuthority: '利用者',
        registrationDate: '',
        retirementDate: ''
    });

    useEffect(() => {
        if (user && mode === 'edit') {
            setFormData({
                employeeNo: user.employeeNo || '',
                name: user.name || '',
                nameKana: user.nameKana || '',
                department: user.department || '',
                phone: user.phone || '',
                email: user.email || '',
                age: user.age || '',
                gender: user.gender || '',
                position: user.position || '',
                pcAuthority: user.pcAuthority || '利用者',
                registrationDate: user.registrationDate
                    ? user.registrationDate.split('T')[0]
                    : '',
                retirementDate: user.retirementDate
                    ? user.retirementDate.split('T')[0]
                    : ''
            });
        } else {
            setFormData({
                employeeNo: '',
                name: '',
                nameKana: '',
                department: '',
                phone: '',
                email: '',
                age: '',
                gender: '',
                position: '',
                pcAuthority: '利用者',
                registrationDate: '',
                retirementDate: ''
            });
        }
    }, [user, mode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        const submitData = {
            ...formData,
            age: parseInt(formData.age) || 0,
            registrationDate: formData.registrationDate && formData.registrationDate !== ""
                ? formData.registrationDate
                : null,
            retirementDate: formData.retirementDate && formData.retirementDate !== ""
                ? formData.retirementDate
                : null
        };
        onSave(submitData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{mode === 'edit' ? 'ユーザー情報編集' : '新規ユーザー登録'}</h2>

                <div className="form-container">
                    <div className="form-left">
                        <div className="form-group">
                            <label>社員番号</label>
                            <input
                                type="text"
                                name="employeeNo"
                                value={formData.employeeNo}
                                onChange={handleChange}
                                disabled={mode === 'edit'}
                            />
                        </div>

                        <div className="form-group">
                            <label>氏名</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>氏名（フリガナ）</label>
                            <input
                                type="text"
                                name="nameKana"
                                value={formData.nameKana}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>所属部門</label>
                            <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>電話番号</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>メールアドレス</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group-row">
                            <div className="form-group">
                                <label>年齢</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>性別</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="">選択</option>
                                    <option value="男">男</option>
                                    <option value="女">女</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-right">
                        <div className="form-group">
                            <label>役職</label>
                            <input
                                type="text"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>PCアカウント権限</label>
                            <select
                                name="pcAuthority"
                                value={formData.pcAuthority}
                                onChange={handleChange}
                            >
                                <option value="利用者">利用者</option>
                                <option value="管理者">管理者</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>登録日</label>
                            <input
                                type="date"
                                name="registrationDate"
                                value={formData.registrationDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>退職日</label>
                            <input
                                type="date"
                                name="retirementDate"
                                value={formData.retirementDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="modal-buttons">
                    <button className="save-btn" onClick={handleSubmit}>
                        {mode === 'edit' ? '変更' : '登録'}
                    </button>
                    <button className="cancel-btn" onClick={onClose}>
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserModal;