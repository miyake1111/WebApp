import React, { useState } from 'react';
import './Layout.css';
import PasswordUpdateModal from './PasswordUpdateModal';

/**
 * アプリケーション全体のレイアウトを提供するコンポーネント
 * サイドバーとメインコンテンツエリアを含む
 * 
 * @param {ReactNode} children - メインコンテンツエリアに表示する子コンポーネント
 * @param {Object} user - ログインユーザー情報（name, employeeName, employeeNo等）
 * @param {Function} onLogout - ログアウト処理を実行する関数
 * @param {Function} onNavigate - ページ遷移を処理する関数
 * @param {String} currentPage - 現在表示中のページ名（dashboard, rentalStatus等）
 */
const Layout = ({ children, user, onLogout, onNavigate, currentPage }) => {
    // パスワード変更モーダルの表示状態を管理
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    return (
        <div className="layout-container">
            <div className="main-container">
                {/* サイドバー部分 */}
                <aside className="sidebar">
                    {/* ユーザー情報表示エリア */}
                    <div className="sidebar-header">
                        <div className="user-section">
                            <p className="greeting">こんにちは</p>
                            {/* userオブジェクトから名前を取得（複数の可能性を考慮） */}
                            <p className="sidebar-user-name">{user?.name || user?.employeeName || 'USER名'}</p>
                        </div>
                    </div>

                    {/* ナビゲーションメニュー */}
                    <nav className="nav-menu">
                        {/* メニュー（ダッシュボード）ボタン */}
                        <button
                            onClick={() => onNavigate('dashboard')}
                            className={currentPage === 'dashboard' ? 'active' : ''}  // 現在のページならアクティブクラスを付与
                        >
                            メニュー
                        </button>

                        {/* 貸出状況ボタン */}
                        <button
                            onClick={() => onNavigate('rentalStatus')}
                            className={currentPage === 'rentalStatus' ? 'active' : ''}
                        >
                            貸出状況
                        </button>

                        {/* 機器一覧ボタン */}
                        <button
                            onClick={() => onNavigate('deviceList')}
                            className={currentPage === 'deviceList' ? 'active' : ''}
                        >
                            機器一覧
                        </button>

                        {/* ユーザー一覧ボタン */}
                        <button
                            onClick={() => onNavigate('userList')}
                            className={currentPage === 'userList' ? 'active' : ''}
                        >
                            ユーザー一覧
                        </button>

                        {/* 下部ボタングループ（パスワード変更・ログアウト） */}
                        <div className="bottom-buttons">
                            {/* パスワード変更ボタン - クリックでモーダルを表示 */}
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="password-update-btn"
                            >
                                パスワード変更
                            </button>

                            {/* ログアウトボタン - App.jsxから渡された関数を実行 */}
                            <button onClick={onLogout} className="logout-btn">
                                ログアウト
                            </button>
                        </div>
                    </nav>
                </aside>

                {/* メインコンテンツエリア - 各ページコンポーネントが表示される */}
                <main className="main-content">
                    {children}
                </main>
            </div>

            {/* パスワード変更モーダル - isOpenがtrueの時のみ表示 */}
            <PasswordUpdateModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                employeeNo={user?.employeeNo || localStorage.getItem('employeeNo')}  // 社員番号をモーダルに渡す
            />
        </div>
    );
};

export default Layout;