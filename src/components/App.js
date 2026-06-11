'use client'
import { useState, useEffect, useRef } from 'react'

// ─── DATA ─────────────────────────────────────────────────────────────────────

const LABS = [
  { key:'hba1c',         label:'HbA1c',         unit:'%',      cat:'diabetes', hi:6.5, cHi:8,   lo:null },
  { key:'glucose',       label:'Glucosa',        unit:'mg/dl',  cat:'diabetes', hi:99,  cHi:200, lo:70 },
  { key:'creatinine',    label:'Creatinina',     unit:'mg/dl',  cat:'kidney',   hi:1.18,cHi:2,   lo:null },
  { key:'egfr',          label:'eGFR',           unit:'ml/min', cat:'kidney',   lo:60,  cLo:30,  hi:null },
  { key:'acr',           label:'ACR',            unit:'mg/g',   cat:'kidney',   hi:29,  cHi:300, lo:null },
  { key:'bun',           label:'BUN',            unit:'mg/dl',  cat:'kidney',   hi:26,  cHi:50,  lo:null },
  { key:'ldl',           label:'LDL',            unit:'mg/dl',  cat:'lipids',   hi:99,  cHi:160, lo:null },
  { key:'hdl',           label:'HDL',            unit:'mg/dl',  cat:'lipids',   lo:40,  cLo:35,  hi:null },
  { key:'triglycerides', label:'Triglicéridos',  unit:'mg/dl',  cat:'lipids',   hi:149, cHi:500, lo:null },
  { key:'cholesterol',   label:'Colesterol',     unit:'mg/dl',  cat:'lipids',   hi:199, cHi:300, lo:null },
  { key:'hemoglobin',    label:'Hemoglobina',    unit:'g/dL',   cat:'blood',    lo:13,  hi:16.7, cLo:10 },
  { key:'wbc',           label:'Leucocitos',     unit:'K/uL',   cat:'blood',    lo:3.6, hi:11.2, cHi:15 },
  { key:'platelets',     label:'Plaquetas',      unit:'K/uL',   cat:'blood',    lo:140, hi:440,  cLo:100 },
  { key:'sodium',        label:'Sodio',          unit:'mEq/L',  cat:'electro',  lo:136, hi:145,  cLo:null },
  { key:'potassium',     label:'Potasio',        unit:'mEq/L',  cat:'electro',  lo:3.5, hi:5.1,  cHi:5.5 },
  { key:'alt',           label:'ALT',            unit:'U/L',    cat:'liver',    hi:44,  cHi:100, lo:null },
  { key:'ast',           label:'AST',            unit:'U/L',    cat:'liver',    hi:43,  cHi:100, lo:null },
  { key:'albumin',       label:'Albúmina',       unit:'g/dL',   cat:'liver',    lo:3.5, hi:5.2,  cLo:null },
  { key:'tsh',           label:'TSH',            unit:'mUI/L',  cat:'other',    lo:0.4, hi:4.0,  cHi:10 },
  { key:'vitamin_d',     label:'Vitamina D',     unit:'ng/mL',  cat:'other',    lo:30,  hi:100,  cLo:10 },
  { key:'uric_acid',     label:'Ácido Úrico',    unit:'mg/dl',  cat:'other',    hi:7.0, cHi:9,   lo:null },
]

const STELO = [
  { key:'glucose_fasting', label:'Glucosa Ayunas',    unit:'mg/dl', meta:'80–100', hi:100, cHi:140, lo:null },
  { key:'glucose_peak',    label:'Pico Post-comida',  unit:'mg/dl', meta:'< 140',  hi:140, cHi:180, lo:null },
  { key:'glucose_avg',     label:'Promedio del Día',  unit:'mg/dl', meta:'< 115',  hi:115, cHi:154, lo:null },
  { key:'time_in_range',   label:'Time in Range',     unit:'%',     meta:'> 70%',  lo:70,  cLo:50,  hi:null },
]

const CATS = {
  diabetes:{ color:'#2563EB', label:'Diabetes',     bg:'#EFF6FF' },
  kidney:  { color:'#059669', label:'Riñones',       bg:'#ECFDF5' },
  lipids:  { color:'#DC2626', label:'Lípidos',       bg:'#FEF2F2' },
  blood:   { color:'#DB2777', label:'Sangre',        bg:'#FDF2F8' },
  electro: { color:'#D97706', label:'Electrolitos',  bg:'#FFFBEB' },
  liver:   { color:'#16A34A', label:'Hígado',        bg:'#F0FDF4' },
  other:   { color:'#7C3AED', label:'Otros',         bg:'#F5F3FF' },
}

const TIMES   = ['ayunas','mañana','almuerzo','noche']
const T_COLOR = { ayunas:'#7C3AED', mañana:'#D97706', almuerzo:'#2563EB', noche:'#059669' }
const T_LABEL = { ayunas:'Ayunas', mañana:'Mañana', almuerzo:'Mediodía', noche:'Noche' }

const DEFAULT_MEDS = {
  rx:[
    { id:'r1', name:'Losartan',      dose:'25 mg',     time:'mañana',   with:'Desayuno',         note:'Protección renal · presión' },
    { id:'r2', name:'Atorvastatina', dose:'40 mg',     time:'noche',    with:'Antes de dormir',  note:'Colesterol — siempre de noche' },
    { id:'r3', name:'Fenofibrate',   dose:'145 mg',    time:'almuerzo', with:'Con comida',       note:'Triglicéridos' },
    { id:'r4', name:'Metformina',    dose:'500 mg',    time:'mañana',   with:'Desayuno',         note:'Diabetes — 1ª dosis' },
    { id:'r5', name:'Metformina',    dose:'500 mg',    time:'noche',    with:'Cena',             note:'Diabetes — 2ª dosis' },
  ],
  vit:[
    { id:'v1',  name:'Vitamina D3 + K2',   dose:'5000 IU',   time:'mañana',   with:'Desayuno' },
    { id:'v2',  name:'CoQ10',              dose:'200 mg',    time:'mañana',   with:'Desayuno + MCT oil', note:'Esencial con estatina' },
    { id:'v3',  name:'Vitamina B12',        dose:'—',         time:'mañana',   with:'Desayuno', note:'Metformina agota B12' },
    { id:'v4',  name:'GTF Chromium',        dose:'200 mcg',  time:'mañana',   with:'Desayuno' },
    { id:'v5',  name:'Ceylon Cinnamon',     dose:'—',         time:'mañana',   with:'Desayuno' },
    { id:'v6',  name:'MCT Oil',             dose:'—',         time:'mañana',   with:'Café / desayuno' },
    { id:'v7',  name:'Alpha Lipoic Acid',   dose:'—',         time:'ayunas',   with:'30 min antes de desayuno' },
    { id:'v8',  name:'NMN',                 dose:'—',         time:'ayunas',   with:'30 min antes de desayuno' },
    { id:'v9',  name:'Omega-3',             dose:'—',         time:'almuerzo', with:'Con comida' },
    { id:'v10', name:'Omega-3',             dose:'—',         time:'noche',    with:'Cena', note:'2ª mitad de dosis' },
    { id:'v11', name:'Apple Cider Vinegar', dose:'—',         time:'almuerzo', with:'Antes de comer' },
    { id:'v12', name:'Magnesio Glicinato',  dose:'300–400mg', time:'noche',    with:'Antes de dormir' },
    { id:'v13', name:'Astragalus Root',     dose:'—',         time:'ayunas',   with:'Mañana', note:'⚠ Consultar nefrólogo' },
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
const STATUS_COLOR = { crit:'#DC2626', warn:'#D97706', ok:'#059669' }
const STATUS_BG    = { crit:'#FEF2F2', warn:'#FFFBEB', ok:'#ECFDF5' }
const gc  = (f,v) => STATUS_COLOR[getStatus(f,v)]
const gbg = (f,v) => STATUS_BG[getStatus(f,v)]
const td  = () => new Date().toISOString().split('T')[0]
const lsGet = (k,fb) => { try { const d=localStorage.getItem(k); return d?JSON.parse(d):fb } catch { return fb } }
const lsSet = (k,v)  => { try { localStorage.setItem(k,JSON.stringify(v)) } catch {} }

// ─── SHARED STYLES ────────────────────────────────────────────────────────────

const S = {
  card:  { background:'#ffffff', borderRadius:16, padding:'16px', marginBottom:12, boxShadow:'0 1px 3px rgba(0,0,0,.08)', border:'1px solid #e8eaf0' },
  inp:   { width:'100%', background:'#ffffff', border:'1px solid #d1d5db', borderRadius:10, padding:'11px 14px', color:'#1a1d2e', fontSize:15, outline:'none', boxSizing:'border-box', marginTop:4 },
  lbl:   { fontSize:11, color:'#6b7280', letterSpacing:.5, textTransform:'uppercase', display:'block', marginTop:14, marginBottom:2 },
  sec:   (c) => ({ fontSize:11, color:c, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', marginBottom:12, paddingBottom:8, borderBottom:`1.5px solid ${c}22` }),
  btn:   (bg,tc='#fff') => ({ width:'100%', background:bg, border:'none', borderRadius:12, padding:'14px', color:tc, fontSize:15, fontWeight:700, cursor:'pointer', marginTop:10, letterSpacing:.2 }),
  pill:  (c,bg) => ({ display:'inline-block', padding:'2px 8px', background:bg, color:c, borderRadius:20, fontSize:10, fontWeight:600 }),
}

// ─── SPARKLINE ────────────────────────────────────────────────────────────────

function Spark({ vals, color }) {
  if (!vals||vals.length<2) return null
  const ns=vals.map(Number).filter(v=>!isNaN(v)); if(ns.length<2) return null
  const mn=Math.min(...ns), mx=Math.max(...ns), rng=mx-mn||1
  const W=64,H=28
  const pts=ns.map((v,i)=>`${(i/(ns.length-1))*W},${H-((v-mn)/rng)*(H-4)+2}`).join(' ')
  const lp=pts.split(' ').at(-1).split(',')
  const trend=ns.at(-1)-ns[0]
  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:2}}>
      <svg width={W} height={H}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" opacity=".8"/>
        <circle cx={lp[0]} cy={lp[1]} r="3" fill={color}/>
      </svg>
      <span style={{fontSize:9,color:trend>0?'#DC2626':trend<0?'#059669':'#6b7280',fontWeight:600}}>
        {trend>0?'↑':trend<0?'↓':'→'} {Math.abs(parseFloat(trend.toFixed(1)))}
      </span>
    </div>
  )
}

// ─── VALUE BADGE ─────────────────────────────────────────────────────────────

function ValueBadge({ value, field }) {
  if (!value) return null
  const c = gc(field,value), bg = gbg(field,value), s = getStatus(field,value)
  const normal = field.lo&&field.hi?`${field.lo}–${field.hi}`:field.hi?`<${field.hi}`:field.lo?`>${field.lo}`:''
  return(
    <div style={{textAlign:'right'}}>
      <div style={{fontSize:20,fontWeight:800,color:c,lineHeight:1}}>{value}</div>
      <div style={{fontSize:10,color:'#9ca3af',marginTop:1}}>{field.unit}</div>
      {s!=='ok'&&(
        <div style={{marginTop:4}}>
          <span style={S.pill(c,bg)}>
            {s==='crit'?'CRÍTICO':'ALTO'}
            {normal&&` · Normal ${normal}`}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────

function Bar({ value, field, color }) {
  if (!value) return null
  const v=parseFloat(value)
  const ref=field.cHi||(field.hi?field.hi*1.5:field.cLo?field.cLo*.5:100)
  const pct=Math.min(96,Math.max(4,(v/ref)*100))
  const c=gc(field,v)
  return(
    <div style={{height:4,background:'#f3f4f6',borderRadius:2,overflow:'hidden',marginTop:6}}>
      <div style={{height:'100%',width:`${pct}%`,background:c,borderRadius:2,transition:'width .5s ease'}}/>
    </div>
  )
}

// ─── UPLOAD ───────────────────────────────────────────────────────────────────

function Upload({ onDone }) {
  const [phase,setPhase]=useState('idle')
  const [msg,  setMsg  ]=useState('')
  const [data, setData ]=useState(null)
  const ref=useRef()

  const b64=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(',')[1]);r.onerror=rej;r.readAsDataURL(f)})

  const run=async(file)=>{
    setPhase('loading');setData(null)
    const ext=file.name.split('.').pop().toLowerCase()
    try{
      let body={}
      if(['jpg','jpeg','png','webp','heic','heif'].includes(ext)){setMsg('Analizando imagen...');body={imageData:await b64(file),imageMime:ext==='png'?'image/png':'image/jpeg'}}
      else if(ext==='pdf'){setMsg('Leyendo PDF...');body={imageData:await b64(file),imageMime:'application/pdf'}}
      else if(['txt','csv'].includes(ext)){setMsg('Leyendo archivo...');body={text:await file.text()}}
      else throw new Error('Usa JPG, PNG, PDF, TXT o CSV')
      setMsg('Claude analizando...')
      const res=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
      const json=await res.json()
      if(!json.ok)throw new Error(json.error)
      setPhase('done');setData(json.data);onDone(json.data)
    }catch(e){setPhase('error');setMsg(e.message)}
  }

  return(
    <div>
      <div onClick={()=>{setPhase('idle');ref.current?.click()}}
        onDrop={e=>{e.preventDefault();run(e.dataTransfer.files[0])}}
        onDragOver={e=>e.preventDefault()}
        style={{border:`2px dashed ${phase==='done'?'#059669':phase==='error'?'#DC2626':'#d1d5db'}`,
          borderRadius:14,padding:'28px 20px',textAlign:'center',cursor:'pointer',
          background:'#ffffff',marginBottom:16,transition:'all .25s'}}>
        <div style={{fontSize:36,marginBottom:10}}>
          {phase==='loading'?'⏳':phase==='done'?'✓':phase==='error'?'✕':'↑'}
        </div>
        <div style={{fontSize:15,fontWeight:700,marginBottom:4,
          color:phase==='error'?'#DC2626':phase==='done'?'#059669':'#1a1d2e'}}>
          {phase==='idle'&&'Subir resultado de laboratorio'}
          {phase==='loading'&&msg}
          {phase==='done'&&'Análisis completado — toca para subir otro'}
          {phase==='error'&&msg}
        </div>
        <div style={{fontSize:12,color:'#9ca3af'}}>
          {(phase==='idle'||phase==='done')&&'Foto · PDF · JPG · PNG · TXT · CSV — albanés, inglés o español'}
        </div>
        {phase==='loading'&&(
          <div style={{display:'flex',justifyContent:'center',gap:6,marginTop:12}}>
            {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:'50%',background:'#2563EB',animation:`dot 1.1s ease-in-out ${i*.18}s infinite`}}/>)}
          </div>
        )}
      </div>
      <input ref={ref} type="file" style={{display:'none'}}
        accept=".jpg,.jpeg,.png,.pdf,.txt,.csv,.heic,.heif,.webp"
        onChange={e=>{if(e.target.files?.[0])run(e.target.files[0])}}/>

      {data&&(
        <div style={{...S.card,background:'#f0fdf4',border:'1px solid #bbf7d0'}}>
          <div style={{fontSize:11,color:'#059669',fontWeight:700,letterSpacing:1.5,marginBottom:12}}>CLAUDE EXTRAJO</div>
          {data.date&&<div style={{fontSize:12,color:'#6b7280',marginBottom:10}}>📅 Fecha detectada: {data.date}</div>}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
            {[...LABS,...STELO].map(f=>{
              const v=data.values?.[f.key]; if(!v) return null
              const c=gc(f,v)
              return(
                <div key={f.key} style={{background:'#ffffff',borderRadius:10,padding:'8px 12px',borderLeft:`3px solid ${c}`}}>
                  <div style={{fontSize:10,color:'#9ca3af',marginBottom:2}}>{f.label}</div>
                  <div style={{fontSize:15,fontWeight:800,color:c}}>{v} <span style={{fontSize:9,opacity:.5,fontWeight:400}}>{f.unit}</span></div>
                </div>
              )
            })}
          </div>
          {data.alerts?.map((a,i)=><div key={i} style={{fontSize:11,color:'#DC2626',padding:'3px 0'}}>⚠ {a}</div>)}
          {data.summary&&<div style={{fontSize:12,color:'#6b7280',marginTop:8,lineHeight:1.6,fontStyle:'italic'}}>{data.summary}</div>}
        </div>
      )}
      <style>{`@keyframes dot{0%,100%{opacity:.2;transform:scale(.75)}50%{opacity:1;transform:scale(1.2)}}`}</style>
    </div>
  )
}

// ─── MEDS ────────────────────────────────────────────────────────────────────

function Meds() {
  const [meds,   setMeds  ]=useState({rx:[],vit:[]})
  const [checks, setChecks]=useState({})
  const [view,   setView  ]=useState('schedule')
  const [modal,  setModal ]=useState(false)
  const [editId, setEditId]=useState(null)
  const [form,   setForm  ]=useState({name:'',dose:'',time:'mañana',with:'',note:'',type:'rx'})

  useEffect(()=>{
    setMeds(lsGet('mk_meds4',DEFAULT_MEDS))
    const today=new Date().toDateString()
    if(lsGet('mk_chkdate','')!==today){lsSet('mk_chkdate',today);lsSet('mk_chks4',{})}
    setChecks(lsGet('mk_chks4',{}))
  },[])

  const saveMeds  =d=>{lsSet('mk_meds4',d);setMeds(d)}
  const saveChecks=c=>{lsSet('mk_chks4',c);setChecks(c)}
  const toggle=id=>{const c={...checks,[id]:!checks[id]};saveChecks(c)}

  const all=[...meds.rx,...meds.vit]
  const done=all.filter(m=>checks[m.id]).length
  const pct=all.length?Math.round((done/all.length)*100):0

  const openAdd=(type)=>{setEditId(null);setForm({name:'',dose:'',time:'mañana',with:'',note:'',type});setModal(true)}
  const openEdit=(m,type)=>{setEditId(m.id);setForm({...m,type});setModal(true)}
  const saveMed=()=>{
    if(!form.name.trim())return
    const cat=form.type==='rx'?'rx':'vit', other=cat==='rx'?'vit':'rx'
    if(editId){
      const inCat=meds[cat].some(m=>m.id===editId)
      saveMeds({[cat]:inCat?meds[cat].map(m=>m.id===editId?{...form,id:editId}:m):[...meds[cat],{...form,id:editId}],[other]:meds[other].filter(m=>m.id!==editId)})
    }else{
      saveMeds({...meds,[cat]:[...meds[cat],{...form,id:'u'+Date.now()}]})
    }
    setModal(false)
  }
  const delMed=(id,cat)=>saveMeds({...meds,[cat]:meds[cat].filter(m=>m.id!==id)})

  const INP={...S.inp,marginTop:4}
  const SEL={...INP,cursor:'pointer'}

  return(
    <div>
      {/* Progress */}
      <div style={{...S.card,background: pct===100?'#f0fdf4':'#ffffff'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:'#1a1d2e'}}>Progreso de hoy</div>
            <div style={{fontSize:12,color:'#6b7280',marginTop:2}}>{done} de {all.length} tomados</div>
          </div>
          <div style={{fontSize:28,fontWeight:800,color:pct===100?'#059669':'#2563EB'}}>{pct}%</div>
        </div>
        <div style={{height:8,background:'#f3f4f6',borderRadius:4,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${pct}%`,background:pct===100?'#059669':'#2563EB',borderRadius:4,transition:'width .4s ease'}}/>
        </div>
        {pct===100&&<div style={{fontSize:12,color:'#059669',marginTop:8,fontWeight:600}}>✓ Todo completado por hoy</div>}
      </div>

      {/* Sub tabs */}
      <div style={{display:'flex',background:'#ffffff',border:'1px solid #e5e7eb',borderRadius:12,padding:3,marginBottom:16,gap:2}}>
        {[['schedule','Horario'],['rx','Recetados'],['vit','Vitaminas']].map(([id,label])=>(
          <button key={id} onClick={()=>setView(id)} style={{flex:1,padding:'8px 4px',
            background:view===id?'#2563EB':'transparent',
            border:'none',borderRadius:9,
            color:view===id?'#ffffff':'#6b7280',
            fontSize:12,fontWeight:view===id?700:500,cursor:'pointer'}}>
            {label}
          </button>
        ))}
      </div>

      {/* Schedule */}
      {view==='schedule'&&TIMES.map(time=>{
        const items=[...meds.rx,...meds.vit].filter(m=>m.time===time)
        if(!items.length)return null
        const tc=T_COLOR[time], td2=items.filter(m=>checks[m.id]).length
        return(
          <div key={time} style={{marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <div style={{fontSize:12,fontWeight:700,color:tc,letterSpacing:.5}}>{T_LABEL[time].toUpperCase()}</div>
              <div style={{fontSize:11,color:'#9ca3af'}}>{td2}/{items.length}</div>
            </div>
            <div style={{...S.card,padding:0,overflow:'hidden'}}>
              {items.map((m,i)=>(
                <div key={m.id} onClick={()=>toggle(m.id)}
                  style={{display:'flex',alignItems:'center',gap:12,padding:'13px 16px',
                    borderBottom:i<items.length-1?'1px solid #f3f4f6':'none',
                    cursor:'pointer',background:checks[m.id]?'#f9fafb':'#ffffff',
                    transition:'background .2s'}}>
                  <div style={{width:22,height:22,borderRadius:7,flexShrink:0,
                    background:checks[m.id]?tc:'transparent',
                    border:`2px solid ${checks[m.id]?tc:'#d1d5db'}`,
                    display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s'}}>
                    {checks[m.id]&&<span style={{fontSize:12,color:'#fff',fontWeight:900}}>✓</span>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                      <span style={{fontSize:14,fontWeight:600,color:checks[m.id]?'#9ca3af':'#1a1d2e',
                        textDecoration:checks[m.id]?'line-through':'none'}}>{m.name}</span>
                      {m.dose&&<span style={S.pill(tc,`${tc}15`)}>{m.dose}</span>}
                      <span style={S.pill(m.type==='rx'?'#2563EB':'#7C3AED',m.type==='rx'?'#EFF6FF':'#F5F3FF')}>
                        {m.type==='rx'?'Rx':'Vit'}
                      </span>
                    </div>
                    {m.with&&<div style={{fontSize:11,color:'#9ca3af',marginTop:2}}>{m.with}</div>}
                    {m.note&&<div style={{fontSize:10,color:m.note.includes('⚠')?'#DC2626':'#9ca3af',marginTop:1}}>{m.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Rx / Vit list */}
      {(view==='rx'||view==='vit')&&(()=>{
        const cat=view==='rx'?'rx':'vit'
        const color=cat==='rx'?'#2563EB':'#7C3AED'
        return(
          <div>
            {TIMES.map(time=>{
              const items=meds[cat].filter(m=>m.time===time)
              if(!items.length)return null
              const tc=T_COLOR[time]
              return(
                <div key={time} style={{marginBottom:18}}>
                  <div style={{fontSize:11,color:tc,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:8}}>{T_LABEL[time]}</div>
                  {items.map(m=>(
                    <div key={m.id} style={{...S.card,marginBottom:7}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                        <div style={{flex:1}}>
                          <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:4,flexWrap:'wrap'}}>
                            <span style={{fontSize:14,fontWeight:700,color:'#1a1d2e'}}>{m.name}</span>
                            {m.dose&&<span style={S.pill(color,`${color}12`)}>{m.dose}</span>}
                          </div>
                          {m.with&&<div style={{fontSize:12,color:'#6b7280'}}>Con {m.with}</div>}
                          {m.note&&<div style={{fontSize:11,color:m.note.includes('⚠')?'#DC2626':'#9ca3af',marginTop:3}}>{m.note}</div>}
                        </div>
                        <div style={{display:'flex',gap:10,marginLeft:8}}>
                          <button onClick={()=>openEdit(m,cat)} style={{background:'none',border:'none',color:'#9ca3af',cursor:'pointer',fontSize:16,padding:0}}>✎</button>
                          <button onClick={()=>delMed(m.id,cat)} style={{background:'none',border:'none',color:'#d1d5db',cursor:'pointer',fontSize:16,padding:0}}>✕</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
            <button onClick={()=>openAdd(cat)} style={{width:'100%',background:'transparent',
              border:`1.5px dashed ${color}44`,borderRadius:12,padding:'12px',
              color,fontSize:13,fontWeight:600,cursor:'pointer',marginTop:4}}>
              + Agregar {cat==='rx'?'medicamento':'suplemento'}
            </button>
          </div>
        )
      })()}

      {/* Modal */}
      {modal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
          <div style={{background:'#ffffff',borderRadius:'20px 20px 0 0',padding:'22px 18px 36px',width:'100%',maxWidth:430,maxHeight:'85vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
              <div style={{fontSize:17,fontWeight:800}}>{editId?'Editar':'Agregar'}</div>
              <button onClick={()=>setModal(false)} style={{background:'none',border:'none',color:'#9ca3af',fontSize:22,cursor:'pointer',padding:0}}>✕</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
              <div>
                <label style={S.lbl}>Tipo</label>
                <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={SEL}>
                  <option value="rx">Recetado</option><option value="vit">Vitamina</option>
                </select>
              </div>
              <div>
                <label style={S.lbl}>Momento</label>
                <select value={form.time} onChange={e=>setForm(p=>({...p,time:e.target.value}))} style={SEL}>
                  {TIMES.map(t=><option key={t} value={t}>{T_LABEL[t]}</option>)}
                </select>
              </div>
            </div>
            {[['name','Nombre *','ej: Losartan'],['dose','Dosis','ej: 25 mg'],['with','Tomar con','ej: Desayuno'],['note','Nota','Para qué sirve...']].map(([k,lbl,ph])=>(
              <div key={k} style={{marginBottom:10}}>
                <label style={S.lbl}>{lbl}</label>
                <input value={form[k]||''} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} placeholder={ph} style={INP}/>
              </div>
            ))}
            <div style={{display:'flex',gap:8,marginTop:16}}>
              <button onClick={()=>setModal(false)} style={{flex:1,background:'#f3f4f6',border:'none',borderRadius:12,padding:'13px',color:'#6b7280',fontSize:14,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
              <button onClick={saveMed} style={{flex:2,background:'#2563EB',border:'none',borderRadius:12,padding:'13px',color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>
                {editId?'Guardar cambios':'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CONTACTS ────────────────────────────────────────────────────────────────

function Contacts() {
  const [contacts,setContacts]=useState([])
  const [editing, setEditing ]=useState(null)
  const [form,    setForm    ]=useState({})

  useEffect(()=>setContacts(lsGet('mk_contacts3',DEFAULT_CONTACTS)),[])
  const save=d=>{lsSet('mk_contacts3',d);setContacts(d)}
  const startEdit=c=>{setEditing(c.id);setForm({...c})}
  const saveEdit=()=>{save(contacts.map(c=>c.id===editing?{...form,id:editing}:c));setEditing(null)}
  const addNew=()=>{const nc={id:'c'+Date.now(),name:'',specialty:'',hospital:'',phone:'',notes:''};save([...contacts,nc]);setEditing(nc.id);setForm(nc)}
  const del=id=>save(contacts.filter(c=>c.id!==id))

  const INP={...S.inp,marginTop:4}

  return(
    <div>
      <div style={{fontSize:13,color:'#6b7280',marginBottom:16,lineHeight:1.6}}>
        Tus médicos y hospitales — disponibles siempre, incluso sin internet
      </div>
      {contacts.map(c=>(
        <div key={c.id} style={S.card}>
          {editing===c.id?(
            <div>
              <div style={{fontSize:13,fontWeight:700,color:'#2563EB',marginBottom:12}}>Editando contacto</div>
              {[['specialty','Especialidad','ej: Nefrólogo'],['name','Nombre completo','Dr. Nombre Apellido'],['hospital','Hospital / Clínica','ej: Cedars-Sinai Medical Center'],['phone','Teléfono','ej: +1 (310) 000-0000'],['notes','Notas','ej: Citas martes por la tarde']].map(([k,lbl,ph])=>(
                <div key={k} style={{marginBottom:10}}>
                  <label style={S.lbl}>{lbl}</label>
                  <input value={form[k]||''} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} placeholder={ph} style={INP}/>
                </div>
              ))}
              <div style={{display:'flex',gap:8,marginTop:12}}>
                <button onClick={()=>setEditing(null)} style={{flex:1,background:'#f3f4f6',border:'none',borderRadius:10,padding:'11px',color:'#6b7280',fontSize:13,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
                <button onClick={saveEdit} style={{flex:2,background:'#2563EB',border:'none',borderRadius:10,padding:'11px',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer'}}>Guardar</button>
              </div>
            </div>
          ):(
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                    <div style={{width:40,height:40,borderRadius:12,background:'#EFF6FF',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,border:'1px solid #bfdbfe'}}>
                      👨‍⚕️
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:c.name?'#1a1d2e':'#9ca3af'}}>{c.name||'Sin nombre aún'}</div>
                      <div style={{fontSize:12,color:'#2563EB',fontWeight:600}}>{c.specialty||'Especialidad'}</div>
                    </div>
                  </div>
                  {c.hospital&&(
                    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5}}>
                      <span style={{fontSize:13}}>🏥</span>
                      <span style={{fontSize:13,color:'#374151'}}>{c.hospital}</span>
                    </div>
                  )}
                  {c.phone&&(
                    <a href={`tel:${c.phone}`} style={{display:'flex',alignItems:'center',gap:6,textDecoration:'none',marginBottom:5}}>
                      <span style={{fontSize:13}}>📞</span>
                      <span style={{fontSize:13,color:'#2563EB',fontWeight:600}}>{c.phone}</span>
                    </a>
                  )}
                  {c.notes&&<div style={{fontSize:12,color:'#6b7280',fontStyle:'italic'}}>{c.notes}</div>}
                  {!c.name&&!c.hospital&&!c.phone&&(
                    <div style={{fontSize:12,color:'#d1d5db',fontStyle:'italic'}}>Toca ✎ para agregar información</div>
                  )}
                </div>
                <div style={{display:'flex',gap:10,marginLeft:8}}>
                  <button onClick={()=>startEdit(c)} style={{background:'none',border:'none',color:'#9ca3af',cursor:'pointer',fontSize:16,padding:0}}>✎</button>
                  <button onClick={()=>del(c.id)} style={{background:'none',border:'none',color:'#d1d5db',cursor:'pointer',fontSize:16,padding:0}}>✕</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      <button onClick={addNew} style={{width:'100%',background:'transparent',border:'1.5px dashed #bfdbfe',borderRadius:12,padding:'12px',color:'#2563EB',fontSize:13,fontWeight:600,cursor:'pointer',marginTop:4}}>
        + Agregar médico u hospital
      </button>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [tab,   setTab  ]=useState('home')
  const [labs,  setLabs ]=useState([])
  const [stelo, setStelo]=useState([])
  const [lForm, setLF   ]=useState({date:td()})
  const [sForm, setSF   ]=useState({date:td()})
  const [toast, setToast]=useState('')
  const [exp,   setExp  ]=useState(null)

  // Load data once on mount
  useEffect(()=>{
    setLabs(lsGet('mk_labs6',[]))
    setStelo(lsGet('mk_stelo6',[]))
  },[])

  // Save helpers — always APPEND, never overwrite
  const saveLabs =d=>{lsSet('mk_labs6', d);setLabs(d)}
  const saveStelo=d=>{lsSet('mk_stelo6',d);setStelo(d)}

  const showToast=(msg,cb)=>{setToast(msg);setTimeout(()=>{setToast('');cb?.()},1600)}

  // Upload → append to front of labs array
  const onUpload=data=>{
    const entry={id:Date.now(),date:data.date||td(),src:'auto',alerts:data.alerts||[],summary:data.summary||'',...data.values}
    saveLabs([entry,...labs])
    showToast('✓ Resultado guardado',()=>setTab('home'))
  }

  const submitLab=()=>{
    if(!lForm.date)return
    saveLabs([{...lForm,id:Date.now(),src:'manual'},...labs])
    setLF({date:td()})
    showToast('✓ Resultado guardado',()=>setTab('home'))
  }

  const submitStelo=()=>{
    if(!sForm.date)return
    saveStelo([{...sForm,id:Date.now()},...stelo])
    setSF({date:td()})
    showToast('✓ Stelo guardado')
  }

  const L=labs[0]||{}, S=stelo[0]||{}
  const crits=LABS.filter(f=>L[f.key]&&getStatus(f,L[f.key])==='crit')
  const hist=key=>[...labs].reverse().filter(l=>l[key]!=null).map(l=>l[key])
  const steloHist=key=>[...stelo].reverse().filter(s=>s[key]!=null).map(s=>s[key])

  // Group stelo by month for timeline
  const steloByMonth=stelo.reduce((acc,s)=>{
    const mo=s.date?.slice(0,7)||'?'
    if(!acc[mo])acc[mo]=[]
    acc[mo].push(s); return acc
  },{})

  const TABS=[
    {id:'home',    label:'Inicio',    icon:'⌂'},
    {id:'upload',  label:'Subir',     icon:'↑'},
    {id:'meds',    label:'Meds',      icon:'⊕'},
    {id:'contacts',label:'Médicos',   icon:'☎'},
    {id:'history', label:'Historial', icon:'≡'},
  ]

  const INP={...S.inp,marginTop:4}

  return(
    <div style={{minHeight:'100vh',paddingBottom:88,background:'#f5f6fa'}}>

      {/* HEADER */}
      <div style={{padding:'18px 18px 14px',background:'#ffffff',borderBottom:'1px solid #e5e7eb',position:'sticky',top:0,zIndex:30}}>
        <div style={{fontSize:9,color:'#2563EB',letterSpacing:3,textTransform:'uppercase',marginBottom:4,fontWeight:600}}>
          HEALTH MONITOR
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:20,fontWeight:800,color:'#1a1d2e',letterSpacing:-.3}}>Mikail Kocak</div>
            <div style={{fontSize:11,color:'#9ca3af',marginTop:2}}>46 años · Los Angeles, CA</div>
          </div>
          {crits.length>0&&(
            <div style={{background:'#FEF2F2',border:'1px solid #fecaca',borderRadius:8,padding:'5px 10px',fontSize:11,color:'#DC2626',fontWeight:700}}>
              ⚠ {crits.length} crítico{crits.length>1?'s':''}
            </div>
          )}
        </div>
      </div>

      {/* TOAST */}
      {toast&&(
        <div style={{position:'fixed',top:80,left:'50%',transform:'translateX(-50%)',
          background:'#059669',color:'#fff',borderRadius:10,padding:'10px 20px',
          fontSize:13,fontWeight:600,zIndex:200,boxShadow:'0 4px 12px rgba(0,0,0,.15)'}}>
          {toast}
        </div>
      )}

      <div style={{padding:'16px 16px 0'}}>

        {/* ══ HOME */}
        {tab==='home'&&(
          <div>
            {/* Critical */}
            {crits.length>0&&(
              <div style={{...S.card,background:'#FEF2F2',border:'1px solid #fecaca',marginBottom:12}}>
                <div style={{fontSize:11,color:'#DC2626',fontWeight:700,letterSpacing:1,marginBottom:10}}>VALORES CRÍTICOS</div>
                {crits.map(f=>(
                  <div key={f.key} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid #fee2e2'}}>
                    <span style={{fontSize:13,color:'#374151'}}>{f.label}</span>
                    <span style={{fontSize:14,fontWeight:800,color:'#DC2626'}}>{L[f.key]} <span style={{fontSize:10,fontWeight:400,opacity:.7}}>{f.unit}</span></span>
                  </div>
                ))}
              </div>
            )}

            {/* Empty */}
            {labs.length===0&&stelo.length===0&&(
              <div style={{textAlign:'center',padding:'70px 20px'}}>
                <div style={{fontSize:48,marginBottom:14,opacity:.2}}>🩺</div>
                <div style={{fontSize:16,fontWeight:700,color:'#6b7280',marginBottom:6}}>Sin datos aún</div>
                <div style={{fontSize:13,color:'#9ca3af',lineHeight:1.6}}>
                  Usa <span style={{color:'#2563EB',fontWeight:600}}>Subir</span> para cargar tus primeros resultados
                </div>
              </div>
            )}

            {/* Lab sections */}
            {Object.entries(CATS).map(([cat,cfg])=>{
              const fields=LABS.filter(f=>f.cat===cat&&L[f.key]!=null)
              if(!fields.length)return null
              return(
                <div key={cat} style={S.card}>
                  <div style={S.sec(cfg.color)}>{cfg.label}</div>
                  {fields.map(f=>{
                    const v=L[f.key], h=hist(f.key)
                    return(
                      <div key={f.key} style={{display:'flex',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #f9fafb',gap:12}}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,color:'#374151',fontWeight:500,marginBottom:4}}>{f.label}</div>
                          <Bar value={v} field={f}/>
                        </div>
                        <ValueBadge value={v} field={f}/>
                        {h.length>1&&<Spark vals={h} color={cfg.color}/>}
                      </div>
                    )
                  })}
                  {L.date&&<div style={{fontSize:10,color:'#d1d5db',marginTop:8,textAlign:'right'}}>Fecha: {L.date}</div>}
                </div>
              )
            })}

            {/* Stelo latest */}
            {stelo.length>0&&(
              <div style={S.card}>
                <div style={S.sec('#7C3AED')}>Stelo CGM — Último registro</div>
                <div style={{fontSize:11,color:'#9ca3af',marginBottom:10}}>📅 {S.date}</div>
                {STELO.map(f=>{
                  const v=S[f.key]; if(!v)return null
                  const sh=steloHist(f.key)
                  return(
                    <div key={f.key} style={{display:'flex',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #f9fafb',gap:12}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,color:'#374151',fontWeight:500,marginBottom:2}}>{f.label}</div>
                        <div style={{fontSize:11,color:'#9ca3af'}}>Meta: {f.meta}</div>
                        <Bar value={v} field={f}/>
                      </div>
                      <ValueBadge value={v} field={f}/>
                      {sh.length>1&&<Spark vals={sh} color="#7C3AED"/>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ UPLOAD */}
        {tab==='upload'&&(
          <div>
            <div style={{fontSize:18,fontWeight:800,color:'#1a1d2e',marginBottom:4}}>Subir Resultado</div>
            <div style={{fontSize:13,color:'#6b7280',marginBottom:18,lineHeight:1.5}}>
              Sube una foto o archivo — Claude lee en albanés, inglés o español y extrae todos los valores
            </div>
            <Upload onDone={onUpload}/>

            {/* Stelo input */}
            <div style={{marginTop:28,paddingTop:20,borderTop:'2px solid #e5e7eb'}}>
              <div style={{fontSize:16,fontWeight:800,color:'#1a1d2e',marginBottom:4}}>Registro Stelo</div>
              <div style={{fontSize:12,color:'#6b7280',marginBottom:16}}>
                Anota tus valores del CGM · O sube el reporte PDF/CSV exportado de la app Stelo arriba
              </div>
              <label style={S.lbl}>Fecha</label>
              <input type="date" value={sForm.date||''} onChange={e=>setSF(p=>({...p,date:e.target.value}))} style={INP}/>
              {STELO.map(f=>(
                <div key={f.key}>
                  <label style={S.lbl}>{f.label} <span style={{color:'#9ca3af',textTransform:'none',letterSpacing:0}}>· meta {f.meta}</span></label>
                  <input type="number" step=".1" placeholder={f.unit} value={sForm[f.key]||''}
                    onChange={e=>setSF(p=>({...p,[f.key]:e.target.value}))}
                    style={{...INP,borderColor:sForm[f.key]?gc(f,sForm[f.key]):'#d1d5db'}}/>
                </div>
              ))}
              <label style={S.lbl}>Estado</label>
              <div style={{display:'flex',gap:6,marginTop:4}}>
                {['😴 Cansado','😐 Normal','💪 Bien','🤕 Mal'].map(o=>(
                  <button key={o} onClick={()=>setSF(p=>({...p,feeling:o}))}
                    style={{flex:1,padding:'10px 2px',
                      background:sForm.feeling===o?'#2563EB':'#ffffff',
                      border:sForm.feeling===o?'1px solid #2563EB':'1px solid #d1d5db',
                      borderRadius:10,color:sForm.feeling===o?'#ffffff':'#6b7280',
                      fontSize:9,cursor:'pointer',lineHeight:1.4,fontWeight:sForm.feeling===o?700:400}}>
                    {o}
                  </button>
                ))}
              </div>
              <label style={S.lbl}>Notas</label>
              <textarea placeholder="Qué comiste, ejercicio, síntomas..." value={sForm.notes||''}
                onChange={e=>setSF(p=>({...p,notes:e.target.value}))}
                style={{...INP,height:68,resize:'none'}}/>
              <button onClick={submitStelo} style={S.btn('#7C3AED')}>Guardar Stelo</button>
            </div>
          </div>
        )}

        {/* ══ MEDS */}
        {tab==='meds'&&(
          <div>
            <div style={{fontSize:18,fontWeight:800,color:'#1a1d2e',marginBottom:4}}>Medicamentos</div>
            <div style={{fontSize:13,color:'#6b7280',marginBottom:16}}>Tu régimen diario · Recetados y vitaminas</div>
            <Meds/>
          </div>
        )}

        {/* ══ CONTACTS */}
        {tab==='contacts'&&(
          <div>
            <div style={{fontSize:18,fontWeight:800,color:'#1a1d2e',marginBottom:4}}>Mis Médicos</div>
            <Contacts/>
          </div>
        )}

        {/* ══ HISTORY */}
        {tab==='history'&&(
          <div>
            <div style={{fontSize:18,fontWeight:800,color:'#1a1d2e',marginBottom:16}}>Historial</div>

            {/* Manual entry collapsible */}
            <details style={{marginBottom:16}}>
              <summary style={{fontSize:13,color:'#2563EB',fontWeight:600,cursor:'pointer',
                padding:'11px 14px',background:'#ffffff',border:'1px solid #bfdbfe',
                borderRadius:12,listStyle:'none',display:'flex',alignItems:'center',gap:6}}>
                ＋ Ingresar resultado a mano
              </summary>
              <div style={{background:'#ffffff',border:'1px solid #e5e7eb',borderTop:'none',borderRadius:'0 0 12px 12px',padding:'16px 14px'}}>
                <label style={S.lbl}>Fecha</label>
                <input type="date" value={lForm.date||''} onChange={e=>setLF(p=>({...p,date:e.target.value}))} style={INP}/>
                {Object.entries(CATS).map(([cat,cfg])=>(
                  <div key={cat} style={{marginTop:18}}>
                    <div style={S.sec(cfg.color)}>{cfg.label}</div>
                    {LABS.filter(f=>f.cat===cat).map(f=>(
                      <div key={f.key}>
                        <label style={S.lbl}>{f.label} <span style={{color:'#d1d5db',textTransform:'none',letterSpacing:0}}>({f.lo&&f.hi?`${f.lo}–${f.hi}`:f.hi?`<${f.hi}`:`>${f.lo}`} {f.unit})</span></label>
                        <input type="number" step=".01" placeholder={f.unit} value={lForm[f.key]||''}
                          onChange={e=>setLF(p=>({...p,[f.key]:e.target.value}))}
                          style={{...INP,borderColor:lForm[f.key]?gc(f,lForm[f.key]):'#d1d5db'}}/>
                      </div>
                    ))}
                  </div>
                ))}
                <label style={{...S.lbl,marginTop:18}}>Notas</label>
                <textarea placeholder="Observaciones, síntomas, cambios de medicamento..." value={lForm.notes||''}
                  onChange={e=>setLF(p=>({...p,notes:e.target.value}))} style={{...INP,height:72,resize:'none'}}/>
                <button onClick={submitLab} style={S.btn('#2563EB')}>Guardar resultado</button>
              </div>
            </details>

            {/* Labs timeline */}
            <div style={{fontSize:11,color:'#2563EB',fontWeight:700,letterSpacing:1.5,marginBottom:12}}>
              LABORATORIOS · {labs.length} registros
            </div>
            {labs.length===0&&<div style={{color:'#9ca3af',fontSize:13,marginBottom:24}}>Sin registros de laboratorio aún</div>}
            {labs.map(l=>(
              <div key={l.id} onClick={()=>setExp(exp===l.id?null:l.id)}
                style={{...S.card,cursor:'pointer',
                  borderColor:exp===l.id?'#2563EB':'#e5e7eb',
                  borderWidth:exp===l.id?2:1,
                  transition:'border-color .2s'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:'#1a1d2e'}}>{l.date}</div>
                    <div style={{fontSize:11,color:'#9ca3af',marginTop:2}}>{l.src==='auto'?'Subido automáticamente · Claude':'Ingreso manual'}</div>
                  </div>
                  <div style={{display:'flex',gap:10,alignItems:'center'}}>
                    {/* Show flags */}
                    <div style={{display:'flex',gap:4}}>
                      {LABS.filter(f=>l[f.key]&&getStatus(f,l[f.key])==='crit').slice(0,2).map(f=>(
                        <span key={f.key} style={S.pill('#DC2626','#FEF2F2')}>!</span>
                      ))}
                    </div>
                    <span style={{fontSize:12,color:'#9ca3af'}}>{exp===l.id?'▲':'▼'}</span>
                    <button onClick={e=>{e.stopPropagation();saveLabs(labs.filter(x=>x.id!==l.id))}}
                      style={{background:'none',border:'none',color:'#d1d5db',cursor:'pointer',fontSize:16,padding:0}}>✕</button>
                  </div>
                </div>

                {exp===l.id&&(
                  <div style={{marginTop:14,borderTop:'1px solid #f3f4f6',paddingTop:14}}>
                    {Object.entries(CATS).map(([cat,cfg])=>{
                      const fields=LABS.filter(f=>f.cat===cat&&l[f.key]!=null)
                      if(!fields.length)return null
                      return(
                        <div key={cat} style={{marginBottom:14}}>
                          <div style={{fontSize:10,color:cfg.color,fontWeight:700,letterSpacing:1,marginBottom:8}}>{cfg.label.toUpperCase()}</div>
                          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                            {fields.map(f=>{
                              const c=gc(f,l[f.key]), bg=gbg(f,l[f.key])
                              return(
                                <div key={f.key} style={{background:bg,borderRadius:10,padding:'8px 12px',borderLeft:`3px solid ${c}`}}>
                                  <div style={{fontSize:10,color:'#9ca3af',marginBottom:2}}>{f.label}</div>
                                  <div style={{fontSize:15,fontWeight:800,color:c}}>{l[f.key]} <span style={{fontSize:9,opacity:.5,fontWeight:400}}>{f.unit}</span></div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                    {l.alerts?.map((a,i)=><div key={i} style={{fontSize:11,color:'#DC2626',padding:'3px 0'}}>⚠ {a}</div>)}
                    {l.summary&&<div style={{fontSize:12,color:'#6b7280',marginTop:8,fontStyle:'italic',lineHeight:1.6}}>{l.summary}</div>}
                    {l.notes&&<div style={{fontSize:11,color:'#9ca3af',marginTop:4,fontStyle:'italic'}}>{l.notes}</div>}
                  </div>
                )}
              </div>
            ))}

            {/* Stelo timeline grouped by month */}
            <div style={{fontSize:11,color:'#7C3AED',fontWeight:700,letterSpacing:1.5,marginBottom:12,marginTop:20}}>
              STELO CGM · {stelo.length} días registrados
            </div>
            {stelo.length===0&&<div style={{color:'#9ca3af',fontSize:13}}>Sin registros Stelo aún</div>}
            {Object.entries(steloByMonth).sort((a,b)=>b[0].localeCompare(a[0])).map(([month,entries])=>(
              <div key={month} style={{marginBottom:16}}>
                <div style={{fontSize:11,color:'#9ca3af',fontWeight:600,letterSpacing:1,marginBottom:8,textTransform:'uppercase'}}>
                  {month}
                </div>
                {entries.map(s=>(
                  <div key={s.id} style={{...S.card,marginBottom:7}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:'#1a1d2e'}}>{s.date}</div>
                        {s.feeling&&<div style={{fontSize:11,color:'#9ca3af',marginTop:1}}>{s.feeling}</div>}
                      </div>
                      <button onClick={()=>saveStelo(stelo.filter(x=>x.id!==s.id))}
                        style={{background:'none',border:'none',color:'#d1d5db',cursor:'pointer',fontSize:16,padding:0}}>✕</button>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                      {STELO.map(f=>s[f.key]?(
                        <div key={f.key} style={{background:gbg(f,s[f.key]),borderRadius:10,padding:'8px 12px',borderLeft:`3px solid ${gc(f,s[f.key])}`}}>
                          <div style={{fontSize:10,color:'#9ca3af',marginBottom:2}}>{f.label}</div>
                          <div style={{fontSize:15,fontWeight:800,color:gc(f,s[f.key])}}>{s[f.key]} <span style={{fontSize:9,opacity:.5,fontWeight:400}}>{f.unit}</span></div>
                        </div>
                      ):null)}
                    </div>
                    {s.notes&&<div style={{fontSize:11,color:'#9ca3af',marginTop:8,fontStyle:'italic'}}>{s.notes}</div>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',
        width:'100%',maxWidth:430,background:'#ffffff',
        borderTop:'1px solid #e5e7eb',display:'flex',zIndex:100,
        paddingBottom:'env(safe-area-inset-bottom)'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:'10px 4px 11px',
            background:'none',border:'none',
            borderTop:tab===t.id?'2px solid #2563EB':'2px solid transparent',
            color:tab===t.id?'#2563EB':'#9ca3af',cursor:'pointer',transition:'all .2s'}}>
            <div style={{fontSize:18,lineHeight:1}}>{t.icon}</div>
            <div style={{fontSize:9,marginTop:3,fontWeight:tab===t.id?700:500,letterSpacing:.5}}>
              {t.label.toUpperCase()}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
