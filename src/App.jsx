import React, { useState, useEffect } from 'react';
import Login from './Login';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';
import { supabase } from './lib/supabase';
import { api } from './api/client';

export default function App() {
  // 'login', 'user_panel', or 'admin_panel'
  const [currentScreen, setCurrentScreen] = useState('login');
  const [booting, setBooting] = useState(true);

  // Restore an existing Supabase session on load and route by role.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          if (data?.session) await routeByRole();
        }
      } finally {
        if (active) setBooting(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const routeByRole = async () => {
    try {
      const me = await api.me();
      setCurrentScreen(me.role === 'admin' ? 'admin_panel' : 'user_panel');
    } catch {
      // If /me fails (e.g. backend in demo mode), default to the user panel.
      setCurrentScreen('user_panel');
    }
  };

  const navigateTo = (screen) => setCurrentScreen(screen);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setCurrentScreen('login');
  };

  if (booting) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          Connecting to Industrial Knowledge Brain…
        </div>
      </div>
    );
  }

  return (
    <>
      {currentScreen === 'login' && (
        <Login onLoggedIn={routeByRole} onNavigate={navigateTo} />
      )}
      {currentScreen === 'user_panel' && <UserDashboard onLogout={handleLogout} />}
      {currentScreen === 'admin_panel' && <AdminDashboard onLogout={handleLogout} />}
    </>
  );
}
