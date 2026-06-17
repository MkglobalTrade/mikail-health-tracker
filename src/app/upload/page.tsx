'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Upload, FileText, Image, X, Check, Droplets, FileUp, Camera, Sparkles, Loader2, Search, Trash2, Eye, TrendingUp } from 'lucide-react'
import { useHealthData } from '@/hooks/useHealthData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/toast-provider'
import { LAB_CATEGORIES, SUGAR_UNITS, TIME_OF_DAY, MEAL_TYPE, getSugarStatus, getCategoryById } from '@/lib/health-categories'
import { cn } from '@/lib/utils'

type TabType = 'lab' | 'sugar'

function simulateOCR(fileName: string): string {
  const keywords: Record<string, string[]> = {
    blood_work: ['CBC','hemoglobin','hematocrit','WBC','RBC','platelet','blood count'],
    metabolic: ['glucose','creatinine','BUN','eGFR','sodium','potassium','CMP','BMP'],
    lipid: ['cholesterol','LDL','HDL','triglyceride','lipid'],
    thyroid: ['TSH','T3','T4','thyroid'],
    vitamin: ['vitamin D','B12','folate','vitamin'],
    hormone: ['testosterone','estrogen','progesterone','cortisol','hormone'],
    urinalysis: ['urine','UA','protein','ketone','urinalysis'],
    imaging: ['X-ray','MRI','CT','ultrasound','imaging','radiology'],
    stelo: ['Stelo','Dexcom','CGM','continuous glucose','glucose monitor'],
  }
  const lower = fileName.toLowerCase()
  for (const [cat, words] of Object.entries(keywords)) {
    if (words.some(w => lower.includes(w.toLowerCase()))) return cat
  }
  return 'other'
}

export default function UploadPage() {
  const router = useRouter()
  const { labResults, sugarReadings, addLabResult, addSugarReading, deleteLabResult, deleteSugarReading } = useHealthData()
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>('lab')
  const [isDragging, setIsDragging] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [previewFile, setPreviewFile] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const [labForm, setLabForm] = useState({ title: '', category: '', date: format(new Date(), 'yyyy-MM-dd'), fileUrl: '', fileType: '' })
  const [sugarForm, setSugarForm] = useState({ value: '', unit: 'mg/dL', date: format(new Date(), 'yyyy-MM-dd'), timeOfDay: 'morning', mealType: 'fasting', notes: '' })

  const handleFile = async (file: File, type: 'pdf' | 'image') => {
    setOcrLoading(true)
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      const detected = simulateOCR(file.name)
      setLabForm(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, ''), category: detected, fileUrl: base64, fileType: type }))
      setPreviewFile(base64)
      setOcrLoading(false)
      addToast(`Detected as ${LAB_CATEGORIES.find(c=>c.id===detected)?.label || 'Other'}`, 'info')
    }
    reader.readAsDataURL(file)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type === 'application/pdf') handleFile(file, 'pdf')
      else if (file.type.startsWith('image/')) handleFile(file, 'image')
      else addToast('Only PDF and images are supported', 'warning')
    }
  }, [])

  const handleSubmitLab = (e: React.FormEvent) => {
    e.preventDefault()
    if (!labForm.title || !labForm.category) return addToast('Please fill all required fields', 'warning')
    addLabResult({ title: labForm.title, category: labForm.category, date: new Date(labForm.date).toISOString(), fileUrl: labForm.fileUrl, fileType: labForm.fileType })
    addToast('Lab report saved successfully', 'success')
    setLabForm({ title: '', category: '', date: format(new Date(), 'yyyy-MM-dd'), fileUrl: '', fileType: '' })
    setPreviewFile(null)
  }

  const handleSubmitSugar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sugarForm.value) return addToast('Please enter a glucose value', 'warning')
    addSugarReading({ value: parseFloat(sugarForm.value), unit: sugarForm.unit, date: new Date(sugarForm.date).toISOString(), timeOfDay: sugarForm.timeOfDay, mealType: sugarForm.mealType, notes: sugarForm.notes })
    addToast('Glucose reading saved', 'success')
    setSugarForm({ value: '', unit: 'mg/dL', date: format(new Date(), 'yyyy-MM-dd'), timeOfDay: 'morning', mealType: 'fasting', notes: '' })
  }

  const filteredLabs = labResults.filter(lab => {
    const matchesSearch = lab.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || lab.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const filteredSugar = sugarReadings.filter(r => `${r.value} ${r.notes}`.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Upload Results</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload lab reports, Stelo CGM data, and glucose readings</p>
      </div>

      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        <button onClick={() => setActiveTab('lab')} className={cn('px-4 py-2 rounded-md text-sm font-medium transition-all', activeTab === 'lab' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
          <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Lab Reports</span>
        </button>
        <button onClick={() => setActiveTab('sugar')} className={cn('px-4 py-2 rounded-md text-sm font-medium transition-all', activeTab === 'sugar' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
          <span className="flex items-center gap-2"><Droplets className="w-4 h-4" /> Glucose / Stelo</span>
        </button>
      </div>

      {activeTab === 'lab' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Upload Lab Report</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}
                className={cn('border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer', isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40', previewFile && 'bg-green-50/50 border-green-300 dark:bg-green-900/10 dark:border-green-800')}>
                <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden"
                  onChange={e => { const file = e.target.files?.[0]; if (file) { if (file.type === 'application/pdf') handleFile(file, 'pdf'); else if (file.type.startsWith('image/')) handleFile(file, 'image'); else addToast('Unsupported file type', 'warning'); } }} />
                {ocrLoading ? (
                  <div className="flex flex-col items-center gap-2"><Loader2 className="w-8 h-8 animate-spin text-primary" /><p className="text-sm text-muted-foreground">Analyzing...</p></div>
                ) : previewFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center"><Check className="w-6 h-6 text-green-600" /></div>
                    <p className="text-sm font-medium text-green-700">File ready</p><p className="text-xs text-muted-foreground">Click to change</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><FileUp className="w-6 h-6 text-primary" /></div>
                    <p className="text-sm font-medium">Drop file or click to upload</p><p className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 10MB)</p>
                  </div>
                )}
              </div>

              {previewFile && (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  {labForm.fileType === 'image' ? (
                    <img src={previewFile} alt="Preview" className="w-full max-h-[200px] object-contain" />
                  ) : (
                    <div className="p-4 bg-red-50 dark:bg-red-900/10 flex items-center gap-3">
                      <FileText className="w-8 h-8 text-red-500" />
                      <div><p className="text-sm font-medium">PDF Document</p><p className="text-xs text-muted-foreground">Preview not available</p></div>
                    </div>
                  )}
                  <button onClick={() => { setPreviewFile(null); setLabForm(prev => ({ ...prev, fileUrl: '', fileType: '' })) }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-white/90 hover:bg-white shadow-sm"><X className="w-4 h-4" /></button>
                </div>
              )}

              <form onSubmit={handleSubmitLab} className="space-y-3">
                <div><Label>Title</Label><Input value={labForm.title} onChange={e => setLabForm(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. Annual Blood Work 2024" required /></div>
                <div>
                  <Label>Category</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {LAB_CATEGORIES.map(cat => (
                      <button key={cat.id} type="button" onClick={() => setLabForm(prev => ({ ...prev, category: cat.id }))}
                        className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border', labForm.category === cat.id ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30')}>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />{cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div><Label>Date</Label><Input type="date" value={labForm.date} onChange={e => setLabForm(prev => ({ ...prev, date: e.target.value }))} required /></div>
                <Button type="submit" className="w-full gap-2 bg-gradient-to-r from-primary to-sky-400 hover:opacity-90"><Sparkles className="w-4 h-4" /> Save Lab Report</Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="w-5 h-5 text-blue-500" /> Your Lab Reports</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
                  </div>
                  <Select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-40">
                    <option value="all">All Categories</option>
                    {LAB_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </Select>
                </div>
                {filteredLabs.length === 0 ? (
                  <div className="text-center py-8"><FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No lab reports yet</p><p className="text-xs text-muted-foreground">Upload your first report</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-hide">
                    {filteredLabs.map(lab => {
                      const cat = getCategoryById(lab.category)
                      return (
                        <div key={lab.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:shadow-sm transition-all group">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + '15' }}>
                            {lab.fileType === 'pdf' ? <FileText className="w-5 h-5" style={{ color: cat.color }} /> : <Image className="w-5 h-5" style={{ color: cat.color }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{lab.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge style={{ backgroundColor: cat.color, color: '#fff' }}>{cat.label}</Badge>
                              <span className="text-xs text-muted-foreground">{format(new Date(lab.date), 'MMM d, yyyy')}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {lab.fileUrl && <button onClick={() => window.open(lab.fileUrl, '_blank')} className="p-1.5 rounded-lg hover:bg-muted"><Eye className="w-4 h-4 text-muted-foreground" /></button>}
                            <button onClick={() => { deleteLabResult(lab.id); addToast('Lab report deleted', 'info'); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-orange-500" /> Glucose Reading</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitSugar} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Value</Label><Input type="number" step="0.1" value={sugarForm.value} onChange={e => setSugarForm(prev => ({ ...prev, value: e.target.value }))} placeholder="120" required /></div>
                  <div><Label>Unit</Label><Select value={sugarForm.unit} onChange={e => setSugarForm(prev => ({ ...prev, unit: e.target.value }))}>{SUGAR_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}</Select></div>
                </div>
                {sugarForm.value && (
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Status:</span>
                      <span className="text-sm px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: getSugarStatus(parseFloat(sugarForm.value), sugarForm.unit).color }}>
                        {getSugarStatus(parseFloat(sugarForm.value), sugarForm.unit).status}
                      </span>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Date</Label><Input type="date" value={sugarForm.date} onChange={e => setSugarForm(prev => ({ ...prev, date: e.target.value }))} required /></div>
                  <div><Label>Time of Day</Label><Select value={sugarForm.timeOfDay} onChange={e => setSugarForm(prev => ({ ...prev, timeOfDay: e.target.value }))}>{TIME_OF_DAY.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</Select></div>
                </div>
                <div><Label>Meal Context</Label><Select value={sugarForm.mealType} onChange={e => setSugarForm(prev => ({ ...prev, mealType: e.target.value }))}>{MEAL_TYPE.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</Select></div>
                <div><Label>Notes</Label><Textarea value={sugarForm.notes} onChange={e => setSugarForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Observations..." rows={3} /></div>
                <Button type="submit" className="w-full gap-2 bg-gradient-to-r from-primary to-sky-400 hover:opacity-90"><Droplets className="w-4 h-4" /> Save Reading</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Camera className="w-5 h-5 text-orange-500" /> Stelo / CGM Photo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-all cursor-pointer" onClick={() => imageInputRef.current?.click()}>
                <input ref={imageInputRef} type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={e => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = () => { addSugarReading({ value: 0, unit: 'mg/dL', date: new Date().toISOString(), timeOfDay: 'morning', mealType: 'fasting', notes: `Stelo CGM screenshot — ${file.name}`, imageUrl: reader.result as string }); addToast('Stelo screenshot saved', 'success'); }; reader.readAsDataURL(file); } }} />
                <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Take photo of Stelo app</p><p className="text-xs text-muted-foreground">Screenshots from your CGM app</p>
              </div>
              <div className="p-4 rounded-lg bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">Tip</p>
                <p className="text-xs text-orange-700 dark:text-orange-300">Take screenshots from your Stelo app and upload them here. We store them for reference. You can also manually enter the glucose value above.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Droplets className="w-5 h-5 text-orange-500" /> Glucose History</CardTitle></CardHeader>
            <CardContent>
              {sugarReadings.length === 0 ? (
                <div className="text-center py-8"><Droplets className="w-12 h-12 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">No readings yet</p></div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide">
                  {filteredSugar.map(r => {
                    const status = getSugarStatus(r.value, r.unit)
                    return (
                      <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:shadow-sm transition-all group">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: status.color + '15' }}>
                          <Droplets className="w-5 h-5" style={{ color: status.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">{r.value}</span>
                            <span className="text-sm text-muted-foreground">{r.unit}</span>
                            <Badge style={{ backgroundColor: status.color, color: '#fff' }}>{status.status}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                            <span>{format(new Date(r.date), 'MMM d, yyyy')}</span><span>•</span><span>{r.timeOfDay}</span><span>•</span><span>{r.mealType}</span>
                          </div>
                          {r.notes && <p className="text-xs text-muted-foreground mt-1">{r.notes}</p>}
                        </div>
                        {r.imageUrl && <img src={r.imageUrl} alt="CGM" className="w-12 h-12 rounded object-cover" />}
                        <button onClick={() => { deleteSugarReading(r.id); addToast('Reading deleted', 'info'); }} className="p-1.5 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
