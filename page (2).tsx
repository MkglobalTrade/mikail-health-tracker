'use client';
import { useEffect, useState, useCallback } from 'react';
import { FlaskConical, Plus, Trash2, X } from 'lucide-react';
import Nav from '@/components/Nav';
import { getLabs, addLab, removeLab, classifyLab } from '@/lib/store';

// Common lab tests with reference ranges (hospital standard)
const LAB_TESTS = [
  { name: 'Glucose', unit: 'mg/dL', min: 70, max: 100 },
  { name: 'HbA1c', unit: '%', min: 4.0, max: 5.6 },
  { name: 'Total Cholesterol', unit: 'mg/dL', min: 0, max: 200 },
  { name: 'LDL Cholesterol', unit: 'mg/dL', min: 0, max: 100 },
  { name: 'HDL Cholesterol', unit: 'mg/dL', min: 40, max: 60 },
  { name: 'Triglycerides', unit: 'mg/dL', min: 0, max: 150 },
  { name: 'Creatinine', unit: 'mg/dL', min: 0.6, max: 1.2 },
  { name: 'BUN', unit: 'mg/dL', min: 7, max: 20 },
  { name: 'eGFR', unit: 'mL/min', min: 60, max: 120 },
  { name: 'ALT', unit: 'U/L', min: 7, max: 56 },
  { name: 'AST', unit: 'U/L', min: 10, max: 40 },
  { name: 'TSH', unit: 'mIU/L', min: 0.4, max: 4.0 },
  { name: 'Vitamin D', unit: 'ng/mL', min: 30, max: 100 },
  { name: 'B12', unit: 'pg/mL', min: 200, max: 900 },
  { name: 'Sodium', unit: 'mEq/L', min: 136, max: 145 },
  { name: 'Potassium', unit: 'mEq/L', min: 3.5, max: 5.0 },
  { name: 'Hemoglobin', unit: 'g/dL', min: 13.5, max: 17.5 },
  { name: 'WBC', unit: 'x10³/µL', min: 4.5, max: 11.0 },
  { name: 'Platelets', unit: 'x10³/µL', min: 150, max: 400 },
  { name: 'Uric Acid', unit: 'mg/dL', min: 3.5, max: 7.2 },
];

const STATUS_STYLE: Record<string, { bg: string; border: string; label: string }> = {
  normal: { bg: 'bg-emerald-50', border: 'border-emerald-200', label: '✅ Normal' },
  borderline: { bg: 'bg-amber-50', border: 'border-amber-200', label: '⚠️ Borderline' },
  high: { bg: 'bg-red-50', border: 'border-red-200', label: '🔴 High' },
  low: { bg: 'bg-red-50', border: 'border-red-200', label: '🔴 Low' },
  critical: { bg: 'bg-red-100', border: 'border-red-300', label: '🚨 Critical' },
};

export default function LabsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<typeof LAB_TESTS[0] | null>(null);
  const [search, setSearch] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  const load = useCallback(() => {
    setResults(getLabs().sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = () => {
    if (!selected || !formValue) return;
    const v = Number(formValue);
    addLab({
      id: Date.now().toString(),
      name: selected.name,
      value: v,
      unit: selected.unit,
      referenceMin: selected.min,
      referenceMax: selected.max,
      status: classifyLab(v, selected.min, selected.max),
      date: formDate,
    });
    setShowAdd(false);
    setSelected(null);
    setFormValue('');
    load();
  };

  // Group by date
  const grouped = results.reduce((acc: any, r: any) => {
    (acc[r.date] = acc[r.date] || []).push(r);
    return acc;
  }, {});

  const normalCount = results.filter((r: any) => r.status === 'normal').length;
  const borderlineCount = results.filter((r: any) => r.status === 'borderline').length;
  const alertCount = results.filter((r: any) => ['high', 'low', 'critical'].includes(r.status)).length;

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="bg-gradient-to-r from-sky-600 to-sky-400 pt-12 pb-5 px-5 rounded-b-3xl">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FlaskConical size={22} className="text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Lab Results</h1>
              <p className="text-sky-100 text-xs">Track your lab work</p>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Plus size={20} className="text-white" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 mt-4">
        {/* Summary */}
        {results.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-100 text-center">
              <p className="text-xl font-bold text-emerald-600">{normalCount}</p>
              <p className="text-[9px] font-bold text-emerald-500 uppercase">Normal</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-2.5 border border-amber-100 text-center">
              <p className="text-xl font-bold text-amber-600">{borderlineCount}</p>
              <p className="text-[9px] font-bold text-amber-500 uppercase">Borderline</p>
            </div>
            <div className="bg-red-50 rounded-xl p-2.5 border border-red-100 text-center">
              <p className="text-xl font-bold text-red-600">{alertCount}</p>
              <p className="text-[9px] font-bold text-red-500 uppercase">Attention</p>
            </div>
          </div>
        )}

        {/* Grouped results */}
        {Object.keys(grouped).length > 0 ? Object.entries(grouped).map(([date, labs]: [string, any]) => (
          <div key={date} className="mb-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
              {new Date(date + 'T12:00:00').toLocaleDateString([], { weekday: 'short', month: 'long', day: 'numeric' })}
            </p>
            <div className="space-y-2">
              {labs.map((r: any) => {
                const st = STATUS_STYLE[r.status] || STATUS_STYLE.normal;
                return (
                  <div key={r.id} className={`p-3.5 rounded-xl border ${st.bg} ${st.border}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-800">{r.name}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/60">{st.label}</span>
                        </div>
                        <div className="mt-1">
                          <span className="text-xl font-bold">{r.value}</span>
                          <span className="text-xs text-gray-400 ml-1">{r.unit}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">Ref: {r.referenceMin}–{r.referenceMax} {r.unit}</p>
                      </div>
                      <button onClick={() => { removeLab(r.id); load(); }} className="p-1 text-gray-300 active:text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {/* Bar indicator */}
                    <div className="mt-2.5 h-1.5 bg-white/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${r.status === 'normal' ? 'bg-emerald-400' : r.status === 'borderline' ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${Math.max(Math.min(((r.value - r.referenceMin) / (r.referenceMax - r.referenceMin)) * 100, 100), 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )) : (
          <div className="text-center py-10">
            <p className="text-4xl mb-2">🔬</p>
            <p className="text-gray-400 text-sm">No lab results yet</p>
            <button onClick={() => setShowAdd(true)} className="mt-3 px-5 py-2 bg-sky-500 text-white rounded-xl text-sm font-bold">Add Result</button>
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 anim-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Add Lab Result</h2>
              <button onClick={() => { setShowAdd(false); setSelected(null); }} className="p-2 text-gray-400"><X size={20} /></button>
            </div>

            {!selected ? (
              <>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search lab test..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 mb-3" />
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {LAB_TESTS.filter((l) => l.name.toLowerCase().includes(search.toLowerCase())).map((lab) => (
                    <button key={lab.name} onClick={() => setSelected(lab)} className="w-full text-left p-3 bg-gray-50 rounded-xl text-sm hover:bg-sky-50 active:bg-sky-100 transition-colors">
                      <span className="font-medium">{lab.name}</span>
                      <span className="text-xs text-gray-400 ml-2">({lab.min}–{lab.max} {lab.unit})</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 bg-sky-50 rounded-xl mb-4">
                  <span className="font-bold text-sky-800 text-sm">{selected.name}</span>
                  <button onClick={() => setSelected(null)} className="text-xs text-sky-500 font-bold">Change</button>
                </div>
                <input type="number" value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Result value" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-xl font-bold focus:outline-none focus:ring-2 focus:ring-sky-400 mb-3" autoFocus />
                <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 mb-4" />
                <button onClick={handleAdd} disabled={!formValue} className="w-full py-3.5 bg-sky-500 text-white rounded-xl font-bold disabled:opacity-40">Save</button>
              </>
            )}
          </div>
        </div>
      )}

      <Nav />
    </div>
  );
}
