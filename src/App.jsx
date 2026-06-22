import React, { useState } from 'react';
import Login from './Login';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';

export default function App() {
  // Global State: 'login', 'user_panel', or 'admin_panel'
  const [currentScreen, setCurrentScreen] = useState('login');

  const navigateTo = (screen) => {
    setCurrentScreen(screen);
  };

  return (
    <>
      {currentScreen === 'login' && <Login onNavigate={navigateTo} />}
      {currentScreen === 'user_panel' && <UserDashboard onLogout={() => navigateTo('login')} />}
      {currentScreen === 'admin_panel' && <AdminDashboard onLogout={() => navigateTo('login')} />}
    </>
  );
}