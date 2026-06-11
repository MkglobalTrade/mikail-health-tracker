'use client';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LabTest } from '@/types/health';

export default function LabResults() {
  const [labTests] = useState<LabTest[]>([
    {
      id: '1',
      name: 'Glucose',
      value: 105,
      unit: 'mg/dL',
      date: '2026-06-10',
      normalMin: 70,
      normalMax: 100,
      warningMax: 126,
      status: 'warning',
      previousValue: 98,
      previousDate: '2026-05-24',
      previousStatus: 'normal'
    },
    {
      id: '2',
      name: 'Hemoglobin A1C',
      value: 6.8,
      unit: '%',
      date: '2026-06-10',
      normalMax: 5.7,
      warningMax: 6.5,
      status: 'warning',
      previousValue: 6.5,
      previousDate: '2026-05-24',
      previousStatus: 'warning'
    },
    {
      id: '3',
      name: 'HDL Cholesterol',
      value: 45,
      unit: 'mg/dL',
      date: '2026-06-10',
      normalMin: 40,
      status: 'normal',
      previousValue: 44,
      previousDate: '2026-05-24',
      previousStatus: 'normal'
    },
    {
      id: '4',
      name: 'LDL Cholesterol',
      value: 180,
      unit: 'mg/dL',
      date: '2026-06-10',
      normalMax: 100,
      warningMax: 160,
      status: 'critical',
      previousValue: 165,
      previousDate: '2026-05-24',
      previousStatus: 'warning'
    },
    {
      id: '5',
      name: 'Triglycerides',
      value: 200,
      unit: 'mg/dL',
      date: '2026-06-10',
      normalMax: 149,
      warningMax: 200,
      status: 'warning',
      previousValue: 175,
      previousDate: '2026-05-24',
      previousStatus: 'warning'
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-700';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700';
      case 'critical':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100';
    }
  };

  const chartData = labTests.map(test => ({
    name: test.name.slice(0, 8),
    value: test.value,
    status: test.status
  }));

  type AlertLevel = 'warning' | 'critical';
  const alerts = labTests
    .filter((test) => {
      if (!test.previousStatus) return false;
      const statusOrder = { normal: 1, warning: 2, critical: 3 };
      return statusOrder[test.status] > statusOrder[test.previousStatus];
    })
    .map((test) => {
      const diff = test.previousValue != null ? test.value - test.previousValue : 0;
      const message =
        test.status === 'critical'
          ? `${test.name} worsened from ${test.previousStatus} to critical.`
          : `${test.name} increased by ${diff} ${test.unit} since ${test.previousDate}.`;
      return {
        id: test.id,
        name: test.name,
        message,
        level: (test.status === 'critical' ? 'critical' : 'warning') as AlertLevel
      };
    });

  const getAlertBannerColor = (level: AlertLevel) =>
    level === 'critical' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800';

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className={`p-4 rounded-xl border ${getAlertBannerColor(alert.level)} shadow-sm`}>
              <p className="font-semibold">Alert: {alert.name}</p>
              <p className="text-sm opacity-85">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Lab Results</h1>
        <p className="text-gray-600">Track and compare your laboratory tests over time</p>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600 font-semibold">Normal Results</p>
          <p className="text-2xl font-bold text-green-700">{labTests.filter(t => t.status === 'normal').length}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-600 font-semibold">Warning Range</p>
          <p className="text-2xl font-bold text-yellow-700">{labTests.filter(t => t.status === 'warning').length}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-red-600 font-semibold">Critical Range</p>
          <p className="text-2xl font-bold text-red-700">{labTests.filter(t => t.status === 'critical').length}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Test Values Comparison</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Test Results List */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Detailed Results</h2>
        {labTests.map((test) => (
          <div
            key={test.id}
            className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{test.name}</h3>
                <p className="text-sm opacity-80">Last updated: {test.date}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{test.value}</p>
                <p className="text-sm opacity-75">{test.unit}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ml-4 ${getStatusBadgeColor(test.status)}`}>
                {test.status.toUpperCase()}
              </span>
            </div>
            {test.normalMin && test.normalMax && (
              <p className="text-xs mt-2 opacity-70">
                Normal range: {test.normalMin}-{test.normalMax} {test.unit}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
