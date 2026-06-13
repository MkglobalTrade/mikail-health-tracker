'use client';
import { useEffect, useState, useCallback } from 'react';
import { Pill, Plus, Trash2, X, Sparkles, Check } from 'lucide-react';
import Nav from '@/components/Nav';
import { getMeds, addMed, updateMed, removeMed } from '@/lib/store';

// AI Vitamin Timing Database (evidence-based)
const VITAMIN_DB: Record<string, { time: string; reason: string; withFood: boolean }> = {
  'Vitamin D': { time: 'Morning', reason: 'Best with sunlight & fatty meals. May disrupt sleep at night.', withFood: true },
  'Vitamin B12': { time: 'Morning', reason: 'Boosts energy. Can interfere with sleep.', withFood: false },
  'Vitamin C': { time: 'Morning/Afternoon', reason: 'Split doses improve absorption.', withFood: false },
  'Iron': { time: 'Morning', reason: 'Best on empty stomach. Avoid with calcium.', withFood: false },
  'Calcium': { time: 'Evening', reason: 'Promotes sleep. Separate from iron 2+ hours.', withFood: true },
  'Magnesium': { time: 'Evening', reason: 'Relaxes muscles, promotes sleep.', withFood: true },
  'Zinc': { time: 'Morning', reason: 'Best on empty stomach.', withFood: false },
  'Omega-3': { time: 'Morning', reason: 'With fatty meal. Fishy aftertaste at night.', withFood: true },
  'Probiotics': { time: 'Morning', reason: '30 min before breakfast, empty stomach.', withFood: false },
  'CoQ10': { time: 'Morning', reason: 'Fat-soluble, energizing. May cause insomnia.', withFood: true },
  'Metformin': { time: 'With meals', reason: 'Reduces GI effects. Evening dose helps dawn phenomenon.', withFood: true },
  'Berberine': { time: 'Before meals', reason: '30 min before meals for blood sugar control.', withFood: false },
  'Chromium': { time: 'Morning', reason: 'With breakfast for blood sugar regulation.', withFood: true },
  'Alpha Lipoic Acid': { time: 'Morning', reason: 'Empty stomach, 30 min before meals.', withFood: false },
  'Cinnamon': { time: 'Before meals', reason: 'Before meals for glucose management.', withFood: true },
  'Turmeric': { time: 'With meals', reason: 'Needs black pepper & fat for absorption.', withFood: true },
  'Melatonin': { time: 'Night', reason: '30-60 min before sleep.', withFood: false },
  'Ashwagandha': { time: 'Evening', reason: 'Promotes relaxation and sleep.', withFood: true },
  'Biotin': { time: 'Morning', reason: 'Water-soluble B vitamin. Morning for consistency.', withFood: false },
  'Folic Acid': { time: 'Morning', reason: 'B vitamin. Empty stomach for absorption.', withFood: false },
  'Fiber': { time: 'Morning', reason: 'With water, before meals for glucose control.', withFood: true },
  'Vitamin A': { time: 'Morning', reason: 'Fat-soluble. Take with healthy fats.', withFood: true },
  'Vitamin E': { time: 'Evening', reason: 'Fat-soluble. Take with dinner.', withFood: true },
  'Vitamin K': { time: 'Evening', reason: 'Fat-soluble. Works with Vitamin D.', withFood: true },
  'Curcumin': { time: 'With meals', reason: 'Needs black pepper & fat for absorption.', withFood: true },
};

function getAiTip(name: string) {
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(VITAMIN_DB)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) return val;
  }
  return null;
}

const FREQS = [
  { key: 'once_daily', label: 'Once daily' },
  { key: 'twice_daily', label: 'Twice daily' },
  { key: 'three_times', label: '3x daily' },
  { key: 'as_needed', label: 'As needed' },
  { key: 'weekly', label: 'Weekly' },
];

export default function MedsPage() {
  const [meds, setMeds] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<'all' | 'day' | 'night'>('all');
  const [form, setForm] = useState({ name: '', dosage: '', frequency: 'once_daily', timeOfDay: ['morning'] as string[], category: 'medication' });

  const load = useCallback(() => setMeds(getMeds()), []);
  useEffect(() => { load(); }, [load]);

  const handleAdd = () => {
    if (!form.name) return;
    const ai = getAiTip(form.name);
    addMed({
      id: Date.now().toString(),
      name: form.name,
      dosage: form.dosage,
      frequency: form.frequency,
      timeOfDay: form.timeOfDay,
      category: form.category,
      aiTip: ai ? `${ai.time} — ${ai.reason}${ai.withFood ? ' 🍽️ With food' : ' 💧 Empty stomach'}` : undefined,
      isActive: true,
    });
    setShowAdd(false);
    setForm({ name: '', dosage: '', frequency: 'once_daily', timeOfDay: ['morning'], category: 'medication' });
    load();
  };

  const toggleTime = (t: string) => {
    setForm({
      ...form,
      timeOfDay: form.timeOfDay.includes(t) ? form.timeOfDay.filter((x) => x !== t) : [...form.timeOfDay, t],
    });
  };

  const active = meds.filter((m: any) => m.isActive);
  const inactive = meds.filter((m: any) => !m.isActive);

  const sections = [
    { title: '🌅 Morning', items: active.filter((m: any) => m.timeOfDay?.includes('morning')) },
    { title: '☀️ Afternoon', items: active.filter((m: any) => m.timeOfDay?.includes('afternoon')) },
    { title: '🌆 Evening', items: active.filter((m: any) => m.timeOfDay?.includes('evening')) },
    { title: '🌙 Night', items: active.filter((m: any) => m.timeOfDay?.includes('night')) },
  ];

  const visible = filter === 'all' ? sections : filter === 'day' ? sections.slice(0, 2) : sections.slice(2);

  const catEmoji = (c: string) => c === 'insulin' ? '💉' : c === 'vitamin' ? '🧬' : c === 'supplement' ? '🌿' : '💊';

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="bg-gradient-to-r from-sky-600 to-sky-400 pt-12 pb-5 px-5 rounded-b-3xl">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Pill size={22} className="text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Medications</h1>
              <p className="text-sky-100 text-xs">{active.length} active</p>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Plus size={20} className="text-white" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 mt-4">
        {/* Day/Night filter */}
        <div className="flex gap-2 mb-4">
          {[{ k: 'all', l: 'All' }, { k: 'day', l: '☀️ Day' }, { k: 'night', l: '🌙 Night' }].map((f) => (
            <button key={f.k} onClick={() => setFilter(f.k as any)} className={`flex-1 py-2 rounded-xl text-xs font-bold ${filter === f.k ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {f.l}
            </button>
          ))}
        </div>

        {meds.length > 0 ? (
          <>
            {visible.map((s) => s.items.length > 0 && (
              <div key={s.title} className="mb-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">{s.title}</p>
                <div className="space-y-2">
                  {s.items.map((m: any) => (
                    <div key={m.id} className="p-3.5 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-start gap-3">
                        <span className="text-lg">{catEmoji(m.category)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-sm">{m.name}</span>
                            {m.dosage && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{m.dosage}</span>}
                            {m.aiTip && <span className="text-[9px] font-bold text-sky-500 bg-sky-50 px-1.5 py-0.5 rounded-full"><Sparkles size={9} className="inline" /> AI</span>}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">{FREQS.find((f) => f.key === m.frequency)?.label} · {m.timeOfDay?.join(', ')}</p>
                          {m.aiTip && (
                            <div className="mt-2 p-2 bg-sky-50 rounded-lg border border-sky-100">
                              <p className="text-[10px] text-sky-700 leading-relaxed"><span className="font-bold">✨ AI Tip:</span> {m.aiTip}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <button onClick={() => { updateMed(m.id, { isActive: !m.isActive }); load(); }} className={`p-1 ${m.isActive ? 'text-emerald-500' : 'text-gray-300'}`}><Check size={16} /></button>
                          <button onClick={() => { removeMed(m.id); load(); }} className="p-1 text-gray-300 active:text-red-400"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {filter === 'all' && inactive.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">💤 Inactive</p>
                <div className="space-y-2">
                  {inactive.map((m: any) => (
                    <div key={m.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 opacity-50 flex items-center gap-3">
                      <span>{catEmoji(m.category)}</span>
                      <span className="flex-1 font-bold text-sm text-gray-500">{m.name}</span>
                      <button onClick={() => { updateMed(m.id, { isActive: true }); load(); }} className="p-1 text-gray-300"><Check size={16} /></button>
                      <button onClick={() => { removeMed(m.id); load(); }} className="p-1 text-gray-300"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-4xl mb-2">💊</p>
            <p className="text-gray-400 text-sm">No medications yet</p>
            <button onClick={() => setShowAdd(true)} className="mt-3 px-5 py-2 bg-sky-500 text-white rounded-xl text-sm font-bold">Add Medication</button>
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 anim-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Add Medication</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 text-gray-400"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Metformin, Vitamin D" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" autoFocus />
                {form.name && getAiTip(form.name) && (
                  <div className="mt-2 p-2.5 bg-sky-50 rounded-xl border border-sky-100">
                    <p className="text-xs font-bold text-sky-600"><Sparkles size={10} className="inline" /> Best: {getAiTip(form.name)!.time}</p>
                    <p className="text-[10px] text-sky-700 mt-0.5">{getAiTip(form.name)!.reason}</p>
                    <p className="text-[10px] text-sky-600 mt-0.5">{getAiTip(form.name)!.withFood ? '🍽️ Take with food' : '💧 Take on empty stomach'}</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="Dosage (500mg)" className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
                  {FREQS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Category</p>
                <div className="grid grid-cols-4 gap-1">
                  {[{ k: 'medication', l: '💊 Med' }, { k: 'vitamin', l: '🧬 Vit' }, { k: 'supplement', l: '🌿 Supp' }, { k: 'insulin', l: '💉 Ins' }].map((c) => (
                    <button key={c.k} onClick={() => setForm({ ...form, category: c.k })} className={`py-2 rounded-lg text-[10px] font-bold ${form.category === c.k ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{c.l}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Time of Day</p>
                <div className="grid grid-cols-4 gap-1">
                  {[{ k: 'morning', l: '🌅 AM' }, { k: 'afternoon', l: '☀️ Mid' }, { k: 'evening', l: '🌆 PM' }, { k: 'night', l: '🌙 Bed' }].map((t) => (
                    <button key={t.k} onClick={() => toggleTime(t.k)} className={`py-2 rounded-lg text-[10px] font-bold ${form.timeOfDay.includes(t.k) ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{t.l}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleAdd} disabled={!form.name} className="w-full py-3.5 bg-sky-500 text-white rounded-xl font-bold disabled:opacity-40">Add Medication</button>
            </div>
          </div>
        </div>
      )}

      <Nav />
    </div>
  );
}
