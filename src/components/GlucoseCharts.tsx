'use client';
import { useState } from 'react';

export default function GlucoseCharts() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | '90day'>('daily');

  // Métricas simuladas de Stelo
  const metrics = {
    average: 112,
    minimum: 74,
    maximum: 185,
    timeInRange: "88%",
    variability: "14.2%",
    spikeDetected: "⚠️ Pico de glucosa detectado a las 14:30 (+45 mg/dL)"
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm max-w-4xl mx-auto my-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">📊 STELO GLUCOSE PAGE</h2>
        <div className="bg-gray-100 p-1 rounded-lg text-sm space-x-1">
          {(['daily', 'weekly', 'monthly', '90day'] as const).map((p) => (
            <button 
              key={p} 
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md capitalize ${period === p ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600'}`}
            >
              {p === '90day' ? '90 Days' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Contenedor del Gráfico */}
      <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center border text-gray-400 mb-6">
        [Gráfico de Glucosa Estilo Stelo - Vista {period.toUpperCase()}]
      </div>

      {/* Métricas e Insights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg"><span className="block text-xs text-gray-500">Average</span><span className="text-lg font-bold">{metrics.average} mg/dL</span></div>
        <div className="bg-gray-50 p-3 rounded-lg"><span className="block text-xs text-gray-500">Min / Max</span><span className="text-lg font-bold text-orange-600">{metrics.minimum} - {metrics.maximum}</span></div>
        <div className="bg-gray-50 p-3 rounded-lg"><span className="block text-xs text-gray-500">Time In Range</span><span className="text-lg font-bold text-green-600">{metrics.timeInRange}</span></div>
        <div className="bg-gray-50 p-3 rounded-lg"><span className="block text-xs text-gray-500">Variability</span><span className="text-lg font-bold">{metrics.variability}</span></div>
      </div>

      <div className="bg-red-50 p-3 rounded-lg text-sm text-red-700 font-medium mb-3">
        {metrics.spikeDetected}
      </div>

      <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
        <span className="font-bold block mb-1">💡 Automatic Insights:</span>
        Tu glucosa se mantiene más estable en los días que registras actividad física por la mañana.
      </div>
    </div>
  );
}
