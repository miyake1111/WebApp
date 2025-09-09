import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
    const [credentials, setCredentials] = useState({
        employeeNo: '',
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
        if (error) {
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // バックエンドAPIを呼び出し
            const response = await fetch('http://localhost:61319/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeNo: credentials.employeeNo,
                    password: credentials.password
                })
            });

            const data = await response.json();
            console.log('Login API response:', data); // デバッグ用

            if (response.ok && data.success) {
                console.log('User data from API:', data.user); // デバッグ用
                console.log('EmployeeNo:', data.user.employeeNo); // デバッグ用

                // ログイン成功
                setIsLoading(false);

                // ユーザー情報をローカルストレージに保存（オプション）
                localStorage.setItem('currentUser', JSON.stringify(data.user));

                if (onLoginSuccess) {
                    onLoginSuccess(data.user);
                }
            } else {
                // ログイン失敗
                setIsLoading(false);
                setError(data.message || 'ログインに失敗しました');
            }
        } catch (err) {
            setIsLoading(false);
            setError('サーバーに接続できませんでした。サーバーが起動していることを確認してください。');
            console.error('Login error:', err);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">PC貸出管理システム</h2>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">社員番号</label>
                        <input
                            type="text"
                            name="employeeNo"
                            value={credentials.employeeNo}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">パスワード</label>
                        <input
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                            disabled={isLoading}
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`login-btn ${isLoading ? 'loading' : ''}`}
                    >
                        {isLoading ? 'ログイン中...' : 'ログイン'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;