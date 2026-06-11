'use client';

export default function MedicationSchedule() {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 max-w-6xl mx-auto">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Medication Schedule</h2>
          <p className="text-slate-600 mt-2">Manage your medications, reminders, and dosing schedule.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Morning</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">2 meds</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Afternoon</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">1 med</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Night</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">2 meds</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Metformin</h3>
              <p className="text-sm text-slate-500">850mg | Morning & Night</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">Active</span>
          </div>
          <p className="mt-4 text-slate-600">Take after breakfast and dinner to support glucose control.</p>
        </div>
      </div>
    </div>
  );
}
