import React from 'react';
import { 
  LayoutDashboard, FileText, Network, Search, Cpu, HardDrive, Wrench, ShieldCheck, 
  LogOut, Bell, HelpCircle, ChevronDown, Calendar, Filter, Upload, 
  MessageSquare, AlertTriangle, CheckCircle2, TrendingUp
} from 'lucide-react';

export default function AdminDashboard({ onLogout }) {
  return (
    <div className="min-h-screen h-screen w-screen bg-slate-50 text-slate-800 flex font-sans antialiased overflow-hidden">
      
      {/* LEFT NAVIGATION PANEL */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 flex-shrink-0">
        <div>
          <div className="p-6 flex items-center gap-2.5 border-b border-slate-800/60">
            <Cpu className="text-indigo-500 w-6 h-6" />
            <div>
              <h2 className="text-sm font-black tracking-tight text-white leading-none">Industrial IQ</h2>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">Knowledge Intelligence</span>
            </div>
          </div>

          <div className="p-4 space-y-5">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white shadow">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 px-3 block mb-1">Knowledge</span>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"><FileText className="w-4 h-4" /> Documents</button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"><Network className="w-4 h-4" /> Knowledge Graph</button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"><Search className="w-4 h-4" /> Search</button>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 px-3 block mb-1">Operations</span>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"><HardDrive className="w-4 h-4" /> Equipment</button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"><Wrench className="w-4 h-4" /> Maintenance</button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-xs text-white">EN</div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">Admin Exec</p>
              <p className="text-[10px] text-slate-500">Unit A Center</p>
            </div>
          </div>
          <button onClick={onLogout} className="text-slate-500 hover:text-red-400 transition-colors p-1">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* CENTRAL SCROLL CONTENT VIEWER */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white border-b border-slate-200 h-16 px-8 flex items-center justify-between sticky top-0 z-40 flex-shrink-0">
          <div className="relative w-96">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input type="text" placeholder="Search documents, diagnostics... (⌘ K)" className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:bg-white" />
          </div>
          <div className="flex items-center gap-4">
            <Bell className="w-4 h-4 text-slate-400 cursor-pointer" />
            <HelpCircle className="w-4 h-4 text-slate-400 cursor-pointer" />
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">A</div>
          </div>
        </header>

        <main className="p-8 space-y-6 flex-1 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">System Command Center Dashboard 📊</h1>
              <p className="text-xs text-slate-500">Live analytical monitoring overlay and cross-linked knowledge indices.</p>
            </div>
            <div className="flex gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-2 rounded-lg text-slate-600 font-medium shadow-sm"><Filter className="w-3.5 h-3.5" /> Unit A <ChevronDown className="w-3.5 h-3.5" /></div>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-2 rounded-lg text-slate-600 font-medium shadow-sm"><Calendar className="w-3.5 h-3.5" /> May 13, 2025 <ChevronDown className="w-3.5 h-3.5" /></div>
            </div>
          </div>

          {/* KPI CARDS SCOREBOARD GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-start gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><FileText className="w-5 h-5" /></div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Documents</p>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">12,458</h3>
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-1"><TrendingUp className="w-3 h-3" /> +245</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-start gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Cpu className="w-5 h-5" /></div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Equipment</p>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">1,245</h3>
                <span className="text-[10px] font-bold text-red-500 mt-1 block">23 Critical Failure Assets</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-start gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Wrench className="w-5 h-5" /></div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Open Orders</p>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">86</h3>
                <span className="text-[10px] font-bold text-orange-500 mt-1 block">12 Delayed Tasks</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><ShieldCheck className="w-5 h-5" /></div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Compliance Index</p>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">92.4%</h3>
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-1"><TrendingUp className="w-3 h-3" /> +2.4%</span>
              </div>
            </div>
          </div>

          {/* ANALYTICAL VIEWS GRIDS SPLIT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center"><MessageSquare className="w-4 h-4" /></div>
                  <h4 className="text-xs font-bold text-slate-900">AI Prompt Assistant Panel</h4>
                </div>
                <div className="relative">
                  <input type="text" placeholder="Query machine analytics log vectors..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-xs text-slate-800 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-900 mb-4">Equipment Distribution Metrics</h4>
                  <div className="flex items-center justify-around gap-2">
                    <div className="w-20 h-20 rounded-full border-[10px] border-emerald-500 border-t-amber-400 border-r-red-400 flex items-center justify-center text-xs font-black">1,245</div>
                    <div className="space-y-1 text-[10px] text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Healthy (51.5%)</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400" /> Warning (25.1%)</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400" /> Critical (14.5%)</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-slate-900">Recent Document Ingestion Feed</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                      <span className="p-1 bg-red-50 text-red-500 rounded font-mono text-[9px] font-bold">PDF</span>
                      <span className="truncate font-medium text-slate-700">Maintenance_Report_May2025.pdf</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="p-1 bg-red-50 text-red-500 rounded font-mono text-[9px] font-bold">PDF</span>
                      <span className="truncate font-medium text-slate-700">Inspection_Pump_P101.pdf</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Active Warning Stream Notifications</h4>
                <div className="space-y-2 text-xs">
                  <div className="bg-red-50/60 border border-red-100 p-2.5 rounded-lg flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800 leading-none">PRV Overdue Check</p>
                      <p className="text-[10px] text-slate-500 mt-1">Pressure Valve PRV-102</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="bg-white border-t border-slate-200 p-4 text-[11px] text-slate-500 font-medium flex justify-between items-center px-8 flex-shrink-0">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Infrastructure Uptime Track: <span className="text-slate-800 font-bold">99.9%</span></div>
          <div>Total Data Vector Clusters: <span className="text-slate-800 font-bold">2.4 TB</span></div>
        </footer>
      </div>
    </div>
  );
}