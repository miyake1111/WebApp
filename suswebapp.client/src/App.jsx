import React, { useState } from 'react';
import Login from './pages/Login/Login.jsx';
import Layout from './components/Layout/Layout.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import RentalStatus from './pages/RentalStatus/RentalStatus.jsx';
import DeviceList from './pages/DeviceList/DeviceList.jsx';
import UserList from './pages/UserList/UserList.jsx';  // ユーザー一覧コンポーネント
import './App.css';

/**
 * アプリケーションのルートコンポーネント
 * ページ遷移とユーザー認証状態を管理
 */
function App() {
    // === ステート管理 ===
    // 現在表示中のページ（初期値：ログイン）
    const [currentPage, setCurrentPage] = useState('login');
    // ログイン中のユーザー情報
    const [currentUser, setCurrentUser] = useState(null);

    /**
     * ログイン成功時の処理
     * ユーザー情報を保存してダッシュボードへ遷移
     * 
     * @param {Object} userInfo - ログインユーザー情報
     */
    const handleLoginSuccess = (userInfo) => {
        console.log('App.jsx - Login success, userInfo:', userInfo);  // デバッグ用
        setCurrentUser(userInfo);      // ユーザー情報を保存
        setCurrentPage('dashboard');   // ダッシュボードへ遷移
    };

    /**
     * ログアウト処理
     * ユーザー情報をクリアしてログインページへ戻る
     */
    const handleLogout = () => {
        setCurrentUser(null);                       // ユーザー情報をクリア
        localStorage.removeItem('currentUser');     // LocalStorageからも削除
        setCurrentPage('login');                   // ログインページへ遷移
    };

    /**
     * ページ遷移処理
     * 
     * @param {string} page - 遷移先のページ名
     */
    const handleNavigate = (page) => {
        setCurrentPage(page);
    };

    // ログインページの場合は単独で表示（Layoutなし）
    if (currentPage === 'login') {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    // ログイン後はLayoutコンポーネント内でページを表示
    return (
        <Layout
            user={currentUser}              // ユーザー情報
            onLogout={handleLogout}         // ログアウト処理
            onNavigate={handleNavigate}     // ページ遷移処理
            currentPage={currentPage}       // 現在のページ
        >
            {/* ダッシュボード */}
            {currentPage === 'dashboard' && <Dashboard user={currentUser} />}

            {/* 貸出状況一覧 */}
            {currentPage === 'rentalStatus' && (
                <RentalStatus
                    user={currentUser}
                    onBack={() => handleNavigate('dashboard')}  // 戻るボタン処理
                />
            )}

            {/* 機器一覧 */}
            {currentPage === 'deviceList' && (
                <DeviceList
                    user={currentUser}
                    onBack={() => handleNavigate('dashboard')}  // 戻るボタン処理
                />
            )}

            {/* ユーザー一覧（追加） */}
            {currentPage === 'userList' && (
                <UserList
                    user={currentUser}
                    onBack={() => handleNavigate('dashboard')}  // 戻るボタン処理
                />
            )}
        </Layout>
    );
}

export default App;