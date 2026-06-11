'use client';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';

export default function SugarLevels() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const dailyData = [
    { time: '6:00 AM', value: 95, date: '2026-06-11' },
    { time: '9:00 AM', value: 145, date: '2026-06-11' },
    { time: '12:00 PM', value: 138, date: '2026-06-11' },
    { time: '3:00 PM', value: 125, date: '2026-06-11' },
    { time: '6:00 PM', value: 135, date: '2026-06-11' },
    { time: '9:00 PM', value: 110, date: '2026-06-11' },
  ];

  const weeklyData = [
    { day: 'Mon', average: 125, min: 95, max: 155 },
    { day: 'Tue', average: 128, min: 98, max: 160 },
    { day: 'Wed', average: 122, min: 92, max: 148 },
    { day: 'Thu', average: 132, min: 105, max: 165 },
    { day: 'Fri', average: 119, min: 88, max: 142 },
    { day: 'Sat', average: 130, min: 102, max: 158 },
    { day: 'Sun', average: 124, min: 96, max: 150 },
  ];

  const monthlyData = [
    { week: 'Week 1', average: 125 },
    { week: 'Week 2', average: 128 },
    { week: 'Week 3', average: 122 },
    { week: 'Week 4', average: 130 },
  ];

  const getChartData = () => {
    switch (period) {
      case 'daily':
        return dailyData;
      case 'weekly':
        return weeklyData;
      case 'monthly':
        return monthlyData;
      default:
        return dailyData;
    }
  };

  const getMetrics = () => {
    const data = getChartData();
    const values = data.map(d => (d as any).value || (d as any).average || 0);
    return {
      average: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      min: Math.min(...values),
      max: Math.max(...values),
    };
  };

  const metrics = getMetrics();
  const targetMin = 70;
  const targetMax = 130;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Blood Sugar Levels</h1>
        <p className="text-gray-600">Daily glucose monitoring and trends</p>
      </div>

      {/* Period Selector */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                period === p
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Average</p>
          <p className="text-2xl font-bold text-blue-600">{metrics.average}</p>
          <p className="text-xs text-gray-500">mg/dL</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Minimum</p>
          <p className="text-2xl font-bold text-green-600">{metrics.min}</p>
          <p className="text-xs text-gray-500">mg/dL</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Maximum</p>
          <p className="text-2xl font-bold text-red-600">{metrics.max}</p>
          <p className="text-xs text-gray-500">mg/dL</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
          <p className="text-sm text-gray-600">Target Range</p>
          <p className="text-lg font-bold text-purple-600">{targetMin}-{targetMax}</p>
          <p className="text-xs text-gray-500">mg/dL</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Glucose Trend</h2>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={getChartData() as any}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={period === 'daily' ? 'time' : period === 'weekly' ? 'day' : 'week'} />
            <YAxis domain={[50, 200]} label={{ value: 'mg/dL', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey={period === 'daily' ? 'value' : 'average'}
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorValue)"
            />
            {period === 'weekly' && (
              <>
                <Line type="monotone" dataKey="min" stroke="#10b981" strokeDasharray="5 5" name="Min" />
                <Line type="monotone" dataKey="max" stroke="#ef4444" strokeDasharray="5 5" name="Max" />
              </>
            )}
            <Legend />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Target Range Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm font-semibold text-green-700">Normal Range</p>
          <p className="text-lg text-green-600">{targetMin}-{targetMax} mg/dL</p>
          <p className="text-xs text-gray-600 mt-1">Fasting and between meals</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm font-semibold text-yellow-700">Prediabetes</p>
          <p className="text-lg text-yellow-600">100-125 mg/dL</p>
          <p className="text-xs text-gray-600 mt-1">Fasting glucose</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm font-semibold text-red-700">High Risk</p>
          <p className="text-lg text-red-600">&gt;126 mg/dL</p>
          <p className="text-xs text-gray-600 mt-1">May indicate diabetes</p>
        </div>
      </div>
    </div>
  );
}
