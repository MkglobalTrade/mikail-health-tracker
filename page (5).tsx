'use client';
import { useEffect, useState, useCallback } from 'react';
import { Clock, FileDown } from 'lucide-react';
import Nav from '@/components/Nav';
import { getGlucose, getLabs, getMeds, estimateHbA1c } from '@/lib/store';

type DataType = 'all' | 'glucose' | 'labs' | 'meds';
type DateRange = '7d' | '30d' | '90d' | '1y' | 'all';

export default function HistoryPage() {
  const [dataType, setDataType] = useState<DataType>('all');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [allGlucose, setAllGlucose] = useState<any[]>([]);
  const [allLabs, setAllLabs] = useState<any[]>([]);
  const [allMeds, setAllMeds] = useState<any[]>([]);

  const load = useCallback(() => {
    setAllGlucose(getGlucose());
    setAllLabs(getLabs());
    setAllMeds(getMeds());
  }, []);

  useEffect(() => { load(); }, [load]);

  const getStart = (): Date => {
    const now = new Date();
    switch (dateRange) {
      case '7d': return new Date(now.getTime() - 7 * 86400000);
      case '30d': return new Date(now.getTime() - 30 * 86400000);
      case '90d': return new Date(now.getTime() - 90 * 86400000);
      case '1y': return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      case 'all': return new Date(2000, 0, 1);
    }
  };

  const fg = allGlucose.filter((r: any) => new Date(r.timestamp) >= getStart()).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const fl = allLabs.filter((r: any) => new Date(r.date) >= getStart()).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const fm = allMeds.filter((m: any) => m.isActive);

  const exportPDF = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    let html = `<!DOCTYPE html><html><head><title>GlucoTrack Report</title><style>
    body{font-family:-apple-system,sans-serif;max-width:800px;margin:0 auto;padding:40px 20px;color:#1e293b;font-size:12px}
    h1{color:#0284c7;font-size:20px;border-bottom:2px solid #0ea5e9;padding-bottom:8px}
    h2{color:#0369a1;font-size:15px;margin-top:24px;border-bottom:1px solid #e0f2fe;padding-bottom:5px}
    table{width:100%;border-collapse:collapse;margin:8px 0}
    th{background:#f0f9ff;text-align:left;padding:6px;font-size:10px;color:#0369a1}
    td{padding:5px 6px;border-bottom:1px solid #f1f5f9;font-size:11px}
    .hdr{background:#0284c7;color:white;padding:16px;border-radius:10px;margin-bottom:16px}
    .hdr h1{color:white;border:none;margin:0;padding:0;font-size:18px}
    .hdr p{margin:3px 0;opacity:0.9;font-size:11px}
    .g{color:#16a34a}.y{color:#ca8a04}.r{color:#dc2626}
    </style></head><body>`;

    html += `<div class="hdr"><h1>GlucoTrack Pro — Health Report</h1><p>Patient: Mikail KOCAK</p><p>Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>`;

    if (fg.length > 0 && (dataType === 'all' || dataType === 'glucose')) {
      const vals = fg.map((r: any) => r.value);
      const avg = vals.reduce((a: number, b: number) => a + b, 0) / vals.length;
      html += `<h2>🩸 Glucose Readings</h2><p><b>Avg:</b> ${Math.round(avg)} mg/dL | <b>HbA1c:</b> ${estimateHbA1c(avg)}% | <b>Count:</b> ${fg.length}</p>`;
      html += `<table><tr><th>Date</th><th>Value</th><th>Context</th></tr>`;
      fg.slice(0, 60).forEach((r: any) => {
        html += `<tr><td>${new Date(r.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td><td>${r.value} mg/dL</td><td>${r.mealContext}</td></tr>`;
      });
      html += `</table>`;
    }

    if (fl.length > 0 && (dataType === 'all' || dataType === 'labs')) {
      html += `<h2>🔬 Lab Results</h2><table><tr><th>Test</th><th>Value</th><th>Reference</th><th>Status</th></tr>`;
      fl.forEach((r: any) => {
        const cls = r.status === 'normal' ? 'g' : r.status === 'borderline' ? 'y' : 'r';
        html += `<tr><td>${r.name}</td><td>${r.value} ${r.unit}</td><td>${r.referenceMin}–${r.referenceMax}</td><td class="${cls}">${r.status.toUpperCase()}</td></tr>`;
      });
      html += `</table>`;
    }

    if (fm.length > 0 && (dataType === 'all' || dataType === 'meds')) {
      html += `<h2>💊 Medications</h2><table><tr><th>Name</th><th>Dosage</th><th>Frequency</th><th>Time</th></tr>`;
      fm.forEach((m: any) => {
        html += `<tr><td>${m.name}</td><td>${m.dosage || '-'}</td><td>${m.frequency}</td><td>${m.timeOfDay?.join(', ') || '-'}</td></tr>`;
      });
      html += `</table>`;
    }

    html += `</body></html>`;
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="bg-gradient-to-r from-sky-600 to-sky-400 pt-12 pb-5 px-5 rounded-b-3xl">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={22} className="text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">History</h1>
              <p className="text-sky-100 text-xs">All your records</p>
            </div>
          </div>
          <button onClick={exportPDF} className="flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-lg text-white text-xs font-bold">
            <FileDown size={14} />PDF
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 mt-4">
        {/* Filters */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-3">
          {[{ k: 'all', l: 'All' }, { k: 'glucose', l: '🩸' }, { k: 'labs', l: '🔬' }, { k: 'meds', l: '💊' }].map((f) => (
            <button key={f.k} onClick={() => setDataType(f.k as DataType)} className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg ${dataType === f.k ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-400'}`}>{f.l}</button>
          ))}
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
          {[{ k: '7d', l: '7D' }, { k: '30d', l: '30D' }, { k: '90d', l: '90D' }, { k: '1y', l: '1Y' }, { k: 'all', l: 'All' }].map((r) => (
            <button key={r.k} onClick={() => setDateRange(r.k as DateRange)} className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg ${dateRange === r.k ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-400'}`}>{r.l}</button>
          ))}
        </div>

        {/* Glucose */}
        {(dataType === 'all' || dataType === 'glucose') && fg.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">🩸 Glucose ({fg.length})</p>
            <div className="space-y-1">
              {fg.slice(0, 30).map((r: any) => (
                <div key={r.id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${r.value < 70 ? 'bg-red-400' : r.value <= 140 ? 'bg-emerald-400' : r.value <= 180 ? 'bg-amber-400' : 'bg-red-400'}`} />
                  <span className="font-bold text-sm flex-1">{r.value} <span className="text-xs text-gray-400 font-normal">mg/dL</span></span>
                  <span className="text-[10px] text-gray-400">{new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Labs */}
        {(dataType === 'all' || dataType === 'labs') && fl.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">🔬 Labs ({fl.length})</p>
            <div className="space-y-1">
              {fl.map((r: any) => (
                <div key={r.id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${r.status === 'normal' ? 'bg-emerald-400' : r.status === 'borderline' ? 'bg-amber-400' : 'bg-red-400'}`} />
                  <span className="font-bold text-sm flex-1">{r.name} <span className="text-xs text-gray-400 font-normal">{r.value} {r.unit}</span></span>
                  <span className={`text-[10px] font-bold ${r.status === 'normal' ? 'text-emerald-600' : r.status === 'borderline' ? 'text-amber-600' : 'text-red-600'}`}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meds */}
        {(dataType === 'all' || dataType === 'meds') && fm.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">💊 Meds ({fm.length})</p>
            <div className="space-y-1">
              {fm.map((m: any) => (
                <div key={m.id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-sky-400" />
                  <span className="font-bold text-sm flex-1">{m.name} <span className="text-xs text-gray-400 font-normal">{m.dosage}</span></span>
                  <span className="text-[10px] text-gray-400">{m.timeOfDay?.join(',')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {fg.length === 0 && fl.length === 0 && (
          <div className="text-center py-10">
            <p className="text-4xl mb-2">📋</p>
            <p className="text-gray-400 text-sm">No records yet</p>
          </div>
        )}
      </div>

      <Nav />
    </div>
  );
}
