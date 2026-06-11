import Link from 'next/link';

const sections = [
  'dashboard', 'labs', 'glucose', 'medications', 'doctors', 'appointments', 'weight', 'blood-pressure', 'goals', 'reports', 'ai-insights', 'settings'
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <section className="mx-auto max-w-5xl rounded-3xl bg-white p-10 shadow-lg">
        <h1 className="text-4xl font-semibold text-slate-950">MK Health v3</h1>
        <p className="mt-4 text-slate-600">Complete health management with labs, glucose, medications, appointments, goals, AI insights, and notifications.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Link key={section} href={`/${section}`} className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-5 text-slate-900 transition hover:bg-slate-200">
              {section.replace('-', ' ').replace(/\w/g, (c) => c.toUpperCase())}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
