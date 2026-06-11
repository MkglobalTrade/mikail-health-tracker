'use client';

import React from 'react';

export default function MedicationSchedule() {
  // Datos de ejemplo para simular la carga desde Supabase posteriormente
  const horariosEjemplo = [
    { id: 1, nombre: 'Metformina', dosis: '850mg', hora: '08:00 AM', tomado: true },
    { id: 2, nombre: 'Omega 3', dosis: '1000mg', hora: '01:00 PM', tomado: false },
    { id: 3, nombre: 'Presión Arterial (Losartán)', dosis: '50mg', hora: '09:00 PM', tomado: false },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center bg-slate-50 dark:bg-zinc-900/50">
        <h2 className="font-semibold text-slate-800 dark:text-zinc-200">Horario de Hoy</h2>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
          Próxima toma en 2h
        </span>
      </div>
      
      <div className="divide-y divide-slate-100 dark:divide-zinc-800">
        {horariosEjemplo.map((med) => (
          <div key={med.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${med.tomado ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <div>
                <p className="font-medium text-slate-700 dark:text-zinc-300">{med.nombre}</p>
                <p className="text-xs text-slate-400 dark:text-zinc-500">{med.dosis} • {med.hora}</p>
              </div>
            </div>
            
            <button 
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                med.tomado 
                  ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed dark:bg-zinc-800 dark:border-zinc-700' 
                  : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-400'
              }`}
              disabled={med.tomado}
            >
              {med.tomado ? 'Tomado' : 'Marcar como tomado'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
