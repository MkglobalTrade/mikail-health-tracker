import MedicationsSchedule from '@/components/MedicationsSchedule';

export default function MedicationsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="rounded-3xl bg-white/80 p-8 shadow-sm border border-slate-200">
          <h1 className="text-3xl font-semibold text-slate-900">Medication Management</h1>
          <p className="text-slate-600 mt-2">Track your prescriptions, refills, and reminders in one place.</p>
        </header>
        <MedicationsSchedule />
      </div>
    </main>
  );
}
