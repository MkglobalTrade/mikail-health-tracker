'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { FileDown, Download, FileText, Droplets, HeartPulse, Pill, Check, Loader2, Database } from 'lucide-react'
import { useHealthData } from '@/hooks/useHealthData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getSugarStatus, getBPStatus, getCategoryById } from '@/lib/health-categories'
import { useToast } from '@/components/toast-provider'

export default function ExportPage() {
  const { sugarReadings, bpReadings, labResults, medications, getSugarStats, getBPStats } = useHealthData()
  const { addToast } = useToast()
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  const sugarStats = getSugarStats(30)
  const bpStats = getBPStats(30)

  const generatePDF = async () => {
    setGenerating(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      const pw = doc.internal.pageSize.getWidth()
      let y = 20

      const addHeader = () => {
        doc.setFontSize(22)
        doc.setTextColor(14, 165, 233)
        doc.text('VitaTrack Health Report', pw/2, y, { align: 'center' })
        y += 8
        doc.setFontSize(11)
        doc.setTextColor(100,100,100)
        doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, pw/2, y, { align: 'center' })
        y += 12
      }

      const addSection = (title: string, color: [number,number,number]) => {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFontSize(14)
        doc.setTextColor(...color)
        doc.text(title, 20, y)
        y += 8
        doc.setFontSize(10)
        doc.setTextColor(0,0,0)
      }

      addHeader()
      doc.setFontSize(10)
      doc.text('Summary:', 20, y)
      y += 6
      doc.text(`• Glucose readings: ${sugarReadings.length}`, 20, y); y += 5
      doc.text(`• BP readings: ${bpReadings.length}`, 20, y); y += 5
      doc.text(`• Active medications: ${medications.filter(m=>m.active).length}`, 20, y); y += 5
      doc.text(`• Lab reports: ${labResults.length}`, 20, y); y += 10

      if (sugarStats || bpStats) {
        addSection('30-Day Statistics', [14,165,233])
        if (sugarStats) { doc.text(`• Avg Glucose: ${Math.round(sugarStats.avg)} mg/dL (range ${Math.round(sugarStats.min)}-${Math.round(sugarStats.max)})`, 20, y); y += 5 }
        if (bpStats) { doc.text(`• Avg BP: ${bpStats.avgSystolic}/${bpStats.avgDiastolic} mmHg`, 20, y); y += 5 }
        y += 5
      }

      if (sugarReadings.length > 0) {
        addSection('Glucose Readings', [249,115,22])
        sugarReadings.slice(0, 20).forEach(r => {
          if (y > 280) { doc.addPage(); y = 20; }
          const s = getSugarStatus(r.value, r.unit)
          doc.text(`${format(new Date(r.date), 'MMM d')} — ${r.value} ${r.unit} (${s.status}) — ${r.timeOfDay}, ${r.mealType}`, 20, y)
          y += 5
        })
        y += 5
      }

      if (bpReadings.length > 0) {
        addSection('Blood Pressure', [239,68,68])
        bpReadings.slice(0, 20).forEach(r => {
          if (y > 280) { doc.addPage(); y = 20; }
          const s = getBPStatus(r.systolic, r.diastolic)
          doc.text(`${format(new Date(r.date), 'MMM d')} — ${r.systolic}/${r.diastolic} (${s.status}) — ${r.timeOfDay}${r.pulse ? `, ♥ ${r.pulse}` : ''}`, 20, y)
          y += 5
        })
        y += 5
      }

      if (medications.filter(m=>m.active).length > 0) {
        addSection('Medications', [139,92,246])
        medications.filter(m=>m.active).forEach(m => {
          if (y > 280) { doc.addPage(); y = 20; }
          doc.text(`• ${m.name} — ${m.dosage} (${m.frequency})${m.notes ? ` — ${m.notes}` : ''}`, 20, y)
          y += 5
        })
        y += 5
      }

      if (labResults.length > 0) {
        addSection('Lab Reports', [59,130,246])
        labResults.forEach(l => {
          if (y > 280) { doc.addPage(); y = 20; }
          const c = getCategoryById(l.category)
          doc.text(`• ${l.title} [${c.label}] — ${format(new Date(l.date), 'MMM d, yyyy')}`, 20, y)
          y += 5
        })
      }

      doc.setFontSize(8)
      doc.setTextColor(150,150,150)
      doc.text('VitaTrack — Not a medical document. Consult your doctor.', 20, doc.internal.pageSize.getHeight()-10)

      doc.save(`vitatrack-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
      addToast('PDF report downloaded successfully', 'success')
      setGenerated(true)
      setTimeout(() => setGenerated(false), 3000)
    } catch (e) {
      addToast('Failed to generate PDF. Please try again.', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const exportJSON = () => {
    const data = { sugarReadings, bpReadings, labResults, medications, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vitatrack-data-${format(new Date(), 'yyyy-MM-dd')}.json`
    a.click()
    URL.revokeObjectURL(url)
    addToast('JSON data exported successfully', 'success')
  }

  const hasData = sugarReadings.length > 0 || bpReadings.length > 0 || medications.length > 0 || labResults.length > 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Export Data</h1>
        <p className="text-sm text-muted-foreground mt-1">Download your health data in multiple formats</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center"><Droplets className="w-5 h-5 text-orange-500" /></div>
          <div><p className="text-lg font-bold">{sugarReadings.length}</p><p className="text-xs text-muted-foreground">Glucose readings</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"><HeartPulse className="w-5 h-5 text-red-500" /></div>
          <div><p className="text-lg font-bold">{bpReadings.length}</p><p className="text-xs text-muted-foreground">BP readings</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><Pill className="w-5 h-5 text-purple-500" /></div>
          <div><p className="text-lg font-bold">{medications.filter(m=>m.active).length}</p><p className="text-xs text-muted-foreground">Active medications</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><FileText className="w-5 h-5 text-blue-500" /></div>
          <div><p className="text-lg font-bold">{labResults.length}</p><p className="text-xs text-muted-foreground">Lab reports</p></div>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileDown className="w-5 h-5 text-primary" />
              PDF Health Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Professional PDF report for your doctor appointments. Includes all readings, medications, and lab history.</p>
            <div className="space-y-1.5">
              {['Glucose trends with status indicators', 'Blood pressure history & classification', 'Complete medication list', 'Lab report inventory', '30-day statistics summary'].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-500" /><span>{f}</span></div>
              ))}
            </div>
            <Button onClick={generatePDF} disabled={generating || !hasData} className="w-full gap-2 bg-gradient-to-r from-primary to-sky-400 hover:opacity-90">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : generated ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              {generating ? 'Generating...' : generated ? 'Downloaded!' : 'Download PDF Report'}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              JSON Data Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Export all your raw data as JSON for backup, analysis, or importing into other tools.</p>
            <div className="space-y-1.5">
              {['Complete data backup', 'Machine-readable format', 'Import to spreadsheets', 'Developer-friendly'].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-500" /><span>{f}</span></div>
              ))}
            </div>
            <Button onClick={exportJSON} disabled={!hasData} variant="outline" className="w-full gap-2">
              <Download className="w-4 h-4" />
              Export JSON Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
