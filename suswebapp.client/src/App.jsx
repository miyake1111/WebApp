import React, { useState } from 'react';
import Login from './pages/Login/Login.jsx';
import Layout from './components/Layout/Layout.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import RentalStatus from './pages/RentalStatus/RentalStatus.jsx';
import DeviceList from './pages/DeviceList/DeviceList.jsx';
import UserList from './pages/UserList/UserList.jsx';  // ← 追加
import './App.css';

function App() {
    const [currentPage, setCurrentPage] = useState('login');
    const [currentUser, setCurrentUser] = useState(null);

    const handleLoginSuccess = (userInfo) => {
        console.log('App.jsx - Login success, userInfo:', userInfo);
        setCurrentUser(userInfo);
        setCurrentPage('dashboard');
    };

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
        setCurrentPage('login');
    };

    const handleNavigate = (page) => {
        setCurrentPage(page);
    };

    if (currentPage === 'login') {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <Layout
            user={currentUser}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            currentPage={currentPage}
        >
            {currentPage === 'dashboard' && <Dashboard user={currentUser} />}
            {currentPage === 'rentalStatus' && (
                <RentalStatus
                    user={currentUser}
                    onBack={() => handleNavigate('dashboard')}
                />
            )}
            {currentPage === 'deviceList' && (
                <DeviceList
                    user={currentUser}
                    onBack={() => handleNavigate('dashboard')}
                />
            )}
            {currentPage === 'userList' && (  // ← 追加
                <UserList
                    user={currentUser}
                    onBack={() => handleNavigate('dashboard')}
                />
            )}
        </Layout>
    );
}

export default App;