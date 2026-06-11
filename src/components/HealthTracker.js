'use client'
import { useState, useEffect } from 'react'

const LAB_FIELDS = [
  { key: 'hba1c', label: 'HbA1c', unit: '%', normal: '<6.5', category: 'diabetes' },
  { key: 'glucose', label: 'Glucosa', unit: 'mg/dl', normal: '70-99', category: 'diabetes' },
  { key: 'creatinine', label: 'Creatinina', unit: 'mg/dl', normal: '0.73-1.18', category: 'kidney' },
  { key: 'egfr', label: 'eGFR', unit: 'ml/min', normal: '≥60', category: 'kidney' },
  { key: 'acr', label: 'ACR', unit: 'mg/g', normal: '<29', category: 'kidney' },
  { key: 'ldl', label: 'LDL', unit: 'mg/dl', normal: '<99', category: 'lipids' },
  { key: 'hdl', label: 'HDL', unit: 'mg/dl', normal: '≥40', category: 'lipids' },
  { key: 'triglycerides', label: 'Triglicéridos', unit: 'mg/dl', normal: '<149', category: 'lipids' },
  { key: 'cholesterol', label: 'Colesterol Total', unit: 'mg/dl', normal: '<199', category: 'lipids' },
  { key: 'uric_acid', label: 'Ácido Úrico', unit: 'mg/dl', normal: '3.4-7.0', category: 'other' },
]

const CATEGORY_CONFIG = {
  diabetes: { accent: '#4f8ef7', label: 'Diabetes', icon: '🩸' },
  kidney: { accent: '#4caf82', label: 'Riñones', icon: '🫘' },
  lipids: { accent: '#f7704f', label: 'Lípidos', icon: '💊' },
  other: { accent: '#b97cf7', label: 'Otros', icon: '🔬' },
}

const STELO_FIELDS = [
  { key: 'glucose_fasting', label: 'Glucosa Ayunas', desc: 'Antes de comer', unit: 'mg/dl', meta: '80–100' },
  { key: 'glucose_peak', label: 'Pico Post-comida', desc: 'Máximo después de comer', unit: 'mg/dl', meta: '<140' },
  { key: 'glucose_avg', label: 'Promedio del Día', desc: 'Promedio 24 horas', unit: 'mg/dl', meta: '<115' },
  { key: 'time_in_range', label: 'Time in Range', desc: '% tiempo en 70–140 mg/dl', unit: '%', meta: '>70%' },
]

function getLabColor(field, value) {
  const v = parseFloat(value)
  if (isNaN(v)) return '#555'
  const map = {
    hba1c: v > 7 ? '#f7704f' : v > 6.5 ? '#f7c04f' : '#4caf82',
    glucose: v > 126 ? '#f7704f' : v > 99 ? '#f7c04f' : '#4caf82',
    acr: v > 300 ? '#f7704f' : v > 30 ? '#f7c04f' : '#4caf82',
    egfr: v < 30 ? '#f7704f' : v < 60 ? '#f7c04f' : '#4caf82',
    ldl: v > 160 ? '#f7704f' : v > 99 ? '#f7c04f' : '#4caf82',
    triglycerides: v > 500 ? '#f7704f' : v > 149 ? '#f7c04f' : '#4caf82',
    hdl: v < 35 ? '#f7704f' : v < 40 ? '#f7c04f' : '#4caf82',
    cholesterol: v > 300 ? '#f7704f' : v > 199 ? '#f7c04f' : '#4caf82',
    creatinine: v > 1.3 ? '#f7704f' : '#4caf82',
    uric_acid: v > 7 ? '#f7704f' : '#4caf82',
  }
  return map[field.key] || '#4caf82'
}

function Sparkline({ values, color }) {
  if (values.length < 2) return null
  const nums = values.map(Number).filter(v => !isNaN(v))
  if (nums.length < 2) return null
  const min = Math.min(...nums), max = Math.max(...nums)
  const range = max - min || 1
  const W = 72, H = 26
  const pts = nums.map((v, i) => `${(i / (nums.length - 1)) * W},${H - ((v - min) / range) * H}`).join(' ')
  const last = pts.split(' ').pop().split(',')
  return (
    <svg width={W} height={H}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
    </svg>
  )
}

function StatusBadge({ value, field }) {
  if (!value) return <span style={{ color: '#333' }}>—</span>
  const color = getLabColor(field, value)
  return (
    <span style={{ color, fontWeight: 700, fontSize: 15 }}>
      {value} <span style={{ fontSize: 10, opacity: 0.6 }}>{field.unit}</span>
    </span>
  )
}

const s = {
  input: {
    width: '100%', background: '#13151e', border: '1px solid #2a2c3a',
    borderRadius: 10, padding: '11px 14px', color: '#e8eaf0',
    fontSize: 15, outline: 'none', boxSizing: 'border-box',
  },
  btn: {
    width: '100%', background: 'linear-gradient(135deg, #1a3a7a, #1a5a9a)',
    border: 'none', borderRadius: 12, padding: '15px',
    color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
    letterSpacing: 0.3, marginTop: 8,
  },
  card: {
    background: '#13151e', border: '1px solid #1e2230',
    borderRadius: 14, padding: '14px 16px', marginBottom: 10,
  },
  label: { fontSize: 11, color: '#555', display: 'block', marginBottom: 5, letterSpacing: 0.5, textTransform: 'uppercase' },
}

export default function HealthTracker() {
  const [tab, setTab] = useState('dashboard')
  const [labs, setLabs] = useState([])
  const [stelo, setStelo] = useState([])
  const [labForm, setLabForm] = useState({ date: new Date().toISOString().split('T')[0] })
  const [steloForm, setSteloForm] = useState({ date: new Date().toISOString().split('T')[0] })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try { const d = localStorage.getItem('mk_labs'); if (d) setLabs(JSON.parse(d)) } catch {}
    try { const d = localStorage.getItem('mk_stelo'); if (d) setStelo(JSON.parse(d)) } catch {}
  }, [])

  const persistLabs = (data) => { localStorage.setItem('mk_labs', JSON.stringify(data)); setLabs(data) }
  const persistStelo = (data) => { localStorage.setItem('mk_stelo', JSON.stringify(data)); setStelo(data) }

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const submitLab = () => {
    if (!labForm.date) return
    persistLabs([{ ...labForm, id: Date.now() }, ...labs])
    setLabForm({ date: new Date().toISOString().split('T')[0] })
    flash(); setTab('dashboard')
  }

  const submitStelo = () => {
    if (!steloForm.date) return
    persistStelo([{ ...steloForm, id: Date.now() }, ...stelo])
    setSteloForm({ date: new Date().toISOString().split('T')[0] })
    flash(); setTab('dashboard')
  }

  const latest = labs[0] || {}
  const hasAlert = latest.acr && parseFloat(latest.acr) > 300

  const fieldHistory = (key) =>
    [...labs].reverse().filter(l => l[key]).map(l => l[key])

  const tabs = [
    { id: 'dashboard', icon: '📊', label: 'Resumen' },
    { id: 'labs', icon: '🧪', label: 'Labs' },
    { id: 'stelo', icon: '📈', label: 'Stelo' },
    { id: 'historial', icon: '📋', label: 'Historial' },
  ]

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 90 }}>

      {/* Header */}
      <div style={{ padding: '20px 18px 14px', borderBottom: '1px solid #1e2230' }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: '#4f8ef7', textTransform: 'uppercase', marginBottom: 3 }}>
          Health Monitor
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Mikail Kocak</div>
          <div style={{ background: '#1a2744', borderRadius: 8, padding: '5px 11px', fontSize: 11, color: '#4f8ef7', border: '1px solid #2a3a5a' }}>
            46 · USA
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '18px 16px' }}>

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div>
            {hasAlert && (
              <div style={{ background: 'linear-gradient(135deg,#3d1a1a,#2d1010)', border: '1px solid #f7704f44', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 22 }}>⚠️</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#f7704f' }}>ACR Muy Elevado</div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>ACR {latest.acr} mg/g — Nefrólogo urgente</div>
                </div>
              </div>
            )}

            {labs.length === 0 && stelo.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#333' }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>🩺</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#555', marginBottom: 8 }}>Sin datos aún</div>
                <div style={{ fontSize: 13 }}>Usa Labs o Stelo para agregar tus primeros resultados</div>
              </div>
            ) : (
              <>
                {['diabetes', 'kidney', 'lipids', 'other'].map(cat => {
                  const fields = LAB_FIELDS.filter(f => f.category === cat && latest[f.key])
                  if (!fields.length) return null
                  const { accent, label, icon } = CATEGORY_CONFIG[cat]
                  return (
                    <div key={cat} style={{ ...s.card, border: `1px solid ${accent}22`, marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: accent, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
                        {icon} {label}
                      </div>
                      {fields.map(f => (
                        <div key={f.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #ffffff08' }}>
                          <div>
                            <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>{f.label}</div>
                            <StatusBadge value={latest[f.key]} field={f} />
                          </div>
                          <Sparkline values={fieldHistory(f.key)} color={accent} />
                        </div>
                      ))}
                    </div>
                  )
                })}

                {stelo.length > 0 && (
                  <div style={{ ...s.card, border: '1px solid #b97cf722' }}>
                    <div style={{ fontSize: 11, color: '#b97cf7', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
                      📈 Stelo — {stelo[0].date}
                    </div>
                    {STELO_FIELDS.map(f => {
                      if (!stelo[0][f.key]) return null
                      return (
                        <div key={f.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #ffffff08' }}>
                          <div style={{ fontSize: 12, color: '#888' }}>{f.label}</div>
                          <span style={{ color: '#b97cf7', fontWeight: 700 }}>{stelo[0][f.key]} <span style={{ fontSize: 10, opacity: 0.6 }}>{f.unit}</span></span>
                        </div>
                      )
                    })}
                    {stelo[0].feeling && <div style={{ fontSize: 12, color: '#555', marginTop: 8 }}>{stelo[0].feeling}</div>}
                  </div>
                )}

                {latest.date && (
                  <div style={{ textAlign: 'center', fontSize: 11, color: '#333', marginTop: 10 }}>
                    Último lab guardado: {latest.date}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* LABS FORM */}
        {tab === 'labs' && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Nuevo Resultado de Lab</div>

            <div style={{ marginBottom: 14 }}>
              <label style={s.label}>Fecha</label>
              <input type="date" value={labForm.date || ''} onChange={e => setLabForm(p => ({ ...p, date: e.target.value }))} style={s.input} />
            </div>

            {['diabetes', 'kidney', 'lipids', 'other'].map(cat => {
              const { accent, label, icon } = CATEGORY_CONFIG[cat]
              return (
                <div key={cat} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: accent, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${accent}33` }}>
                    {icon} {label}
                  </div>
                  {LAB_FIELDS.filter(f => f.category === cat).map(f => (
                    <div key={f.key} style={{ marginBottom: 11 }}>
                      <label style={s.label}>{f.label} <span style={{ color: '#333' }}>({f.normal} {f.unit})</span></label>
                      <input
                        type="number" step="0.01" placeholder={f.unit}
                        value={labForm[f.key] || ''}
                        onChange={e => setLabForm(p => ({ ...p, [f.key]: e.target.value }))}
                        style={s.input}
                      />
                    </div>
                  ))}
                </div>
              )
            })}

            <div style={{ marginBottom: 14 }}>
              <label style={s.label}>Notas del médico</label>
              <textarea
                placeholder="Observaciones, cambios de medicamento, síntomas..."
                value={labForm.notes || ''}
                onChange={e => setLabForm(p => ({ ...p, notes: e.target.value }))}
                style={{ ...s.input, height: 80, resize: 'none' }}
              />
            </div>

            <button onClick={submitLab} style={s.btn}>
              {saved ? '✅ Guardado' : 'Guardar Resultados'}
            </button>
          </div>
        )}

        {/* STELO FORM */}
        {tab === 'stelo' && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Registro Diario Stelo</div>
            <div style={{ fontSize: 12, color: '#555', marginBottom: 18 }}>Anota tus lecturas del CGM</div>

            <div style={{ marginBottom: 14 }}>
              <label style={s.label}>Fecha</label>
              <input type="date" value={steloForm.date || ''} onChange={e => setSteloForm(p => ({ ...p, date: e.target.value }))} style={s.input} />
            </div>

            {STELO_FIELDS.map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ ...s.label, color: '#aaa', textTransform: 'none', fontSize: 13 }}>{f.label}</label>
                <div style={{ fontSize: 11, color: '#444', marginBottom: 6 }}>{f.desc} — meta: {f.meta}</div>
                <input
                  type="number" step="0.1" placeholder={f.unit}
                  value={steloForm[f.key] || ''}
                  onChange={e => setSteloForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={s.input}
                />
              </div>
            ))}

            <div style={{ marginBottom: 14 }}>
              <label style={s.label}>¿Cómo te sentiste?</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['😴 Cansado', '😐 Normal', '💪 Bien', '🤕 Mal'].map(opt => (
                  <button key={opt} onClick={() => setSteloForm(p => ({ ...p, feeling: opt }))} style={{
                    flex: 1, padding: '9px 4px',
                    background: steloForm.feeling === opt ? '#1a2744' : '#13151e',
                    border: steloForm.feeling === opt ? '1px solid #4f8ef7' : '1px solid #2a2c3a',
                    borderRadius: 8, color: steloForm.feeling === opt ? '#4f8ef7' : '#444',
                    fontSize: 10, cursor: 'pointer',
                  }}>{opt}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={s.label}>Notas</label>
              <textarea
                placeholder="Qué comiste, ejercicio, síntomas..."
                value={steloForm.notes || ''}
                onChange={e => setSteloForm(p => ({ ...p, notes: e.target.value }))}
                style={{ ...s.input, height: 70, resize: 'none' }}
              />
            </div>

            <button onClick={submitStelo} style={s.btn}>
              {saved ? '✅ Guardado' : 'Guardar Registro Stelo'}
            </button>
          </div>
        )}

        {/* HISTORIAL */}
        {tab === 'historial' && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#4f8ef7', marginBottom: 12 }}>
              🧪 Laboratorios ({labs.length})
            </div>

            {labs.length === 0 ? (
              <div style={{ color: '#333', fontSize: 12, marginBottom: 24 }}>Sin laboratorios guardados aún</div>
            ) : labs.map(l => (
              <div key={l.id} style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>📅 {l.date}</div>
                  <button onClick={() => persistLabs(labs.filter(x => x.id !== l.id))} style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: 18 }}>🗑</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {LAB_FIELDS.map(f => l[f.key] ? (
                    <div key={f.key} style={{ background: '#1a1c24', borderRadius: 7, padding: '4px 9px', fontSize: 11 }}>
                      <span style={{ color: '#444' }}>{f.label}: </span>
                      <StatusBadge value={l[f.key]} field={f} />
                    </div>
                  ) : null)}
                </div>
                {l.notes && <div style={{ fontSize: 11, color: '#444', marginTop: 8, fontStyle: 'italic' }}>{l.notes}</div>}
              </div>
            ))}

            <div style={{ fontSize: 13, fontWeight: 700, color: '#b97cf7', marginBottom: 12, marginTop: 20 }}>
              📈 Stelo ({stelo.length} días)
            </div>

            {stelo.length === 0 ? (
              <div style={{ color: '#333', fontSize: 12 }}>Sin registros Stelo aún</div>
            ) : stelo.map(entry => (
              <div key={entry.id} style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>📅 {entry.date} {entry.feeling}</div>
                  <button onClick={() => persistStelo(stelo.filter(x => x.id !== entry.id))} style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: 18 }}>🗑</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {STELO_FIELDS.map(f => entry[f.key] ? (
                    <div key={f.key} style={{ background: '#1a1c24', borderRadius: 7, padding: '4px 9px', fontSize: 11 }}>
                      <span style={{ color: '#444' }}>{f.label}: </span>
                      <span style={{ color: '#b97cf7', fontWeight: 700 }}>{entry[f.key]} {f.unit}</span>
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
        width: '100%', maxWidth: 480,
        background: '#0d0f14', borderTop: '1px solid #1e2230',
        display: 'flex', zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '10px 4px 12px',
            background: 'none', border: 'none',
            borderTop: tab === t.id ? '2px solid #4f8ef7' : '2px solid transparent',
            color: tab === t.id ? '#4f8ef7' : '#444',
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
            <div style={{ fontSize: 20 }}>{t.icon}</div>
            <div style={{ fontSize: 10, marginTop: 2, fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
