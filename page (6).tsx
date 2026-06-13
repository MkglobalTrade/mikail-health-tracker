'use client';
import { useState, useCallback } from 'react';
import { Newspaper, RefreshCw, ExternalLink, Clock } from 'lucide-react';
import Nav from '@/components/Nav';

const CATEGORIES: Record<string, { label: string; style: string; emoji: string }> = {
  longevity: { label: 'Longevity', style: 'bg-violet-100 text-violet-700', emoji: '🧬' },
  diabetes: { label: 'Diabetes', style: 'bg-sky-100 text-sky-700', emoji: '🩸' },
  medicine: { label: 'Medicine', style: 'bg-emerald-100 text-emerald-700', emoji: '⚕️' },
  wellness: { label: 'Wellness', style: 'bg-amber-100 text-amber-700', emoji: '🌿' },
};

const NEWS_DATA = [
  { id: '1', title: 'ADA Standards of Care: Key Updates for Diabetes Management', summary: 'Updated recommendations for CGM, SGLT2 inhibitors, and personalized treatment targets.', source: 'ADA', url: 'https://diabetes.org/clinical-resources', category: 'diabetes', publishedAt: new Date().toISOString(), readTime: '8 min' },
  { id: '2', title: 'New GLP-1 Agonists Show Promise for Diabetes Reversal', summary: 'Next-gen GLP-1 receptor agonists may help achieve diabetes remission in certain patients.', source: 'Nature Medicine', url: 'https://nature.com/nm', category: 'diabetes', publishedAt: new Date(Date.now() - 2 * 36e5).toISOString(), readTime: '6 min' },
  { id: '3', title: '5 Evidence-Based Strategies to Extend Healthspan', summary: 'Intermittent fasting, exercise timing, and targeted supplementation for longevity.', source: 'Cell Metabolism', url: 'https://cell.com/cell-metabolism', category: 'longevity', publishedAt: new Date(Date.now() - 4 * 36e5).toISOString(), readTime: '7 min' },
  { id: '4', title: 'AI Blood Glucose Prediction Achieves 95% Accuracy', summary: 'ML models predict glucose 30 minutes ahead, transforming real-time management.', source: 'Lancet Digital Health', url: 'https://thelancet.com', category: 'medicine', publishedAt: new Date(Date.now() - 6 * 36e5).toISOString(), readTime: '5 min' },
  { id: '5', title: 'Mediterranean Diet + Time-Restricted Eating Improves Insulin Sensitivity', summary: '10-hour eating window with Mediterranean diet reduces HbA1c significantly.', source: 'Diabetes Care', url: 'https://diabetesjournals.org/care', category: 'wellness', publishedAt: new Date(Date.now() - 8 * 36e5).toISOString(), readTime: '4 min' },
  { id: '6', title: 'Senolytics: Removing Zombie Cells Could Add Decades to Lifespan', summary: 'Senolytic drugs clear senescent cells, reducing age-related inflammation.', source: 'Science Transl Med', url: 'https://science.org', category: 'longevity', publishedAt: new Date(Date.now() - 12 * 36e5).toISOString(), readTime: '6 min' },
  { id: '7', title: 'CGMs Now Recommended for All Type 2 Diabetes Patients', summary: 'Major societies now recommend CGM for all T2D patients, not just insulin users.', source: 'Endocrine Society', url: 'https://endocrine.org', category: 'diabetes', publishedAt: new Date(Date.now() - 16 * 36e5).toISOString(), readTime: '5 min' },
  { id: '8', title: 'Biomarker Panel Predicts Diabetes Complications 5 Years Early', summary: 'Biomarkers predict nephropathy, retinopathy, neuropathy before clinical onset.', source: 'JAMA', url: 'https://jamanetwork.com', category: 'medicine', publishedAt: new Date(Date.now() - 20 * 36e5).toISOString(), readTime: '7 min' },
  { id: '9', title: 'Sleep Quality Directly Impacts Next-Day Blood Glucose', summary: 'Poor sleep and irregular patterns significantly affect glucose control.', source: 'Sleep Med Reviews', url: 'https://sciencedirect.com', category: 'wellness', publishedAt: new Date(Date.now() - 24 * 36e5).toISOString(), readTime: '5 min' },
  { id: '10', title: 'NAD+ Supplementation Shows Anti-Aging Benefits', summary: 'Nicotinamide riboside improves biological aging markers and metabolic function.', source: 'Nature Aging', url: 'https://nature.com/nataging', category: 'longevity', publishedAt: new Date(Date.now() - 28 * 36e5).toISOString(), readTime: '6 min' },
];

export default function NewsPage() {
  const [news] = useState(NEWS_DATA);
  const [category, setCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setRefreshing(false);
  }, []);

  const filtered = category === 'all' ? news : news.filter((n) => n.category === category);

  const timeAgo = (d: string) => {
    const h = Math.floor((Date.now() - new Date(d).getTime()) / 36e5);
    if (h < 1) return 'Now';
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="bg-gradient-to-r from-sky-600 to-sky-400 pt-12 pb-5 px-5 rounded-b-3xl">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Newspaper size={22} className="text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Medical News</h1>
              <p className="text-sky-100 text-xs">AI-curated updates</p>
            </div>
          </div>
          <button onClick={refresh} disabled={refreshing} className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <RefreshCw size={16} className={`text-white ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 mt-4">
        {/* Category filter */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4 overflow-x-auto">
          {[{ k: 'all', l: 'All' }, { k: 'diabetes', l: '🩸' }, { k: 'longevity', l: '🧬' }, { k: 'medicine', l: '⚕️' }, { k: 'wellness', l: '🌿' }].map((c) => (
            <button key={c.k} onClick={() => setCategory(c.k)} className={`whitespace-nowrap px-3 py-1.5 text-[11px] font-bold rounded-lg ${category === c.k ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-400'}`}>{c.l}</button>
          ))}
        </div>

        {/* Featured */}
        {filtered.length > 0 && (
          <a href={filtered[0].url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl border border-sky-100 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${CATEGORIES[filtered[0].category].style}`}>{CATEGORIES[filtered[0].category].emoji} {CATEGORIES[filtered[0].category].label}</span>
              {filtered[0].readTime && <span className="text-[9px] text-gray-400 flex items-center gap-0.5"><Clock size={8} />{filtered[0].readTime}</span>}
            </div>
            <h3 className="font-bold text-sm leading-snug mb-1">{filtered[0].title}</h3>
            <p className="text-xs text-gray-500">{filtered[0].summary}</p>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-gray-400">{filtered[0].source}</span>
              <span className="text-[10px] text-sky-500 flex items-center gap-0.5">Read <ExternalLink size={8} /></span>
            </div>
          </a>
        )}

        {/* List */}
        <div className="space-y-2">
          {filtered.slice(1).map((item) => {
            const cat = CATEGORIES[item.category];
            return (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-start gap-2.5">
                  <span className="text-lg shrink-0">{cat.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${cat.style}`}>{cat.label}</span>
                      <span className="text-[8px] text-gray-400">{timeAgo(item.publishedAt)}</span>
                    </div>
                    <h4 className="font-bold text-xs leading-snug">{item.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{item.summary}</p>
                    <span className="text-[9px] text-gray-300">{item.source}</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-10">
            <p className="text-4xl mb-2">📰</p>
            <p className="text-gray-400 text-sm">No news in this category</p>
          </div>
        )}
      </div>

      <Nav />
    </div>
  );
}
