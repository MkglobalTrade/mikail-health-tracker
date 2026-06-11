'use client';
import { useState } from 'react';
import { Medication } from '@/types/health';

export default function MedicationManager() {
  const [meds] = useState<Medication[]>([
    {
      id: '1',
      name: 'Metformina',
      dose: '850mg',
      schedule: { morning: true, afternoon: false, night: true },
      doctor: 'Dr. Alejandro Ríos',
      startDate: '2026-01-15',
      endDate: '2026-07-15',
      notes: 'Tomar junto con las comidas principales.',
      remindersActive: true
    }
  ]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm max-w-4xl mx-auto my-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">💊 MEDICATION PAGE</h2>
      
      <div className="space-y-4">
        {meds.map((med) => (
          <div key={med.id} className="border rounded-xl p-4 bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{med.name} <span className="text-sm font-normal text-gray-500">({med.dose})</span></h3>
                <p className="text-xs text-gray-500">Médico: {med.doctor} | {med.startDate} al {med.endDate}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full font-semibold ${med.remindersActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {med.remindersActive ? '🔔 Recordatorios Activos' : '🔕 Silenciado'}
              </span>
            </div>

            {/* Timeline de Horarios */}
            <div className="mt-4 flex gap-2">
              <span className={`px-3 py-1 rounded text-xs font-medium ${med.schedule.morning ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>Mañana</span>
              <span className={`px-3 py-1 rounded text-xs font-medium ${med.schedule.afternoon ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>Tarde</span>
              <span className={`px-3 py-1 rounded text-xs font-medium ${med.schedule.night ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>Noche</span>
            </div>

            {med.notes && <p className="text-xs bg-white p-2 border rounded mt-3 text-gray-600 italic">Nota: {med.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
