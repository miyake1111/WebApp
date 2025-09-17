import React, { useState, useEffect } from 'react';
import './DeviceModal.css';

const DeviceModal = ({ isOpen, onClose, device, onSave, mode }) => {
    const [formData, setFormData] = useState({
        assetNo: '',
        manufacturer: '',
        os: '',
        memory: '',
        storage: '',
        graphicsCard: '',
        storageLocation: '',
        isBroken: false,
        leaseStartDate: '',
        leaseEndDate: '',
        remarks: ''
    });

    const [errors, setErrors] = useState({});
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        if (device && mode === 'edit') {
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
                    ? device.leaseStartDate.split('T')[0]
                    : '',
                leaseEndDate: device.leaseEndDate
                    ? device.leaseEndDate.split('T')[0]
                    : '',
                remarks: device.remarks || ''
            });
            setErrors({});
        } else if (mode === 'add' && isOpen) {
            // 新規登録時はフォームをリセット
            setFormData({
                assetNo: '',
                manufacturer: '',
                os: 'Windows10',
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

    // 資産番号の重複チェック
    const checkAssetNoDuplicate = async (assetNo) => {
        if (mode === 'add' && assetNo && /^[A-Z][0-9]{2}-[0-9]{4}-[0-9]{2}$/.test(assetNo)) {
            setIsChecking(true);
            try {
                const response = await fetch('/api/device/list');
                const data = await response.json();
                if (data.success) {
                    const exists = data.data.some(d => d.assetNo === assetNo);
                    if (exists) {
                        setErrors(prev => ({ ...prev, assetNo: 'この資産番号は既に使用されています' }));
                    } else {
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

    // 資産番号の入力制限（形式：A19-2024-01）
    const handleAssetNoChange = (e) => {
        const value = e.target.value.toUpperCase();
        // 英数字とハイフンのみ許可
        if (/^[A-Z0-9-]*$/.test(value)) {
            setFormData({ ...formData, assetNo: value });

            // 形式チェック
            if (value && !/^[A-Z][0-9]{2}-[0-9]{2}-[0-9]{3}$/.test(value)) {
                setErrors({ ...errors, assetNo: '形式: A19-01-012（英字1文字+数字2桁-数字2桁-数字3桁）' });
            } else {
                checkAssetNoDuplicate(value);
            }
        }
    };

    // メーカーの入力制限
    const handleManufacturerChange = (e) => {
        const value = e.target.value;
        setFormData({ ...formData, manufacturer: value });
    };

    // メモリの入力制限（4の倍数チェック）
    const handleMemoryChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) || value === '') {
            setFormData({ ...formData, memory: value });

            if (value) {
                const memValue = parseInt(value);
                if (memValue < 4 || memValue > 128) {
                    setErrors({ ...errors, memory: '4GB～128GBの範囲で入力してください' });
                } else if (memValue % 4 !== 0) {
                    setErrors({ ...errors, memory: '4の倍数で入力してください（4, 8, 16, 32...）' });
                } else {
                    const newErrors = { ...errors };
                    delete newErrors.memory;
                    setErrors(newErrors);
                }
            }
        }
    };

    // 容量の入力制限
    const handleStorageChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) || value === '') {
            setFormData({ ...formData, storage: value });

            if (value) {
                const storageValue = parseInt(value);
                if (storageValue < 120 || storageValue > 8000) {
                    setErrors({ ...errors, storage: '120GB～8000GBの範囲で入力してください' });
                } else {
                    const newErrors = { ...errors };
                    delete newErrors.storage;
                    setErrors(newErrors);
                }
            }
        }
    };

    // 日付の整合性チェック
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

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

        onSave(submitData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{mode === 'edit' ? '機器情報編集' : '新規機器登録'}</h2>

                <div className="form-container">
                    <div className="form-left">
                        <div className="form-group">
                            <label>資産番号 *</label>
                            <input
                                type="text"
                                name="assetNo"
                                value={formData.assetNo}
                                onChange={handleAssetNoChange}
                                disabled={mode === 'edit'}
                                placeholder="A19-2024-01"
                                maxLength="12"
                            />
                            {errors.assetNo && <span className="error-text">{errors.assetNo}</span>}
                            {isChecking && <span className="checking-text">重複確認中...</span>}
                        </div>

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

                        <div className="form-group">
                            <label>グラフィックボード</label>
                            <input
                                type="text"
                                name="graphicsCard"
                                value={formData.graphicsCard}
                                onChange={handleChange}
                            />
                        </div>

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

                    <div className="form-right">
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

                        <div className="form-group-row">
                            <div className="form-group">
                                <label>リース開始日</label>
                                <input
                                    type="date"
                                    name="leaseStartDate"
                                    value={formData.leaseStartDate}
                                    onChange={handleDateChange}
                                />
                            </div>

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