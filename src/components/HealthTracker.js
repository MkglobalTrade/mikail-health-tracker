'use client'
import { useState, useEffect, useRef } from 'react'

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const LAB_FIELDS = [
  { key: 'hba1c',        label: 'HbA1c',           unit: '%',     normal: '<6.5',       category: 'diabetes', criticalHigh: 7,    warnHigh: 6.5 },
  { key: 'glucose',      label: 'Glucosa',          unit: 'mg/dl', normal: '70–99',      category: 'diabetes', criticalHigh: 200,  warnHigh: 126, warnLow: 70 },
  { key: 'creatinine',   label: 'Creatinina',       unit: 'mg/dl', normal: '0.73–1.18',  category: 'kidney',   criticalHigh: 2,    warnHigh: 1.3 },
  { key: 'egfr',         label: 'eGFR',             unit: 'ml/min',normal: '≥60',        category: 'kidney',   criticalLow: 30,    warnLow: 60 },
  { key: 'acr',          label: 'ACR',              unit: 'mg/g',  normal: '<29',        category: 'kidney',   criticalHigh: 300,  warnHigh: 30 },
  { key: 'ldl',          label: 'LDL',              unit: 'mg/dl', normal: '<99',        category: 'lipids',   criticalHigh: 160,  warnHigh: 99 },
  { key: 'hdl',          label: 'HDL',              unit: 'mg/dl', normal: '≥40',        category: 'lipids',   criticalLow: 35,    warnLow: 40 },
  { key: 'triglycerides',label: 'Triglicéridos',    unit: 'mg/dl', normal: '<149',       category: 'lipids',   criticalHigh: 500,  warnHigh: 149 },
  { key: 'cholesterol',  label: 'Colesterol Total', unit: 'mg/dl', normal: '<199',       category: 'lipids',   criticalHigh: 300,  warnHigh: 199 },
  { key: 'uric_acid',    label: 'Ácido Úrico',      unit: 'mg/dl', normal: '3.4–7.0',   category: 'other',    criticalHigh: 9,    warnHigh: 7 },
  { key: 'hemoglobin',   label: 'Hemoglobina',      unit: 'g/dL',  normal: '13–16.7',   category: 'blood',    warnLow: 13 },
  { key: 'wbc',          label: 'Leucocitos',       unit: 'K/uL',  normal: '3.6–11.2',  category: 'blood',    criticalHigh: 15,   warnLow: 3.6 },
  { key: 'platelets',    label: 'Plaquetas',        unit: 'K/uL',  normal: '140–440',   category: 'blood',    warnLow: 140 },
  { key: 'sodium',       label: 'Sodio',            unit: 'mEq/L', normal: '136–145',   category: 'electro',  warnLow: 136, warnHigh: 145 },
  { key: 'potassium',    label: 'Potasio',          unit: 'mEq/L', normal: '3.5–5.1',   category: 'electro',  criticalHigh: 5.5,  warnLow: 3.5 },
  { key: 'alt',          label: 'ALT',              unit: 'U/L',   normal: '<44',        category: 'liver',    warnHigh: 44 },
  { key: 'ast',          label: 'AST',              unit: 'U/L',   normal: '<43',        category: 'liver',    warnHigh: 43 },
  { key: 'albumin',      label: 'Albúmina',         unit: 'g/dL',  normal: '3.5–5.2',   category: 'liver',    warnLow: 3.5 },
  { key: 'tsh',          label: 'TSH',              unit: 'mUI/L', normal: '0.4–4.0',   category: 'other',    warnHigh: 4 },
  { key: 'vitamin_d',    label: 'Vitamina D',       unit: 'ng/mL', normal: '30–100',     category: 'other',    warnLow: 30 },
  { key: 'ferritin',     label: 'Ferritina',        unit: 'ng/mL', normal: '12–300',     category: 'other',    warnLow: 12 },
  { key: 'bun',          label: 'BUN/Urea',         unit: 'mg/dl', normal: '8–26',       category: 'kidney',   warnHigh: 26 },
]

const STELO_FIELDS = [
  { key: 'glucose_fasting', label: 'Glucosa Ayunas',   unit: 'mg/dl', meta: '80–100',  criticalHigh: 140, warnHigh: 100 },
  { key: 'glucose_peak',    label: 'Pico Post-comida', unit: 'mg/dl', meta: '<140',    criticalHigh: 180, warnHigh: 140 },
  { key: 'glucose_avg',     label: 'Promedio Día',     unit: 'mg/dl', meta: '<115',    criticalHigh: 154, warnHigh: 115 },
  { key: 'time_in_range',   label: 'Time in Range',    unit: '%',     meta: '>70%',    criticalLow: 50,   warnLow: 70 },
]

const CATEGORY_CONFIG = {
  diabetes: { accent: '#4f8ef7', label: 'Diabetes',     icon: '🩸' },
  kidney:   { accent: '#4caf82', label: 'Riñones',       icon: '🫘' },
  lipids:   { accent: '#f7704f', label: 'Lípidos',       icon: '💊' },
  blood:    { accent: '#e8507a', label: 'Sangre',        icon: '🔴' },
  electro:  { accent: '#f7c04f', label: 'Electrolitos',  icon: '⚡' },
  liver:    { accent: '#a0c878', label: 'Hígado',        icon: '🟢' },
  other:    { accent: '#b97cf7', label: 'Otros',         icon: '🔬' },
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getStatus(field, value) {
  if (value === null || value === undefined || value === '') return 'normal'
  const v = parseFloat(value)
  if (isNaN(v)) return 'normal'
  if ((field.criticalHigh && v >= field.criticalHigh) || (field.criticalLow && v <= field.criticalLow)) return 'critical'
  if ((field.warnHigh && v > field.warnHigh) || (field.warnLow && v < field.warnLow)) return 'warn'
  return 'normal'
}

const STATUS_COLOR = { critical: '#f7704f', warn: '#f7c04f', normal: '#4caf82' }

function getColor(field, value) {
  return STATUS_COLOR[getStatus(field, value)]
}

function Sparkline({ values, color }) {
  if (!values || values.length < 2) return null
  const nums = values.map(Number).filter(v => !isNaN(v))
  if (nums.length < 2) return null
  const min = Math.min(...nums), max = Math.max(...nums)
  const range = max - min || 1
  const W = 70, H = 26
  const pts = nums.map((v, i) => `${(i / (nums.length - 1)) * W},${H - ((v - min) / range) * (H - 4) + 2}`).join(' ')
  const last = pts.split(' ').pop().split(',')
  const trend = nums[nums.length - 1] - nums[0]
  const trendColor = Math.abs(trend) < range * 0.05 ? '#888' : (trend > 0 ? '#f7704f' : '#4caf82')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
      <svg width={W} height={H}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" opacity="0.5" />
        <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
      </svg>
      <span style={{ fontSize: 9, color: trendColor }}>{trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend.toFixed ? trend.toFixed(1) : trend)}</span>
    </div>
  )
}

function GaugeBar({ value, field }) {
  if (!value) return null
  const v = parseFloat(value)
  const color = getColor(field, v)
  const status = getStatus(field, v)
  const pct = Math.min(100, Math.max(5,
    field.criticalHigh ? (v / (field.criticalHigh * 1.2)) * 100 :
    field.warnHigh ? (v / (field.warnHigh * 1.5)) * 100 : 50
  ))
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ height: 4, background: '#1e2230', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.6s ease' }} />
      </div>
      {status !== 'normal' && (
        <div style={{ fontSize: 9, color, marginTop: 2 }}>
          {status === 'critical' ? '⚠️ CRÍTICO' : '⚡ Fuera de rango'}
        </div>
      )}
    </div>
  )
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const st = {
  input: {
    width: '100%', background: '#13151e', border: '1px solid #2a2c3a',
    borderRadius: 10, padding: '11px 14px', color: '#e8eaf0',
    fontSize: 15, outline: 'none', boxSizing: 'border-box',
  },
  btn: (color = '#1a3a7a') => ({
    width: '100%', background: `linear-gradient(135deg, ${color}, ${color}cc)`,
    border: 'none', borderRadius: 12, padding: '14px',
    color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
    letterSpacing: 0.3, marginTop: 8, transition: 'opacity 0.2s',
  }),
  card: {
    background: '#13151e', border: '1px solid #1e2230',
    borderRadius: 14, padding: '14px 16px', marginBottom: 10,
  },
  label: {
    fontSize: 11, color: '#555', display: 'block',
    marginBottom: 5, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  section: (accent) => ({
    fontSize: 11, color: accent, fontWeight: 700, letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: 10, paddingBottom: 6,
    borderBottom: `1px solid ${accent}33`,
  }),
}

// ─── UPLOAD COMPONENT ─────────────────────────────────────────────────────────

function UploadZone({ onResult }) {
  const [state, setState] = useState('idle') // idle | loading | done | error
  const [progress, setProgress] = useState('')
  const [preview, setPreview] = useState(null)
  const fileRef = useRef()

  const processFile = async (file) => {
    setState('loading')
    setProgress('Leyendo archivo...')
    setPreview(null)

    try {
      const ext = file.name.split('.').pop().toLowerCase()
      const formData = new FormData()
      formData.append('fileType', ext)

      if (['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext)) {
        setProgress('Analizando imagen con IA...')
        const base64 = await fileToBase64(file)
        const mime = ext === 'png' ? 'image/png' : 'image/jpeg'
        formData.append('imageData', base64)
        formData.append('imageMime', mime)

      } else if (ext === 'pdf') {
        setProgress('Extrayendo texto del PDF...')
        const base64 = await fileToBase64(file)
        formData.append('imageData', base64)
        formData.append('imageMime', 'application/pdf')

      } else if (['doc', 'docx'].includes(ext)) {
        setProgress('Leyendo documento Word...')
        const text = await readDocx(file)
        formData.append('extractedText', text)

      } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
        setProgress('Leyendo spreadsheet...')
        const text = await readExcel(file)
        formData.append('extractedText', text)

      } else if (ext === 'txt') {
        const text = await file.text()
        formData.append('extractedText', text)

      } else {
        throw new Error('Formato no soportado. Usa: JPG, PNG, PDF, DOCX, XLSX, CSV, TXT')
      }

      setProgress('Claude está analizando tus resultados...')
      const res = await fetch('/api/analyze', { method: 'POST', body: formData })
      const json = await res.json()

      if (!json.success) throw new Error(json.error || 'Error al analizar')

      setState('done')
      setPreview(json.data)
      onResult(json.data)

    } catch (err) {
      setState('error')
      setProgress(err.message)
    }
  }

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const readDocx = async (file) => {
    const mammoth = (await import('mammoth')).default
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value
  }

  const readExcel = async (file) => {
    const XLSX = (await import('xlsx')).default
    const arrayBuffer = await file.arrayBuffer()
    const wb = XLSX.read(arrayBuffer, { type: 'array' })
    return wb.SheetNames.map(name => {
      const ws = wb.Sheets[name]
      return XLSX.utils.sheet_to_csv(ws)
    }).join('\n\n')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer?.files?.[0]
    if (file) processFile(file)
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: `2px dashed ${state === 'done' ? '#4caf82' : state === 'error' ? '#f7704f' : '#2a3a5a'}`,
          borderRadius: 16, padding: '32px 20px', textAlign: 'center',
          cursor: 'pointer', background: '#13151e', transition: 'all 0.3s',
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 10 }}>
          {state === 'loading' ? '⏳' : state === 'done' ? '✅' : state === 'error' ? '❌' : '📤'}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: state === 'error' ? '#f7704f' : '#e8eaf0', marginBottom: 6 }}>
          {state === 'idle' && 'Sube tu resultado'}
          {state === 'loading' && progress}
          {state === 'done' && '¡Análisis completado!'}
          {state === 'error' && progress}
        </div>
        <div style={{ fontSize: 11, color: '#444' }}>
          {state === 'idle' && 'JPG · PNG · PDF · DOCX · XLSX · CSV'}
          {state === 'loading' && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#4f8ef7',
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          )}
          {state === 'done' && 'Toca para subir otro archivo'}
          {state === 'error' && 'Toca para intentar de nuevo'}
        </div>
      </div>

      <input
        ref={fileRef} type="file" style={{ display: 'none' }}
        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
        onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]) }}
      />

      {/* Preview of extracted data */}
      {preview && (
        <div style={{ background: '#0d1a0d', border: '1px solid #4caf8244', borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: '#4caf82', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
            🤖 CLAUDE ENCONTRÓ
          </div>

          {preview.date && (
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>📅 Fecha: {preview.date}</div>
          )}

          {/* Values grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
            {LAB_FIELDS.concat(STELO_FIELDS).map(f => {
              const v = preview.values?.[f.key]
              if (!v) return null
              const color = getColor(f, v)
              return (
                <div key={f.key} style={{ background: '#13151e', borderRadius: 8, padding: '6px 10px' }}>
                  <div style={{ fontSize: 10, color: '#555' }}>{f.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color }}>{v} <span style={{ fontSize: 9, opacity: 0.6 }}>{f.unit}</span></div>
                </div>
              )
            })}
          </div>

          {/* Alerts */}
          {preview.alerts?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              {preview.alerts.map((a, i) => (
                <div key={i} style={{ fontSize: 11, color: '#f7704f', padding: '4px 0', borderBottom: '1px solid #1e2230' }}>
                  ⚠️ {a}
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {preview.summary && (
            <div style={{ fontSize: 12, color: '#888', fontStyle: 'italic', lineHeight: 1.5 }}>
              {preview.summary}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function HealthTracker() {
  const [tab, setTab] = useState('upload')
  const [labs, setLabs] = useState([])
  const [stelo, setStelo] = useState([])
  const [labForm, setLabForm] = useState({ date: today() })
  const [steloForm, setSteloForm] = useState({ date: today() })
  const [saved, setSaved] = useState(false)
  const [expandedLab, setExpandedLab] = useState(null)

  function today() { return new Date().toISOString().split('T')[0] }

  useEffect(() => {
    try { const d = localStorage.getItem('mk_labs_v2'); if (d) setLabs(JSON.parse(d)) } catch {}
    try { const d = localStorage.getItem('mk_stelo_v2'); if (d) setStelo(JSON.parse(d)) } catch {}
  }, [])

  const saveLabs = (data) => { localStorage.setItem('mk_labs_v2', JSON.stringify(data)); setLabs(data) }
  const saveStelo = (data) => { localStorage.setItem('mk_stelo_v2', JSON.stringify(data)); saveStelo(data) }

  const flash = (cb) => { setSaved(true); setTimeout(() => { setSaved(false); cb?.() }, 1800) }

  // When Claude returns data from file upload, pre-fill the lab form
  const handleUploadResult = (data) => {
    const newEntry = {
      id: Date.now(),
      date: data.date || today(),
      source: 'upload',
      raw_findings: data.raw_findings || [],
      alerts: data.alerts || [],
      summary: data.summary || '',
      ...data.values,
    }
    const updated = [newEntry, ...labs]
    saveLabs(updated)
    flash()
  }

  const submitLabForm = () => {
    if (!labForm.date) return
    const updated = [{ ...labForm, id: Date.now(), source: 'manual' }, ...labs]
    saveLabs(updated)
    setLabForm({ date: today() })
    flash(() => setTab('dashboard'))
  }

  const submitSteloForm = () => {
    if (!steloForm.date) return
    const persistData = (data) => { localStorage.setItem('mk_stelo_v2', JSON.stringify(data)); setStelo(data) }
    const updated = [{ ...steloForm, id: Date.now() }, ...stelo]
    persistData(updated)
    setSteloForm({ date: today() })
    flash(() => setTab('dashboard'))
  }

  const latest = labs[0] || {}
  const latestStelo = stelo[0] || {}

  const fieldHistory = (key) => [...labs].reverse().filter(l => l[key] != null).map(l => l[key])

  const criticalAlerts = labs.length > 0 ? LAB_FIELDS.filter(f => {
    const v = latest[f.key]
    return v && getStatus(f, v) === 'critical'
  }) : []

  const TABS = [
    { id: 'upload',    icon: '📤', label: 'Subir' },
    { id: 'dashboard', icon: '📊', label: 'Resumen' },
    { id: 'manual',    icon: '✏️',  label: 'Manual' },
    { id: 'historial', icon: '📋', label: 'Historial' },
  ]

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 90 }}>

      {/* Header */}
      <div style={{ padding: '18px 18px 12px', borderBottom: '1px solid #1e2230', background: '#0d0f14', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: '#4f8ef7', textTransform: 'uppercase', marginBottom: 2 }}>Health Monitor</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Mikail Kocak</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {criticalAlerts.length > 0 && (
              <div style={{ background: '#f7704f22', border: '1px solid #f7704f44', borderRadius: 6, padding: '3px 8px', fontSize: 10, color: '#f7704f', fontWeight: 700 }}>
                ⚠️ {criticalAlerts.length} alerta{criticalAlerts.length > 1 ? 's' : ''}
              </div>
            )}
            <div style={{ background: '#1a2744', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: '#4f8ef7', border: '1px solid #2a3a5a' }}>
              46 · USA
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* ── UPLOAD TAB ── */}
        {tab === 'upload' && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Subir Resultados</div>
            <div style={{ fontSize: 12, color: '#555', marginBottom: 16 }}>
              Claude lee y extrae automáticamente todos los valores
            </div>
            <UploadZone onResult={handleUploadResult} />

            {saved && (
              <div style={{ background: '#0d1a0d', border: '1px solid #4caf8244', borderRadius: 10, padding: '12px 16px', marginTop: 12, textAlign: 'center', fontSize: 13, color: '#4caf82', fontWeight: 600 }}>
                ✅ Guardado en tu historial
              </div>
            )}

            {/* Stelo section */}
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#b97cf7', marginBottom: 12 }}>📈 Registro Diario Stelo</div>
              <div style={{ marginBottom: 12 }}>
                <label style={st.label}>Fecha</label>
                <input type="date" value={steloForm.date || ''} onChange={e => setSteloForm(p => ({ ...p, date: e.target.value }))} style={st.input} />
              </div>
              {STELO_FIELDS.map(f => (
                <div key={f.key} style={{ marginBottom: 12 }}>
                  <label style={{ ...st.label, color: '#aaa', textTransform: 'none', fontSize: 12 }}>
                    {f.label} <span style={{ color: '#333' }}>meta: {f.meta}</span>
                  </label>
                  <input
                    type="number" step="0.1" placeholder={f.unit}
                    value={steloForm[f.key] || ''}
                    onChange={e => setSteloForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={st.input}
                  />
                </div>
              ))}
              <div style={{ marginBottom: 12 }}>
                <label style={st.label}>¿Cómo te sentiste?</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['😴 Cansado', '😐 Normal', '💪 Bien', '🤕 Mal'].map(opt => (
                    <button key={opt} onClick={() => setSteloForm(p => ({ ...p, feeling: opt }))} style={{
                      flex: 1, padding: '8px 2px',
                      background: steloForm.feeling === opt ? '#1a2744' : '#13151e',
                      border: steloForm.feeling === opt ? '1px solid #4f8ef7' : '1px solid #2a2c3a',
                      borderRadius: 8, color: steloForm.feeling === opt ? '#4f8ef7' : '#444',
                      fontSize: 9, cursor: 'pointer',
                    }}>{opt}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={st.label}>Notas</label>
                <textarea
                  placeholder="Qué comiste, ejercicio, síntomas..."
                  value={steloForm.notes || ''}
                  onChange={e => setSteloForm(p => ({ ...p, notes: e.target.value }))}
                  style={{ ...st.input, height: 60, resize: 'none' }}
                />
              </div>
              <button onClick={submitSteloForm} style={st.btn('#6a2fa0')}>
                {saved ? '✅ Guardado' : 'Guardar Stelo'}
              </button>
            </div>
          </div>
        )}

        {/* ── DASHBOARD TAB ── */}
        {tab === 'dashboard' && (
          <div>
            {criticalAlerts.length > 0 && (
              <div style={{ background: 'linear-gradient(135deg,#3d1a1a,#2d1010)', border: '1px solid #f7704f44', borderRadius: 12, padding: '12px 16px', marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: '#f7704f', fontWeight: 700, marginBottom: 6 }}>⚠️ VALORES CRÍTICOS</div>
                {criticalAlerts.map(f => (
                  <div key={f.key} style={{ fontSize: 12, color: '#aaa', padding: '2px 0' }}>
                    {f.label}: <span style={{ color: '#f7704f', fontWeight: 700 }}>{latest[f.key]} {f.unit}</span>
                  </div>
                ))}
              </div>
            )}

            {labs.length === 0 && stelo.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#333' }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>🩺</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#555', marginBottom: 8 }}>Sin datos aún</div>
                <div style={{ fontSize: 13 }}>Usa <b style={{ color: '#4f8ef7' }}>Subir</b> para cargar tus resultados</div>
              </div>
            ) : (
              <>
                {Object.keys(CATEGORY_CONFIG).map(cat => {
                  const fields = LAB_FIELDS.filter(f => f.category === cat && latest[f.key] != null)
                  if (!fields.length) return null
                  const { accent, label, icon } = CATEGORY_CONFIG[cat]
                  return (
                    <div key={cat} style={{ ...st.card, border: `1px solid ${accent}22`, marginBottom: 12 }}>
                      <div style={st.section(accent)}>{icon} {label}</div>
                      {fields.map(f => {
                        const v = latest[f.key]
                        const color = getColor(f, v)
                        const history = fieldHistory(f.key)
                        return (
                          <div key={f.key} style={{ padding: '8px 0', borderBottom: '1px solid #ffffff06' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>{f.label}</div>
                                <div style={{ fontSize: 18, fontWeight: 800, color }}>
                                  {v} <span style={{ fontSize: 10, opacity: 0.5, fontWeight: 400 }}>{f.unit}</span>
                                </div>
                                <GaugeBar value={v} field={f} />
                              </div>
                              {history.length > 1 && <Sparkline values={history} color={accent} />}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}

                {stelo.length > 0 && (
                  <div style={{ ...st.card, border: '1px solid #b97cf722' }}>
                    <div style={st.section('#b97cf7')}>📈 Stelo — {latestStelo.date}</div>
                    {STELO_FIELDS.map(f => {
                      const v = latestStelo[f.key]
                      if (!v) return null
                      const color = getColor(f, v)
                      const history = [...stelo].reverse().filter(s => s[f.key]).map(s => s[f.key])
                      return (
                        <div key={f.key} style={{ padding: '8px 0', borderBottom: '1px solid #ffffff06' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>{f.label}</div>
                              <div style={{ fontSize: 18, fontWeight: 800, color }}>
                                {v} <span style={{ fontSize: 10, opacity: 0.5, fontWeight: 400 }}>{f.unit}</span>
                              </div>
                              <GaugeBar value={v} field={f} />
                            </div>
                            {history.length > 1 && <Sparkline values={history} color="#b97cf7" />}
                          </div>
                        </div>
                      )
                    })}
                    {latestStelo.feeling && <div style={{ fontSize: 12, color: '#555', marginTop: 8 }}>{latestStelo.feeling}</div>}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── MANUAL TAB ── */}
        {tab === 'manual' && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Ingreso Manual</div>
            <div style={{ fontSize: 12, color: '#555', marginBottom: 16 }}>Para cuando no tienes el archivo digital</div>

            <div style={{ marginBottom: 14 }}>
              <label style={st.label}>Fecha del análisis</label>
              <input type="date" value={labForm.date || ''} onChange={e => setLabForm(p => ({ ...p, date: e.target.value }))} style={st.input} />
            </div>

            {Object.keys(CATEGORY_CONFIG).map(cat => {
              const fields = LAB_FIELDS.filter(f => f.category === cat)
              const { accent, label, icon } = CATEGORY_CONFIG[cat]
              return (
                <div key={cat} style={{ marginBottom: 20 }}>
                  <div style={st.section(accent)}>{icon} {label}</div>
                  {fields.map(f => (
                    <div key={f.key} style={{ marginBottom: 10 }}>
                      <label style={st.label}>
                        {f.label} <span style={{ color: '#2a2c3a' }}>({f.normal} {f.unit})</span>
                      </label>
                      <input
                        type="number" step="0.01" placeholder={`ej: ${f.unit}`}
                        value={labForm[f.key] || ''}
                        onChange={e => setLabForm(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{
                          ...st.input,
                          borderColor: labForm[f.key] ? getColor(f, labForm[f.key]) + '66' : '#2a2c3a',
                        }}
                      />
                    </div>
                  ))}
                </div>
              )
            })}

            <div style={{ marginBottom: 14 }}>
              <label style={st.label}>Notas</label>
              <textarea
                placeholder="Observaciones del médico, síntomas, cambios de medicamento..."
                value={labForm.notes || ''}
                onChange={e => setLabForm(p => ({ ...p, notes: e.target.value }))}
                style={{ ...st.input, height: 80, resize: 'none' }}
              />
            </div>

            <button onClick={submitLabForm} style={st.btn()}>
              {saved ? '✅ Guardado' : 'Guardar Resultados'}
            </button>
          </div>
        )}

        {/* ── HISTORIAL TAB ── */}
        {tab === 'historial' && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#4f8ef7', marginBottom: 12 }}>
              🧪 Laboratorios ({labs.length})
            </div>

            {labs.length === 0 ? (
              <div style={{ color: '#333', fontSize: 12, marginBottom: 24 }}>Sin resultados guardados</div>
            ) : labs.map((l, idx) => (
              <div key={l.id} style={{ ...st.card, cursor: 'pointer' }} onClick={() => setExpandedLab(expandedLab === l.id ? null : l.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedLab === l.id ? 10 : 0 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>📅 {l.date}</div>
                    <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>
                      {l.source === 'upload' ? '🤖 Subido automáticamente' : '✏️ Manual'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 16, color: '#333' }}>{expandedLab === l.id ? '▲' : '▼'}</span>
                    <button onClick={(e) => { e.stopPropagation(); saveLabs(labs.filter(x => x.id !== l.id)) }} style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: 18 }}>🗑</button>
                  </div>
                </div>

                {expandedLab === l.id && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
                      {LAB_FIELDS.map(f => {
                        if (!l[f.key]) return null
                        const color = getColor(f, l[f.key])
                        return (
                          <div key={f.key} style={{ background: '#1a1c24', borderRadius: 8, padding: '6px 10px' }}>
                            <div style={{ fontSize: 10, color: '#444' }}>{f.label}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color }}>{l[f.key]} <span style={{ fontSize: 9, opacity: 0.5 }}>{f.unit}</span></div>
                          </div>
                        )
                      })}
                    </div>
                    {l.alerts?.length > 0 && l.alerts.map((a, i) => (
                      <div key={i} style={{ fontSize: 11, color: '#f7704f', padding: '3px 0' }}>⚠️ {a}</div>
                    ))}
                    {l.summary && <div style={{ fontSize: 11, color: '#555', marginTop: 8, fontStyle: 'italic', lineHeight: 1.5 }}>{l.summary}</div>}
                    {l.notes && <div style={{ fontSize: 11, color: '#555', marginTop: 6, fontStyle: 'italic' }}>{l.notes}</div>}
                  </div>
                )}
              </div>
            ))}

            <div style={{ fontSize: 13, fontWeight: 700, color: '#b97cf7', marginBottom: 12, marginTop: 20 }}>
              📈 Stelo ({stelo.length} días)
            </div>

            {stelo.length === 0 ? (
              <div style={{ color: '#333', fontSize: 12 }}>Sin registros Stelo</div>
            ) : stelo.map(entry => (
              <div key={entry.id} style={st.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>📅 {entry.date} {entry.feeling}</div>
                  <button onClick={() => { const d = stelo.filter(x => x.id !== entry.id); localStorage.setItem('mk_stelo_v2', JSON.stringify(d)); setStelo(d) }} style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: 18 }}>🗑</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {STELO_FIELDS.map(f => entry[f.key] ? (
                    <div key={f.key} style={{ background: '#1a1c24', borderRadius: 8, padding: '6px 10px' }}>
                      <div style={{ fontSize: 10, color: '#444' }}>{f.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: getColor(f, entry[f.key]) }}>{entry[f.key]} <span style={{ fontSize: 9, opacity: 0.5 }}>{f.unit}</span></div>
                    </div>
                  ) : null)}
                </div>
                {entry.notes && <div style={{ fontSize: 11, color: '#444', marginTop: 8, fontStyle: 'italic' }}>{entry.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480, background: '#0d0f14',
        borderTop: '1px solid #1e2230', display: 'flex', zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '10px 4px 12px', background: 'none', border: 'none',
            borderTop: tab === t.id ? '2px solid #4f8ef7' : '2px solid transparent',
            color: tab === t.id ? '#4f8ef7' : '#444', cursor: 'pointer', transition: 'all 0.2s',
          }}>
            <div style={{ fontSize: 20 }}>{t.icon}</div>
            <div style={{ fontSize: 10, marginTop: 2, fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
