import React, { useState, useEffect } from 'react';
import './UserModal.css';

/**
 * ユーザー編集/新規登録モーダルコンポーネント
 * ユーザー情報の入力フォームとバリデーション機能を提供
 * 
 * @param {boolean} isOpen - モーダルの表示/非表示状態
 * @param {Function} onClose - モーダルを閉じる関数
 * @param {Object} user - 編集対象のユーザー（新規登録時はnull）
 * @param {Function} onSave - 保存処理を行う関数
 * @param {string} mode - 動作モード（'add': 新規登録, 'edit': 編集）
 */
const UserModal = ({ isOpen, onClose, user, onSave, mode }) => {
    // フォームデータの状態管理
    const [formData, setFormData] = useState({
        employeeNo: '',                    // 社員番号
        name: '',                          // 氏名
        nameKana: '',                      // 氏名（カナ）
        department: '開発1課',              // 部署（デフォルト値）
        phone: '',                         // 電話番号
        email: '',                         // メールアドレス
        age: 20,                           // 年齢（デフォルト値）
        gender: '男',                       // 性別（デフォルト値）
        position: '一般',                   // 役職（デフォルト値）
        pcAuthority: '利用者',              // PC権限（デフォルト値）
        registrationDate: new Date().toISOString().split('T')[0],  // 登録日（今日）
        retirementDate: null               // 退職日
    });

    // エラーメッセージ管理
    const [errors, setErrors] = useState({});
    // 社員番号重複チェック中フラグ
    const [isChecking, setIsChecking] = useState(false);

    /**
     * モーダルが開かれた時の初期化処理
     * 編集モード時は既存データをセット、新規登録時はリセット
     */
    useEffect(() => {
        if (user && mode === 'edit') {
            // 編集モード - 既存データをフォームにセット
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

    /**
     * 社員番号の重複チェック（非同期）
     * 新規登録時のみ実行
     * 
     * @param {string} employeeNo - チェック対象の社員番号
     */
    const checkEmployeeNoDuplicate = async (employeeNo) => {
        // 正規表現で形式をチェック（A1234形式）
        if (mode === 'add' && employeeNo && /^[A-Z][0-9]{4}$/.test(employeeNo)) {
            setIsChecking(true);
            try {
                const response = await fetch('/api/user/list');
                const data = await response.json();
                if (data.success) {
                    // 既存データと照合
                    const exists = data.data.some(u => u.employeeNo === employeeNo);
                    if (exists) {
                        setErrors(prev => ({ ...prev, employeeNo: 'この社員番号は既に使用されています' }));
                    } else {
                        // エラーをクリア
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

    /**
     * 社員番号の入力制限
     * 形式：大文字アルファベット1文字＋数字4桁
     * 
     * @param {Event} e - 入力イベント
     */
    const handleEmployeeNoChange = (e) => {
        const value = e.target.value.toUpperCase();  // 大文字に変換
        // 形式チェック
        if (/^[A-Z]?[0-9]{0,4}$/.test(value) || value === '') {
            setFormData({ ...formData, employeeNo: value });

            // 形式バリデーション
            if (value && !/^[A-Z][0-9]{4}$/.test(value)) {
                setErrors({ ...errors, employeeNo: '形式: A1234（大文字1文字＋数字4桁）' });
            } else {
                checkEmployeeNoDuplicate(value);
            }
        }
    };

    /**
     * 氏名の入力制限（数字を含まない）
     * 
     * @param {Event} e - 入力イベント
     */
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

    /**
     * 氏名（カナ）の入力制限（カタカナのみ）
     * 
     * @param {Event} e - 入力イベント
     */
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

    /**
     * 電話番号の入力制限（数字のみ）
     * 
     * @param {Event} e - 入力イベント
     */
    const handlePhoneChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {  // 数字のみ許可
            setFormData({ ...formData, phone: value });

            // 桁数チェック
            if (value && value.length < 10) {
                setErrors({ ...errors, phone: '10桁以上の数字を入力してください' });
            } else {
                const newErrors = { ...errors };
                delete newErrors.phone;
                setErrors(newErrors);
            }
        }
    };

    /**
     * メールアドレスの入力制限とバリデーション
     * 
     * @param {Event} e - 入力イベント
     */
    const handleEmailChange = (e) => {
        const value = e.target.value;
        // 英数字と@、.、-、_のみ許可
        if (/^[a-zA-Z0-9@.\-_]*$/.test(value)) {
            setFormData({ ...formData, email: value });

            // @の存在チェック
            if (value && !value.includes('@')) {
                setErrors({ ...errors, email: '@を含む正しいメールアドレスを入力してください' });
            } else if (value && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
                // メールアドレス形式の詳細チェック
                setErrors({ ...errors, email: '正しいメールアドレス形式で入力してください' });
            } else {
                const newErrors = { ...errors };
                delete newErrors.email;
                setErrors(newErrors);
            }
        }
    };

    /**
     * 汎用的な入力変更処理
     * 
     * @param {Event} e - 入力イベント
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    /**
     * フォーム送信処理
     * バリデーション後、親コンポーネントの保存関数を呼び出し
     * 
     * @param {Event} e - フォーム送信イベント
     */
    const handleSubmit = async (e) => {
        e.preventDefault();  // デフォルト送信を防止

        // データ送信用に整形
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

        // エラーがある場合は送信を中止
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            alert('入力内容にエラーがあります');
            return;
        }

        // 親コンポーネントの保存関数を呼び出し
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

    // モーダルが閉じている場合は何も表示しない
    if (!isOpen) return null;

    return (
        // モーダルオーバーレイ - クリックで閉じる
        <div className="modal-overlay" onClick={onClose}>
            {/* モーダル本体 - クリックイベントの伝播を停止 */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{mode === 'add' ? '新規ユーザー登録' : 'ユーザー編集'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        {/* 社員番号入力 */}
                        <div className="form-group">
                            <label>社員番号 *</label>
                            <input
                                type="text"
                                name="employeeNo"
                                value={formData.employeeNo}
                                onChange={handleEmployeeNoChange}
                                disabled={mode === 'edit'}  // 編集時は変更不可
                                maxLength="5"
                                placeholder="A1234"
                                required
                            />
                            {errors.employeeNo && <span className="error-text">{errors.employeeNo}</span>}
                            {isChecking && <span className="checking-text">重複確認中...</span>}
                        </div>

                        {/* 氏名入力 */}
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

                        {/* 氏名（カナ）入力 */}
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

                        {/* 部署選択 */}
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

                        {/* 電話番号入力 */}
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

                        {/* メールアドレス入力 */}
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

                        {/* 年齢入力 */}
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

                        {/* 性別選択 */}
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

                        {/* 役職選択 */}
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

                        {/* PCアカウント権限選択 */}
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

                        {/* 退職日入力（編集モード時のみ） */}
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

                    {/* ボタングループ */}
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