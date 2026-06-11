'use client';
import { useState } from 'react';
import { Medication } from '@/types/health';
import { Clock, Check } from 'lucide-react';

export default function MedicationsSchedule() {
  const [medications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Metformin',
      dose: '850mg',
      schedule: { morning: true, afternoon: false, night: true },
      doctor: 'Dr. Alexander Rodriguez',
      startDate: '2026-01-15',
      endDate: '2026-12-31',
      notes: 'Take with meals to reduce stomach upset',
      remindersActive: true
    },
    {
      id: '2',
      name: 'Atorvastatin',
      dose: '20mg',
      schedule: { morning: false, afternoon: false, night: true },
      doctor: 'Dr. Maria Garcia',
      startDate: '2026-02-20',
      endDate: '2026-12-31',
      notes: 'Take before bedtime for maximum effectiveness',
      remindersActive: true
    },
    {
      id: '3',
      name: 'Lisinopril',
      dose: '10mg',
      schedule: { morning: true, afternoon: false, night: false },
      doctor: 'Dr. Maria Garcia',
      startDate: '2026-01-10',
      endDate: '2026-12-31',
      notes: 'Blood pressure medication - take consistently',
      remindersActive: true
    },
    {
      id: '4',
      name: 'Vitamin D3',
      dose: '2000 IU',
      schedule: { morning: true, afternoon: false, night: false },
      doctor: 'Dr. Sarah Williams',
      startDate: '2026-03-01',
      endDate: '2026-12-31',
      notes: 'Supplement for bone health',
      remindersActive: false
    },
  ]);

  const morningMeds = medications.filter(m => m.schedule.morning);
  const afternoonMeds = medications.filter(m => m.schedule.afternoon);
  const nightMeds = medications.filter(m => m.schedule.night);

  const MedicationCard = ({ medication }: { medication: Medication }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{medication.name}</h3>
          <p className="text-sm text-blue-600 font-semibold">{medication.dose}</p>
        </div>
        {medication.remindersActive && (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Check className="w-3 h-3" /> Active
          </span>
        )}
      </div>
      <p className="text-xs text-gray-600 mb-2">Prescribed by: {medication.doctor}</p>
      <p className="text-xs text-gray-700 italic">{medication.notes}</p>
      <p className="text-xs text-gray-500 mt-2">
        {medication.startDate} to {medication.endDate}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-blue-600">Medication Schedule</h1>
        </div>
        <p className="text-gray-600">Manage your medications and daily reminders</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500">
          <p className="text-sm text-gray-600">Morning Meds</p>
          <p className="text-3xl font-bold text-orange-600">{morningMeds.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600">Afternoon Meds</p>
          <p className="text-3xl font-bold text-yellow-600">{afternoonMeds.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
          <p className="text-sm text-gray-600">Evening Meds</p>
          <p className="text-3xl font-bold text-purple-600">{nightMeds.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Total Active</p>
          <p className="text-3xl font-bold text-blue-600">{medications.length}</p>
        </div>
      </div>

      {/* Daily Schedule */}
      <div className="space-y-6">
        {/* Morning */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-lg">🌅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Morning</h2>
            <span className="text-sm text-gray-600">Recommended 7:00 AM</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {morningMeds.length > 0 ? (
              morningMeds.map(med => <MedicationCard key={med.id} medication={med} />)
            ) : (
              <p className="text-gray-500 italic">No medications scheduled</p>
            )}
          </div>
        </div>

        {/* Afternoon */}
        {afternoonMeds.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-lg">☀️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Afternoon</h2>
              <span className="text-sm text-gray-600">Recommended 1:00 PM</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {afternoonMeds.map(med => <MedicationCard key={med.id} medication={med} />)}
            </div>
          </div>
        )}

        {/* Evening */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-lg">🌙</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Evening</h2>
            <span className="text-sm text-gray-600">Recommended 8:00 PM</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nightMeds.length > 0 ? (
              nightMeds.map(med => <MedicationCard key={med.id} medication={med} />)
            ) : (
              <p className="text-gray-500 italic">No medications scheduled</p>
            )}
          </div>
        </div>
      </div>

      {/* Important Alert */}
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
        <h3 className="font-bold text-red-900 mb-2">Important: Never Skip Medications</h3>
        <p className="text-red-800 text-sm mb-2">
          Taking your medications as prescribed is crucial for managing your health conditions. If you experience any side effects or concerns, contact your doctor immediately.
        </p>
        <p className="text-red-800 text-sm">
          In case of missed doses, consult your healthcare provider for guidance on when to take your next dose.
        </p>
      </div>
    </div>
  );
}
