'use client';
import { useEffect, useState, useRef } from 'react';
import { Bot, Send, X, Trash2, Settings, AlertTriangle } from 'lucide-react';
import Nav from '@/components/Nav';
import { getChat, addChat, clearChat, getApiKey, saveApiKey } from '@/lib/store';

const SYSTEM_PROMPT = `You are Dr. AI, a knowledgeable and caring virtual health assistant specializing in diabetes management, metabolic health, and general wellness. You advise Mikail KOCAK, born July 23 1979, who has diabetes.

Rules:
- Provide medically accurate information based on current ADA/AHA guidelines
- Always remind: you are AI, not a replacement for their doctor
- For emergencies: tell them to call 911 immediately
- Use mg/dL for glucose values
- Keep responses concise (under 200 words)
- If unsure, recommend consulting their healthcare provider
- Be empathetic and professional`;

export default function AIDoctorPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(getChat());
    setApiKey(getApiKey());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    addChat(userMsg);
    setInput('');
    setLoading(true);
    setError('');

    try {
      if (!apiKey) throw new Error('No API key. Tap ⚙️ to add your OpenAI key.');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...updated.map((m: any) => ({ role: m.role, content: m.content })),
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages([...updated, aiMsg]);
      addChat(aiMsg);
    } catch (err: any) {
      setError(err.message || 'Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "What's a healthy fasting glucose?",
    'Best foods for blood sugar?',
    'How does exercise affect glucose?',
    'What is HbA1c?',
    'Vitamins for diabetics?',
    'How to manage dawn phenomenon?',
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-gradient-to-r from-sky-600 to-sky-400 pt-12 pb-5 px-5 rounded-b-3xl">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot size={22} className="text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">AI Doctor</h1>
              <p className="text-sky-100 text-xs">Virtual health assistant</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowSettings(true)} className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <Settings size={16} className="text-white" />
            </button>
            <button onClick={() => { clearChat(); setMessages([]); }} className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <Trash2 size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="max-w-lg mx-auto w-full px-4 mt-3">
        <div className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-lg border border-amber-100">
          <AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-[10px] text-amber-700">AI provides general info only. Always consult your doctor. Emergency? Call 911.</p>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto max-w-lg mx-auto w-full px-4 mt-3 pb-44">
        {messages.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-100 flex items-center justify-center mb-3">
              <Bot size={28} className="text-sky-500" />
            </div>
            <h3 className="font-bold text-lg">Hi Mikail 👋</h3>
            <p className="text-gray-400 text-sm mt-1">Ask about diabetes, medications, nutrition...</p>
            <div className="mt-5 space-y-1.5">
              {quickQuestions.map((q) => (
                <button key={q} onClick={() => setInput(q)} className="w-full text-left p-2.5 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-100 hover:bg-sky-50">
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {messages.map((m: any) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl ${m.role === 'user' ? 'bg-sky-500 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                  {m.role === 'assistant' && (
                    <div className="flex items-center gap-1 mb-1">
                      <Bot size={10} className="text-sky-500" />
                      <span className="text-[9px] font-bold text-sky-500">Dr. AI</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            )}
            {error && <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-2.5">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask Dr. AI..."
              className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={!input.trim() || loading} className="w-11 h-11 bg-sky-500 text-white rounded-xl flex items-center justify-center disabled:opacity-40 shrink-0">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 anim-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">AI Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 text-gray-400"><X size={20} /></button>
            </div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">OpenAI API Key</label>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-400" />
            <p className="text-[10px] text-gray-400 mt-1.5">Stored locally only. Get key at <a href="https://platform.openai.com/api-keys" target="_blank" className="text-sky-500 underline">platform.openai.com</a></p>
            <button onClick={() => { saveApiKey(apiKey); setShowSettings(false); }} className="w-full mt-4 py-3 bg-sky-500 text-white rounded-xl font-bold">Save</button>
          </div>
        </div>
      )}

      <Nav />
    </div>
  );
}
