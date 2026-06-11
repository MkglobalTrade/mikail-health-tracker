'use client'
import { useState, useEffect } from 'react'
import { MEDS_DEFAULT, lsGet, lsSet } from '../../lib/data'
import { FormField, GhostBtn } from '../ui'

function MedItem({ m, done, onToggle, onEdit, isLast }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 16px', borderBottom:isLast?'none':'1px solid #F9FAFB', background:done?'#FAFAFA':'#fff' }}>
      <div onClick={onToggle} style={{ width:22, height:22, borderRadius:7, flexShrink:0, marginTop:1, background:done?'#10B981':'transparent', border:'2px solid '+(done?'#10B981':'#D1D5DB'), display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s', cursor:'pointer' }}>
        {done && <span style={{ color:'#fff', fontSize:13, fontWeight:700, lineHeight:1 }}>✓</span>}
      </div>
      <div style={{ flex:1, cursor:'pointer' }} onClick={onToggle}>
        <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:2 }}>
          <span style={{ fontSize:14, fontWeight:600, color:done?'#9CA3AF':'#1F2937', textDecoration:done?'line-through':'none' }}>{m.name}</span>
          {m.dose && m.dose !== '—' && (
            <span style={{ fontSize:10, padding:'1px 7px', borderRadius:20, background:'#EEF2FF', color:'#3730A3', border:'1px solid #C7D2FE', fontWeight:500 }}>{m.dose}</span>
          )}
          <span style={{ fontSize:9, padding:'1px 6px', borderRadius:20, background:m.type==='rx'?'#EEF2FF':'#F5F3FF', color:m.type==='rx'?'#4338CA':'#6D28D9', fontWeight:600 }}>{m.type==='rx'?'Rx':'Vit'}</span>
        </div>
        {m.with && <div style={{ fontSize:11, color:'#9CA3AF' }}>With {m.with}</div>}
        {m.note && <div style={{ fontSize:10, color:m.note.includes('⚠')?'#D97706':'#9CA3AF' }}>{m.note}</div>}
      </div>
      <button onClick={onEdit} style={{ background:'none', border:'none', color:'#D1D5DB', fontSize:17, padding:'2px 4px', flexShrink:0 }}>✎</button>
    </div>
  )
}

export default function MedsScreen() {
  const [meds,   setMeds  ] = useState({ morning:[], night:[] })
  const [checks, setChecks] = useState({})
  const [view,   setView  ] = useState('morning')
  const [modal,  setModal ] = useState(null)
  const [form,   setForm  ] = useState({})

  useEffect(() => {
    setMeds(lsGet('mk_meds_v9', MEDS_DEFAULT))
    const td = new Date().toDateString()
    if (lsGet('mk_chk_date','') !== td) { lsSet('mk_chk_date', td); lsSet('mk_chks_v9', {}) }
    setChecks(lsGet('mk_chks_v9', {}))
  }, [])

  const saveMeds   = d => { lsSet('mk_meds_v9', d); setMeds(d) }
  const saveChecks = c => { lsSet('mk_chks_v9', c); setChecks(c) }
  const toggle     = id => saveChecks({ ...checks, [id]: !checks[id] })

  const allMeds = [...(meds.morning||[]), ...(meds.night||[])]
  const done    = allMeds.filter(m => checks[m.id]).length
  const pct     = allMeds.length ? Math.round((done / allMeds.length) * 100) : 0
  const current = meds[view] || []

  const openAdd  = () => { setForm({ name:'', dose:'', with:'', note:'', type:'rx', time:view }); setModal('add') }
  const openEdit = m  => { setForm({ ...m, time:view }); setModal('edit') }

  const saveMed = () => {
    if (!form.name?.trim()) return
    const t = form.time || view
    const other = t === 'morning' ? 'night' : 'morning'
    const updated = { ...meds }
    if (modal === 'edit') {
      const inT = (updated[t]||[]).some(m => m.id === form.id)
      updated[t]     = inT ? (updated[t]||[]).map(m => m.id===form.id ? {...form} : m) : [...(updated[t]||[]), {...form}]
      updated[other] = (updated[other]||[]).filter(m => m.id !== form.id)
    } else {
      updated[t] = [...(updated[t]||[]), { ...form, id:'u'+Date.now() }]
    }
    saveMeds(updated)
    setModal(null)
  }

  const delMed = (id, t) => saveMeds({ ...meds, [t]: (meds[t]||[]).filter(m => m.id !== id) })

  const ringEl = (t) => {
    const items = meds[t] || []
    const d = items.filter(m => checks[m.id]).length
    const p = items.length ? Math.round((d/items.length)*100) : 0
    const r = 10, circ = 2*Math.PI*r, dash = (p/100)*circ
    const c = p===100 ? '#10B981' : '#4F46E5'
    return (
      <svg width={24} height={24} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={12} cy={12} r={r} fill="none" stroke="#E5E7EB" strokeWidth="2.5" />
        <circle cx={12} cy={12} r={r} fill="none" stroke={c} strokeWidth="2.5" strokeDasharray={dash+' '+circ} strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <div style={{ padding:'16px 16px 0' }}>
      <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:16, padding:'14px 16px', marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:'#1F2937' }}>Today's progress</div>
            <div style={{ fontSize:12, color:'#6B7280', marginTop:2 }}>{done} of {allMeds.length} taken</div>
          </div>
          <div style={{ fontSize:24, fontWeight:700, color:pct===100?'#10B981':'#4F46E5' }}>{pct}%</div>
        </div>
        <div style={{ height:6, background:'#F3F4F6', borderRadius:3, overflow:'hidden' }}>
          <div style={{ height:'100%', width:pct+'%', background:pct===100?'#10B981':'#4F46E5', borderRadius:3, transition:'width .4s ease' }} />
        </div>
        {pct===100 && <div style={{ fontSize:12, color:'#10B981', marginTop:6, fontWeight:600, textAlign:'center' }}>✓ All done for today</div>}
      </div>

      <div style={{ display:'flex', background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', overflow:'hidden', marginBottom:14 }}>
        {['morning','night'].map(t => (
          <button key={t} onClick={() => setView(t)} style={{ flex:1, padding:'12px 8px', border:'none', cursor:'pointer', background:view===t?'#EEF2FF':'transparent', borderBottom:'2px solid '+(view===t?'#4F46E5':'transparent'), display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {ringEl(t)}
              <span style={{ fontSize:14, fontWeight:view===t?600:400, color:view===t?'#4F46E5':'#6B7280' }}>
                {t==='morning' ? '🌅 Morning' : '🌙 Night'}
              </span>
            </div>
            <span style={{ fontSize:11, color:'#9CA3AF' }}>
              {(meds[t]||[]).filter(m=>checks[m.id]).length}/{(meds[t]||[]).length} taken
            </span>
          </button>
        ))}
      </div>

      {current.filter(m => m.type==='rx').length > 0 && (
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'#9CA3AF', marginBottom:7 }}>Prescribed</div>
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', overflow:'hidden' }}>
            {current.filter(m => m.type==='rx').map((m,i,arr) => (
              <MedItem key={m.id} m={m} done={!!checks[m.id]} onToggle={() => toggle(m.id)} onEdit={() => openEdit(m)} isLast={i===arr.length-1} />
            ))}
          </div>
        </div>
      )}

      {current.filter(m => m.type==='vit').length > 0 && (
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'#9CA3AF', marginBottom:7 }}>Vitamins &amp; Supplements</div>
          <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E5E7EB', overflow:'hidden' }}>
            {current.filter(m => m.type==='vit').map((m,i,arr) => (
              <MedItem key={m.id} m={m} done={!!checks[m.id]} onToggle={() => toggle(m.id)} onEdit={() => openEdit(m)} isLast={i===arr.length-1} />
            ))}
          </div>
        </div>
      )}

      <GhostBtn onClick={openAdd}>+ Add {view} medication</GhostBtn>

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:300, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', padding:'22px 18px 40px', width:'100%', maxWidth:430, maxHeight:'85vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div style={{ fontSize:17, fontWeight:700 }}>{modal==='edit'?'Edit':'Add medication'}</div>
              <button onClick={() => setModal(null)} style={{ background:'none', border:'none', fontSize:22, color:'#9CA3AF', padding:0 }}>✕</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:4 }}>
              <FormField label="Type">
                <select value={form.type||'rx'} onChange={e => setForm(p=>({...p,type:e.target.value}))}>
                  <option value="rx">Prescribed</option>
                  <option value="vit">Vitamin / Supplement</option>
                </select>
              </FormField>
              <FormField label="Time">
                <select value={form.time||view} onChange={e => setForm(p=>({...p,time:e.target.value}))}>
                  <option value="morning">🌅 Morning</option>
                  <option value="night">🌙 Night</option>
                </select>
              </FormField>
            </div>
            {[['name','Name *','e.g. Losartan'],['dose','Dose','e.g. 25 mg'],['with','Take with','e.g. Breakfast'],['note','Note','Purpose or warning...']].map(([k,lbl,ph]) => (
              <FormField key={k} label={lbl}>
                <input value={form[k]||''} onChange={e => setForm(p=>({...p,[k]:e.target.value}))} placeholder={ph} />
              </FormField>
            ))}
            <div style={{ display:'flex', gap:8, marginTop:16 }}>
              <button onClick={() => setModal(null)} style={{ flex:1, background:'#F9FAFB', border:'1px solid #E5E7EB', borderRadius:12, padding:'13px', color:'#6B7280', fontSize:14, fontWeight:500 }}>Cancel</button>
              {modal==='edit' && (
                <button onClick={() => { delMed(form.id, form.time||view); setModal(null) }} style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:12, padding:'13px 16px', color:'#DC2626', fontSize:14, fontWeight:500 }}>Delete</button>
              )}
              <button onClick={saveMed} style={{ flex:2, background:'#4F46E5', border:'none', borderRadius:12, padding:'13px', color:'#fff', fontSize:14, fontWeight:700 }}>
                {modal==='edit'?'Save changes':'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
