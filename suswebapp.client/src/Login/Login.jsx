/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
        // エラーをクリア
        if (error) {
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // デモ用の認証ロジック（実際のAPIに置き換えてください）
            if (credentials.username === 'admin' && credentials.password === 'password') {
                // ログイン成功
                setTimeout(() => {
                    setIsLoading(false);
                    if (onLoginSuccess) {
                        onLoginSuccess();
                    }
                }, 1000); // 1秒後にログイン成功
            } else {
                // ログイン失敗
                setTimeout(() => {
                    setIsLoading(false);
                    setError('ユーザー名またはパスワードが正しくありません');
                }, 1000);
            }
        } catch (err) {
            setIsLoading(false);
            setError('ログイン処理中にエラーが発生しました');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">
                    PC貸出管理システム
                </h2>

                <div className="login-form">
                    <div className="form-group">
                        <label className="form-label">
                            ユーザー名
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={credentials.username}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            パスワード
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={`login-btn ${isLoading ? 'loading' : ''}`}
                    >
                        {isLoading ? 'ログイン中...' : 'ログイン'}
                    </button>
                </div>

                <div className="demo-info">
                    <strong>デモ用認証情報:</strong><br />
                    ユーザー名: admin<br />
                    パスワード: password
                </div>
            </div>
        </div>
    );
};

export default Login;