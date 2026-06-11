// ─── LAB FIELDS ───────────────────────────────────────────────────────────────

export const LABS = [
  { key:'hba1c',        label:'HbA1c',            unit:'%',      cat:'Diabetes',     hi:6.5, cHi:8 },
  { key:'glucose',      label:'Glucose',           unit:'mg/dl',  cat:'Diabetes',     lo:70, hi:99, cHi:200 },
  { key:'creatinine',   label:'Creatinine',        unit:'mg/dl',  cat:'Kidneys',      hi:1.18, cHi:2 },
  { key:'egfr',         label:'eGFR',              unit:'ml/min', cat:'Kidneys',      lo:60, cLo:30 },
  { key:'acr',          label:'ACR',               unit:'mg/g',   cat:'Kidneys',      hi:29, cHi:300 },
  { key:'bun',          label:'BUN',               unit:'mg/dl',  cat:'Kidneys',      hi:26, cHi:50 },
  { key:'ldl',          label:'LDL',               unit:'mg/dl',  cat:'Lipids',       hi:99, cHi:160 },
  { key:'hdl',          label:'HDL',               unit:'mg/dl',  cat:'Lipids',       lo:40, cLo:35 },
  { key:'triglycerides',label:'Triglycerides',     unit:'mg/dl',  cat:'Lipids',       hi:149, cHi:500 },
  { key:'cholesterol',  label:'Total Cholesterol', unit:'mg/dl',  cat:'Lipids',       hi:199, cHi:300 },
  { key:'hemoglobin',   label:'Hemoglobin',        unit:'g/dL',   cat:'Blood',        lo:13, hi:16.7, cLo:10 },
  { key:'wbc',          label:'WBC',               unit:'K/uL',   cat:'Blood',        lo:3.6, hi:11.2, cHi:15 },
  { key:'platelets',    label:'Platelets',         unit:'K/uL',   cat:'Blood',        lo:140, hi:440, cLo:100 },
  { key:'sodium',       label:'Sodium',            unit:'mEq/L',  cat:'Electrolytes', lo:136, hi:145 },
  { key:'potassium',    label:'Potassium',         unit:'mEq/L',  cat:'Electrolytes', lo:3.5, hi:5.1, cHi:5.5 },
  { key:'alt',          label:'ALT',               unit:'U/L',    cat:'Liver',        hi:44, cHi:100 },
  { key:'ast',          label:'AST',               unit:'U/L',    cat:'Liver',        hi:43, cHi:100 },
  { key:'albumin',      label:'Albumin',           unit:'g/dL',   cat:'Liver',        lo:3.5, hi:5.2 },
  { key:'tsh',          label:'TSH',               unit:'mUI/L',  cat:'Other',        lo:0.4, hi:4.0, cHi:10 },
  { key:'vitamin_d',    label:'Vitamin D',         unit:'ng/mL',  cat:'Other',        lo:30, hi:100, cLo:10 },
  { key:'uric_acid',    label:'Uric Acid',         unit:'mg/dl',  cat:'Other',        hi:7.0, cHi:9 },
  { key:'ferritin',     label:'Ferritin',          unit:'ng/mL',  cat:'Other',        lo:12, hi:300 },
  { key:'systolic',     label:'Systolic BP',       unit:'mmHg',   cat:'Vitals',       hi:130, cHi:160 },
  { key:'diastolic',    label:'Diastolic BP',      unit:'mmHg',   cat:'Vitals',       hi:80, cHi:100 },
  { key:'weight_kg',    label:'Weight',            unit:'kg',     cat:'Vitals' },
]

export const STELO = [
  { key:'glucose_fasting', label:'Fasting Glucose',  unit:'mg/dl', target:'80–100', hi:100, cHi:140 },
  { key:'glucose_peak',    label:'Peak Post-meal',    unit:'mg/dl', target:'< 140',  hi:140, cHi:180 },
  { key:'glucose_avg',     label:'Daily Average',     unit:'mg/dl', target:'< 115',  hi:115, cHi:154 },
  { key:'time_in_range',   label:'Time in Range',     unit:'%',     target:'> 70%',  lo:70,  cLo:50 },
]

export const CAT_ORDER = ['Diabetes','Kidneys','Lipids','Vitals','Blood','Electrolytes','Liver','Other']

export const CAT_COLOR = {
  Diabetes:    '#4F46E5',
  Kidneys:     '#0891B2',
  Lipids:      '#DC2626',
  Blood:       '#DB2777',
  Electrolytes:'#D97706',
  Liver:       '#16A34A',
  Vitals:      '#7C3AED',
  Other:       '#6B7280',
}

// ─── MEDICATIONS ─────────────────────────────────────────────────────────────

export const MEDS_DEFAULT = {
  morning: [
    { id:'m1', name:'Losartan',           dose:'25 mg',     with:'Breakfast',           note:'Kidney protection · blood pressure', type:'rx' },
    { id:'m2', name:'Metformin',          dose:'500 mg',    with:'Breakfast',           note:'Diabetes — 1st dose', type:'rx' },
    { id:'m3', name:'Fenofibrate',        dose:'145 mg',    with:'Lunch with fat',      note:'Triglycerides', type:'rx' },
    { id:'m4', name:'Vitamin D3 + K2',   dose:'5000 IU',   with:'Breakfast',           note:'', type:'vit' },
    { id:'m5', name:'CoQ10',             dose:'200 mg',    with:'Breakfast + MCT oil', note:'Essential with statin', type:'vit' },
    { id:'m6', name:'Vitamin B12',        dose:'—',         with:'Breakfast',           note:'Metformin depletes B12', type:'vit' },
    { id:'m7', name:'GTF Chromium',       dose:'200 mcg',   with:'Breakfast',           note:'', type:'vit' },
    { id:'m8', name:'Ceylon Cinnamon',    dose:'—',         with:'Breakfast',           note:'', type:'vit' },
    { id:'m9', name:'MCT Oil',            dose:'—',         with:'Coffee / breakfast',  note:'', type:'vit' },
    { id:'m10',name:'Alpha Lipoic Acid',  dose:'—',         with:'30 min before eating',note:'Antioxidant · insulin sensitivity', type:'vit' },
    { id:'m11',name:'NMN',               dose:'—',         with:'30 min before eating',note:'NAD+ · longevity', type:'vit' },
    { id:'m12',name:'Omega-3',           dose:'—',         with:'Lunch',               note:'Half dose', type:'vit' },
    { id:'m13',name:'Apple Cider Vinegar',dose:'—',         with:'Before lunch',        note:'', type:'vit' },
  ],
  night: [
    { id:'n1', name:'Atorvastatin',       dose:'40 mg',     with:'Before bed',          note:'Cholesterol — always at night', type:'rx' },
    { id:'n2', name:'Metformin',          dose:'500 mg',    with:'Dinner',              note:'Diabetes — 2nd dose', type:'rx' },
    { id:'n3', name:'Magnesium Glycinate',dose:'300–400 mg',with:'Before bed',          note:'Sleep · blood pressure', type:'vit' },
    { id:'n4', name:'Omega-3',           dose:'—',         with:'Dinner',              note:'2nd half of dose', type:'vit' },
  ]
}

// ─── CONTACTS ────────────────────────────────────────────────────────────────

export const CONTACTS_DEFAULT = [
  { id:'c1', specialty:'Primary Care',    name:'', hospital:'', phone:'', address:'', notes:'' },
  { id:'c2', specialty:'Nephrologist',    name:'', hospital:'', phone:'', address:'', notes:'' },
  { id:'c3', specialty:'Cardiologist',    name:'', hospital:'', phone:'', address:'', notes:'' },
  { id:'c4', specialty:'Endocrinologist', name:'', hospital:'', phone:'', address:'', notes:'' },
]

// ─── STATUS UTILITIES ─────────────────────────────────────────────────────────

export function getStatus(f, v) {
  if (v == null || v === '') return 'ok'
  const n = parseFloat(v); if (isNaN(n)) return 'ok'
  if ((f.cHi && n >= f.cHi) || (f.cLo != null && n <= f.cLo)) return 'crit'
  if ((f.hi  && n > f.hi)   || (f.lo  != null && n < f.lo))   return 'warn'
  return 'ok'
}

export const STATUS_COLOR = { crit: '#EF4444', warn: '#F59E0B', ok: '#10B981' }
export const STATUS_BG    = { crit: '#FEF2F2', warn: '#FFFBEB', ok: '#ECFDF5' }
export const STATUS_BD    = { crit: '#FECACA', warn: '#FDE68A', ok: '#A7F3D0' }
export const STATUS_LABEL = { crit: 'Critical', warn: 'High', ok: 'Normal' }

export const gc  = (f, v) => STATUS_COLOR[getStatus(f, v)]
export const gbg = (f, v) => STATUS_BG[getStatus(f, v)]

export function normalRange(f) {
  if (f.lo != null && f.hi) return `${f.lo}–${f.hi}`
  if (f.hi) return `< ${f.hi}`
  if (f.lo != null) return `> ${f.lo}`
  return ''
}

// ─── LOCAL STORAGE ────────────────────────────────────────────────────────────

export const today = () => new Date().toISOString().split('T')[0]

export const lsGet = (k, fb) => {
  try { const d = localStorage.getItem(k); return d ? JSON.parse(d) : fb } catch { return fb }
}
export const lsSet = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)) } catch {}
}

// ─── FILE TO BASE64 ───────────────────────────────────────────────────────────

export const toBase64 = (file) => new Promise((res, rej) => {
  const r = new FileReader()
  r.onload = () => res(r.result.split(',')[1]); r.onerror = rej; r.readAsDataURL(file)
})
