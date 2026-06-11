'use client'
import { useState, useEffect, useRef } from 'react'

// ─── CONFIG DATA ──────────────────────────────────────────────────────────────

const LABS = [
  { key:'hba1c',        label:'HbA1c',             unit:'%',      cat:'Diabetes',     hi:6.5, cHi:8,    warn:'> 6.5%' },
  { key:'glucose',      label:'Glucose',            unit:'mg/dl',  cat:'Diabetes',     lo:70,  hi:99,    cHi:200 },
  { key:'creatinine',   label:'Creatinine',         unit:'mg/dl',  cat:'Kidneys',      hi:1.18,cHi:2 },
  { key:'egfr',         label:'eGFR',               unit:'ml/min', cat:'Kidneys',      lo:60,  cLo:30 },
  { key:'acr',          label:'ACR',                unit:'mg/g',   cat:'Kidneys',      hi:29,  cHi:300 },
  { key:'bun',          label:'BUN',                unit:'mg/dl',  cat:'Kidneys',      hi:26,  cHi:50 },
  { key:'ldl',          label:'LDL Cholesterol',    unit:'mg/dl',  cat:'Lipids',       hi:99,  cHi:160 },
  { key:'hdl',          label:'HDL Cholesterol',    unit:'mg/dl',  cat:'Lipids',       lo:40,  cLo:35 },
  { key:'triglycerides',label:'Triglycerides',      unit:'mg/dl',  cat:'Lipids',       hi:149, cHi:500 },
  { key:'cholesterol',  label:'Total Cholesterol',  unit:'mg/dl',  cat:'Lipids',       hi:199, cHi:300 },
  { key:'hemoglobin',   label:'Hemoglobin',         unit:'g/dL',   cat:'Blood',        lo:13,  hi:16.7, cLo:10 },
  { key:'wbc',          label:'White Blood Cells',  unit:'K/uL',   cat:'Blood',        lo:3.6, hi:11.2, cHi:15 },
  { key:'platelets',    label:'Platelets',          unit:'K/uL',   cat:'Blood',        lo:140, hi:440,  cLo:100 },
  { key:'sodium',       label:'Sodium',             unit:'mEq/L',  cat:'Electrolytes', lo:136, hi:145 },
  { key:'potassium',    label:'Potassium',          unit:'mEq/L',  cat:'Electrolytes', lo:3.5, hi:5.1,  cHi:5.5 },
  { key:'alt',          label:'ALT',                unit:'U/L',    cat:'Liver',        hi:44,  cHi:100 },
  { key:'ast',          label:'AST',                unit:'U/L',    cat:'Liver',        hi:43,  cHi:100 },
  { key:'albumin',      label:'Albumin',            unit:'g/dL',   cat:'Liver',        lo:3.5, hi:5.2 },
  { key:'tsh',          label:'TSH',                unit:'mUI/L',  cat:'Other',        lo:0.4, hi:4.0,  cHi:10 },
  { key:'vitamin_d',    label:'Vitamin D',          unit:'ng/mL',  cat:'Other',        lo:30,  hi:100,  cLo:10 },
  { key:'uric_acid',    label:'Uric Acid',          unit:'mg/dl',  cat:'Other',        hi:7.0, cHi:9 },
  { key:'ferritin',     label:'Ferritin',           unit:'ng/mL',  cat:'Other',        lo:12,  hi:300 },
  { key:'systolic',     label:'Systolic BP',        unit:'mmHg',   cat:'Vitals',       hi:130, cHi:160 },
  { key:'diastolic',    label:'Diastolic BP',       unit:'mmHg',   cat:'Vitals',       hi:80,  cHi:100 },
  { key:'weight_kg',    label:'Weight',             unit:'kg',     cat:'Vitals' },
]

const STELO = [
  { key:'glucose_fasting', label:'Fasting Glucose',   unit:'mg/dl', target:'80–100',  hi:100, cHi:140 },
  { key:'glucose_peak',    label:'Peak Post-meal',     unit:'mg/dl', target:'< 140',   hi:140, cHi:180 },
  { key:'glucose_avg',     label:'Daily Average',      unit:'mg/dl', target:'< 115',   hi:115, cHi:154 },
  { key:'time_in_range',   label:'Time in Range',      unit:'%',     target:'> 70%',   lo:70,  cLo:50 },
]

const CAT_COLOR = {
  Diabetes:    '#4F46E5',
  Kidneys:     '#0891B2',
  Lipids:      '#DC2626',
  Blood:       '#DB2777',
  Electrolytes:'#D97706',
  Liver:       '#16A34A',
  Vitals:      '#7C3AED',
  Other:       '#6B7280',
}

const MEDS_DEFAULT = {
  morning: [
    { id:'m1', name:'Losartan',        dose:'25 mg',    with:'Breakfast',         note:'Kidney protection · blood pressure', type:'rx' },
    { id:'m2', name:'Metformin',       dose:'500 mg',   with:'Breakfast',         note:'Diabetes', type:'rx' },
    { id:'m3', name:'Vitamin D3 + K2', dose:'5000 IU',  with:'Breakfast',         note:'', type:'vit' },
    { id:'m4', name:'CoQ10',           dose:'200 mg',   with:'Breakfast + MCT',   note:'Essential with statin', type:'vit' },
    { id:'m5', name:'Vitamin B12',     dose:'—',        with:'Breakfast',         note:'Metformin depletes B12', type:'vit' },
    { id:'m6', name:'GTF Chromium',    dose:'200 mcg',  with:'Breakfast',         note:'', type:'vit' },
    { id:'m7', name:'Ceylon Cinnamon', dose:'—',        with:'Breakfast',         note:'', type:'vit' },
    { id:'m8', name:'MCT Oil',         dose:'—',        with:'Coffee / breakfast', note:'', type:'vit' },
    { id:'m9', name:'Alpha Lipoic Acid',dose:'—',       with:'30 min before eating',note:'Antioxidant · insulin', type:'vit' },
    { id:'m10',name:'NMN',             dose:'—',        with:'30 min before eating',note:'NAD+ · longevity', type:'vit' },
    { id:'m11',name:'Fenofibrate',     dose:'145 mg',   with:'Lunch (with fat)',   note:'Triglycerides', type:'rx' },
    { id:'m12',name:'Omega-3',         dose:'—',        with:'Lunch',             note:'Half dose', type:'vit' },
    { id:'m13',name:'Apple Cider Vinegar',dose:'—',     with:'Before lunch',      note:'', type:'vit' },
  ],
  night: [
    { id:'n1', name:'Atorvastatin',    dose:'40 mg',    with:'Before bed',        note:'Cholesterol — always at night', type:'rx' },
    { id:'n2', name:'Metformin',       dose:'500 mg',   with:'Dinner',            note:'Diabetes — 2nd dose', type:'rx' },
    { id:'n3', name:'Magnesium Glycinate',dose:'300–400mg',with:'Before bed',     note:'Sleep · blood pressure', type:'vit' },
    { id:'n4', name:'Omega-3',         dose:'—',        with:'Dinner',            note:'2nd half of dose', type:'vit' },
  ]
}

const CONTACTS_DEFAULT = [
  { id:'c1', specialty:'Primary Care',    name:'', hospital:'', phone:'', address:'', notes:'' },
  { id:'c2', specialty:'Nephrologist',    name:'', hospital:'', phone:'', address:'', notes:'' },
  { id:'c3', specialty:'Cardiologist',    name:'', hospital:'', phone:'', address:'', notes:'' },
  { id:'c4', specialty:'Endocrinologist', name:'', hospital:'', phone:'', address:'', notes:'' },
]

// ─── UTILS ────────────────────────────────────────────────────────────────────

function st(f, v) {
  if (v == null || v === '') return 'ok'
  const n = parseFloat(v); if (isNaN(n)) return 'ok'
  if ((f.cHi && n >= f.cHi) || (f.cLo != null && n <= f.cLo)) return 'crit'
  if ((f.hi  && n > f.hi)   || (f.lo  != null && n < f.lo))   return 'warn'
  return 'ok'
}

const SC = { crit: '#EF4444', warn: '#F59E0B', ok: '#10B981' }
const SBG = { crit: '#FEF2F2', warn: '#FFFBEB', ok: '#ECFDF5' }
const SBD = { crit: '#FECACA', warn: '#FDE68A', ok: '#A7F3D0' }
const SL  = { crit: 'Critical', warn: 'High', ok: 'Normal' }
const gc  = (f, v) => SC[st(f, v)]
const gbg = (f, v) => SBG[st(f, v)]

const today = () => new Date().toISOString().split('T')[0]

const lsGet = (k, fb) => { try { const d = localStorage.getItem(k); return d ? JSON.parse(d) : fb } catch { return fb } }
const lsSet = (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

function normalRange(f) {
  if (f.lo != null && f.hi) return `${f.lo}–${f.hi}`
  if (f.hi) return `< ${f.hi}`
  if (f.lo != null) return `> ${f.lo}`
  return '—'
}

// ─── SPARKLINE ────────────────────────────────────────────────────────────────

function Spark({ data, color, width = 80, height = 32 }) {
  if (!data || data.length < 2) return null
  const nums = data.map(Number).filter(v => !isNaN(v))
  if (nums.length < 2) return null
  const mn = Math.min(...nums), mx = Math.max(...nums), rng = mx - mn || 1
  const W = width, H = height, pad = 4
  const pts = nums.map((v, i) =>
    `${(i / (nums.length - 1)) * (W - pad * 2) + pad},${H - pad - ((v - mn) / rng) * (H - pad * 2)}`
  ).join(' ')
  const last = pts.trim().split(' ').pop().split(',')
  const trend = nums[nums.length - 1] - nums[0]
  const tc = trend > rng * 0.05 ? '#EF4444' : trend < -rng * 0.05 ? '#10B981' : '#9CA3AF'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
      <svg width={W} height={H} style={{ display: 'block' }}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" opacity=".7" />
        <circle cx={parseFloat(last[0])} cy={parseFloat(last[1])} r="3" fill={color} />
      </svg>
      <span style={{ fontSize: 9, fontWeight: 600, color: tc }}>
        {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(parseFloat(trend.toFixed(1)))}
      </span>
    </div>
  )
}

// ─── GAUGE ────────────────────────────────────────────────────────────────────

function Gauge({ value, field, size = 64 }) {
  if (!value) return null
  const v = parseFloat(value)
  const color = gc(field, v)
  const ref = field.cHi || (field.hi ? field.hi * 1.6 : field.cLo ? field.cLo * 0.4 : 100)
  const pct = Math.min(0.96, Math.max(0.04, v / ref))
  const r = size / 2 - 6
  const circ = Math.PI * r
  const dash = pct * circ
  return (
    <div style={{ position: 'relative', width: size, height: size / 2 + 8, flexShrink: 0 }}>
      <svg width={size} height={size / 2 + 8} style={{ display: 'block' }}>
        <path d={`M 6 ${size/2} A ${r} ${r} 0 0 1 ${size-6} ${size/2}`}
          fill="none" stroke="#F3F4F6" strokeWidth="5" strokeLinecap="round" />
        <path d={`M 6 ${size/2} A ${r} ${r} 0 0 1 ${size-6} ${size/2}`}
          fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray .6s ease' }} />
        <circle cx={size / 2} cy={size / 2} r="2.5" fill={color} />
      </svg>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        textAlign: 'center', lineHeight: 1
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color }}>{v}</div>
        <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 1 }}>{field.unit}</div>
      </div>
    </div>
  )
}

// ─── STATUS CHIP ──────────────────────────────────────────────────────────────

function Chip({ status }) {
  if (status === 'ok') return null
  const bg = SBG[status], bd = SBD[status], tc = SC[status]
  return (
    <span style={{
      display: 'inline-block', fontSize: 10, fontWeight: 600,
      padding: '2px 7px', borderRadius: 20,
      background: bg, color: tc, border: `1px solid ${bd}`
    }}>
      {SL[status]}
    </span>
  )
}

// ─── UPLOAD ZONE ─────────────────────────────────────────────────────────────

function UploadZone({ onResult }) {
  const [phase, setPhase] = useState('idle')
  const [msg,   setMsg]   = useState('')
  const [result,setResult]= useState(null)
  const ref = useRef()

  const toB64 = f => new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result.split(',')[1]); r.onerror = rej; r.readAsDataURL(f)
  })

  const run = async (file) => {
    setPhase('loading'); setResult(null)
    const ext = file.name.split('.').pop().toLowerCase()
    try {
      let body = {}
      if (['jpg','jpeg','png','webp','heic','heif'].includes(ext)) {
        setMsg('Analyzing image…')
        body = { imageData: await toB64(file), imageMime: ext === 'png' ? 'image/png' : 'image/jpeg' }
      } else if (ext === 'pdf') {
        setMsg('Reading PDF…')
        body = { imageData: await toB64(file), imageMime: 'application/pdf' }
      } else if (['txt','csv'].includes(ext)) {
        setMsg('Reading file…')
        body = { text: await file.text() }
      } else {
        throw new Error('Supported: JPG, PNG, PDF, TXT, CSV')
      }

      setMsg('Claude is analyzing your results…')
      const res  = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error)
      setPhase('done'); setResult(json.data); onResult(json.data)
    } catch (e) {
      setPhase('error'); setMsg(e.message)
    }
  }

  const bcolor = phase === 'done' ? '#10B981' : phase === 'error' ? '#EF4444' : '#E5E7EB'

  return (
    <div>
      <div onClick={() => { setPhase('idle'); ref.current?.click() }}
        onDrop={e => { e.preventDefault(); run(e.dataTransfer.files[0]) }}
        onDragOver={e => e.preventDefault()}
        style={{
          border: `2px dashed ${bcolor}`, borderRadius: 16, padding: '32px 20px',
          textAlign: 'center', cursor: 'pointer', background: '#fff',
          marginBottom: 16, transition: 'border-color .25s'
        }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>
          {phase === 'loading' ? '⏳' : phase === 'done' ? '✓' : phase === 'error' ? '✕' : '↑'}
        </div>
        <div style={{
          fontSize: 15, fontWeight: 600, marginBottom: 4,
          color: phase === 'error' ? '#EF4444' : phase === 'done' ? '#10B981' : '#1F2937'
        }}>
          {phase === 'idle'    && 'Upload your lab result'}
          {phase === 'loading' && msg}
          {phase === 'done'    && 'Done — tap to upload another'}
          {phase === 'error'   && msg}
        </div>
        <div style={{ fontSize: 12, color: '#9CA3AF' }}>
          {(phase === 'idle' || phase === 'done') && 'Photo · PDF · JPG · PNG · TXT · CSV  ·  Albanian · English · Turkish · Spanish'}
        </div>
        {phase === 'loading' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: '50%', background: '#4F46E5',
                animation: `pulse 1.1s ease-in-out ${i * .18}s infinite`
              }} />
            ))}
          </div>
        )}
      </div>

      <input ref={ref} type="file" style={{ display: 'none' }}
        accept=".jpg,.jpeg,.png,.pdf,.txt,.csv,.heic,.heif,.webp"
        onChange={e => { if (e.target.files?.[0]) run(e.target.files[0]) }} />

      {result && (
        <div style={{ background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#065F46', letterSpacing: 1.5, marginBottom: 12 }}>
            CLAUDE EXTRACTED
          </div>
          {result.date && (
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>
              Date detected: {result.date}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 10 }}>
            {[...LABS, ...STELO].map(f => {
              const v = result.values?.[f.key]; if (!v) return null
              const c = gc(f, v), bg = gbg(f, v)
              return (
                <div key={f.key} style={{ background: '#fff', borderRadius: 10, padding: '7px 11px', borderLeft: `3px solid ${c}` }}>
                  <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2 }}>{f.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: c }}>
                    {v} <span style={{ fontSize: 9, opacity: .5, fontWeight: 400 }}>{f.unit}</span>
                  </div>
                </div>
              )
            })}
          </div>
          {result.alerts?.map((a, i) => (
            <div key={i} style={{ fontSize: 11, color: '#DC2626', padding: '3px 0' }}>⚠ {a}</div>
          ))}
          {result.summary && (
            <div style={{ fontSize: 12, color: '#374151', marginTop: 10, lineHeight: 1.6, fontStyle: 'italic' }}>
              {result.summary}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:.2;transform:scale(.75)}50%{opacity:1;transform:scale(1.2)}}`}</style>
    </div>
  )
}

// ─── CHART ────────────────────────────────────────────────────────────────────

function TrendChart({ labHistory, steloHistory }) {
  const [selected, setSelected] = useState('hba1c')

  const allFields = [...LABS, ...STELO]
  const field = allFields.find(f => f.key === selected)

  const data = selected.startsWith('glucose_') || selected === 'time_in_range'
    ? [...steloHistory].reverse().filter(s => s[selected] != null).map(s => ({ date: s.date, val: parseFloat(s[selected]) }))
    : [...labHistory].reverse().filter(l => l[selected] != null).map(l => ({ date: l.date, val: parseFloat(l[selected]) }))

  const availableFields = allFields.filter(f => {
    const src = f.key.startsWith('glucose_') || f.key === 'time_in_range' ? steloHistory : labHistory
    return src.some(e => e[f.key] != null)
  })

  if (!availableFields.length) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF' }}>
        <div style={{ fontSize: 32, marginBottom: 8, opacity: .3 }}>📈</div>
        <div style={{ fontSize: 13 }}>Upload results to see trends</div>
      </div>
    )
  }

  const H = 140, W_PAD = 40, TOP_PAD = 16, BOT_PAD = 24
  const vals = data.map(d => d.val)
  const mn = vals.length ? Math.min(...vals) : 0
  const mx = vals.length ? Math.max(...vals) : 100
  const rng = mx - mn || 1

  const color = field ? (CAT_COLOR[field.cat] || '#4F46E5') : '#4F46E5'

  const pts = data.map((d, i) => {
    const x = W_PAD + (i / Math.max(data.length - 1, 1)) * (300 - W_PAD * 2)
    const y = TOP_PAD + (1 - (d.val - mn) / rng) * (H - TOP_PAD - BOT_PAD)
    return { x, y, d }
  })

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,.08)', border: '1px solid #E5E7EB' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Trend Analysis</div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {availableFields.slice(0, 10).map(f => (
          <button key={f.key} onClick={() => setSelected(f.key)} style={{
            padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
            border: `1px solid ${selected === f.key ? CAT_COLOR[f.cat] || '#4F46E5' : '#E5E7EB'}`,
            background: selected === f.key ? (CAT_COLOR[f.cat] || '#4F46E5') : '#fff',
            color: selected === f.key ? '#fff' : '#6B7280',
            cursor: 'pointer'
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {data.length < 2 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: '#9CA3AF', fontSize: 12 }}>
          Need at least 2 data points for {field?.label}
        </div>
      ) : (
        <svg width="100%" viewBox={`0 0 300 ${H}`} style={{ display: 'block' }}>
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity=".15" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {field && field.hi && (
            <line x1={W_PAD} x2={300 - W_PAD}
              y1={TOP_PAD + (1 - (field.hi - mn) / rng) * (H - TOP_PAD - BOT_PAD)}
              y2={TOP_PAD + (1 - (field.hi - mn) / rng) * (H - TOP_PAD - BOT_PAD)}
              stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,4" />
          )}

          {pts.length > 1 && (
            <path
              d={`M ${pts[0].x} ${H - BOT_PAD} L ${pts.map(p => `${p.x} ${p.y}`).join(' L ')} L ${pts[pts.length-1].x} ${H - BOT_PAD} Z`}
              fill="url(#grad)" />
          )}

          <polyline
            points={pts.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="#fff" stroke={color} strokeWidth="2" />
              <text x={p.x} y={H - 6} textAnchor="middle" fontSize="8" fill="#9CA3AF">
                {p.d.date?.slice(5)}
              </text>
            </g>
          ))}

          <text x={W_PAD - 4} y={TOP_PAD + 4} textAnchor="end" fontSize="8" fill="#9CA3AF">
            {mx.toFixed(1)}
          </text>
          <text x={W_PAD - 4} y={H - BOT_PAD} textAnchor="end" fontSize="8" fill="#9CA3AF">
            {mn.toFixed(1)}
          </text>
        </svg>
      )}

      {data.length >= 2 && (() => {
        const first = data[0].val, last = data[data.length - 1].val
        const diff = last - first
        const pct = Math.abs((diff / first) * 100).toFixed(1)
        const improved = field?.lo != null ? diff > 0 : diff < 0
        return (
          <div style={{ display: 'flex', gap: 10, marginTop: 12, paddingTop: 12, borderTop: '1px solid #F3F4F6' }}>
            <div style={{ flex: 1, background: '#F9FAFB', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2 }}>FIRST</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{first}</div>
            </div>
            <div style={{ flex: 1, background: '#F9FAFB', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2 }}>LATEST</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: gc(field, last) }}>{last}</div>
            </div>
            <div style={{ flex: 1, background: improved ? '#ECFDF5' : '#FEF2F2', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2 }}>CHANGE</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: improved ? '#10B981' : '#EF4444' }}>
                {diff > 0 ? '+' : ''}{diff.toFixed(1)}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ─── MEDS ────────────────────────────────────────────────────────────────────

function Meds() {
  const [meds,   setMeds  ] = useState({ morning: [], night: [] })
  const [checks, setChecks] = useState({})
  const [view,   setView  ] = useState('morning')
  const [modal,  setModal ] = useState(null)
  const [form,   setForm  ] = useState({})

  useEffect(() => {
    setMeds(lsGet('mk_meds_v9', MEDS_DEFAULT))
    const td = new Date().toDateString()
    if (lsGet('mk_chk_date', '') !== td) { lsSet('mk_chk_date', td); lsSet('mk_chks_v9', {}) }
    setChecks(lsGet('mk_chks_v9', {}))
  }, [])

  const saveMeds   = d => { lsSet('mk_meds_v9', d); setMeds(d) }
  const saveChecks = c => { lsSet('mk_chks_v9', c); setChecks(c) }
  const toggle     = id => { const c = { ...checks, [id]: !checks[id] }; saveChecks(c) }

  const allMorning = meds.morning || [], allNight = meds.night || []
  const current = view === 'morning' ? allMorning : allNight
  const doneM = allMorning.filter(m => checks[m.id]).length
  const doneN = allNight.filter(m => checks[m.id]).length
  const pctM  = allMorning.length ? Math.round((doneM / allMorning.length) * 100) : 0
  const pctN  = allNight.length   ? Math.round((doneN / allNight.length)   * 100) : 0

  const openAdd = () => {
    setForm({ name: '', dose: '', with: '', note: '', type: 'rx', time: view })
    setModal('add')
  }
  const openEdit = (m) => {
    setForm({ ...m, time: view })
    setModal('edit')
  }
  const save = () => {
    if (!form.name?.trim()) return
    const t = form.time || view
    const updated = { ...meds }
    if (modal === 'edit') {
      updated[t] = (updated[t] || []).map(m => m.id === form.id ? { ...form } : m)
    } else {
      const id = 'u' + Date.now()
      updated[t] = [...(updated[t] || []), { ...form, id }]
    }
    saveMeds(updated); setModal(null)
  }
  const del = (id, t) => {
    const updated = { ...meds, [t]: (meds[t] || []).filter(m => m.id !== id) }
    saveMeds(updated)
  }

  const tabStyle = (active, pct) => ({
    flex: 1, padding: '10px 8px', border: 'none', background: 'transparent',
    borderBottom: `2px solid ${active ? '#4F46E5' : 'transparent'}`,
    color: active ? '#4F46E5' : '#9CA3AF', fontSize: 13, fontWeight: active ? 600 : 400,
    cursor: 'pointer', position: 'relative'
  })

  const ringStyle = (pct, done) => {
    const c = done ? '#10B981' : '#4F46E5'
    const r = 10, circ = 2 * Math.PI * r, dash = (pct / 100) * circ
    return { c, r, circ, dash }
  }

  return (
    <div>
      {/* Morning / Night tabs with progress rings */}
      <div style={{ display: 'flex', background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #E5E7EB', marginBottom: 14 }}>
        {[['morning', '🌅 Morning', doneM, allMorning.length, pctM], ['night', '🌙 Night', doneN, allNight.length, pctN]].map(([t, label, done, total, pct]) => {
          const active = view === t
          const { c, r, circ, dash } = ringStyle(pct, pct === 100)
          return (
            <button key={t} onClick={() => setView(t)} style={{
              flex: 1, padding: '14px 8px', border: 'none', cursor: 'pointer',
              background: active ? '#EEF2FF' : 'transparent',
              borderBottom: `2px solid ${active ? '#4F46E5' : 'transparent'}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width={26} height={26} style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx={13} cy={13} r={r} fill="none" stroke="#E5E7EB" strokeWidth="2.5" />
                  <circle cx={13} cy={13} r={r} fill="none" stroke={c} strokeWidth="2.5"
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: 14, fontWeight: active ? 600 : 400, color: active ? '#4F46E5' : '#6B7280' }}>
                  {label}
                </span>
              </div>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>{done}/{total} taken · {pct}%</span>
            </button>
          )
        })}
      </div>

      {/* Med items */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 12 }}>
        {current.map((m, i) => {
          const done = !!checks[m.id]
          return (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 16px',
              borderBottom: i < current.length - 1 ? '1px solid #F9FAFB' : 'none',
              background: done ? '#FAFAFA' : '#fff', cursor: 'pointer'
            }}>
              <div onClick={() => toggle(m.id)} style={{
                width: 22, height: 22, borderRadius: 7, flexShrink: 0, marginTop: 1,
                background: done ? '#10B981' : 'transparent',
                border: `2px solid ${done ? '#10B981' : '#D1D5DB'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .15s'
              }}>
                {done && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: 1 }}>✓</span>}
              </div>
              <div style={{ flex: 1 }} onClick={() => toggle(m.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 2 }}>
                  <span style={{
                    fontSize: 14, fontWeight: 600,
                    color: done ? '#9CA3AF' : '#1F2937',
                    textDecoration: done ? 'line-through' : 'none'
                  }}>{m.name}</span>
                  {m.dose && m.dose !== '—' && (
                    <span style={{
                      fontSize: 10, padding: '1px 7px', borderRadius: 20,
                      background: m.type === 'rx' ? '#EEF2FF' : '#F0FDF4',
                      color: m.type === 'rx' ? '#4F46E5' : '#16A34A',
                      border: `1px solid ${m.type === 'rx' ? '#C7D2FE' : '#BBF7D0'}`,
                      fontWeight: 500
                    }}>{m.dose}</span>
                  )}
                  <span style={{
                    fontSize: 9, padding: '1px 6px', borderRadius: 20,
                    background: m.type === 'rx' ? '#EEF2FF' : '#F5F3FF',
                    color: m.type === 'rx' ? '#4F46E5' : '#7C3AED',
                    fontWeight: 600
                  }}>{m.type === 'rx' ? 'Rx' : 'Vit'}</span>
                </div>
                {m.with && <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 1 }}>With {m.with}</div>}
                {m.note && (
                  <div style={{ fontSize: 10, color: m.note.includes('⚠') ? '#D97706' : '#9CA3AF' }}>
                    {m.note}
                  </div>
                )}
              </div>
              <button onClick={() => openEdit(m)} style={{
                background: 'none', border: 'none', color: '#D1D5DB', fontSize: 16,
                padding: '2px 4px', flexShrink: 0
              }}>✎</button>
            </div>
          )
        })}
        {current.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
            No medications added for {view}
          </div>
        )}
      </div>

      <button onClick={openAdd} style={{
        width: '100%', background: 'transparent',
        border: '1.5px dashed #C7D2FE', borderRadius: 12, padding: '11px',
        color: '#4F46E5', fontSize: 13, fontWeight: 600
      }}>
        + Add {view === 'morning' ? 'morning' : 'night'} medication
      </button>

      {/* Modal */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
          zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px 20px 0 0',
            padding: '22px 18px 40px', width: '100%', maxWidth: 430,
            maxHeight: '85vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{modal === 'edit' ? 'Edit' : 'Add medication'}</div>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', fontSize: 22, color: '#9CA3AF', padding: 0 }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: '#6B7280', display: 'block', marginBottom: 4, letterSpacing: .5, textTransform: 'uppercase' }}>Type</label>
                <select value={form.type || 'rx'} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="rx">Prescribed</option>
                  <option value="vit">Vitamin / Supplement</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#6B7280', display: 'block', marginBottom: 4, letterSpacing: .5, textTransform: 'uppercase' }}>Time</label>
                <select value={form.time || view} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}>
                  <option value="morning">🌅 Morning</option>
                  <option value="night">🌙 Night</option>
                </select>
              </div>
            </div>

            {[['name', 'Name *', 'e.g. Losartan'], ['dose', 'Dose', 'e.g. 25 mg'], ['with', 'Take with', 'e.g. Breakfast'], ['note', 'Note', 'Purpose or warning...']].map(([k, lbl, ph]) => (
              <div key={k} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: '#6B7280', display: 'block', marginBottom: 4, letterSpacing: .5, textTransform: 'uppercase' }}>{lbl}</label>
                <input value={form[k] || ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} placeholder={ph} />
              </div>
            ))}

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={() => setModal(null)} style={{
                flex: 1, background: '#F9FAFB', border: '1px solid #E5E7EB',
                borderRadius: 12, padding: '13px', color: '#6B7280', fontSize: 14, fontWeight: 500
              }}>Cancel</button>
              {modal === 'edit' && (
                <button onClick={() => { del(form.id, form.time); setModal(null) }} style={{
                  background: '#FEF2F2', border: '1px solid #FECACA',
                  borderRadius: 12, padding: '13px 16px', color: '#DC2626', fontSize: 14, fontWeight: 500
                }}>Delete</button>
              )}
              <button onClick={save} style={{
                flex: 2, background: '#4F46E5', border: 'none',
                borderRadius: 12, padding: '13px', color: '#fff', fontSize: 14, fontWeight: 600
              }}>{modal === 'edit' ? 'Save changes' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CONTACTS ────────────────────────────────────────────────────────────────

function Contacts() {
  const [contacts, setContacts] = useState([])
  const [editing,  setEditing ] = useState(null)
  const [form,     setForm    ] = useState({})

  useEffect(() => setContacts(lsGet('mk_contacts_v9', CONTACTS_DEFAULT)), [])

  const save = d => { lsSet('mk_contacts_v9', d); setContacts(d) }

  const startEdit = c => { setEditing(c.id); setForm({ ...c }) }
  const saveEdit  = () => { save(contacts.map(c => c.id === editing ? { ...form, id: editing } : c)); setEditing(null) }
  const addNew    = () => {
    const nc = { id: 'c' + Date.now(), specialty: '', name: '', hospital: '', phone: '', address: '', notes: '' }
    save([...contacts, nc]); setEditing(nc.id); setForm(nc)
  }
  const del = id => { if (confirm('Delete this contact?')) save(contacts.filter(c => c.id !== id)) }

  const initials = c => (c.name || c.specialty || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div>
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 16, lineHeight: 1.6 }}>
        Your doctors and hospitals — always available, even offline.
      </div>

      {contacts.map((c, i) => (
        <div key={c.id} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '16px', marginBottom: 10 }}>
          {editing === c.id ? (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#4F46E5', marginBottom: 14 }}>Edit contact</div>
              {[['specialty','Specialty','e.g. Nephrologist'], ['name','Full name','Dr. First Last'], ['hospital','Hospital / Clinic','e.g. Cedars-Sinai'], ['phone','Phone','+1 (310) 000-0000'], ['address','Address',''], ['notes','Notes','e.g. Appointments Tuesday PM']].map(([k, lbl, ph]) => (
                <div key={k} style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, color: '#6B7280', display: 'block', marginBottom: 3, letterSpacing: .5, textTransform: 'uppercase' }}>{lbl}</label>
                  <input value={form[k] || ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} placeholder={ph} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => setEditing(null)} style={{ flex: 1, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '11px', color: '#6B7280', fontSize: 13, fontWeight: 500 }}>Cancel</button>
                <button onClick={saveEdit} style={{ flex: 2, background: '#4F46E5', border: 'none', borderRadius: 10, padding: '11px', color: '#fff', fontSize: 13, fontWeight: 600 }}>Save</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14, background: '#EEF2FF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 600, color: '#4F46E5', border: '1px solid #C7D2FE',
                    flexShrink: 0
                  }}>{initials(c)}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: c.name ? '#1F2937' : '#9CA3AF' }}>
                      {c.name || 'No name yet'}
                    </div>
                    <div style={{ fontSize: 12, color: '#4F46E5', fontWeight: 500 }}>
                      {c.specialty || 'Specialty'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => startEdit(c)} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 17, padding: 0 }}>✎</button>
                  <button onClick={() => del(c.id)} style={{ background: 'none', border: 'none', color: '#D1D5DB', fontSize: 17, padding: 0 }}>✕</button>
                </div>
              </div>
              {c.hospital && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#374151', marginBottom: 5 }}>
                  <span style={{ color: '#9CA3AF' }}>🏥</span> {c.hospital}
                </div>
              )}
              {c.phone && (
                <a href={`tel:${c.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#4F46E5', textDecoration: 'none', marginBottom: 5, fontWeight: 500 }}>
                  <span style={{ color: '#9CA3AF' }}>📞</span> {c.phone}
                </a>
              )}
              {c.address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#374151', marginBottom: 5 }}>
                  <span style={{ color: '#9CA3AF' }}>📍</span> {c.address}
                </div>
              )}
              {c.notes && (
                <div style={{ fontSize: 12, color: '#6B7280', fontStyle: 'italic', marginTop: 4 }}>{c.notes}</div>
              )}
              {!c.name && !c.hospital && !c.phone && (
                <div style={{ fontSize: 12, color: '#D1D5DB', fontStyle: 'italic' }}>Tap ✎ to add information</div>
              )}
            </div>
          )}
        </div>
      ))}

      <button onClick={addNew} style={{
        width: '100%', background: 'transparent',
        border: '1.5px dashed #C7D2FE', borderRadius: 12, padding: '12px',
        color: '#4F46E5', fontSize: 13, fontWeight: 600, marginTop: 4
      }}>
        + Add doctor or hospital
      </button>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [tab,   setTab  ] = useState('home')
  const [labs,  setLabs ] = useState([])
  const [stelo, setStelo] = useState([])
  const [toast, setToast] = useState('')
  const [exp,   setExp  ] = useState(null)

  useEffect(() => {
    setLabs(lsGet('mk_labs_v9', []))
    setStelo(lsGet('mk_stelo_v9', []))
  }, [])

  const addLab  = entry => { const d = [entry, ...labs];  lsSet('mk_labs_v9',  d); setLabs(d) }
  const addStelo= entry => { const d = [entry, ...stelo]; lsSet('mk_stelo_v9', d); setStelo(d) }

  const showToast = (msg, cb) => {
    setToast(msg)
    setTimeout(() => { setToast(''); cb?.() }, 1600)
  }

  const onUpload = data => {
    const entry = { id: Date.now(), date: data.date || today(), src: 'upload', alerts: data.alerts || [], summary: data.summary || '', ...data.values }
    addLab(entry)
    showToast('✓ Result saved to history', () => setTab('home'))
  }

  const L = labs[0] || {}, S = stelo[0] || {}
  const crits = LABS.filter(f => L[f.key] && st(f, L[f.key]) === 'crit')
  const hist  = key => [...labs].reverse().filter(l => l[key] != null).map(l => l[key])
  const sHist = key => [...stelo].reverse().filter(s => s[key] != null).map(s => s[key])

  // Group history by month
  const byMonth = {}
  ;[...labs.map(e => ({ ...e, _type: 'lab' })), ...stelo.map(e => ({ ...e, _type: 'stelo' }))].forEach(e => {
    const m = e.date?.slice(0, 7) || 'Unknown'
    if (!byMonth[m]) byMonth[m] = []
    byMonth[m].push(e)
  })

  const TABS = [
    { id: 'home',    label: 'Home',    icon: '⌂' },
    { id: 'upload',  label: 'Upload',  icon: '↑' },
    { id: 'meds',    label: 'Meds',    icon: '⊕' },
    { id: 'doctors', label: 'Doctors', icon: '☎' },
    { id: 'history', label: 'History', icon: '≡' },
  ]

  const CAT_ORDER = ['Diabetes', 'Kidneys', 'Lipids', 'Vitals', 'Blood', 'Electrolytes', 'Liver', 'Other']

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 90, background: '#F9FAFB' }}>

      {/* HEADER */}
      <div style={{
        padding: '18px 18px 14px', background: '#fff',
        borderBottom: '1px solid #E5E7EB',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,.06)'
      }}>
        <div style={{ fontSize: 9, color: '#4F46E5', letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 700, marginBottom: 5 }}>
          HEALTH MONITOR
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 21, fontWeight: 700, color: '#111827', letterSpacing: -.4 }}>Mikail Kocak</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>46 yrs · Los Angeles, CA</div>
          </div>
          {crits.length > 0 && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '5px 10px', fontSize: 11, color: '#DC2626', fontWeight: 700 }}>
              ⚠ {crits.length} critical
            </div>
          )}
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          background: '#10B981', color: '#fff', borderRadius: 10,
          padding: '10px 20px', fontSize: 13, fontWeight: 600,
          zIndex: 200, boxShadow: '0 4px 12px rgba(0,0,0,.15)',
          whiteSpace: 'nowrap'
        }}>
          {toast}
        </div>
      )}

      <div style={{ padding: '16px 16px 0' }}>

        {/* ══ HOME ══ */}
        {tab === 'home' && (
          <div>
            {crits.length > 0 && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', letterSpacing: 1, marginBottom: 10 }}>CRITICAL VALUES</div>
                {crits.map(f => (
                  <div key={f.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #FEE2E2' }}>
                    <span style={{ fontSize: 13, color: '#374151' }}>{f.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#DC2626' }}>{L[f.key]} <span style={{ fontSize: 10, opacity: .6 }}>{f.unit}</span></span>
                  </div>
                ))}
              </div>
            )}

            {labs.length === 0 && stelo.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                <div style={{ fontSize: 52, marginBottom: 16, opacity: .15 }}>🩺</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: '#4B5563', marginBottom: 8 }}>No data yet</div>
                <div style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.7 }}>
                  Go to <span style={{ color: '#4F46E5', fontWeight: 600 }}>Upload</span> to add your first lab results.<br />
                  Albanian, English, Turkish and Spanish<br />documents are all supported.
                </div>
              </div>
            ) : (
              <>
                {CAT_ORDER.map(cat => {
                  const fields = LABS.filter(f => f.cat === cat && L[f.key] != null)
                  if (!fields.length) return null
                  const cc = CAT_COLOR[cat] || '#6B7280'
                  return (
                    <div key={cat} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '16px', marginBottom: 12, boxShadow: '0 1px 2px rgba(0,0,0,.04)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: cc, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${cc}22` }}>
                        {cat}
                      </div>
                      {fields.map(f => {
                        const v = L[f.key], s = st(f, v), sc = SC[s], h = hist(f.key)
                        return (
                          <div key={f.key} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F9FAFB', gap: 10 }}>
                            <Gauge value={v} field={f} size={62} />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 13, color: '#4B5563', fontWeight: 500 }}>{f.label}</span>
                                <Chip status={s} />
                              </div>
                              <div style={{ height: 4, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden', width: '100%' }}>
                                <div style={{
                                  height: '100%', background: sc, borderRadius: 2,
                                  width: `${Math.min(96, Math.max(4, (parseFloat(v) / (f.cHi || f.hi * 1.5 || 100)) * 100))}%`,
                                  transition: 'width .5s ease'
                                }} />
                              </div>
                              {s !== 'ok' && (
                                <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 3 }}>
                                  Normal range: {normalRange(f)} {f.unit}
                                </div>
                              )}
                            </div>
                            {h.length > 1 && <Spark data={h} color={cc} />}
                          </div>
                        )
                      })}
                      {L.date && <div style={{ fontSize: 10, color: '#D1D5DB', marginTop: 8, textAlign: 'right' }}>Date: {L.date}</div>}
                    </div>
                  )
                })}

                {/* Stelo */}
                {stelo.length > 0 && (
                  <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '16px', marginBottom: 12, boxShadow: '0 1px 2px rgba(0,0,0,.04)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #EDE9FE' }}>
                      Stelo CGM — Latest Entry
                    </div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 10 }}>📅 {S.date}</div>
                    {STELO.map(f => {
                      const v = S[f.key]; if (!v) return null
                      const s = st(f, v), sc = SC[s], sh = sHist(f.key)
                      return (
                        <div key={f.key} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F9FAFB', gap: 10 }}>
                          <Gauge value={v} field={f} size={62} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                              <span style={{ fontSize: 13, color: '#4B5563', fontWeight: 500 }}>{f.label}</span>
                              <Chip status={s} />
                            </div>
                            <div style={{ fontSize: 10, color: '#9CA3AF' }}>Target: {f.target}</div>
                          </div>
                          {sh.length > 1 && <Spark data={sh} color="#7C3AED" />}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Trend chart */}
                <TrendChart labHistory={labs} steloHistory={stelo} />
              </>
            )}
          </div>
        )}

        {/* ══ UPLOAD ══ */}
        {tab === 'upload' && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Upload Result</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 18, lineHeight: 1.6 }}>
              Take a photo or upload a file — Claude reads Albanian, English, Turkish and Spanish automatically.
            </div>
            <UploadZone onResult={onUpload} />

            {/* Stelo manual entry */}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Stelo CGM Entry</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 14 }}>
                Log your daily CGM readings manually, or upload the Stelo PDF/CSV report above.
              </div>
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '16px' }}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: '#6B7280', display: 'block', marginBottom: 3, letterSpacing: .5, textTransform: 'uppercase' }}>Date</label>
                  <input type="date" id="sd" defaultValue={today()} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  {STELO.map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 11, color: '#6B7280', display: 'block', marginBottom: 3, letterSpacing: .5, textTransform: 'uppercase' }}>
                        {f.label}
                        <span style={{ color: '#D1D5DB', textTransform: 'none', letterSpacing: 0 }}> · {f.target}</span>
                      </label>
                      <input type="number" step=".1" placeholder={f.unit} id={`sf-${f.key}`} />
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: '#6B7280', display: 'block', marginBottom: 3, letterSpacing: .5, textTransform: 'uppercase' }}>How did you feel?</label>
                  <select id="sf-feel">
                    <option value="">— select —</option>
                    {['😴 Tired', '😐 Normal', '💪 Good', '🤕 Unwell'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: '#6B7280', display: 'block', marginBottom: 3, letterSpacing: .5, textTransform: 'uppercase' }}>Notes</label>
                  <textarea id="sf-notes" placeholder="What you ate, exercise, symptoms..." style={{ height: 64, resize: 'none' }} />
                </div>
                <button onClick={() => {
                  const entry = {
                    id: Date.now(), date: document.getElementById('sd')?.value || today(), src: 'manual',
                    ...Object.fromEntries(STELO.map(f => [f.key, document.getElementById(`sf-${f.key}`)?.value || null])),
                    feeling: document.getElementById('sf-feel')?.value,
                    notes: document.getElementById('sf-notes')?.value,
                  }
                  addStelo(entry)
                  showToast('✓ Stelo entry saved')
                  STELO.forEach(f => { const el = document.getElementById(`sf-${f.key}`); if (el) el.value = '' })
                  const feel = document.getElementById('sf-feel'); if (feel) feel.value = ''
                  const notes = document.getElementById('sf-notes'); if (notes) notes.value = ''
                }} style={{
                  width: '100%', background: '#7C3AED', border: 'none', borderRadius: 12,
                  padding: '13px', color: '#fff', fontSize: 14, fontWeight: 600
                }}>
                  Save Stelo Entry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ MEDS ══ */}
        {tab === 'meds' && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Medications</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Your daily regimen · Prescribed and supplements</div>
            <Meds />
          </div>
        )}

        {/* ══ DOCTORS ══ */}
        {tab === 'doctors' && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4 }}>My Doctors</div>
            <Contacts />
          </div>
        )}

        {/* ══ HISTORY ══ */}
        {tab === 'history' && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16 }}>History</div>

            {labs.length === 0 && stelo.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: '#9CA3AF' }}>
                <div style={{ fontSize: 36, marginBottom: 10, opacity: .2 }}>📋</div>
                <div style={{ fontSize: 13 }}>No history yet. Upload your first results.</div>
              </div>
            ) : (
              Object.keys(byMonth).sort((a, b) => b.localeCompare(a)).map(month => (
                <div key={month} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
                    {month}
                  </div>
                  {byMonth[month].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(entry => {
                    const isLab = entry._type === 'lab'
                    const hasCrit = isLab && LABS.some(f => entry[f.key] && st(f, entry[f.key]) === 'crit')
                    const isOpen = exp === entry.id
                    return (
                      <div key={entry.id} onClick={() => setExp(isOpen ? null : entry.id)}
                        style={{ background: '#fff', border: `1px solid ${isOpen ? '#C7D2FE' : '#E5E7EB'}`, borderRadius: 14, padding: '12px 14px', marginBottom: 8, cursor: 'pointer', transition: 'border-color .2s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>{entry.date}</span>
                              <span style={{
                                fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 20,
                                background: hasCrit ? '#FEF2F2' : isLab ? '#EEF2FF' : '#F5F3FF',
                                color: hasCrit ? '#DC2626' : isLab ? '#4F46E5' : '#7C3AED',
                                border: `1px solid ${hasCrit ? '#FECACA' : isLab ? '#C7D2FE' : '#DDD6FE'}`
                              }}>
                                {hasCrit ? 'Critical' : isLab ? 'Lab' : 'Stelo'}
                              </span>
                            </div>
                            <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>
                              {entry.src === 'upload' ? 'Uploaded · Claude' : 'Manual entry'}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: '#D1D5DB' }}>{isOpen ? '▲' : '▼'}</span>
                            <button onClick={e => {
                              e.stopPropagation()
                              if (isLab) { const d = labs.filter(l => l.id !== entry.id); lsSet('mk_labs_v9', d); setLabs(d) }
                              else { const d = stelo.filter(s => s.id !== entry.id); lsSet('mk_stelo_v9', d); setStelo(d) }
                            }} style={{ background: 'none', border: 'none', color: '#D1D5DB', fontSize: 16, padding: 0 }}>✕</button>
                          </div>
                        </div>

                        {isOpen && (
                          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #F3F4F6' }}>
                            {isLab ? (
                              <div>
                                {CAT_ORDER.map(cat => {
                                  const fields = LABS.filter(f => f.cat === cat && entry[f.key] != null)
                                  if (!fields.length) return null
                                  return (
                                    <div key={cat} style={{ marginBottom: 12 }}>
                                      <div style={{ fontSize: 10, fontWeight: 700, color: CAT_COLOR[cat] || '#6B7280', letterSpacing: 1, marginBottom: 7 }}>{cat.toUpperCase()}</div>
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                        {fields.map(f => {
                                          const s = st(f, entry[f.key]), sc = SC[s], bg = SBG[s]
                                          return (
                                            <div key={f.key} style={{ background: bg, borderRadius: 10, padding: '8px 11px', borderLeft: `3px solid ${sc}` }}>
                                              <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2 }}>{f.label}</div>
                                              <div style={{ fontSize: 15, fontWeight: 600, color: sc }}>
                                                {entry[f.key]} <span style={{ fontSize: 9, opacity: .5, fontWeight: 400 }}>{f.unit}</span>
                                              </div>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  )
                                })}
                                {entry.alerts?.map((a, i) => <div key={i} style={{ fontSize: 11, color: '#DC2626', padding: '3px 0' }}>⚠ {a}</div>)}
                                {entry.summary && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 10, fontStyle: 'italic', lineHeight: 1.6 }}>{entry.summary}</div>}
                              </div>
                            ) : (
                              <div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                                  {STELO.map(f => {
                                    if (!entry[f.key]) return null
                                    const s = st(f, entry[f.key]), sc = SC[s], bg = SBG[s]
                                    return (
                                      <div key={f.key} style={{ background: bg, borderRadius: 10, padding: '8px 11px', borderLeft: `3px solid ${sc}` }}>
                                        <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2 }}>{f.label}</div>
                                        <div style={{ fontSize: 15, fontWeight: 600, color: sc }}>
                                          {entry[f.key]} <span style={{ fontSize: 9, opacity: .5 }}>{f.unit}</span>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                                {entry.feeling && <div style={{ fontSize: 12, color: '#6B7280' }}>{entry.feeling}</div>}
                                {entry.notes && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, fontStyle: 'italic' }}>{entry.notes}</div>}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430, background: '#fff',
        borderTop: '1px solid #E5E7EB', display: 'flex', zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -1px 4px rgba(0,0,0,.06)'
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '10px 4px 11px', background: 'none', border: 'none',
            borderTop: `2px solid ${tab === t.id ? '#4F46E5' : 'transparent'}`,
            color: tab === t.id ? '#4F46E5' : '#9CA3AF',
            transition: 'all .2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3
          }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{t.icon}</span>
            <span style={{ fontSize: 9, fontWeight: tab === t.id ? 700 : 400, letterSpacing: .5, textTransform: 'uppercase' }}>
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
