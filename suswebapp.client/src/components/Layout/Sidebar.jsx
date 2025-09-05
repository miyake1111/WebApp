import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ user, onLogout, onNavigate, currentPage }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleNavigate = (page) => {
        onNavigate(page);
        // モバイル時はメニューを閉じる
        if (window.innerWidth <= 768) {
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* モバイル用ハンバーガーメニュー */}
            <button className="mobile-menu-toggle" onClick={toggleMenu}>
                <span></span>
                <span></span>
                <span></span>
            </button>

            {/* オーバーレイ */}
            <div
                className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
                onClick={() => setIsOpen(false)}
            />

            {/* サイドバー本体 */}
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h2>こんにちは</h2>
                    <p className="user-name">{user?.name || 'USER名'}</p>
                </div>

                <div className="sidebar-menu">
                    <button
                        className={`menu-item ${currentPage === 'rentalStatus' ? 'active' : ''}`}
                        onClick={() => handleNavigate('rentalStatus')}
                    >
                        貸出状況
                    </button>

                    <button
                        className={`menu-item ${currentPage === 'deviceList' ? 'active' : ''}`}
                        onClick={() => handleNavigate('deviceList')}
                    >
                        機器一覧
                    </button>

                    <button
                        className={`menu-item ${currentPage === 'userList' ? 'active' : ''}`}
                        onClick={() => handleNavigate('userList')}
                    >
                        ユーザー覧
                    </button>
                </div>

                <button className="logout-button" onClick={onLogout}>
                    LOGOUT
                </button>
            </div>
        </>
    );
};

export default Sidebar;