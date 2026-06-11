import MedicationManager from '@/components/MedicationManager';

export default function MedicationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="bg-white p-6 rounded-xl shadow-sm">
          <h1 className="text-3xl font-bold text-blue-600">💊 Medications</h1>
          <p className="text-gray-600 mt-2">Manage your medications and schedule</p>
        </header>
        
        <MedicationManager />
      </div>
    </div>
  );
}
