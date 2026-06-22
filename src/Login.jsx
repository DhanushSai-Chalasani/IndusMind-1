import React, { useState } from 'react';
import { Shield, User, Lock, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase';

export default function Login({ onLoggedIn, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');

    // Demo mode: no Supabase configured -> jump straight into the user panel.
    if (!isSupabaseConfigured) {
      onLoggedIn?.();
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      await onLoggedIn?.();
    } catch (err) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-between p-6 text-zinc-200 antialiased font-sans">
      {/* Demo-only admin shortcut (visible when Supabase is not configured) */}
      <div>
        {!isSupabaseConfigured && (
          <button
            onClick={() => onNavigate('admin_panel')}
            className="flex items-center gap-2 text-xs bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white px-4 py-2.5 rounded-lg transition-all"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-500" /> Enter Admin Dashboard (demo)
          </button>
        )}
      </div>

      {/* Login form */}
      <form
        onSubmit={handleSignIn}
        className="max-w-md w-full mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto border border-emerald-500/20">
            <User className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Industrial Knowledge Brain</h2>
          <p className="text-xs text-zinc-400">
            {isSupabaseConfigured
              ? 'Sign in to access the AI copilot & knowledge base'
              : 'Demo mode — run the backend with AUTH_ENABLED=false'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-medium">Operator ID / Email</label>
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-3 top-3.5 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@plant.internal"
                autoComplete="username"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-3 text-xs text-zinc-300 focus:outline-none focus:border-emerald-600/60"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-medium">Access Key Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute left-3 top-3.5 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-3 text-xs text-zinc-300 focus:outline-none focus:border-emerald-600/60"
              />
            </div>
          </div>

          {error && (
            <p className="text-[11px] text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold text-xs py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isSupabaseConfigured ? 'Sign in' : 'Enter User Dashboard'}
          </button>
        </div>
      </form>

      <div className="text-center text-[11px] text-zinc-700 tracking-wide">
        Industrial Knowledge Brain • Secure Systems Verification Protocol
      </div>
    </div>
  );
}
