'use client';
import { useEffect, useState, useCallback } from 'react';
import { Activity, Plus, Trash2, X } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import Nav from '@/components/Nav';
import { getGlucose, addGlucose, removeGlucose, estimateHbA1c } from '@/lib/store';

type Period = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export default function TrackerPage() {
  const [readings, setReadings] = useState<any[]>([]);
  const [period, setPeriod] = useState<Period>('daily');
  const [showAdd, setShowAdd] = useState(false);
  const [value, setValue] = useState('');
  const [meal, setMeal] = useState('fasting');

  const load = useCallback(() => {
    setReadings(getGlucose().sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, []);

  useEffect(() => { load(); }, [load]);

  const getStart = (): Date => {
    const now = new Date();
    switch (period) {
      case 'daily': return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'weekly': return new Date(now.getTime() - 7 * 86400000);
      case 'monthly': return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      case 'quarterly': return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      case 'yearly': return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    }
  };

  const filtered = readings.filter((r: any) => new Date(r.timestamp) >= getStart());
  const chartData = [...filtered]
    .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((r: any) => ({
      label: period === 'daily'
        ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      value: r.value,
    }));

  const stats = filtered.length > 0 ? (() => {
    const vals = filtered.map((r: any) => Number(r.value));
    const avg = vals.reduce((a: number, b: number) => a + b, 0) / vals.length;
    return { avg: Math.round(avg), min: Math.min(...vals), max: Math.max(...vals), hba1c: estimateHbA1c(avg) };
  })() : null;

  const handleAdd = () => {
    if (!value) return;
    addGlucose({
      id: Date.now().toString(),
      value: Number(value),
      timestamp: new Date().toISOString(),
      mealContext: meal,
    });
    setShowAdd(false);
    setValue('');
    setMeal('fasting');
    load();
  };

  const MEAL_ICONS: Record<string, string> = {
    fasting: '🌅', before_meal: '🍽️', after_meal: '🥗', bedtime: '🌙', other: '📝',
  };

  const glucoseColor = (v: number) =>
    v < 70 ? 'bg-red-100 text-red-600' :
    v <= 140 ? 'bg-emerald-100 text-emerald-600' :
    v <= 180 ? 'bg-amber-100 text-amber-600' :
    'bg-red-100 text-red-600';

  const glucoseLabel = (v: number) =>
    v < 70 ? 'Low' : v <= 140 ? 'Normal' : v <= 180 ? 'Elevated' : 'High';

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="bg-gradient-to-r from-sky-600 to-sky-400 pt-12 pb-5 px-5 rounded-b-3xl">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity size={22} className="text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Glucose Tracker</h1>
              <p className="text-sky-100 text-xs">Blood sugar monitoring</p>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Plus size={20} className="text-white" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 mt-4">
        {/* Period selector */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
          {[{ k: 'daily', l: 'Day' }, { k: 'weekly', l: 'Week' }, { k: 'monthly', l: 'Month' }, { k: 'quarterly', l: 'Qtr' }, { k: 'yearly', l: 'Year' }].map((p) => (
            <button key={p.k} onClick={() => setPeriod(p.k as Period)} className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all ${period === p.k ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-400'}`}>
              {p.l}
            </button>
          ))}
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className={`p-3 rounded-xl border ${stats.avg <= 140 ? 'bg-emerald-50 border-emerald-100' : stats.avg <= 180 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'}`}>
              <p className="text-[10px] font-bold uppercase opacity-60">Avg Glucose</p>
              <p className="text-xl font-bold mt-0.5">{stats.avg} <span className="text-xs opacity-60">mg/dL</span></p>
            </div>
            <div className={`p-3 rounded-xl border ${stats.hba1c <= 6.5 ? 'bg-emerald-50 border-emerald-100' : stats.hba1c <= 7.5 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'}`}>
              <p className="text-[10px] font-bold uppercase opacity-60">Est. HbA1c</p>
              <p className="text-xl font-bold mt-0.5">{stats.hba1c} <span className="text-xs opacity-60">%</span></p>
            </div>
            <div className="p-3 rounded-xl border bg-sky-50 border-sky-100">
              <p className="text-[10px] font-bold uppercase opacity-60">Low</p>
              <p className="text-xl font-bold mt-0.5">{stats.min}</p>
            </div>
            <div className="p-3 rounded-xl border bg-sky-50 border-sky-100">
              <p className="text-[10px] font-bold uppercase opacity-60">High</p>
              <p className="text-xl font-bold mt-0.5">{stats.max}</p>
            </div>
          </div>
        )}

        {!stats && (
          <div className="text-center py-10">
            <p className="text-4xl mb-2">📊</p>
            <p className="text-gray-400 text-sm">No readings for this period</p>
            <button onClick={() => setShowAdd(true)} className="mt-3 px-5 py-2 bg-sky-500 text-white rounded-xl text-sm font-bold">Add Reading</button>
          </div>
        )}

        {/* Chart */}
        {chartData.length > 1 && (
          <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Trend</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="glucGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[40, 300]} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '11px', border: '1px solid #e0f2fe' }} />
                  <ReferenceLine y={180} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} />
                  <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} />
                  <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} fill="url(#glucGrad)" dot={{ r: 2, fill: '#0ea5e9' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* HbA1c Gauge */}
        {stats && (
          <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 mb-4">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#e0f2fe" strokeWidth="8" />
                  <circle cx="50" cy="50" r="38" fill="none"
                    stroke={stats.hba1c <= 6.5 ? '#22c55e' : stats.hba1c <= 7.5 ? '#eab308' : '#ef4444'}
                    strokeWidth="8"
                    strokeDasharray={`${Math.min((stats.hba1c / 14) * 239, 239)} 239`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{stats.hba1c}%</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-400" /><span className="text-xs text-gray-600">Normal ≤ 6.5%</span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span className="text-xs text-gray-600">At Risk 6.5–7.5%</span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="text-xs text-gray-600">High &gt; 7.5%</span></div>
                <p className="text-[9px] text-gray-400 mt-1">*ADAG formula estimate</p>
              </div>
            </div>
          </div>
        )}

        {/* Readings list */}
        <div className="space-y-2">
          {filtered.slice(0, 20).map((r: any) => (
            <div key={r.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-lg">{MEAL_ICONS[r.mealContext] || '📝'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{r.value}</span>
                  <span className="text-xs text-gray-400">mg/dL</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${glucoseColor(r.value)}`}>
                    {glucoseLabel(r.value)}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {new Date(r.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {' · '}{(r.mealContext || '').replace('_', ' ')}
                </p>
              </div>
              <button onClick={() => { removeGlucose(r.id); load(); }} className="p-1.5 text-gray-300 active:text-red-400">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 anim-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Log Glucose</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 text-gray-400"><X size={20} /></button>
            </div>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Blood glucose (mg/dL)"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-xl font-bold focus:outline-none focus:ring-2 focus:ring-sky-400 mb-4"
              autoFocus
            />
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[{ k: 'fasting', l: '🌅 Fasting' }, { k: 'before_meal', l: '🍽️ Before' }, { k: 'after_meal', l: '🥗 After' }, { k: 'bedtime', l: '🌙 Bed' }, { k: 'other', l: '📝 Other' }].map((m) => (
                <button key={m.k} onClick={() => setMeal(m.k)} className={`py-2.5 rounded-xl text-xs font-bold ${meal === m.k ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {m.l}
                </button>
              ))}
            </div>
            <button onClick={handleAdd} disabled={!value} className="w-full py-3.5 bg-sky-500 text-white rounded-xl font-bold disabled:opacity-40">
              Save Reading
            </button>
          </div>
        </div>
      )}

      <Nav />
    </div>
  );
}
