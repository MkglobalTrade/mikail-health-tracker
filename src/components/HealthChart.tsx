'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SugarChartProps {
  data: Array<{ date: string; value: number; unit: string }>
}

export function SugarChart({ data }: SugarChartProps) {
  const chartData = data.slice(0, 14).reverse().map(d => ({
    ...d,
    displayValue: d.value,
    label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  const maxValue = Math.max(...data.map(d => d.value), 200)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Glucose Trends (14 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="sugarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 10 }} 
                interval="preserveStartEnd"
                stroke="#64748b"
              />
              <YAxis 
                domain={[0, maxValue]} 
                tick={{ fontSize: 10 }} 
                stroke="#64748b"
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [`${value} mg/dL`, 'Glucose']}
              />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={100} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={140} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.5} />
              <Area 
                type="monotone" 
                dataKey="displayValue" 
                stroke="#f97316" 
                strokeWidth={2}
                fill="url(#sugarGradient)" 
                dot={{ r: 3, fill: '#f97316' }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 opacity-50"></span> Low</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 opacity-50"></span> Normal</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 opacity-50"></span> Elevated</span>
        </div>
      </CardContent>
    </Card>
  )
}

interface BPChartProps {
  data: Array<{ date: string; systolic: number; diastolic: number }>
}

export function BPChart({ data }: BPChartProps) {
  const chartData = data.slice(0, 14).reverse().map(d => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Blood Pressure Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 10 }} 
                interval="preserveStartEnd"
                stroke="#64748b"
              />
              <YAxis 
                domain={[40, 180]} 
                tick={{ fontSize: 10 }} 
                stroke="#64748b"
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0',
                  fontSize: '12px'
                }}
              />
              <ReferenceLine y={120} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'Normal', fontSize: 10, fill: '#10b981' }} />
              <ReferenceLine y={130} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.5} />
              <Line 
                type="monotone" 
                dataKey="systolic" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ r: 3, fill: '#ef4444' }}
                name="Systolic"
              />
              <Line 
                type="monotone" 
                dataKey="diastolic" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 3, fill: '#3b82f6' }}
                name="Diastolic"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Systolic</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Diastolic</span>
        </div>
      </CardContent>
    </Card>
  )
}
