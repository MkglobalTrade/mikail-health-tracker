'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Pill, Plus, Trash2, Check, Sun, Moon, Clock } from 'lucide-react'
import { useHealthData } from '@/hooks/useHealthData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { MEDICATION_FREQUENCY } from '@/lib/health-categories'
import { useToast } from '@/components/toast-provider'
import { cn } from '@/lib/utils'

export default function MedicationsPage() {
  const { medications, medLogs, addMedication, deleteMedication, takeMedication } = useHealthData()
  const { addToast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', dosage: '', frequency: 'both', startDate: format(new Date(), 'yyyy-MM-dd'), notes: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.dosage) return addToast('Please fill name and dosage', 'warning')
    addMedication({ name: form.name, dosage: form.dosage, frequency: form.frequency, startDate: new Date(form.startDate).toISOString(), active: true, notes: form.notes })
    addToast('Medication added successfully', 'success')
    setForm({ name: '', dosage: '', frequency: 'both', startDate: format(new Date(), 'yyyy-MM-dd'), notes: '' })
    setShowForm(false)
  }

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayLogs = medLogs.filter(l => l.takenAt.startsWith(today))
  const takenIds = new Set(todayLogs.map(l => l.medicationId))
  const morningMeds = medications.filter(m => m.active && (m.frequency === 'morning' || m.frequency === 'both'))
  const eveningMeds = medications.filter(m => m.active && (m.frequency === 'evening' || m.frequency === 'both'))

  const isMorningTaken = (id: string) => takenIds.has(id) && medications.find(m => m.id === id)?.frequency !== 'evening'
  const isEveningTaken = (id: string) => takenIds.has(id) && medications.find(m => m.id === id)?.frequency !== 'morning'

  const handleTake = (id: string, tod: string) => {
    takeMedication(id, tod)
    addToast('Medication marked as taken', 'success')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Medications</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your daily medications — morning and evening</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 w-fit"><Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'Add Medication'}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center"><Sun className="w-5 h-5 text-yellow-600" /></div>
              Morning Routine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {morningMeds.length === 0 ? <p className="text-sm text-muted-foreground py-4">No morning medications</p> : (
              morningMeds.map(med => {
                const taken = isMorningTaken(med.id)
                return (
                  <div key={med.id} className={cn('flex items-center gap-3 p-3 rounded-lg border transition-all', taken ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800' : 'border-border hover:shadow-sm')}>
                    <button onClick={() => { if (!taken) handleTake(med.id, 'morning'); }}
                      className={cn('w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all', taken ? 'bg-green-500 border-green-500' : 'border-muted-foreground hover:border-primary')}>
                      {taken && <Check className="w-5 h-5 text-white" />}
                    </button>
                    <div className="flex-1">
                      <p className={cn('text-sm font-medium', taken && 'line-through opacity-60')}>{med.name}</p>
                      <p className="text-xs text-muted-foreground">{med.dosage}</p>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center"><Moon className="w-5 h-5 text-indigo-600" /></div>
              Evening Routine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {eveningMeds.length === 0 ? <p className="text-sm text-muted-foreground py-4">No evening medications</p> : (
              eveningMeds.map(med => {
                const taken = isEveningTaken(med.id)
                return (
                  <div key={med.id} className={cn('flex items-center gap-3 p-3 rounded-lg border transition-all', taken ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800' : 'border-border hover:shadow-sm')}>
                    <button onClick={() => { if (!taken) handleTake(med.id, 'evening'); }}
                      className={cn('w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all', taken ? 'bg-green-500 border-green-500' : 'border-muted-foreground hover:border-primary')}>
                      {taken && <Check className="w-5 h-5 text-white" />}
                    </button>
                    <div className="flex-1">
                      <p className={cn('text-sm font-medium', taken && 'line-through opacity-60')}>{med.name}</p>
                      <p className="text-xs text-muted-foreground">{med.dosage}</p>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card className="animate-slide-up">
          <CardHeader><CardTitle className="text-lg">Add New Medication</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Metformin" required /></div>
                <div><Label>Dosage</Label><Input value={form.dosage} onChange={e => setForm(prev => ({ ...prev, dosage: e.target.value }))} placeholder="e.g. 500mg" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Frequency</Label><Select value={form.frequency} onChange={e => setForm(prev => ({ ...prev, frequency: e.target.value }))}>{MEDICATION_FREQUENCY.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}</Select></div>
                <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))} required /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Take with food, avoid alcohol..." rows={2} /></div>
              <Button type="submit" className="w-full gap-2 bg-gradient-to-r from-primary to-sky-400 hover:opacity-90"><Pill className="w-4 h-4" /> Add Medication</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">All Medications</CardTitle></CardHeader>
        <CardContent>
          {medications.length === 0 ? (
            <div className="text-center py-8"><Pill className="w-12 h-12 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">No medications added</p></div>
          ) : (
            <div className="space-y-2">
              {medications.map(med => (
                <div key={med.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:shadow-sm transition-all group">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0"><Pill className="w-5 h-5 text-purple-600" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{med.name}</span>
                      <span className="text-xs text-muted-foreground">{med.dosage}</span>
                      <Badge variant={med.active ? 'success' : 'secondary'}>{med.active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" /><span>{med.frequency === 'both' ? 'Morning & Evening' : med.frequency === 'morning' ? 'Morning' : 'Evening'}</span><span>•</span><span>Started {format(new Date(med.startDate), 'MMM d, yyyy')}</span>
                    </div>
                    {med.notes && <p className="text-xs text-muted-foreground mt-1">{med.notes}</p>}
                  </div>
                  <button onClick={() => { deleteMedication(med.id); addToast('Medication deleted', 'info'); }} className="p-1.5 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
