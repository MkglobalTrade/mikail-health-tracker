'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { HeartPulse, Plus, Trash2, TrendingDown, TrendingUp, Activity } from 'lucide-react'
import { useHealthData } from '@/hooks/useHealthData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { TIME_OF_DAY, getBPStatus } from '@/lib/health-categories'
import { BPChart } from '@/components/HealthChart'
import { StatsCard } from '@/components/StatsCard'
import { useToast } from '@/components/toast-provider'
import { cn } from '@/lib/utils'

export default function BloodPressurePage() {
  const { bpReadings, addBPReading, deleteBPReading, getBPStats } = useHealthData()
  const { addToast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ systolic: '', diastolic: '', pulse: '', date: format(new Date(), 'yyyy-MM-dd'), timeOfDay: 'morning', notes: '' })

  const stats = getBPStats(7)
  const chartData = bpReadings.slice(0, 14).map(r => ({ date: r.date, systolic: r.systolic, diastolic: r.diastolic }))
  const latest = bpReadings[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.systolic || !form.diastolic) return addToast('Please enter systolic and diastolic values', 'warning')
    addBPReading({ systolic: parseInt(form.systolic), diastolic: parseInt(form.diastolic), pulse: form.pulse ? parseInt(form.pulse) : undefined, date: new Date(form.date).toISOString(), timeOfDay: form.timeOfDay, notes: form.notes })
    addToast('Blood pressure reading saved', 'success')
    setForm({ systolic: '', diastolic: '', pulse: '', date: format(new Date(), 'yyyy-MM-dd'), timeOfDay: 'morning', notes: '' })
    setShowForm(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Blood Pressure</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your daily blood pressure readings</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 w-fit"><Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'Add Reading'}</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard title="Latest" value={latest ? `${latest.systolic}/${latest.diastolic}` : '--/--'} subtitle={latest ? getBPStatus(latest.systolic, latest.diastolic).status : 'No data'} icon={<HeartPulse className="w-5 h-5" style={{ color: latest ? getBPStatus(latest.systolic, latest.diastolic).color : '#6b7280' }} />} color={latest ? getBPStatus(latest.systolic, latest.diastolic).color : '#6b7280'} />
        <StatsCard title="7-Day Avg Systolic" value={stats?.avgSystolic || '--'} subtitle="mmHg" icon={<TrendingUp className="w-5 h-5 text-red-500" />} color="#ef4444" />
        <StatsCard title="7-Day Avg Diastolic" value={stats?.avgDiastolic || '--'} subtitle="mmHg" icon={<TrendingDown className="w-5 h-5 text-blue-500" />} color="#3b82f6" />
        <StatsCard title="Total Readings" value={bpReadings.length} subtitle="all time" icon={<Activity className="w-5 h-5 text-green-500" />} color="#10b981" />
      </div>

      {showForm && (
        <Card className="animate-slide-up">
          <CardHeader><CardTitle className="text-lg">New Blood Pressure Reading</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Systolic</Label><Input type="number" value={form.systolic} onChange={e => setForm(prev => ({ ...prev, systolic: e.target.value }))} placeholder="120" required /></div>
                <div><Label>Diastolic</Label><Input type="number" value={form.diastolic} onChange={e => setForm(prev => ({ ...prev, diastolic: e.target.value }))} placeholder="80" required /></div>
                <div><Label>Pulse (optional)</Label><Input type="number" value={form.pulse} onChange={e => setForm(prev => ({ ...prev, pulse: e.target.value }))} placeholder="72" /></div>
              </div>
              {form.systolic && form.diastolic && (
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge style={{ backgroundColor: getBPStatus(parseInt(form.systolic), parseInt(form.diastolic)).color, color: '#fff' }}>
                      {getBPStatus(parseInt(form.systolic), parseInt(form.diastolic)).status}
                    </Badge>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))} required /></div>
                <div><Label>Time of Day</Label><Select value={form.timeOfDay} onChange={e => setForm(prev => ({ ...prev, timeOfDay: e.target.value }))}>{TIME_OF_DAY.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</Select></div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="How are you feeling?" rows={2} /></div>
              <Button type="submit" className="w-full gap-2 bg-gradient-to-r from-primary to-sky-400 hover:opacity-90"><HeartPulse className="w-4 h-4" /> Save Reading</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {chartData.length > 0 && <BPChart data={chartData} />}

      <Card>
        <CardHeader><CardTitle className="text-lg">Reading History</CardTitle></CardHeader>
        <CardContent>
          {bpReadings.length === 0 ? (
            <div className="text-center py-8"><HeartPulse className="w-12 h-12 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">No readings yet</p></div>
          ) : (
            <div className="space-y-2">
              {bpReadings.map(r => {
                const status = getBPStatus(r.systolic, r.diastolic)
                return (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:shadow-sm transition-all group">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: status.color + '15' }}>
                      <HeartPulse className="w-6 h-6" style={{ color: status.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{r.systolic}/{r.diastolic}</span>
                        <span className="text-sm text-muted-foreground">mmHg</span>
                        <Badge style={{ backgroundColor: status.color, color: '#fff' }}>{status.status}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <span>{format(new Date(r.date), 'MMM d, yyyy')}</span><span>•</span><span>{r.timeOfDay}</span>{r.pulse && <><span>•</span><span>♥ {r.pulse} bpm</span></>}
                      </div>
                      {r.notes && <p className="text-xs text-muted-foreground mt-1">{r.notes}</p>}
                    </div>
                    <button onClick={() => { deleteBPReading(r.id); addToast('Reading deleted', 'info'); }} className="p-1.5 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
