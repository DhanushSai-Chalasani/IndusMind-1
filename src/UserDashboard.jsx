import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, ShieldCheck, Activity, FileText, 
  Upload, ChevronRight, HelpCircle, AlertCircle, LogOut 
} from 'lucide-react';

export default function UserDashboard({ onLogout }) {
  const [activeView, setActiveView] = useState('copilot');
  const [chatSubTab, setChatSubTab] = useState('chat');

  const [documents] = useState([
    { name: 'Boiler SOP v3.pdf', size: '1.2 MB', status: 'ready', color: 'bg-emerald-500' },
    { name: 'Pump maintenance log.pdf', size: '840 KB', status: 'ready', color: 'bg-emerald-500' },
    { name: 'OISD Rule 116.pdf', size: '2.4 MB', status: 'ready', color: 'bg-blue-500' },
    { name: 'Inspection report P-04.pdf', size: '1.1 MB', status: 'ready', color: 'bg-amber-500' },
  ]);

  const [messages, setMessages] = useState([
    { 
      role: 'user', 
      content: 'What is the safe shutdown procedure for Boiler B-12 during gas pressure abnormality?' 
    },
    { 
      role: 'assistant', 
      content: 'During a gas pressure abnormality in Boiler B-12, the safe shutdown procedure requires three immediate steps: (1) isolate the fuel gas supply using the manual shut-off valve located at the battery limit, (2) activate the emergency depressurisation valve to reduce internal pressure below 0.5 bar, and (3) notify the shift supervisor and initiate evacuation of the 15-metre exclusion zone as per emergency protocol.',
      citations: ['Boiler SOP v3.pdf — p.7', 'OISD Rule 116.pdf — p.3'],
      confidence: 91
    },
    {
      role: 'user',
      content: 'How often should pressure relief valves be tested?'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newQuery = inputMessage;
    setMessages(prev => [...prev, { role: 'user', content: newQuery }]);
    setInputMessage('');

    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Pressure relief valves (PRVs) on Boiler B-12 must be tested once every 6 months under operating conditions, or immediately following any unexpected pressure surge exceeding 16.5 bar. Ensure structural logs are updated in the local maintenance system.`,
        citations: ['OISD Rule 116.pdf — p.12', 'Inspection report P-04.pdf — p.2'],
        confidence: 95
      }]);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans antialiased overflow-hidden selection:bg-zinc-700">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between p-4">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold tracking-tight text-zinc-100 text-lg">PlantBrain</span>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveView('copilot')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeView === 'copilot' ? 'bg-zinc-800 text-zinc-100 shadow-inner' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
            >
              <MessageSquare className="w-4 h-4" /> Knowledge copilot
            </button>
            <button 
              onClick={() => setActiveView('compliance')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeView === 'compliance' ? 'bg-zinc-800 text-zinc-100 shadow-inner' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
            >
              <ShieldCheck className="w-4 h-4" /> Compliance scan
            </button>
            <button 
              onClick={() => setActiveView('rca')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeView === 'rca' ? 'bg-zinc-800 text-zinc-100 shadow-inner' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
            >
              <Activity className="w-4 h-4" /> RCA assistant
            </button>
          </nav>

          <div className="pt-2 space-y-3">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-2">Uploaded documents</span>
            <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
              {documents.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-zinc-800/30 text-xs text-zinc-300">
                  <div className={`w-1.5 h-1.5 rounded-full ${doc.color}`} />
                  <span className="truncate flex-1 font-mono">{doc.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer Operations */}
        <div className="space-y-2">
          <button className="w-full flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-600 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium py-2.5 px-4 rounded-lg transition-all">
            <Upload className="w-3.5 h-3.5" /> Upload document
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-zinc-500 hover:text-red-400 text-xs py-2 transition-colors font-medium"
          >
            <LogOut className="w-3.5 h-3.5" /> Disconnect Session
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT PANEL */}
      <main className="flex-1 bg-zinc-950 flex flex-col p-6 overflow-hidden">
        {activeView === 'copilot' && (
          <div className="flex-1 bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60">
              <div>
                <h2 className="text-base font-semibold text-zinc-100">Knowledge copilot</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Ask anything across your {documents.length} uploaded documents</p>
              </div>
            </div>

            <div className="px-6 border-b border-zinc-800 flex gap-6 text-xs font-medium bg-zinc-900/20">
              <button onClick={() => setChatSubTab('chat')} className={`py-3 relative ${chatSubTab === 'chat' ? 'text-zinc-100 font-semibold' : 'text-zinc-400'}`}>
                Chat {chatSubTab === 'chat' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded" />}
              </button>
              <button onClick={() => setChatSubTab('library')} className={`py-3 relative ${chatSubTab === 'library' ? 'text-zinc-100 font-semibold' : 'text-zinc-400'}`}>
                Document library {chatSubTab === 'library' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded" />}
              </button>
            </div>

            {chatSubTab === 'chat' ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[75%] space-y-2">
                        <div className={`p-4 text-[13px] leading-relaxed rounded-xl ${msg.role === 'user' ? 'bg-blue-900/40 border border-blue-800/50 text-blue-100 rounded-br-sm' : 'bg-zinc-850 border border-zinc-800 text-zinc-200 rounded-bl-sm'}`}>
                          {msg.content}
                        </div>
                        {msg.role === 'assistant' && msg.citations && (
                          <div className="space-y-2 pt-0.5 px-1">
                            <div className="flex flex-wrap gap-2">
                              {msg.citations.map((cite, cIdx) => (
                                <div key={cIdx} className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700/60 px-2.5 py-1 rounded text-[11px] font-mono text-zinc-400"><FileText className="w-3 h-3" /> {cite}</div>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                              <div className="w-20 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${msg.confidence}%` }} />
                              </div>
                              <span>{msg.confidence}% confidence</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800 bg-zinc-900/40 flex gap-2">
                  <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Type your operational question here..." className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none" />
                  <button type="submit" className="bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs px-4 py-3 rounded-lg shadow transition-all active:scale-95">Ask</button>
                </form>
              </div>
            ) : (
              <div className="p-6 text-xs text-zinc-400">Document registry data view matrix content frame placeholder.</div>
            )}
          </div>
        )}

        {activeView === 'compliance' && (
          <div className="flex-1 bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4">
            <h2 className="text-base font-semibold text-zinc-100">Compliance scan engine</h2>
            <div className="border border-zinc-800 bg-zinc-950/40 rounded-xl p-4 flex gap-3 text-xs text-zinc-300">
              <AlertCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div><span className="font-semibold block text-zinc-200 mb-1">All Systems Validated</span>No deviations found inside current operational documents.</div>
            </div>
          </div>
        )}

        {activeView === 'rca' && (
          <div className="flex-1 bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4">
            <h2 className="text-base font-semibold text-zinc-100">Root cause analysis (RCA) assistant</h2>
            <p className="text-xs text-zinc-400">Input incident telemetry scripts inside operational logs to calculate risk failure paths.</p>
          </div>
        )}
      </main>
    </div>
  );
}