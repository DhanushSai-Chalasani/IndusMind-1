import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, ShieldCheck, Activity, FileText,
  Upload, LogOut, Loader2
} from 'lucide-react';
import { api } from './api/client';

const STATUS_COLOR = {
  ready: 'bg-emerald-500',
  processing: 'bg-amber-400',
  failed: 'bg-red-500',
};

// Reusable analysis tool: preset prompt buttons + free-text, backed by /query.
function ToolPanel({ icon: Icon, title, description, presets }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [custom, setCustom] = useState('');

  const run = async (question) => {
    const q = (question || '').trim();
    if (!q || loading) return;
    setLoading(true);
    setErr('');
    setResult(null);
    try {
      const res = await api.query(q);
      const citations = [
        ...new Set((res.sources || []).map((s) => `${s.file_name || 'document'} — #${s.chunk_index}`)),
      ];
      setResult({
        question: q,
        answer: res.answer,
        citations,
        confidence: Math.round((res.confidence_score || 0) * 100),
      });
    } catch (e) {
      setErr(e.message || 'Query failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-5 overflow-y-auto">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
          <p className="text-xs text-zinc-400">{description}</p>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Suggested analyses</span>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => run(p)}
              disabled={loading}
              className="text-left text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 px-3 py-2 rounded-lg transition-colors disabled:opacity-60"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(custom);
          setCustom('');
        }}
        className="flex gap-2"
      >
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Or ask your own question…"
          disabled={loading}
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold px-4 rounded-lg disabled:opacity-60"
        >
          Run
        </button>
      </form>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing the knowledge base…
        </div>
      )}
      {err && <p className="text-xs text-red-400">{err}</p>}

      {result && (
        <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 space-y-3">
          <p className="text-[11px] text-zinc-500">{result.question}</p>
          <p className="text-[13px] text-zinc-200 leading-relaxed whitespace-pre-wrap">{result.answer}</p>
          {result.citations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.citations.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700/60 px-2.5 py-1 rounded text-[11px] font-mono text-zinc-400">
                  <FileText className="w-3 h-3" /> {c}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <div className="w-20 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${result.confidence}%` }} />
            </div>
            <span>{result.confidence}% confidence</span>
          </div>
        </div>
      )}
    </div>
  );
}

const COMPLIANCE_PRESETS = [
  'What inspections or actions are overdue?',
  'What compliance gaps exist for Boiler B201?',
  'List any safety deviations found across the reports.',
];

const RCA_PRESETS = [
  'Why did Pump P101 fail?',
  'What is the probable root cause of the Compressor C101 trip?',
  'What recurring failures are occurring in Unit A?',
];

export default function UserDashboard({ onLogout }) {
  const [activeView, setActiveView] = useState('copilot');
  const [chatSubTab, setChatSubTab] = useState('chat');

  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hi! I\'m your Industrial Knowledge Copilot. Ask me anything about your ' +
        'manuals, maintenance logs, inspection or incident reports — I answer ' +
        'from your organization\'s documents and cite the sources.',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load the document library for the sidebar.
  const loadLibrary = async () => {
    try {
      const docs = await api.library();
      setDocuments(docs);
    } catch {
      /* library is best-effort; ignore if unavailable */
    }
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const question = inputMessage.trim();
    if (!question || sending) return;

    setError('');
    setInputMessage('');
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setSending(true);

    try {
      const res = await api.query(question, sessionId);
      if (res.session_id) setSessionId(res.session_id);

      const citations = (res.sources || []).map(
        (s) => `${s.file_name || 'document'} — #${s.chunk_index}`
      );
      // De-duplicate citations while preserving order.
      const uniqueCitations = [...new Set(citations)];

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.answer,
          citations: uniqueCitations,
          confidence: Math.round((res.confidence_score || 0) * 100),
        },
      ]);
    } catch (err) {
      setError(err.message || 'Query failed');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Sorry — I could not reach the knowledge base. Please confirm the ' +
            'backend is running and try again.',
        },
      ]);
    } finally {
      setSending(false);
    }
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
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-2">
              Uploaded documents ({documents.length})
            </span>
            <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
              {documents.length === 0 && (
                <p className="px-2 text-[11px] text-zinc-600">No documents yet.</p>
              )}
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-zinc-800/30 text-xs text-zinc-300">
                  <div className={`w-1.5 h-1.5 rounded-full ${STATUS_COLOR[doc.status] || 'bg-zinc-500'}`} />
                  <span className="truncate flex-1 font-mono">{doc.file_name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={loadLibrary}
            className="w-full flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-600 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium py-2.5 px-4 rounded-lg transition-all"
          >
            <Upload className="w-3.5 h-3.5" /> Refresh documents
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-zinc-500 hover:text-red-400 text-xs py-2 transition-colors font-medium"
          >
            <LogOut className="w-3.5 h-3.5" /> Disconnect Session
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 bg-zinc-950 flex flex-col p-6 overflow-hidden">
        {activeView === 'copilot' && (
          <div className="flex-1 bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60">
              <div>
                <h2 className="text-base font-semibold text-zinc-100">Knowledge copilot</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Ask anything across your {documents.length} uploaded documents
                </p>
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
                        <div className={`p-4 text-[13px] leading-relaxed rounded-xl whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-900/40 border border-blue-800/50 text-blue-100 rounded-br-sm' : 'bg-zinc-850 border border-zinc-800 text-zinc-200 rounded-bl-sm'}`}>
                          {msg.content}
                        </div>
                        {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                          <div className="space-y-2 pt-0.5 px-1">
                            <div className="flex flex-wrap gap-2">
                              {msg.citations.map((cite, cIdx) => (
                                <div key={cIdx} className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700/60 px-2.5 py-1 rounded text-[11px] font-mono text-zinc-400"><FileText className="w-3 h-3" /> {cite}</div>
                              ))}
                            </div>
                            {typeof msg.confidence === 'number' && (
                              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                                <div className="w-20 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${msg.confidence}%` }} />
                                </div>
                                <span>{msg.confidence}% confidence</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {sending && (
                    <div className="flex justify-start">
                      <div className="bg-zinc-850 border border-zinc-800 text-zinc-400 rounded-xl rounded-bl-sm p-4 text-[13px] flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching the knowledge base…
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {error && (
                  <div className="px-6 pb-2 text-[11px] text-red-400">{error}</div>
                )}

                <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800 bg-zinc-900/40 flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your operational question here..."
                    disabled={sending}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    className="bg-zinc-100 hover:bg-white disabled:opacity-60 text-zinc-950 font-semibold text-xs px-4 py-3 rounded-lg shadow transition-all active:scale-95"
                  >
                    Ask
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-2">
                {documents.length === 0 && (
                  <p className="text-xs text-zinc-500">No documents in the knowledge base yet.</p>
                )}
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 bg-zinc-950/40 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs">
                    <span className="p-1 bg-zinc-800 text-zinc-400 rounded font-mono text-[9px] font-bold uppercase">{doc.file_type}</span>
                    <span className="truncate flex-1 font-mono text-zinc-300">{doc.file_name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${doc.status === 'ready' ? 'bg-emerald-500/15 text-emerald-400' : doc.status === 'failed' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>{doc.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'compliance' && (
          <ToolPanel
            icon={ShieldCheck}
            title="Compliance scan"
            description="Surface compliance gaps and overdue actions from your SOPs and inspection reports."
            presets={COMPLIANCE_PRESETS}
          />
        )}

        {activeView === 'rca' && (
          <ToolPanel
            icon={Activity}
            title="Root cause analysis"
            description="Probable root causes drawn from incident and maintenance records."
            presets={RCA_PRESETS}
          />
        )}
      </main>
    </div>
  );
}
