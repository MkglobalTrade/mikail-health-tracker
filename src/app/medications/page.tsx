'use client';

import React, { useState } from 'react';

// ==========================================
// COMPONENTE: MedicationSchedule (Inline)
// ==========================================
function MedicationSchedule() {
  // Datos de prueba locales (Próximamente conectados a tu esquema de Supabase)
  const [medicaciones, setMedicaciones] = useState([
    { id: 1, nombre: 'Metformina', dosis: '850mg', hora: '08:00 AM', tomado: true, tipo: 'Pastilla' },
    { id: 2, nombre: 'Omega 3', dosis: '1000mg', hora: '01:00 PM', tomado: false, tipo: 'Cápsula' },
    { id: 3, nombre: 'Losartán (Presión)', dosis: '50mg', hora: '09:00 PM', tomado: false, tipo: 'Pastilla' },
  ]);

  const toggleTomado = (id: number) => {
    setMedicaciones(prev =>
      prev.map(med => (med.id === id ? { ...med, tomado: !med.tomado } : med))
    );
  };

  const pendientes = medicaciones.filter(m => !m.tomado).length;

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors">
      {/* Cabecera de la tarjeta */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900/50">
        <div>
          <h2 className="font-semibold text-slate-800 dark:text-zinc-200 text-base md:text-lg">
            Horario de Hoy
          </h2>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
            Tienes {pendientes} tomas pendientes
          </p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${
          pendientes === 0 
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
        }`}>
          {pendientes === 0 ? '¡Todo al día!' : `Pendientes: ${pendientes}`}
        </span>
      </div>
      
      {/* Lista de Medicamentos */}
      <div className="divide-y divide-slate-100 dark:divide-zinc-800">
        {medicaciones.map((med) => (
          <div 
            key={med.id} 
            className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/30 dark:hover:bg-zinc-900/20 transition-colors gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Indicador de estado */}
              <div className={`w-3 h-3 rounded-full shrink-0 shadow-sm transition-all duration-300 ${
                med.tomado ? 'bg-emerald-500 scale-110' : 'bg-amber-500 pulse'
              }`} />
              
              {/* Información del Medicamento */}
              <div className="truncate">
                <p className={`font-semibold text-sm sm:text-base text-slate-700 dark:text-zinc-300 truncate ${
                  med.tomado ? 'line-through text-slate-400 dark:text-zinc-500 font-normal' : ''
                }`}>
                  {med.nombre}
                </p>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded text-[10px]">
                    {med.tipo}
                  </span>
                  • {med.dosis} • <span className="font-medium text-slate-500 dark:text-zinc-400">{med.hora}</span>
                </p>
              </div>
            </div>
            
            {/* Botón de Acción Táctil (Optimizado para móvil) */}
            <button 
              onClick={() => toggleTomado(med.id)}
              className={`text-xs font-medium px-4 py-2 rounded-xl border transition-all shrink-0 active:scale-95 select-none ${
                med.tomado 
                  ? 'bg-slate-100 border-transparent text-slate-400 dark:bg-zinc-800 dark:text-zinc-500' 
                  : 'bg-indigo-600 border-indigo-600 text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-500 dark:border-indigo-500 dark:hover:bg-indigo-600'
              }`}
            >
              {med.tomado ? 'Tomado ✓' : 'Marcar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// VISTA PRINCIPAL: /medications
// ==========================================
export default function MedicationsPage() {
  return (
    <div className="w-full min-h-screen p-4 sm:p-6 md:p-8 bg-slate-50 dark:bg-zinc-950 transition-colors">
      <div className="w-full max-w-2xl mx-auto">
        {/* Encabezado */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl sm:text-2xl">💊</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50">
              Control de Medicación
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 pl-1">
            Gestiona tus horarios, dosis y recordatorios diarios de salud de forma simple.
          </p>
        </header>
        
        {/* Contenido Principal */}
        <main className="w-full">
          <MedicationSchedule />
        </main>
      </div>
    </div>
  );
}
