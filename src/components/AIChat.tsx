'use client';
import { useState } from 'react';

const mockResponses: Record<string, string> = {
  'what is my latest glucose level': 'Your most recent glucose reading was 132 mg/dL, which is in the warning range. Keep hydrated and monitor post-meal readings.',
  'what should i do if my blood sugar is high': 'If your blood sugar is high, follow your doctor’s plan, stay hydrated, and avoid fast-acting carbohydrates while resting for 30 minutes.',
  'how often should i check glucose': 'For daily monitoring, check fasting glucose in the morning and 1-2 hours after meals, especially if you are managing diabetes.',
  'list my medications': 'You are currently taking Metformin, Atorvastatin, Lisinopril, and Vitamin D3. Follow the schedule shown in your medications module.'
};

export default function AIChat() {
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState<{ role: 'user' | 'assistant'; message: string }[]>([
    { role: 'assistant', message: 'Hello! Ask me about your lab results, glucose levels, or medications.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const getResponse = (query: string) => {
    const normalized = query.toLowerCase().trim();
    return mockResponses[normalized] || 'I’m here to help. Please ask about your labs, glucose, medications, or doctors.';
  };

  const handleSend = () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user' as const, message: chatInput.trim() };
    setChatLog((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsLoading(true);

    setTimeout(() => {
      const response = getResponse(chatInput);
      setChatLog((prev) => [...prev, { role: 'assistant', message: response }]);
      setIsLoading(false);
    }, 700);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm max-w-5xl mx-auto my-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Health Assistant</h2>
          <p className="text-sm text-gray-600 mt-1">Ask questions about your health data, medications, and lab results.</p>
        </div>
        <div className="rounded-lg bg-blue-50 px-4 py-3 text-blue-700 text-sm">
          Sample question: <span className="font-semibold">What is my latest glucose level?</span>
        </div>
      </div>

      <div className="space-y-3 mb-4 max-h-[360px] overflow-y-auto pr-2">
        {chatLog.map((message, index) => (
          <div
            key={index}
            className={`rounded-2xl p-4 ${message.role === 'user' ? 'bg-blue-600 text-white self-end ml-auto' : 'bg-gray-100 text-gray-900'}`}
          >
            <p className="text-sm leading-6">{message.message}</p>
            <span className="block text-[10px] uppercase tracking-[0.2em] mt-2 opacity-70">
              {message.role}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          type="text"
          placeholder="Ask a health question..."
          className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!chatInput.trim() || isLoading}
        >
          {isLoading ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
