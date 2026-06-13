'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Activity, FlaskConical, Pill, Bot, Clock, Newspaper } from 'lucide-react';

const TABS = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Track', icon: Activity, path: '/tracker' },
  { label: 'Labs', icon: FlaskConical, path: '/labs' },
  { label: 'Meds', icon: Pill, path: '/meds' },
  { label: 'AI Dr', icon: Bot, path: '/ai-doctor' },
  { label: 'History', icon: Clock, path: '/history' },
  { label: 'News', icon: Newspaper, path: '/news' },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around px-1 py-1.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.path;
          return (
            <button
              key={tab.label}
              onClick={() => router.push(tab.path)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-colors ${
                active ? 'text-sky-600' : 'text-gray-400'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span className={`text-[9px] mt-0.5 ${active ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
