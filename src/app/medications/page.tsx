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
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center bg-slate-50 dark:bg-zinc-900/50">
            <h2 className="font-semibold text-slate-800 dark:text-zinc-200">Horario de Hoy</h2>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
              Próxima toma en 2h
            </span>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-zinc-800 p-4">
            <p className="text-slate-600 dark:text-zinc-400">Próximamente...</p>
          </div>
        </div>
      </main>
    </div>
  );
}
