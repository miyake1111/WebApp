import React, { useState } from 'react';
import Login from './Login/Login.jsx';
import './App.css';

// シンプルなルーティング管理
const App = () => {
    const [currentPage, setCurrentPage] = useState('login');

    // ログイン成功時の処理
    const handleLoginSuccess = () => {
        setCurrentPage('dashboard');
    };

    // ログアウト処理
    const handleLogout = () => {
        setCurrentPage('login');
    };

    // Dashboard コンポーネント
    const Dashboard = () => {
        return (
            <div className="dashboard">
                <h1>ログイン成功！PC貸出管理トップページ</h1>
                <button
                    onClick={handleLogout}
                    className="logout-btn"
                >
                    ログアウト
                </button>
            </div>
        );
    };

    // 現在のページに応じてコンポーネントを表示
    return (
        <div className="app">
            {currentPage === 'login' && (
                <Login onLoginSuccess={handleLoginSuccess} />
            )}
            {currentPage === 'dashboard' && (
                <Dashboard />
            )}
        </div>
    );
};

export default App;