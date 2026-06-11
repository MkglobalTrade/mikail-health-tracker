'use client'
import { useRef, useState } from 'react'
import { LABS, STELO, today, toBase64, gc, gbg } from '../../lib/data'
import { PrimaryBtn, FormField } from '../ui'

function UploadZone({ onResult }) {
  const [phase, setPhase] = useState('idle')
  const [msg,   setMsg  ] = useState('')
  const [result,setResult] = useState(null)
  const ref = useRef()

  const run = async (file) => {
    setPhase('loading'); setResult(null)
    const ext = file.name.split('.').pop().toLowerCase()
    try {
      let body = {}
      if (['jpg','jpeg','png','webp','heic','heif'].includes(ext)) {
        setMsg('Analyzing image...')
        body = { imageData: await toBase64(file), imageMime: ext === 'png' ? 'image/png' : 'image/jpeg' }
      } else if (ext === 'pdf') {
        setMsg('Reading PDF...')
        body = { imageData: await toBase64(file), imageMime: 'application/pdf' }
      } else if (['txt','csv'].includes(ext)) {
        setMsg('Reading file...')
        body = { text: await file.text() }
      } else {
        throw new Error('Supported: JPG, PNG, PDF, TXT, CSV')
      }
      setMsg('Claude is analyzing...')
      const res  = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error)
      setPhase('done'); setResult(json.data); onResult(json.data)
    } catch (e) {
      setPhase('error'); setMsg(e.message)
    }
  }

  const bc = phase === 'done' ? '#10B981' : phase === 'error' ? '#EF4444' : '#E5E7EB'
  return (
    <div>
      <div onClick={() => { setPhase('idle'); ref.current?.click() }}
        onDrop={e => { e.preventDefault(); run(e.dataTransfer.files[0]) }}
        onDragOver={e => e.preventDefault()}
        style={{ border: `2px dashed ${bc}`, borderRadius: 16, padding: '32px 20px', textAlign: 'center', cursor: 'pointer', background: '#fff', marginBottom: 16, transition: 'border-color .25s' }}>
        <div style={{ fontSize: 38, marginBottom: 10 }}>
          {phase === 'loading' ? '⏳' : phase === 'done' ? '✓' : phase === 'error' ? '✕' : '↑'}
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: phase === 'error' ? '#EF4444' : phase === 'done' ? '#10B981' : '#1F2937' }}>
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
            {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#4F46E5', animation: `pulse 1.1s ease-in-out ${i * .18}s infinite` }} />)}
          </div>
        )}
      </div>
      <input ref={ref} type="file" style={{ display: 'none' }} accept=".jpg,.jpeg,.png,.pdf,.txt,.csv,.heic,.heif,.webp" onChange={e => { if (e.target.files?.[0]) run(e.target.files[0]) }} />
      {result && (
        <div style={{ background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#065F46', letterSpacing: 1.5, marginBottom: 10 }}>CLAUDE EXTRACTED</div>
          {result.date && <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>Date: {result.date}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 10 }}>
            {[...LABS, ...STELO].map(f => {
              const v = result.values?.[f.key]; if (!v) return null
              return (
                <div key={f.key} style={{ background: '#fff', borderRadius: 10, padding: '7px 11px', borderLeft: `3px solid ${gc(f, v)}` }}>
                  <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2 }}>{f.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: gc(f, v) }}>{v} <span style={{ fontSize: 9, opacity: .5 }}>{f.unit}</span></div>
                </div>
              )
            })}
          </div>
          {result.alerts?.map((a, i) => <div key={i} style={{ fontSize: 11, color: '#DC2626', padding: '3px 0' }}>⚠ {a}</div>)}
          {result.summary && <div style={{ fontSize: 12, color: '#374151', marginTop: 8, lineHeight: 1.6, fontStyle: 'italic' }}>{result.summary}</div>}
        </div>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:.2;transform:scale(.75)}50%{opacity:1;transform:scale(1.2)}}`}</style>
    </div>
  )
}

export default function UploadScreen({ onLabSaved, onSteloSaved }) {
  const [sForm, setSForm] = useState({ date: today() })
  const [saved, setSaved] = useState(false)

  const saveSteloEntry = () => {
    const entry = { id: Date.now(), date: sForm.date || today(), src: 'manual', ...sForm }
    onSteloSaved(entry)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
    setSForm({ date: today() })
  }

  return (
    <div style={{ padding: '16px 16px 0' }}>
      <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 1.6 }}>
        Take a photo or upload a file — Claude reads Albanian, English, Turkish and Spanish automatically.
      </div>
      <UploadZone onResult={data => {
        const entry = { id: Date.now(), date: data.date || today(), src: 'upload', alerts: data.alerts || [], summary: data.summary || '', ...data.values }
        onLabSaved(entry)
      }} />

      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #E5E7EB' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Stelo CGM Entry</div>
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 14 }}>Log your daily readings, or upload the Stelo PDF/CSV above.</div>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '16px' }}>
          <FormField label="Date">
            <input type="date" value={sForm.date || ''} onChange={e => setSForm(p => ({ ...p, date: e.target.value }))} />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[['glucose_fasting','Fasting glucose','80–100'],['glucose_peak','Peak post-meal','< 140'],['glucose_avg','Daily average','< 115'],['time_in_range','Time in range','> 70%']].map(([k,lbl,meta]) => (
              <FormField key={k} label={`${lbl} · ${meta}`}>
                <input type="number" step=".1" placeholder="value" value={sForm[k] || ''} onChange={e => setSForm(p => ({ ...p, [k]: e.target.value }))} />
              </FormField>
            ))}
          </div>
          <FormField label="How did you feel?">
            <select value={sForm.feeling || ''} onChange={e => setSForm(p => ({ ...p, feeling: e.target.value }))}>
              <option value="">— select —</option>
              {['😴 Tired','😐 Normal','💪 Good','🤕 Unwell'].map(o => <option key={o}>{o}</option>)}
            </select>
          </FormField>
          <FormField label="Notes">
            <textarea value={sForm.notes || ''} onChange={e => setSForm(p => ({ ...p, notes: e.target.value }))} placeholder="What you ate, exercise, symptoms..." style={{ height: 64, resize: 'none' }} />
          </FormField>
          <PrimaryBtn onClick={saveSteloEntry} color="#7C3AED">{saved ? '✓ Saved' : 'Save Stelo Entry'}</PrimaryBtn>
        </div>
      </div>
    </div>
  )
}
