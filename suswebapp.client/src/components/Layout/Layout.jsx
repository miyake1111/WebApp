import React, { useState } from 'react';
import './Layout.css';
import PasswordUpdateModal from './PasswordUpdateModal';

const Layout = ({ children, user, onLogout, onNavigate, currentPage }) => {
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    return (
        <div className="layout-container">
            <div className="main-container">
                <aside className="sidebar">
                    <div className="sidebar-header">
                        <div className="user-section">
                            <p className="greeting">こんにちは</p>
                            <p className="sidebar-user-name">{user?.name || user?.employeeName || 'USER名'}</p>
                        </div>
                    </div>
                    <nav className="nav-menu">
                        <button
                            onClick={() => onNavigate('dashboard')}
                            className={currentPage === 'dashboard' ? 'active' : ''}
                        >
                            メニュー
                        </button>
                        <button
                            onClick={() => onNavigate('rentalStatus')}
                            className={currentPage === 'rentalStatus' ? 'active' : ''}
                        >
                            貸出状況
                        </button>
                        <button
                            onClick={() => onNavigate('deviceList')}
                            className={currentPage === 'deviceList' ? 'active' : ''}
                        >
                            機器一覧
                        </button>
                        <button
                            onClick={() => onNavigate('userList')}
                            className={currentPage === 'userList' ? 'active' : ''}
                        >
                            ユーザー一覧
                        </button>

                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="password-update-btn"
                        >
                            パスワード変更
                        </button>

                        <button onClick={onLogout} className="logout-btn">
                            ログアウト
                        </button>
                    </nav>
                </aside>
                <main className="main-content">
                    {children}
                </main>
            </div>

            <PasswordUpdateModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                employeeNo={user?.employeeNo || localStorage.getItem('employeeNo')}
            />
        </div>
    );
};

export default Layout;