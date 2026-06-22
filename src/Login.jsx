import React from 'react';
import { Shield, User, Lock } from 'lucide-react';

export default function Login({ onNavigate }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-between p-6 text-zinc-200 antialiased font-sans">
      
      {/* Top Left Admin Quick-Switch Button Layout */}
      <div>
        <button 
          onClick={() => onNavigate('admin_panel')}
          className="flex items-center gap-2 text-xs bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white px-4 py-2.5 rounded-lg transition-all"
        >
          <Shield className="w-3.5 h-3.5 text-indigo-500" /> Admin Access Portal
        </button>
      </div>

      {/* Main Field Operator Login Form Layout */}
      <div className="max-w-md w-full mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto border border-emerald-500/20">
            <User className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Field Operator Portal</h2>
          <p className="text-xs text-zinc-400">Access localized RAG schemas & asset safety indices</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-medium">Operator ID / Email</label>
            <input 
              type="text" 
              readOnly
              defaultValue="operator.zone3@plant.internal"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-300 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-medium">Access Key Password</label>
            <input 
              type="password" 
              readOnly
              defaultValue="••••••••"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-300 focus:outline-none"
            />
          </div>
          <button 
            onClick={() => onNavigate('user_panel')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.99]"
          >
            Access User Dashboard
          </button>
        </div>
      </div>

      {/* Bottom Legal Notice */}
      <div className="text-center text-[11px] text-zinc-700 tracking-wide">
        PlantBrain Industrial Platform • Secure Systems Verification Protocol
      </div>
    </div>
  );
}