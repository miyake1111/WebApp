import React, { useState, useEffect } from 'react';
import './DeviceModal.css';

/**
 * デバイス編集/新規登録モーダルコンポーネント
 * 機器情報の入力フォームとバリデーション機能を提供
 * 
 * @param {boolean} isOpen - モーダルの表示/非表示状態
 * @param {Function} onClose - モーダルを閉じる関数
 * @param {Object} device - 編集対象のデバイス（新規登録時はnull）
 * @param {Function} onSave - 保存処理を行う関数
 * @param {string} mode - 動作モード（'add': 新規登録, 'edit': 編集）
 */
const DeviceModal = ({ isOpen, onClose, device, onSave, mode }) => {
    // フォームデータの状態管理
    const [formData, setFormData] = useState({
        assetNo: '',            // 資産番号
        manufacturer: '',       // メーカー
        os: '',                // OS
        memory: '',            // メモリ（GB）
        storage: '',           // ストレージ（GB）
        graphicsCard: '',      // グラフィックカード
        storageLocation: '',   // 保管場所
        isBroken: false,       // 故障フラグ
        leaseStartDate: '',    // リース開始日
        leaseEndDate: '',      // リース終了日
        remarks: ''            // 備考
    });

    // エラーメッセージ管理
    const [errors, setErrors] = useState({});
    // 資産番号重複チェック中フラグ
    const [isChecking, setIsChecking] = useState(false);

    /**
     * モーダルが開かれた時の初期化処理
     * 編集モード時は既存データをセット、新規登録時はリセット
     */
    useEffect(() => {
        if (device && mode === 'edit') {
            // 編集モード - 既存データをフォームにセット
            setFormData({
                assetNo: device.assetNo || '',
                manufacturer: device.manufacturer || '',
                os: device.os || '',
                memory: device.memory || '',
                storage: device.storage || '',
                graphicsCard: device.graphicsCard || '',
                storageLocation: device.storageLocation || '',
                isBroken: device.isBroken || false,
                leaseStartDate: device.leaseStartDate
                    ? device.leaseStartDate.split('T')[0]  // 日付部分のみ抽出
                    : '',
                leaseEndDate: device.leaseEndDate
                    ? device.leaseEndDate.split('T')[0]
                    : '',
                remarks: device.remarks || ''
            });
            setErrors({});
        } else if (mode === 'add' && isOpen) {
            // 新規登録モード - フォームをリセット
            setFormData({
                assetNo: '',
                manufacturer: '',
                os: 'Windows10',  // デフォルト値
                memory: '',
                storage: '',
                graphicsCard: '',
                storageLocation: '',
                isBroken: false,
                leaseStartDate: '',
                leaseEndDate: '',
                remarks: ''
            });
            setErrors({});
        }
    }, [device, mode, isOpen]);

    /**
     * 資産番号の重複チェック（非同期）
     * 新規登録時のみ実行
     * 
     * @param {string} assetNo - チェック対象の資産番号
     */
    const checkAssetNoDuplicate = async (assetNo) => {
        // 正規表現で形式をチェック（A19-2024-01形式）
        if (mode === 'add' && assetNo && /^[A-Z][0-9]{2}-[0-9]{4}-[0-9]{2}$/.test(assetNo)) {
            setIsChecking(true);
            try {
                const response = await fetch('/api/device/list');
                const data = await response.json();
                if (data.success) {
                    // 既存データと照合
                    const exists = data.data.some(d => d.assetNo === assetNo);
                    if (exists) {
                        setErrors(prev => ({ ...prev, assetNo: 'この資産番号は既に使用されています' }));
                    } else {
                        // エラーをクリア
                        const newErrors = { ...errors };
                        delete newErrors.assetNo;
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
     * 資産番号の入力制限
     * 形式：A19-2024-01（英字1文字+数字2桁-数字4桁-数字2桁）
     * 修正：正しい形式チェック
     */
    const handleAssetNoChange = (e) => {
        const value = e.target.value.toUpperCase();
        // 英数字とハイフンのみ許可
        if (/^[A-Z0-9-]*$/.test(value)) {
            setFormData({ ...formData, assetNo: value });

            // 形式チェック（A19-01-012形式）
            if (value && !/^[A-Z][0-9]{2}-[0-9]{2}-[0-9]{3}$/.test(value)) {
                setErrors({ ...errors, assetNo: '形式: A19-01-012（英字1文字+数字2桁-数字2桁-数字3桁）' });
            } else {
                checkAssetNoDuplicate(value);
            }
        }
    };

    /**
     * メーカーの入力処理
     */
    const handleManufacturerChange = (e) => {
        const value = e.target.value;
        setFormData({ ...formData, manufacturer: value });
    };

    /**
     * メモリの入力制限（4の倍数チェック）
     * 4GB～128GBの範囲で、4の倍数のみ許可
     */
    const handleMemoryChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) || value === '') {  // 数字のみ許可
            setFormData({ ...formData, memory: value });

            if (value) {
                const memValue = parseInt(value);
                if (memValue < 4 || memValue > 128) {
                    setErrors({ ...errors, memory: '4GB～128GBの範囲で入力してください' });
                } else if (memValue % 4 !== 0) {
                    setErrors({ ...errors, memory: '4の倍数で入力してください（4, 8, 16, 32...）' });
                } else {
                    // エラーをクリア
                    const newErrors = { ...errors };
                    delete newErrors.memory;
                    setErrors(newErrors);
                }
            }
        }
    };

    /**
     * ストレージの入力制限
     * 120GB～8000GBの範囲
     */
    const handleStorageChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) || value === '') {  // 数字のみ許可
            setFormData({ ...formData, storage: value });

            if (value) {
                const storageValue = parseInt(value);
                if (storageValue < 120 || storageValue > 8000) {
                    setErrors({ ...errors, storage: '120GB～8000GBの範囲で入力してください' });
                } else {
                    // エラーをクリア
                    const newErrors = { ...errors };
                    delete newErrors.storage;
                    setErrors(newErrors);
                }
            }
        }
    };

    /**
     * 日付の整合性チェック
     * リース終了日が開始日より後であることを確認
     */
    const handleDateChange = (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        setFormData(newFormData);

        // リース期限日チェック
        if (name === 'leaseEndDate' || name === 'leaseStartDate') {
            if (newFormData.leaseStartDate && newFormData.leaseEndDate) {
                if (newFormData.leaseStartDate >= newFormData.leaseEndDate) {
                    setErrors({ ...errors, leaseEndDate: 'リース期限日は開始日より後の日付を設定してください' });
                } else {
                    // エラーをクリア
                    const newErrors = { ...errors };
                    delete newErrors.leaseEndDate;
                    setErrors(newErrors);
                }
            }

            // 過去日付の警告
            if (name === 'leaseEndDate' && value) {
                const today = new Date().toISOString().split('T')[0];
                if (value < today) {
                    setErrors({ ...errors, leaseEndDate: '⚠️ リース期限日が過去の日付です' });
                }
            }
        }
    };

    /**
     * 汎用的な入力変更処理
     */
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    /**
     * フォーム送信処理
     * バリデーション後、親コンポーネントの保存関数を呼び出し
     */
    const handleSubmit = () => {
        // バリデーションチェック
        const validationErrors = {};

        // 資産番号の必須チェック
        if (!formData.assetNo) {
            validationErrors.assetNo = '資産番号は必須です';
        } else if (mode === 'add' && !/^[A-Z][0-9]{2}-[0-9]{2}-[0-9]{3}$/.test(formData.assetNo)) {
            validationErrors.assetNo = '正しい形式で入力してください';
        }

        // 保管場所の必須チェック
        if (!formData.storageLocation) {
            validationErrors.storageLocation = '保管場所は必須です';
        }

        // メモリの最終チェック
        if (formData.memory) {
            const memValue = parseInt(formData.memory);
            if (memValue % 4 !== 0 || memValue < 4 || memValue > 128) {
                validationErrors.memory = '4の倍数（4～128GB）で入力してください';
            }
        }

        // 容量の最終チェック
        if (formData.storage) {
            const storageValue = parseInt(formData.storage);
            if (storageValue < 120 || storageValue > 8000) {
                validationErrors.storage = '120GB～8000GBの範囲で入力してください';
            }
        }

        // エラーがある場合は送信を中止
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            alert('入力内容にエラーがあります');
            return;
        }

        // データ送信用に整形
        const submitData = {
            assetNo: formData.assetNo,
            manufacturer: formData.manufacturer || "",
            os: formData.os || "",
            memory: parseInt(formData.memory) || 0,
            storage: parseInt(formData.storage) || 0,
            graphicsCard: formData.graphicsCard || "",
            storageLocation: formData.storageLocation || "",
            isBroken: formData.isBroken || false,
            leaseStartDate: formData.leaseStartDate || null,
            leaseEndDate: formData.leaseEndDate || null,
            remarks: formData.remarks || ""
        };

        // 親コンポーネントの保存関数を呼び出し
        onSave(submitData);
    };

    // モーダルが閉じている場合は何も表示しない
    if (!isOpen) return null;

    return (
        // モーダルオーバーレイ - クリックで閉じる
        <div className="modal-overlay" onClick={onClose}>
            {/* モーダル本体 - クリックイベントの伝播を停止 */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{mode === 'edit' ? '機器情報編集' : '新規機器登録'}</h2>

                {/* フォーム本体 */}
                <div className="form-container">
                    {/* 左側カラム */}
                    <div className="form-left">
                        {/* 資産番号入力 */}
                        <div className="form-group">
                            <label>資産番号 *</label>
                            <input
                                type="text"
                                name="assetNo"
                                value={formData.assetNo}
                                onChange={handleAssetNoChange}
                                disabled={mode === 'edit'}  // 編集時は変更不可
                                placeholder="A19-01-012"
                                maxLength="12"
                            />
                            {errors.assetNo && <span className="error-text">{errors.assetNo}</span>}
                            {isChecking && <span className="checking-text">重複確認中...</span>}
                        </div>

                        {/* メーカー入力 */}
                        <div className="form-group">
                            <label>メーカー</label>
                            <input
                                type="text"
                                name="manufacturer"
                                value={formData.manufacturer}
                                onChange={handleManufacturerChange}
                                placeholder="Dell, HP, Lenovo等"
                            />
                        </div>

                        {/* OS選択 */}
                        <div className="form-group">
                            <label>OS</label>
                            <select
                                name="os"
                                value={formData.os}
                                onChange={handleChange}
                            >
                                <option value="">選択してください</option>
                                <option value="Windows10">Windows10</option>
                                <option value="Windows11">Windows11</option>
                                <option value="macOS">macOS</option>
                                <option value="Linux">Linux</option>
                                <option value="その他">その他</option>
                            </select>
                        </div>

                        {/* メモリ入力 */}
                        <div className="form-group">
                            <label>メモリ (GB)</label>
                            <input
                                type="text"
                                name="memory"
                                value={formData.memory}
                                onChange={handleMemoryChange}
                                placeholder="4, 8, 16, 32..."
                            />
                            {errors.memory && <span className="error-text">{errors.memory}</span>}
                        </div>

                        {/* 容量入力 */}
                        <div className="form-group">
                            <label>容量 (GB)</label>
                            <input
                                type="text"
                                name="storage"
                                value={formData.storage}
                                onChange={handleStorageChange}
                                placeholder="256, 512, 1000..."
                            />
                            {errors.storage && <span className="error-text">{errors.storage}</span>}
                        </div>

                        {/* グラフィックボード入力 */}
                        <div className="form-group">
                            <label>グラフィックボード</label>
                            <input
                                type="text"
                                name="graphicsCard"
                                value={formData.graphicsCard}
                                onChange={handleChange}
                            />
                        </div>

                        {/* 故障チェックボックス */}
                        <div className="form-group">
                            <label>故障</label>
                            <input
                                type="checkbox"
                                name="isBroken"
                                checked={formData.isBroken}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* 右側カラム */}
                    <div className="form-right">
                        {/* 保管場所入力 */}
                        <div className="form-group">
                            <label>保管場所 *</label>
                            <input
                                type="text"
                                name="storageLocation"
                                value={formData.storageLocation}
                                onChange={handleChange}
                                placeholder="3F-A棚、倉庫B等"
                            />
                            {errors.storageLocation && <span className="error-text">{errors.storageLocation}</span>}
                        </div>

                        {/* リース日付（横並び） */}
                        <div className="form-group-row">
                            {/* リース開始日 */}
                            <div className="form-group">
                                <label>リース開始日</label>
                                <input
                                    type="date"
                                    name="leaseStartDate"
                                    value={formData.leaseStartDate}
                                    onChange={handleDateChange}
                                />
                            </div>

                            {/* リース期限日 */}
                            <div className="form-group">
                                <label>リース期限日</label>
                                <input
                                    type="date"
                                    name="leaseEndDate"
                                    value={formData.leaseEndDate}
                                    onChange={handleDateChange}
                                />
                                {errors.leaseEndDate && <span className="error-text">{errors.leaseEndDate}</span>}
                            </div>
                        </div>

                        {/* 備考入力 */}
                        <div className="form-group">
                            <label>備考</label>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                rows="6"
                            />
                        </div>
                    </div>
                </div>

                {/* ボタングループ */}
                <div className="modal-buttons">
                    <button className="save-btn" onClick={handleSubmit} disabled={isChecking}>
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

export default DeviceModal;