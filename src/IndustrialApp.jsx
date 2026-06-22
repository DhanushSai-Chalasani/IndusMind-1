import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, AlertTriangle, Play, Cpu, ShieldAlert, FileText, CheckCircle, RefreshCw } from 'lucide-react';

export default function IndustrialApp() {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState('copilot'); // 'copilot' or 'rca'
  const [isScanning, setIsScanning] = useState(false);
  const [showRcaAlert, setShowRcaAlert] = useState(false);

  // Tab 1: Copilot Chat State
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your Industrial Expert Copilot. Provide asset readings or ask about safety protocols.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Tab 2: RCA Input State
  const [logInput, setLogInput] = useState(
    "Morning shift report: Routine check complete. Noticed a minor 0.2 bar micro-fluctuation in Vent Valve EV-09. Asset operational."
  );

  // Auto-scroll logic for chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotTyping]);

  // Handle Chat Submissions
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setIsBotTyping(true);

    // Simulate RAG Backend Processing Pipeline
    setTimeout(() => {
      let botResponse = `I have logged your statement regarding: "${userMessage}". Scanning technical manuals to cross-verify structural safety limits...`;

      if (userMessage.toLowerCase().includes('boiler') || userMessage.toLowerCase().includes('15.8')) {
        botResponse = `### ⚠️ Warning Protocol Identified\nAccording to the **OEM Manual (Page 4)**, the maximum limit is 15.5 bar. You are entering a critical zone.\n\n### 📋 Action Checklist (Cross-referenced with OISD Regs):\n1. Check if Emergency Vent Valve **EV-09** is responsive.\n2. Do **NOT** issue any active Hot Work Permits in **Zone 3** until pressure stabilizes below 15.0 bar.\n\n*Source: OEM_Boiler_B102_Rev4.pdf, OISD-STD-118-Sec7*`;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
      setIsBotTyping(false);
    }, 1500);
  };

  // Handle Autonomous Incident Scanner
  const runIncidentScan = () => {
    setIsScanning(true);
    setShowRcaAlert(false);

    // 3-second mandatory spinner simulation
    setTimeout(() => {
      setIsScanning(false);
      setShowRcaAlert(true);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased">
      {/* HEADER SECTION */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="text-blue-500 w-6 h-6 animate-pulse" />
            <h1 className="text-xl font-bold tracking-tight">Industrial Knowledge Intelligence Platform</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Fusing Document Intelligence, Ontologies, & Asset Safety Profiles</p>
        </div>
        
        {/* TABS CONTROLLER */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 self-start md:self-auto">
          <button 
            onClick={() => setActiveTab('copilot')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'copilot' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <MessageSquare className="w-4 h-4" /> Field Expert Copilot
          </button>
          <button 
            onClick={() => setActiveTab('rca')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'rca' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <AlertTriangle className="w-4 h-4" /> Autonomous RCA & Predictor
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto p-4 md:p-6">
        
        {/* TAB 1: FIELD EXPERT COPILOT */}
        {activeTab === 'copilot' && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl flex flex-col h-[75vh] shadow-2xl overflow-hidden">
            {/* Context Notice Banner */}
            <div className="bg-blue-950/40 border-b border-blue-900/40 px-4 py-2.5 flex items-center gap-2 text-xs text-blue-400">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>Real-time RAG Pipeline Active: Every operational insight enforces strict OEM manual & OISD regulatory citations.</span>
            </div>

            {/* Chat Messages Frame */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-950 to-slate-900/50">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl p-4 text-sm shadow-md whitespace-pre-line leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-slate-850 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}>
                    <span className="block text-[10px] uppercase font-bold tracking-wider opacity-60 mb-1">
                      {msg.role === 'user' ? 'Field Operator' : 'Knowledge Intelligence Core'}
                    </span>
                    {msg.content}
                  </div>
                </div>
              ))}

              {isBotTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-850 border border-slate-800 text-slate-400 rounded-xl rounded-bl-none p-4 text-sm flex items-center gap-3">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-xs italic animate-pulse">Running semantic parsing & pipeline graph mapping...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form Action */}
            <form onSubmit={handleChatSubmit} className="p-4 border-t border-slate-800 bg-slate-950 flex gap-2">
              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about parameters (e.g., 'Hey, pressure on Boiler B-102 is currently sitting at 15.8 bar...')"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-5 py-3 rounded-lg shadow-lg active:scale-95 transition-all"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: AUTONOMOUS RCA & NEAR-MISS PREDICTOR */}
        {activeTab === 'rca' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-2 text-slate-200">
                <FileText className="text-emerald-500 w-5 h-5" /> 
                Autonomous Root Cause & Near-Miss Intelligence Engine
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                Paste real-time shift entries or telemetry observations below to run graph correlation matches against legacy plant failure systems.
              </p>

              <textarea 
                value={logInput}
                onChange={(e) => setLogInput(e.target.value)}
                rows={5}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm font-mono text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all leading-relaxed"
                placeholder="Paste fresh operational/maintenance text records..."
              />

              <button
                onClick={runIncidentScan}
                disabled={isScanning}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-semibold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Analyzing Historical Log Vectors (3s)...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Run Autonomous Incident Scan</span>
                  </>
                )}
              </button>
            </div>

            {/* DYNAMIC ALERT BANNER ENGINE */}
            {showRcaAlert && (
              <div className="border-2 border-red-500 bg-red-950/20 rounded-xl p-6 shadow-2xl relative overflow-hidden animate-pulse">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-shimmer" />
                
                <h3 className="text-red-400 font-bold text-base flex items-center gap-2 tracking-wide uppercase mb-3">
                  <ShieldAlert className="w-5 h-5 animate-bounce" /> 🚨 CRITICAL COMPOUND RISK DETECTED
                </h3>
                
                <ul className="space-y-4 text-sm text-slate-300 leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-red-400 font-bold">● Pattern Match:</span> 
                    <span>Our Failure Engine identified that this exact micro-fluctuation in <strong>Valve EV-09</strong> has occurred 3 times historically (Ref: Logs from March 2024, Nov 2024, and Aug 2025).</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-400 font-bold">● Downstream Impact:</span> 
                    <span>In all 3 historical cases, this exact pattern resulted in an unvented pressure spike and an average of <strong>14 hours of unplanned downtime</strong> within a 24-hour window.</span>
                  </li>
                  <li className="flex gap-2 p-3 bg-red-950/40 rounded-lg border border-red-900/50">
                    <span className="text-emerald-400 font-bold">● Recommended Mitigation:</span> 
                    <span className="text-slate-200">Dispatch a technician to physically inspect the actuator on <strong>Valve EV-09 immediately</strong>. Do not delay inspection workflows.</span>
                  </li>
                </ul>

                {/* Additional Metrics Breakdown Card Component Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 border-t border-red-900/40 pt-4">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-center">
                    <p className="text-[10px] uppercase text-slate-500 font-bold">Match Confidence</p>
                    <p className="text-lg font-black text-red-400">94.2%</p>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-center">
                    <p className="text-[10px] uppercase text-slate-500 font-bold">Est. Loss Imminent</p>
                    <p className="text-lg font-black text-amber-400">14 Hours</p>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-center">
                    <p className="text-[10px] uppercase text-slate-500 font-bold">Action Window</p>
                    <p className="text-lg font-black text-emerald-400">Immediate</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}