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
                // 日付フィールドの処理を追加
                leaseStartDate: device.leaseStartDate
                    ? device.leaseStartDate.split('T')[0] // YYYY-MM-DD形式に変換
                    : '',
                leaseEndDate: device.leaseEndDate
                    ? device.leaseEndDate.split('T')[0]
                    : '',
                remarks: device.remarks || ''
            });
        } else {
            // 新規登録時
            setFormData({
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
        }
    }, [device, mode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = () => {
        // 空文字列をnullに変換し、数値型も適切に処理
        const submitData = {
            assetNo: formData.assetNo,
            manufacturer: formData.manufacturer || "",
            os: formData.os || "",
            memory: parseInt(formData.memory) || 0,
            storage: parseInt(formData.storage) || 0,
            graphicsCard: formData.graphicsCard || "",
            storageLocation: formData.storageLocation || "",
            isBroken: formData.isBroken || false,
            // 空文字列の場合はnullを送信
            leaseStartDate: formData.leaseStartDate && formData.leaseStartDate !== ""
                ? formData.leaseStartDate
                : null,
            leaseEndDate: formData.leaseEndDate && formData.leaseEndDate !== ""
                ? formData.leaseEndDate
                : null,
            remarks: formData.remarks || ""
        };
        onSave(submitData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{mode === 'edit' ? '機器情報編集' : '新規機器登録'}</h2>

                <div className="form-container">
                    <div className="form-left">
                        <div className="form-group">
                            <label>資産番号</label>
                            <input
                                type="text"
                                name="assetNo"
                                value={formData.assetNo}
                                onChange={handleChange}
                                disabled={mode === 'edit'}
                            />
                        </div>

                        <div className="form-group">
                            <label>メーカー</label>
                            <input
                                type="text"
                                name="manufacturer"
                                value={formData.manufacturer}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>OS</label>
                            <input
                                type="text"
                                name="os"
                                value={formData.os}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>メモリ</label>
                            <input
                                type="number"
                                name="memory"
                                value={formData.memory}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>容量</label>
                            <input
                                type="number"
                                name="storage"
                                value={formData.storage}
                                onChange={handleChange}
                            />
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
                            <label>備考</label>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                rows="6"
                            />
                        </div>

                        <div className="form-group">
                            <label>保管場所</label>
                            <input
                                type="text"
                                name="storageLocation"
                                value={formData.storageLocation}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group-row">
                            <div className="form-group">
                                <label>リース開始日</label>
                                <input
                                    type="date"
                                    name="leaseStartDate"
                                    value={formData.leaseStartDate}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>リース期限日</label>
                                <input
                                    type="date"
                                    name="leaseEndDate"
                                    value={formData.leaseEndDate}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {mode === 'edit' && (
                            <div className="form-group">
                                <label>登録日</label>
                                <input
                                    type="text"
                                    value={device.registrationDate || '2025/XX/XX'}
                                    disabled
                                />
                            </div>
                        )}
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

export default DeviceModal;