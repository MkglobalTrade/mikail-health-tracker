import MedicationSchedule from '@/components/medications/MedicationSchedule';

export default function MedicationsPage() {
  return (
    <div className="w-full min-h-screen p-4 md:p-6 bg-slate-50 dark:bg-zinc-950">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
          Control de Medicación
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Gestiona tus horarios, dosis y recordatorios diarios.
        </p>
      </header>
      
      <main className="w-full">
        <MedicationSchedule />
      </main>
    </div>
  );
}
