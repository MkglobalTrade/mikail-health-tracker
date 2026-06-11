'use client'
import { useState, useEffect, useRef } from 'react'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const LABS = [
  { key:'hba1c',         label:'HbA1c',        unit:'%',      cat:'diabetes', hi:6.5, cHi:8 },
  { key:'glucose',       label:'Glucosa',       unit:'mg/dl',  cat:'diabetes', lo:70, hi:99, cHi:200 },
  { key:'creatinine',    label:'Creatinina',    unit:'mg/dl',  cat:'kidney',   hi:1.18, cHi:2 },
  { key:'egfr',          label:'eGFR',          unit:'ml/min', cat:'kidney',   lo:60, cLo:30 },
  { key:'acr',           label:'ACR',           unit:'mg/g',   cat:'kidney',   hi:29, cHi:300 },
  { key:'bun',           label:'BUN',           unit:'mg/dl',  cat:'kidney',   hi:26, cHi:50 },
  { key:'ldl',           label:'LDL',           unit:'mg/dl',  cat:'lipids',   hi:99, cHi:160 },
  { key:'hdl',           label:'HDL',           unit:'mg/dl',  cat:'lipids',   lo:40, cLo:35 },
  { key:'triglycerides', label:'Triglicéridos', unit:'mg/dl',  cat:'lipids',   hi:149, cHi:500 },
  { key:'cholesterol',   label:'Colesterol',    unit:'mg/dl',  cat:'lipids',   hi:199, cHi:300 },
  { key:'hemoglobin',    label:'Hemoglobina',   unit:'g/dL',   cat:'blood',    lo:13, hi:16.7, cLo:10 },
  { key:'wbc',           label:'Leucocitos',    unit:'K/uL',   cat:'blood',    lo:3.6, hi:11.2, cHi:15 },
  { key:'platelets',     label:'Plaquetas',     unit:'K/uL',   cat:'blood',    lo:140, hi:440, cLo:100 },
  { key:'sodium',        label:'Sodio',         unit:'mEq/L',  cat:'electro',  lo:136, hi:145 },
  { key:'potassium',     label:'Potasio',       unit:'mEq/L',  cat:'electro',  lo:3.5, hi:5.1, cHi:5.5 },
  { key:'alt',           label:'ALT',           unit:'U/L',    cat:'liver',    hi:44, cHi:100 },
  { key:'ast',           label:'AST',           unit:'U/L',    cat:'liver',    hi:43, cHi:100 },
  { key:'albumin',       label:'Albúmina',      unit:'g/dL',   cat:'liver',    lo:3.5, hi:5.2 },
  { key:'tsh',           label:'TSH',           unit:'mUI/L',  cat:'other',    lo:0.4, hi:4.0, cHi:10 },
  { key:'vitamin_d',     label:'Vitamina D',    unit:'ng/mL',  cat:'other',    lo:30, hi:100, cLo:10 },
  { key:'uric_acid',     label:'Ácido Úrico',   unit:'mg/dl',  cat:'other',    hi:7.0, cHi:9 },
]

const STELO = [
  { key:'glucose_fasting', label:'Glucosa Ayunas',   unit:'mg/dl', meta:'80–100', hi:100, cHi:140 },
  { key:'glucose_peak',    label:'Pico Post-comida', unit:'mg/dl', meta:'< 140',  hi:140, cHi:180 },
  { key:'glucose_avg',     label:'Promedio Día',     unit:'mg/dl', meta:'< 115',  hi:115, cHi:154 },
  { key:'time_in_range',   label:'Time in Range',    unit:'%',     meta:'> 70%',  lo:70, cLo:50 },
]

const CATS = {
  diabetes:{ color:'#4B8EF0', label:'Diabetes',     icon:'◉' },
  kidney:  { color:'#2ECC8E', label:'Riñones',       icon:'◉' },
  lipids:  { color:'#F0724B', label:'Lípidos',       icon:'◉' },
  blood:   { color:'#E04E78', label:'Sangre',        icon:'◉' },
  electro: { color:'#E8B84B', label:'Electrolitos',  icon:'◉' },
  liver:   { color:'#6DC45A', label:'Hígado',        icon:'◉' },
  other:   { color:'#9B72E8', label:'Otros',         icon:'◉' },
}

const TIMES = ['ayunas','mañana','almuerzo','noche']
const T_COLOR = { ayunas:'#9B72E8', mañana:'#E8B84B', almuerzo:'#4B8EF0', noche:'#2ECC8E' }
const T_LABEL = { ayunas:'Ayunas', mañana:'Mañana', almuerzo:'Mediodía', noche:'Noche' }
const T_ICON  = { ayunas:'☽', mañana:'◎', almuerzo:'○', noche:'☽' }

const DEFAULT_MEDS = {
  rx: [
    { id:'r1', name:'Losartan',       dose:'25 mg',     time:'mañana',   with:'Desayuno',         note:'Protección renal · presión arterial' },
    { id:'r2', name:'Atorvastatina',  dose:'40 mg',     time:'noche',    with:'Antes de dormir',  note:'Colesterol — siempre de noche' },
    { id:'r3', name:'Fenofibrate',    dose:'145 mg',    time:'almuerzo', with:'Con comida grasa', note:'Triglicéridos' },
    { id:'r4', name:'Metformina',     dose:'500 mg',    time:'mañana',   with:'Desayuno',         note:'Diabetes — primera dosis' },
    { id:'r5', name:'Metformina',     dose:'500 mg',    time:'noche',    with:'Cena',             note:'Diabetes — segunda dosis' },
  ],
  vit: [
    { id:'v1',  name:'Vitamina D3 + K2',    dose:'5000 IU',   time:'mañana',   with:'Desayuno',              note:'Huesos · cardiovascular' },
    { id:'v2',  name:'CoQ10',               dose:'200 mg',    time:'mañana',   with:'Desayuno + MCT oil',    note:'Esencial con estatina' },
    { id:'v3',  name:'Vitamina B12',         dose:'—',         time:'mañana',   with:'Desayuno',              note:'Metformina agota B12' },
    { id:'v4',  name:'GTF Chromium',         dose:'200 mcg',  time:'mañana',   with:'Desayuno',              note:'Sensibilidad insulínica' },
    { id:'v5',  name:'Ceylon Cinnamon',      dose:'—',         time:'mañana',   with:'Desayuno',              note:'Glucosa postprandial' },
    { id:'v6',  name:'MCT Oil',              dose:'—',         time:'mañana',   with:'Desayuno / café',       note:'Energía cetogénica' },
    { id:'v7',  name:'Alpha Lipoic Acid',    dose:'—',         time:'ayunas',   with:'30 min antes desayuno', note:'Antioxidante · insulina' },
    { id:'v8',  name:'NMN',                  dose:'—',         time:'ayunas',   with:'30 min antes desayuno', note:'NAD+ · longevidad' },
    { id:'v9',  name:'Omega-3',              dose:'—',         time:'almuerzo', with:'Con comida',            note:'Triglicéridos — mitad dosis' },
    { id:'v10', name:'Omega-3',              dose:'—',         time:'noche',    with:'Cena',                  note:'Segunda mitad' },
    { id:'v11', name:'Apple Cider Vinegar',  dose:'—',         time:'almuerzo', with:'Antes de comer',        note:'Glucosa postprandial' },
    { id:'v12', name:'Magnesio Glicinato',   dose:'300–400mg', time:'noche',    with:'Antes de dormir',       note:'Sueño · presión arterial' },
    { id:'v13', name:'Astragalus Root',      dose:'—',         time:'ayunas',   with:'Mañana',                note:'⚠ Consultar nefrólogo' },
  ]
}

const DEFAULT_CONTACTS = [
  { id:'c1', name:'', specialty:'Médico Principal', hospital:'', phone:'', notes:'' },
  { id:'c2', name:'', specialty:'Nefrólogo',        hospital:'', phone:'', notes:'' },
  { id:'c3', name:'', specialty:'Cardiólogo',       hospital:'', phone:'', notes:'' },
  { id:'c4', name:'', specialty:'Endocrinólogo',    hospital:'', phone:'', notes:'' },
]

// ─── UTILS ────────────────────────────────────────────────────────────────────

function getStatus(f, v) {
  if (v == null || v === '') return 'ok'
  const n = parseFloat(v); if (isNaN(n)) return 'ok'
  if ((f.cHi && n >= f.cHi) || (f.cLo != null && n <= f.cLo)) return 'crit'
  if ((f.hi  && n > f.hi)   || (f.lo  != null && n < f.lo))   return 'warn'
  return 'ok'
}
const SC = { crit:'#F0724B', warn:'#E8B84B', ok:'#2ECC8E' }
const gc = (f,v) => SC[getStatus(f,v)]
const td = () => new Date().toISOString().split('T')[0]
const get = (k,fb) => { try { const d=localStorage.getItem(k); return d?JSON.parse(d):fb } catch { return fb } }
const set = (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)) } catch {} }

// ─── MICRO COMPONENTS ─────────────────────────────────────────────────────────

function Pill({ label, color, small }) {
  return (
    <span style={{ display:'inline-block', padding: small?'1px 7px':'3px 10px',
      background:`${color}18`, color, borderRadius:20,
      fontSize: small?9:11, fontWeight:600, letterSpacing:.3 }}>
      {label}
    </span>
  )
}

function StatusDot({ value, field }) {
  if (!value) return null
  const s = getStatus(field, value), c = SC[s]
  return <span style={{ width:7, height:7, borderRadius:'50%', background:c, display:'inline-block', flexShrink:0 }}/>
}

function Spark({ vals, color }) {
  if (!vals || vals.length < 2) return null
  const ns = vals.map(Number).filter(v => !isNaN(v))
  if (ns.length < 2) return null
  const mn = Math.min(...ns), mx = Math.max(...ns), rng = mx-mn||1
  const W=56, H=22
  const pts = ns.map((v,i) => `${(i/(ns.length-1))*W},${H-((v-mn)/rng)*(H-3)+1.5}`).join(' ')
  const lp = pts.split(' ').at(-1).split(',')
  const trend = ns.at(-1) - ns[0]
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:1 }}>
      <svg width={W} height={H}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" opacity=".6"/>
        <circle cx={lp[0]} cy={lp[1]} r="2.5" fill={color}/>
      </svg>
      <span style={{ fontSize:8, color: trend>0?'#F0724B':trend<0?'#2ECC8E':'#4a5070' }}>
        {trend>0?'↑':trend<0?'↓':'→'} {Math.abs(parseFloat(trend.toFixed(1)))}
      </span>
    </div>
  )
}

function ProgressRing({ pct, size=44, stroke=4, color='#4B8EF0' }) {
  const r = (size-stroke)/2, circ = 2*Math.PI*r
  const dash = Math.min(.97, pct/100) * circ
  return (
    <svg width={size} height={size} style={{ transform:'rotate(-90deg)', flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#12172a" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition:'stroke-dasharray .5s ease' }}/>
    </svg>
  )
}

function ValueRing({ value, field, size=56 }) {
  if (!value) return null
  const v=parseFloat(value), c=gc(field,v)
  const ref = field.cHi||(field.hi?field.hi*1.5:field.cLo?field.cLo*.5:100)
  const pct = Math.min(97, Math.max(3, (v/ref)*100))
  const r=(size-5)/2, circ=2*Math.PI*r, dash=(pct/100)*circ
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ position:'absolute', transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#12172a" strokeWidth="4.5"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth="4.5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition:'stroke-dasharray .5s ease' }}/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontSize:10, fontWeight:800, color:c, lineHeight:1 }}>{v}</div>
        <div style={{ fontSize:6.5, color:'#3a4060', marginTop:1 }}>{field.unit}</div>
      </div>
    </div>
  )
}

// ─── UPLOAD ───────────────────────────────────────────────────────────────────

function Upload({ onDone }) {
  const [phase, setPhase] = useState('idle')
  const [msg,   setMsg]   = useState('')
  const [data,  setData]  = useState(null)
  const ref = useRef()

  const b64 = f => new Promise((res,rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result.split(',')[1]); r.onerror=rej; r.readAsDataURL(f)
  })

  const run = async (file) => {
    setPhase('loading'); setData(null)
    const ext = file.name.split('.').pop().toLowerCase()
    try {
      let body = {}
      if (['jpg','jpeg','png','webp','heic','heif'].includes(ext)) {
        setMsg('Analizando imagen…'); body = { imageData:await b64(file), imageMime:ext==='png'?'image/png':'image/jpeg' }
      } else if (ext==='pdf') {
        setMsg('Leyendo PDF…'); body = { imageData:await b64(file), imageMime:'application/pdf' }
      } else if (['txt','csv'].includes(ext)) {
        setMsg('Leyendo archivo…'); body = { text:await file.text() }
      } else { throw new Error('Usa JPG, PNG, PDF, TXT o CSV') }

      setMsg('Claude analizando…')
      const res  = await fetch('/api/analyze',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error)
      setPhase('done'); setData(json.data); onDone(json.data)
    } catch(e) { setPhase('error'); setMsg(e.message) }
  }

  return (
    <div>
      <div onClick={()=>{ setPhase('idle'); ref.current?.click() }}
        onDrop={e=>{e.preventDefault();run(e.dataTransfer.files[0])}}
        onDragOver={e=>e.preventDefault()}
        style={{ border:`1.5px dashed ${phase==='done'?'#2ECC8E':phase==='error'?'#F0724B':'#1e2640'}`,
          borderRadius:16, padding:'28px 20px', textAlign:'center', cursor:'pointer',
          background:'#0a0d18', marginBottom:16, transition:'all .25s' }}>
        <div style={{ fontSize:32, marginBottom:10 }}>
          {phase==='loading'?'⏳':phase==='done'?'✓':phase==='error'?'✕':'↑'}
        </div>
        <div style={{ fontSize:15, fontWeight:700, marginBottom:4,
          color:phase==='error'?'#F0724B':phase==='done'?'#2ECC8E':'#e8ecf4' }}>
          {phase==='idle'&&'Subir resultado de laboratorio'}
          {phase==='loading'&&msg}
          {phase==='done'&&'Análisis completado'}
          {phase==='error'&&msg}
        </div>
        <div style={{ fontSize:11, color:'#3a4060' }}>
          {(phase==='idle'||phase==='done')&&'Foto · PDF · JPG · PNG · TXT · CSV'}
        </div>
        {phase==='loading'&&(
          <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:12 }}>
            {[0,1,2].map(i=><div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#4B8EF0', animation:`dot 1.1s ease-in-out ${i*.18}s infinite` }}/>)}
          </div>
        )}
      </div>

      <input ref={ref} type="file" style={{display:'none'}}
        accept=".jpg,.jpeg,.png,.pdf,.txt,.csv,.heic,.heif,.webp"
        onChange={e=>{if(e.target.files?.[0])run(e.target.files[0])}}/>

      {data && (
        <div style={{ background:'#071210', border:'1px solid #2ECC8E22', borderRadius:14, padding:16 }}>
          <div style={{ fontSize:10, color:'#2ECC8E', fontWeight:700, letterSpacing:2, marginBottom:12 }}>
            CLAUDE EXTRAJO
          </div>
          {data.date&&<div style={{ fontSize:11, color:'#4a5070', marginBottom:10 }}>Fecha: {data.date}</div>}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7, marginBottom:10 }}>
            {LABS.concat(STELO).map(f=>{
              const v=data.values?.[f.key]; if(!v) return null
              const c=gc(f,v)
              return(
                <div key={f.key} style={{ background:'#0d1020', borderRadius:10, padding:'8px 11px', borderLeft:`2px solid ${c}` }}>
                  <div style={{ fontSize:9, color:'#3a4060', marginBottom:2 }}>{f.label}</div>
                  <div style={{ fontSize:15, fontWeight:800, color:c }}>{v} <span style={{ fontSize:8, opacity:.5, fontWeight:400 }}>{f.unit}</span></div>
                </div>
              )
            })}
          </div>
          {data.alerts?.map((a,i)=><div key={i} style={{ fontSize:11, color:'#F0724B', padding:'3px 0' }}>⚠ {a}</div>)}
          {data.summary&&<div style={{ fontSize:11, color:'#4a5070', marginTop:8, lineHeight:1.6, fontStyle:'italic' }}>{data.summary}</div>}
        </div>
      )}
      <style>{`@keyframes dot{0%,100%{opacity:.2;transform:scale(.75)}50%{opacity:1;transform:scale(1.2)}}`}</style>
    </div>
  )
}

// ─── MEDS SCREEN ─────────────────────────────────────────────────────────────

function Meds() {
  const [meds,    setMeds]   = useState({ rx:[], vit:[] })
  const [checks,  setChecks] = useState({})
  const [view,    setView]   = useState('schedule') // schedule | rx | vit
  const [modal,   setModal]  = useState(false)
  const [editItem,setEdit]   = useState(null)
  const [form,    setForm]   = useState({ name:'', dose:'', time:'mañana', with:'', note:'', type:'rx' })

  useEffect(()=>{
    setMeds(get('mk_meds3', DEFAULT_MEDS))
    const today = new Date().toDateString()
    if (get('mk_chk_date','') !== today) { set('mk_chk_date',today); set('mk_chks3',{}) }
    setChecks(get('mk_chks3',{}))
  },[])

  const saveMeds = d => { set('mk_meds3',d); setMeds(d) }
  const saveChecks= c => { set('mk_chks3',c); setChecks(c) }
  const toggle = id => { const c={...checks,[id]:!checks[id]}; saveChecks(c) }

  const all = [...meds.rx,...meds.vit]
  const done = all.filter(m=>checks[m.id]).length
  const pct = all.length ? Math.round((done/all.length)*100) : 0

  const openAdd = (type) => {
    setEdit(null)
    setForm({ name:'', dose:'', time:'mañana', with:'', note:'', type })
    setModal(true)
  }
  const openEdit = (item, type) => {
    setEdit({ id:item.id, type })
    setForm({ ...item, type })
    setModal(true)
  }
  const save = () => {
    if (!form.name.trim()) return
    const cat = form.type==='rx'?'rx':'vit'
    const other = cat==='rx'?'vit':'rx'
    if (editItem) {
      const inCat = meds[cat].some(m=>m.id===editItem.id)
      const updated = {
        [cat]: inCat ? meds[cat].map(m=>m.id===editItem.id?{...form,id:editItem.id}:m) : [...meds[cat],{...form,id:editItem.id}],
        [other]: meds[other].filter(m=>m.id!==editItem.id)
      }
      saveMeds(updated)
    } else {
      const id = 'u'+Date.now()
      saveMeds({...meds,[cat]:[...meds[cat],{...form,id}]})
    }
    setModal(false)
  }
  const del = (id,cat) => saveMeds({...meds,[cat]:meds[cat].filter(m=>m.id!==id)})

  const INP = { width:'100%', background:'#0d1020', border:'1px solid #1e2640', borderRadius:10, padding:'10px 13px', color:'#e8ecf4', fontSize:14, outline:'none', boxSizing:'border-box' }

  return (
    <div>
      {/* Daily progress */}
      <div style={{ background:'#0a0d18', border:'1px solid #1e2640', borderRadius:16, padding:'16px', marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700 }}>Progreso de hoy</div>
            <div style={{ fontSize:11, color:'#4a5070', marginTop:2 }}>{done} de {all.length} tomados</div>
          </div>
          <div style={{ position:'relative' }}>
            <ProgressRing pct={pct} size={52} stroke={5} color={pct===100?'#2ECC8E':'#4B8EF0'}/>
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:12, fontWeight:800, color:pct===100?'#2ECC8E':'#4B8EF0' }}>{pct}%</span>
            </div>
          </div>
        </div>
        <div style={{ height:3, background:'#12172a', borderRadius:2, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:pct===100?'#2ECC8E':'linear-gradient(90deg,#4B8EF0,#9B72E8)', borderRadius:2, transition:'width .4s ease' }}/>
        </div>
        {pct===100&&<div style={{ fontSize:11, color:'#2ECC8E', marginTop:8, textAlign:'center', fontWeight:600 }}>✓ Todo completado por hoy</div>}
      </div>

      {/* Sub tabs */}
      <div style={{ display:'flex', background:'#0a0d18', border:'1px solid #1e2640', borderRadius:12, padding:3, marginBottom:16, gap:2 }}>
        {[['schedule','Horario'],['rx','Recetados'],['vit','Vitaminas']].map(([id,label])=>(
          <button key={id} onClick={()=>setView(id)} style={{ flex:1, padding:'8px 4px',
            background:view===id?'#12172a':'transparent',
            border:view===id?'1px solid #1e2640':'1px solid transparent',
            borderRadius:9, color:view===id?'#e8ecf4':'#4a5070',
            fontSize:12, fontWeight:view===id?700:400, cursor:'pointer' }}>{label}</button>
        ))}
      </div>

      {/* Schedule view */}
      {view==='schedule' && TIMES.map(time=>{
        const items = [...meds.rx,...meds.vit].filter(m=>m.time===time)
        if (!items.length) return null
        const tc = T_COLOR[time]
        const tdone = items.filter(m=>checks[m.id]).length
        return(
          <div key={time} style={{ marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:24, height:24, borderRadius:8, background:`${tc}18`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:13, color:tc }}>{T_ICON[time]}</div>
                <span style={{ fontSize:12, fontWeight:700, color:tc, letterSpacing:.5 }}>{T_LABEL[time].toUpperCase()}</span>
              </div>
              <span style={{ fontSize:11, color:'#3a4060' }}>{tdone}/{items.length}</span>
            </div>
            <div style={{ background:'#0a0d18', border:'1px solid #1e2640', borderRadius:14, overflow:'hidden' }}>
              {items.map((m,i)=>(
                <div key={m.id} onClick={()=>toggle(m.id)}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                    borderBottom:i<items.length-1?'1px solid #0d1020':'none',
                    cursor:'pointer', opacity:checks[m.id]?.7:1, transition:'opacity .2s' }}>
                  <div style={{ width:22, height:22, borderRadius:7, flexShrink:0,
                    background:checks[m.id]?tc:'transparent',
                    border:`1.5px solid ${checks[m.id]?tc:'#2a3050'}`,
                    display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}>
                    {checks[m.id]&&<span style={{ fontSize:11, color:'#060810', fontWeight:900 }}>✓</span>}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                      <span style={{ fontSize:14, fontWeight:600,
                        textDecoration:checks[m.id]?'line-through':'none',
                        color:checks[m.id]?'#3a4060':'#e8ecf4' }}>{m.name}</span>
                      {m.dose&&<Pill label={m.dose} color={tc} small/>}
                      <Pill label={m.type==='rx'?'Rx':'Vit'} color={m.type==='rx'?'#4B8EF0':'#9B72E8'} small/>
                    </div>
                    {m.with&&<div style={{ fontSize:11, color:'#3a4060', marginTop:2 }}>{m.with}</div>}
                    {m.note&&<div style={{ fontSize:10, color:m.note.includes('⚠')?'#F0724B':'#2a3050', marginTop:1 }}>{m.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Rx / Vit list */}
      {(view==='rx'||view==='vit') && (() => {
        const cat = view==='rx'?'rx':'vit'
        const color = cat==='rx'?'#4B8EF0':'#9B72E8'
        const items = meds[cat]
        return(
          <div>
            {TIMES.map(time=>{
              const tItems = items.filter(m=>m.time===time)
              if (!tItems.length) return null
              const tc = T_COLOR[time]
              return(
                <div key={time} style={{ marginBottom:18 }}>
                  <div style={{ fontSize:10, color:tc, fontWeight:700, letterSpacing:2,
                    textTransform:'uppercase', marginBottom:8, display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ flex:1, height:1, background:`${tc}22` }}/>{T_ICON[time]} {T_LABEL[time]}<div style={{ flex:1, height:1, background:`${tc}22` }}/>
                  </div>
                  {tItems.map(m=>(
                    <div key={m.id} style={{ background:'#0a0d18', border:`1px solid ${color}18`,
                      borderRadius:12, padding:'12px 14px', marginBottom:7 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4, flexWrap:'wrap' }}>
                            <span style={{ fontSize:14, fontWeight:700 }}>{m.name}</span>
                            {m.dose&&<Pill label={m.dose} color={color} small/>}
                          </div>
                          {m.with&&<div style={{ fontSize:11, color:'#4a5070' }}>Con {m.with}</div>}
                          {m.note&&<div style={{ fontSize:10, color:m.note.includes('⚠')?'#F0724B':'#3a4060', marginTop:3 }}>{m.note}</div>}
                        </div>
                        <div style={{ display:'flex', gap:8, marginLeft:8 }}>
                          <button onClick={()=>openEdit(m,cat)} style={{ background:'none', border:'none', color:'#3a4060', cursor:'pointer', fontSize:15, padding:0 }}>✎</button>
                          <button onClick={()=>del(m.id,cat)} style={{ background:'none', border:'none', color:'#2a3050', cursor:'pointer', fontSize:15, padding:0 }}>✕</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
            <button onClick={()=>openAdd(cat)} style={{ width:'100%', background:'transparent',
              border:`1px dashed ${color}44`, borderRadius:12, padding:'12px',
              color, fontSize:13, cursor:'pointer', marginTop:4 }}>
              + Agregar {cat==='rx'?'medicamento':'suplemento'}
            </button>
          </div>
        )
      })()}

      {/* Modal */}
      {modal&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.8)', zIndex:200,
          display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div style={{ background:'#0d1020', borderRadius:'20px 20px 0 0', padding:'22px 18px 36px',
            width:'100%', maxWidth:430, border:'1px solid #1e2640', borderBottom:'none', maxHeight:'85vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <div style={{ fontSize:16, fontWeight:800 }}>{editItem?'Editar':'Agregar'}</div>
              <button onClick={()=>setModal(false)} style={{ background:'none', border:'none', color:'#4a5070', fontSize:22, cursor:'pointer', padding:0 }}>✕</button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
              <div>
                <label style={{ fontSize:10, color:'#4a5070', display:'block', marginBottom:4, letterSpacing:1 }}>TIPO</label>
                <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={INP}>
                  <option value="rx">Recetado</option>
                  <option value="vit">Vitamina</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize:10, color:'#4a5070', display:'block', marginBottom:4, letterSpacing:1 }}>MOMENTO</label>
                <select value={form.time} onChange={e=>setForm(p=>({...p,time:e.target.value}))} style={INP}>
                  {TIMES.map(t=><option key={t} value={t}>{T_LABEL[t]}</option>)}
                </select>
              </div>
            </div>

            {[['name','NOMBRE *','ej: Losartan'],['dose','DOSIS','ej: 25 mg'],['with','TOMAR CON','ej: Desayuno'],['note','NOTA','Para qué sirve…']].map(([k,lbl,ph])=>(
              <div key={k} style={{ marginBottom:10 }}>
                <label style={{ fontSize:10, color:'#4a5070', display:'block', marginBottom:4, letterSpacing:1 }}>{lbl}</label>
                <input value={form[k]||''} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} placeholder={ph} style={INP}/>
              </div>
            ))}

            <div style={{ display:'flex', gap:8, marginTop:16 }}>
              <button onClick={()=>setModal(false)} style={{ flex:1, background:'#12172a', border:'1px solid #1e2640', borderRadius:12, padding:'13px', color:'#4a5070', fontSize:14, cursor:'pointer' }}>Cancelar</button>
              <button onClick={save} style={{ flex:2, background:'linear-gradient(135deg,#1a3a7a,#253a90)', border:'none', borderRadius:12, padding:'13px', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                {editItem?'Guardar cambios':'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CONTACTS SCREEN ─────────────────────────────────────────────────────────

function Contacts() {
  const [contacts, setContacts] = useState([])
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState({})

  useEffect(()=>{ setContacts(get('mk_contacts2', DEFAULT_CONTACTS)) },[])
  const save = d => { set('mk_contacts2',d); setContacts(d) }

  const startEdit = (c) => { setEditing(c.id); setForm({...c}) }
  const saveEdit  = () => {
    save(contacts.map(c => c.id===editing ? {...form,id:editing} : c))
    setEditing(null)
  }
  const addNew = () => {
    const nc = { id:'c'+Date.now(), name:'', specialty:'', hospital:'', phone:'', notes:'' }
    const updated = [...contacts, nc]
    save(updated)
    setEditing(nc.id); setForm(nc)
  }
  const del = id => save(contacts.filter(c=>c.id!==id))

  const INP = { width:'100%', background:'#0d1020', border:'1px solid #1e2640', borderRadius:10, padding:'10px 13px', color:'#e8ecf4', fontSize:14, outline:'none', boxSizing:'border-box' }

  return (
    <div>
      <div style={{ fontSize:11, color:'#4a5070', marginBottom:16, lineHeight:1.6 }}>
        Tus médicos y hospitales — siempre disponibles en caso de emergencia
      </div>

      {contacts.map((c,i) => (
        <div key={c.id} style={{ background:'#0a0d18', border:'1px solid #1e2640',
          borderRadius:16, padding:'14px 16px', marginBottom:10 }}>
          {editing === c.id ? (
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'#4B8EF0', marginBottom:12 }}>Editando contacto</div>
              {[['specialty','ESPECIALIDAD','ej: Nefrólogo'],['name','NOMBRE COMPLETO','Dr. Apellido Nombre'],['hospital','HOSPITAL / CLÍNICA','ej: Cedars-Sinai'],['phone','TELÉFONO','ej: +1 (310) 000-0000'],['notes','NOTAS','ej: Citas Martes tarde']].map(([k,lbl,ph])=>(
                <div key={k} style={{ marginBottom:10 }}>
                  <label style={{ fontSize:9, color:'#4a5070', display:'block', marginBottom:3, letterSpacing:1 }}>{lbl}</label>
                  <input value={form[k]||''} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} placeholder={ph} style={INP}/>
                </div>
              ))}
              <div style={{ display:'flex', gap:8, marginTop:12 }}>
                <button onClick={()=>setEditing(null)} style={{ flex:1, background:'#12172a', border:'1px solid #1e2640', borderRadius:10, padding:'11px', color:'#4a5070', fontSize:13, cursor:'pointer' }}>Cancelar</button>
                <button onClick={saveEdit} style={{ flex:2, background:'linear-gradient(135deg,#1a3a7a,#253a90)', border:'none', borderRadius:10, padding:'11px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>Guardar</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:'#12172a',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:16, border:'1px solid #1e2640' }}>👨‍⚕️</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:c.name?'#e8ecf4':'#3a4060' }}>
                        {c.name||'Sin nombre'}
                      </div>
                      <div style={{ fontSize:11, color:'#4B8EF0' }}>{c.specialty||'Especialidad'}</div>
                    </div>
                  </div>
                  {c.hospital&&(
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                      <span style={{ fontSize:11, color:'#3a4060' }}>🏥</span>
                      <span style={{ fontSize:12, color:'#6a7090' }}>{c.hospital}</span>
                    </div>
                  )}
                  {c.phone&&(
                    <a href={`tel:${c.phone}`} style={{ display:'flex', alignItems:'center', gap:6, textDecoration:'none' }}>
                      <span style={{ fontSize:11, color:'#3a4060' }}>📞</span>
                      <span style={{ fontSize:12, color:'#4B8EF0', fontWeight:600 }}>{c.phone}</span>
                    </a>
                  )}
                  {c.notes&&<div style={{ fontSize:11, color:'#3a4060', marginTop:5, fontStyle:'italic' }}>{c.notes}</div>}
                  {!c.name&&!c.hospital&&!c.phone&&(
                    <div style={{ fontSize:12, color:'#2a3050', fontStyle:'italic' }}>Toca editar para agregar información</div>
                  )}
                </div>
                <div style={{ display:'flex', gap:8, marginLeft:8 }}>
                  <button onClick={()=>startEdit(c)} style={{ background:'none', border:'none', color:'#3a4060', cursor:'pointer', fontSize:16, padding:0 }}>✎</button>
                  <button onClick={()=>del(c.id)} style={{ background:'none', border:'none', color:'#2a3050', cursor:'pointer', fontSize:16, padding:0 }}>✕</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      <button onClick={addNew} style={{ width:'100%', background:'transparent',
        border:'1px dashed #4B8EF044', borderRadius:12, padding:'12px',
        color:'#4B8EF0', fontSize:13, cursor:'pointer', marginTop:4 }}>
        + Agregar médico / hospital
      </button>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [tab,   setTab]  = useState('home')
  const [labs,  setLabs] = useState([])
  const [stelo, setSte]  = useState([])
  const [lForm, setLF]   = useState({ date:td() })
  const [sForm, setSF]   = useState({ date:td() })
  const [flash, setFlash]= useState(false)
  const [exp,   setExp]  = useState(null)

  useEffect(()=>{ setLabs(get('mk_labs5',[])); setSte(get('mk_stelo5',[])) },[])

  const saveLabs  = d => { set('mk_labs5', d);  setLabs(d) }
  const saveStelo = d => { set('mk_stelo5',d); setSte(d) }
  const ok = cb  => { setFlash(true); setTimeout(()=>{ setFlash(false); cb?.() },1400) }

  const onUpload = data => {
    saveLabs([{ id:Date.now(), date:data.date||td(), src:'auto', alerts:data.alerts||[], summary:data.summary||'', ...data.values }, ...labs])
    ok(()=>setTab('home'))
  }

  const submitLab = () => {
    if (!lForm.date) return
    saveLabs([{ ...lForm, id:Date.now(), src:'manual' }, ...labs])
    setLF({ date:td() }); ok(()=>setTab('home'))
  }

  const submitSte = () => {
    if (!sForm.date) return
    saveStelo([{ ...sForm, id:Date.now() }, ...stelo])
    setSF({ date:td() }); ok()
  }

  const L = labs[0]||{}, S = stelo[0]||{}
  const crits = LABS.filter(f=>L[f.key]&&getStatus(f,L[f.key])==='crit')
  const hist  = key => [...labs].reverse().filter(l=>l[key]!=null).map(l=>l[key])

  // Shared styles
  const INP = { width:'100%', background:'#0a0d18', border:'1px solid #1e2640', borderRadius:11, padding:'11px 14px', color:'#e8ecf4', fontSize:14, outline:'none', boxSizing:'border-box', marginTop:4 }
  const BTN = (bg='#1a3a7a') => ({ width:'100%', background:`linear-gradient(135deg,${bg} 0%,${bg}dd 100%)`, border:'none', borderRadius:13, padding:'14px', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', marginTop:10, letterSpacing:.2 })
  const CARD = (ac='#1e2640') => ({ background:'#0a0d18', border:`1px solid ${ac}`, borderRadius:16, padding:'16px', marginBottom:12 })
  const LBL  = { fontSize:10, color:'#4a5070', letterSpacing:1, textTransform:'uppercase', marginTop:14, marginBottom:3, display:'block' }
  const SEC  = c => ({ fontSize:10, color:c, fontWeight:700, letterSpacing:2, textTransform:'uppercase', marginBottom:10, paddingBottom:7, borderBottom:`1px solid ${c}22` })

  const TABS = [
    { id:'home',     icon:'▦',  label:'Inicio' },
    { id:'upload',   icon:'↑',  label:'Subir' },
    { id:'meds',     icon:'⊕',  label:'Meds' },
    { id:'contacts', icon:'☎',  label:'Médicos' },
    { id:'history',  icon:'≡',  label:'Historial' },
  ]

  return (
    <div style={{ minHeight:'100vh', paddingBottom:88 }}>

      {/* ── HEADER */}
      <div style={{ padding:'18px 18px 14px', background:'#060810',
        borderBottom:'1px solid #0e1220', position:'sticky', top:0, zIndex:30,
        backdropFilter:'blur(12px)' }}>
        <div style={{ fontSize:9, color:'#4B8EF0', letterSpacing:3, textTransform:'uppercase', marginBottom:5 }}>
          HEALTH MONITOR
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:21, fontWeight:800, letterSpacing:-.5, lineHeight:1 }}>Mikail Kocak</div>
            <div style={{ fontSize:11, color:'#4a5070', marginTop:3 }}>46 años · Los Angeles, CA</div>
          </div>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            {crits.length>0&&(
              <div style={{ background:'#F0724B14', border:'1px solid #F0724B44',
                borderRadius:8, padding:'4px 10px', fontSize:11, color:'#F0724B', fontWeight:700 }}>
                ⚠ {crits.length} alerta{crits.length>1?'s':''}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding:'16px 16px 0' }}>

        {/* ══ HOME */}
        {tab==='home' && (
          <div>
            {flash&&(
              <div style={{ background:'#071510', border:'1px solid #2ECC8E33',
                borderRadius:12, padding:'11px 16px', marginBottom:12,
                display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ color:'#2ECC8E', fontSize:14 }}>✓</span>
                <span style={{ fontSize:13, color:'#2ECC8E', fontWeight:600 }}>Guardado correctamente</span>
              </div>
            )}

            {/* Critical banner */}
            {crits.length>0&&(
              <div style={CARD('#F0724B33')}>
                <div style={{ fontSize:10, color:'#F0724B', fontWeight:700, letterSpacing:2, marginBottom:10 }}>VALORES CRÍTICOS</div>
                {crits.map(f=>(
                  <div key={f.key} style={{ display:'flex', justifyContent:'space-between',
                    alignItems:'center', padding:'6px 0', borderBottom:'1px solid #F0724B0d' }}>
                    <span style={{ fontSize:13, color:'#8a90a8' }}>{f.label}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:'#F0724B' }}>{L[f.key]} {f.unit}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {labs.length===0&&stelo.length===0&&(
              <div style={{ textAlign:'center', padding:'70px 20px' }}>
                <div style={{ fontSize:48, marginBottom:14, opacity:.3 }}>⬡</div>
                <div style={{ fontSize:16, fontWeight:700, color:'#3a4060', marginBottom:6 }}>Sin datos aún</div>
                <div style={{ fontSize:13, color:'#2a3050', lineHeight:1.6 }}>
                  Usa <span style={{ color:'#4B8EF0', fontWeight:600 }}>Subir</span> para cargar tus primeros resultados de laboratorio
                </div>
              </div>
            )}

            {/* Lab cards */}
            {Object.entries(CATS).map(([cat,cfg])=>{
              const fields = LABS.filter(f=>f.cat===cat&&L[f.key]!=null)
              if (!fields.length) return null
              return(
                <div key={cat} style={CARD(cfg.color+'1a')}>
                  <div style={SEC(cfg.color)}>{cfg.label}</div>
                  {fields.map(f=>{
                    const v=L[f.key], c=gc(f,v), s=getStatus(f,v), h=hist(f.key)
                    return(
                      <div key={f.key} style={{ display:'flex', alignItems:'center',
                        padding:'10px 0', borderBottom:'1px solid #ffffff04', gap:12 }}>
                        <ValueRing value={v} field={f} size={54}/>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                            <span style={{ fontSize:12, color:'#6a7090' }}>{f.label}</span>
                            <StatusDot value={v} field={f}/>
                          </div>
                          <div style={{ height:3, background:'#0e1220', borderRadius:2, overflow:'hidden' }}>
                            <div style={{ height:'100%', background:c, borderRadius:2,
                              width:`${Math.min(97,Math.max(3,(parseFloat(v)/(f.cHi||f.hi*1.5||100))*100))}%`,
                              transition:'width .5s ease' }}/>
                          </div>
                          {s!=='ok'&&(
                            <div style={{ fontSize:9, color:c, marginTop:3, letterSpacing:.3 }}>
                              {s==='crit'?'CRÍTICO':'FUERA DE RANGO'} · Normal: {f.lo&&f.hi?`${f.lo}–${f.hi}`:f.hi?`<${f.hi}`:`>${f.lo}`} {f.unit}
                            </div>
                          )}
                        </div>
                        {h.length>1&&<Spark vals={h} color={cfg.color}/>}
                      </div>
                    )
                  })}
                </div>
              )
            })}

            {/* Stelo card */}
            {stelo.length>0&&(
              <div style={CARD('#9B72E81a')}>
                <div style={SEC('#9B72E8')}>STELO CGM · {S.date}</div>
                {STELO.map(f=>{
                  const v=S[f.key]; if(!v) return null
                  const c=gc(f,v), sh=[...stelo].reverse().filter(s=>s[f.key]).map(s=>s[f.key])
                  return(
                    <div key={f.key} style={{ display:'flex', alignItems:'center',
                      padding:'10px 0', borderBottom:'1px solid #ffffff04', gap:12 }}>
                      <ValueRing value={v} field={f} size={54}/>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, color:'#6a7090', marginBottom:3 }}>{f.label}</div>
                        <div style={{ fontSize:10, color:'#3a4060' }}>Meta: {f.meta}</div>
                      </div>
                      {sh.length>1&&<Spark vals={sh} color="#9B72E8"/>}
                    </div>
                  )
                })}
                {S.feeling&&<div style={{ fontSize:11, color:'#4a5070', marginTop:8 }}>{S.feeling}</div>}
              </div>
            )}

            {labs.length>0&&(
              <div style={{ textAlign:'center', fontSize:10, color:'#2a3050', marginTop:4, letterSpacing:.5 }}>
                ÚLTIMO LAB: {L.date} · {labs.length} REGISTROS
              </div>
            )}
          </div>
        )}

        {/* ══ UPLOAD */}
        {tab==='upload' && (
          <div>
            <div style={{ fontSize:18, fontWeight:800, marginBottom:4 }}>Subir Resultado</div>
            <div style={{ fontSize:13, color:'#4a5070', marginBottom:18, lineHeight:1.5 }}>
              Sube una foto o archivo — Claude extrae todos los valores automáticamente
            </div>
            <Upload onDone={onUpload}/>
            {flash&&<div style={{ background:'#071510', border:'1px solid #2ECC8E33', borderRadius:12, padding:'12px 16px', marginTop:10, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ color:'#2ECC8E' }}>✓</span>
              <span style={{ fontSize:13, color:'#2ECC8E', fontWeight:600 }}>Guardado en historial</span>
            </div>}

            <div style={{ marginTop:28, paddingTop:20, borderTop:'1px solid #0e1220' }}>
              <div style={{ fontSize:15, fontWeight:800, marginBottom:4 }}>Registro Stelo</div>
              <div style={{ fontSize:12, color:'#4a5070', marginBottom:16 }}>
                Anota tus valores diarios del CGM · También puedes subir el PDF/CSV exportado de Stelo arriba
              </div>
              <label style={LBL}>Fecha</label>
              <input type="date" value={sForm.date||''} onChange={e=>setSF(p=>({...p,date:e.target.value}))} style={INP}/>
              {STELO.map(f=>(
                <div key={f.key}>
                  <label style={LBL}>{f.label} <span style={{ color:'#2a3050', textTransform:'none', letterSpacing:0 }}>· meta {f.meta}</span></label>
                  <input type="number" step=".1" placeholder={f.unit} value={sForm[f.key]||''}
                    onChange={e=>setSF(p=>({...p,[f.key]:e.target.value}))}
                    style={{ ...INP, borderColor:sForm[f.key]?gc(f,sForm[f.key])+'66':'#1e2640' }}/>
                </div>
              ))}
              <label style={LBL}>Estado</label>
              <div style={{ display:'flex', gap:6, marginTop:4 }}>
                {['😴 Cansado','😐 Normal','💪 Bien','🤕 Mal'].map(o=>(
                  <button key={o} onClick={()=>setSF(p=>({...p,feeling:o}))} style={{ flex:1,
                    padding:'9px 2px', background:sForm.feeling===o?'#12172a':'#0a0d18',
                    border:sForm.feeling===o?'1px solid #4B8EF0':'1px solid #1e2640',
                    borderRadius:10, color:sForm.feeling===o?'#4B8EF0':'#3a4060',
                    fontSize:9, cursor:'pointer', lineHeight:1.4 }}>{o}</button>
                ))}
              </div>
              <label style={LBL}>Notas</label>
              <textarea placeholder="Qué comiste, ejercicio, síntomas…" value={sForm.notes||''}
                onChange={e=>setSF(p=>({...p,notes:e.target.value}))}
                style={{ ...INP, height:68, resize:'none' }}/>
              <button onClick={submitSte} style={BTN('#5a2090')}>{flash?'✓ Guardado':'Guardar Stelo'}</button>
            </div>
          </div>
        )}

        {/* ══ MEDS */}
        {tab==='meds' && (
          <div>
            <div style={{ fontSize:18, fontWeight:800, marginBottom:4 }}>Medicamentos</div>
            <div style={{ fontSize:13, color:'#4a5070', marginBottom:18 }}>Tu régimen diario · Recetados y vitaminas</div>
            <Meds/>
          </div>
        )}

        {/* ══ CONTACTS */}
        {tab==='contacts' && (
          <div>
            <div style={{ fontSize:18, fontWeight:800, marginBottom:4 }}>Mis Médicos</div>
            <Contacts/>
          </div>
        )}

        {/* ══ MANUAL */}
        {tab==='history' && (
          <div>
            <div style={{ fontSize:18, fontWeight:800, marginBottom:16 }}>Historial</div>

            {/* Add manual lab button */}
            <details style={{ marginBottom:16 }}>
              <summary style={{ fontSize:13, color:'#4B8EF0', fontWeight:600, cursor:'pointer',
                padding:'10px 14px', background:'#0a0d18', border:'1px solid #4B8EF022',
                borderRadius:12, listStyle:'none', display:'flex', alignItems:'center', gap:6 }}>
                <span>+ Ingresar resultado manual</span>
              </summary>
              <div style={{ background:'#0a0d18', border:'1px solid #1e2640', borderTop:'none',
                borderRadius:'0 0 12px 12px', padding:'16px 14px' }}>
                <label style={LBL}>Fecha</label>
                <input type="date" value={lForm.date||''} onChange={e=>setLF(p=>({...p,date:e.target.value}))} style={INP}/>
                {Object.entries(CATS).map(([cat,cfg])=>(
                  <div key={cat} style={{ marginTop:18 }}>
                    <div style={SEC(cfg.color)}>{cfg.label}</div>
                    {LABS.filter(f=>f.cat===cat).map(f=>(
                      <div key={f.key}>
                        <label style={LBL}>{f.label} <span style={{ color:'#2a3050',textTransform:'none',letterSpacing:0 }}>({f.lo&&f.hi?`${f.lo}–${f.hi}`:f.hi?`<${f.hi}`:`>${f.lo}`} {f.unit})</span></label>
                        <input type="number" step=".01" placeholder={f.unit} value={lForm[f.key]||''}
                          onChange={e=>setLF(p=>({...p,[f.key]:e.target.value}))}
                          style={{ ...INP, borderColor:lForm[f.key]?gc(f,lForm[f.key])+'66':'#1e2640' }}/>
                      </div>
                    ))}
                  </div>
                ))}
                <label style={{ ...LBL,marginTop:18 }}>Notas</label>
                <textarea placeholder="Observaciones, síntomas, cambios…" value={lForm.notes||''}
                  onChange={e=>setLF(p=>({...p,notes:e.target.value}))} style={{ ...INP,height:72,resize:'none' }}/>
                <button onClick={submitLab} style={BTN()}>{flash?'✓ Guardado':'Guardar'}</button>
              </div>
            </details>

            {/* Labs history */}
            <div style={{ fontSize:10, color:'#4B8EF0', fontWeight:700, letterSpacing:2, marginBottom:10 }}>
              LABORATORIOS · {labs.length} registros
            </div>
            {labs.length===0&&<div style={{ color:'#2a3050', fontSize:13, marginBottom:24 }}>Sin registros</div>}
            {labs.map(l=>(
              <div key={l.id} onClick={()=>setExp(exp===l.id?null:l.id)}
                style={{ ...CARD(exp===l.id?'#4B8EF044':'#1e2640'), cursor:'pointer', transition:'border-color .2s' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700 }}>{l.date}</div>
                    <div style={{ fontSize:10, color:'#3a4060', marginTop:2 }}>
                      {l.src==='auto'?'Auto · Claude':'Manual'}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <span style={{ fontSize:12, color:'#3a4060' }}>{exp===l.id?'▲':'▼'}</span>
                    <button onClick={e=>{e.stopPropagation();saveLabs(labs.filter(x=>x.id!==l.id))}}
                      style={{ background:'none', border:'none', color:'#2a3050', cursor:'pointer', fontSize:16, padding:0 }}>✕</button>
                  </div>
                </div>
                {exp===l.id&&(
                  <div style={{ marginTop:14 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7, marginBottom:10 }}>
                      {LABS.map(f=>{ if(!l[f.key]) return null; const c=gc(f,l[f.key])
                        return(<div key={f.key} style={{ background:'#060810', borderRadius:10, padding:'8px 12px', borderLeft:`2px solid ${c}` }}>
                          <div style={{ fontSize:9, color:'#3a4060', marginBottom:2 }}>{f.label}</div>
                          <div style={{ fontSize:14, fontWeight:800, color:c }}>{l[f.key]} <span style={{ fontSize:8, opacity:.4 }}>{f.unit}</span></div>
                        </div>)
                      })}
                    </div>
                    {l.alerts?.map((a,i)=><div key={i} style={{ fontSize:11, color:'#F0724B', padding:'3px 0' }}>⚠ {a}</div>)}
                    {l.summary&&<div style={{ fontSize:11, color:'#4a5070', marginTop:8, fontStyle:'italic', lineHeight:1.6 }}>{l.summary}</div>}
                    {l.notes&&<div style={{ fontSize:11, color:'#3a4060', marginTop:4, fontStyle:'italic' }}>{l.notes}</div>}
                  </div>
                )}
              </div>
            ))}

            {/* Stelo history */}
            <div style={{ fontSize:10, color:'#9B72E8', fontWeight:700, letterSpacing:2, marginBottom:10, marginTop:20 }}>
              STELO · {stelo.length} días
            </div>
            {stelo.length===0&&<div style={{ color:'#2a3050', fontSize:13 }}>Sin registros</div>}
            {stelo.map(s=>(
              <div key={s.id} style={CARD('#9B72E81a')}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <div style={{ fontSize:14, fontWeight:700 }}>{s.date} <span style={{ fontSize:12, fontWeight:400 }}>{s.feeling}</span></div>
                  <button onClick={()=>saveStelo(stelo.filter(x=>x.id!==s.id))}
                    style={{ background:'none', border:'none', color:'#2a3050', cursor:'pointer', fontSize:16, padding:0 }}>✕</button>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
                  {STELO.map(f=>s[f.key]?(
                    <div key={f.key} style={{ background:'#060810', borderRadius:10, padding:'8px 12px', borderLeft:`2px solid ${gc(f,s[f.key])}` }}>
                      <div style={{ fontSize:9, color:'#3a4060', marginBottom:2 }}>{f.label}</div>
                      <div style={{ fontSize:14, fontWeight:800, color:gc(f,s[f.key]) }}>{s[f.key]} <span style={{ fontSize:8, opacity:.4 }}>{f.unit}</span></div>
                    </div>
                  ):null)}
                </div>
                {s.notes&&<div style={{ fontSize:11, color:'#3a4060', marginTop:8, fontStyle:'italic' }}>{s.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV */}
      <div style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)',
        width:'100%', maxWidth:430, background:'#060810',
        borderTop:'1px solid #0e1220', display:'flex', zIndex:100,
        paddingBottom:'env(safe-area-inset-bottom)' }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1,
            padding:'10px 4px 11px', background:'none', border:'none',
            borderTop:tab===t.id?`2px solid #4B8EF0`:'2px solid transparent',
            color:tab===t.id?'#4B8EF0':'#2a3050', cursor:'pointer', transition:'all .2s' }}>
            <div style={{ fontSize:18, lineHeight:1 }}>{t.icon}</div>
            <div style={{ fontSize:9, marginTop:3, fontWeight:tab===t.id?700:400, letterSpacing:.5 }}>
              {t.label.toUpperCase()}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
