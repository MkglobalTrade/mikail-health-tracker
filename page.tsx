'use client';
import { useEffect, useState } from 'react';
import { Calendar, Heart, ChevronRight } from 'lucide-react';
import Nav from '@/components/Nav';
import { getProfile, getGlucose, estimateHbA1c, getMeds } from '@/lib/store';

export default function HomePage() {
  const [profile, setProfile] = useState({ name: 'Mikail KOCAK', birthDate: '1979-07-23', photoUrl: '' });
  const [todayAvg, setTodayAvg] = useState<number | null>(null);
  const [todayHbA1c, setTodayHbA1c] = useState<number | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [activeMeds, setActiveMeds] = useState(0);
  const [greeting, setGreeting] = useState('Good Morning');

  useEffect(() => {
    setProfile(getProfile());
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening');

    const readings = getGlucose();
    const today = new Date().toISOString().split('T')[0];
    const todayReadings = readings.filter((r: any) => r.timestamp && r.timestamp.startsWith(today));
    if (todayReadings.length > 0) {
      const vals = todayReadings.map((r: any) => Number(r.value));
      const avg = vals.reduce((a: number, b: number) => a + b, 0) / vals.length;
      setTodayAvg(Math.round(avg));
      setTodayHbA1c(estimateHbA1c(avg));
    }
    setTodayCount(todayReadings.length);
    setActiveMeds(getMeds().filter((m: any) => m.isActive).length);
  }, []);

  const calcAge = () => {
    const birth = new Date('1979-07-23');
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  };

  const daysToBirthday = () => {
    const birth = new Date('1979-07-23');
    const now = new Date();
    const next = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (next < now) next.setFullYear(next.getFullYear() + 1);
    return Math.ceil((next.getTime() - now.getTime()) / 86400000);
  };

  const colorFor = (val: number, green: number, yellow: number) =>
    val <= green ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
    val <= yellow ? 'bg-amber-50 text-amber-700 border-amber-100' :
    'bg-red-50 text-red-700 border-red-100';

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-400 pt-14 pb-8 px-5 rounded-b-3xl">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sky-100 text-sm font-medium">{greeting} 👋</p>
              <h1 className="text-2xl font-bold text-white mt-0.5">{profile.name}</h1>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center border-2 border-white/30">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <span className="text-lg font-bold text-white">MK</span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 bg-white/15 rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-white" />
                <span className="text-sky-100 text-[10px] font-bold uppercase">Age</span>
              </div>
              <p className="text-white text-lg font-bold mt-1">{calcAge()}</p>
              <p className="text-sky-200 text-[10px]">Born July 23, 1979</p>
            </div>
            <div className="flex-1 bg-white/15 rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-2">
                <Heart size={14} className="text-white" />
                <span className="text-sky-100 text-[10px] font-bold uppercase">Birthday</span>
              </div>
              <p className="text-white text-lg font-bold mt-1">{daysToBirthday()}d</p>
              <p className="text-sky-200 text-[10px]">Until next birthday</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 mt-5">
        {/* Stats */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Today&apos;s Overview</p>
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-2xl border p-3 ${todayAvg ? colorFor(todayAvg, 140, 180) : 'bg-sky-50 text-sky-700 border-sky-100'}`}>
            <p className="text-[10px] font-bold uppercase opacity-60">Avg Glucose</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold">{todayAvg ?? '—'}</span>
              <span className="text-xs opacity-60">mg/dL</span>
            </div>
          </div>
          <div className={`rounded-2xl border p-3 ${todayHbA1c ? colorFor(todayHbA1c, 6.5, 7.5) : 'bg-sky-50 text-sky-700 border-sky-100'}`}>
            <p className="text-[10px] font-bold uppercase opacity-60">Est. HbA1c</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold">{todayHbA1c ?? '—'}</span>
              <span className="text-xs opacity-60">%</span>
            </div>
          </div>
          <div className="rounded-2xl border p-3 bg-sky-50 text-sky-700 border-sky-100">
            <p className="text-[10px] font-bold uppercase opacity-60">Readings</p>
            <p className="text-xl font-bold mt-1">{todayCount}</p>
          </div>
          <div className="rounded-2xl border p-3 bg-sky-50 text-sky-700 border-sky-100">
            <p className="text-[10px] font-bold uppercase opacity-60">Active Meds</p>
            <p className="text-xl font-bold mt-1">{activeMeds}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-6 mb-3">Quick Actions</p>
        <div className="space-y-2">
          {[
            { label: 'Log Glucose', emoji: '🩸', href: '/tracker' },
            { label: 'Upload Lab Results', emoji: '🔬', href: '/labs' },
            { label: 'My Medications', emoji: '💊', href: '/meds' },
            { label: 'Ask AI Doctor', emoji: '🤖', href: '/ai-doctor' },
            { label: 'Medical News', emoji: '📰', href: '/news' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100 active:bg-sky-50 transition-colors"
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="flex-1 font-semibold text-gray-800 text-sm">{item.label}</span>
              <ChevronRight size={16} className="text-gray-300" />
            </a>
          ))}
        </div>

        {/* Glucose Targets */}
        <div className="mt-6 p-4 bg-sky-50 rounded-2xl border border-sky-100">
          <p className="font-bold text-sky-800 text-sm mb-2">📊 ADA Glucose Targets</p>
          {[
            { label: 'Fasting', range: '80–130 mg/dL', color: 'bg-emerald-400' },
            { label: 'Before Meal', range: '80–130 mg/dL', color: 'bg-sky-400' },
            { label: 'After Meal (2hr)', range: '< 180 mg/dL', color: 'bg-amber-400' },
            { label: 'Bedtime', range: '100–140 mg/dL', color: 'bg-indigo-400' },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-2 py-1">
              <div className={`w-2 h-2 rounded-full ${t.color}`} />
              <span className="text-xs text-gray-600 flex-1">{t.label}</span>
              <span className="text-xs font-bold text-gray-800">{t.range}</span>
            </div>
          ))}
        </div>
      </div>

      <Nav />
    </div>
  );
}
