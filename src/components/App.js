'use client'
import { useState, useEffect } from 'react'
import { lsGet, lsSet, today, getStatus, LABS } from '../lib/data'
import { Header, BottomNav, Toast } from './ui'
import HomeScreen    from './screens/HomeScreen'
import UploadScreen  from './screens/UploadScreen'
import MedsScreen    from './screens/MedsScreen'
import DoctorsScreen from './screens/DoctorsScreen'
import HistoryScreen from './screens/HistoryScreen'
import ChatScreen    from './screens/ChatScreen'

export default function App() {
  const [tab,   setTab  ] = useState('home')
  const [labs,  setLabs ] = useState([])
  const [stelo, setStelo] = useState([])
  const [toast, setToast] = useState('')

  useEffect(() => {
    setLabs(lsGet('mk_labs_v9', []))
    setStelo(lsGet('mk_stelo_v9', []))
  }, [])

  const addLab   = entry => { const d = [entry, ...labs];  lsSet('mk_labs_v9',  d); setLabs(d);  flash('✓ Result saved') }
  const addStelo = entry => { const d = [entry, ...stelo]; lsSet('mk_stelo_v9', d); setStelo(d); flash('✓ Stelo entry saved') }
  const delLab   = id    => { const d = labs.filter(l  => l.id !== id);  lsSet('mk_labs_v9',  d); setLabs(d) }
  const delStelo = id    => { const d = stelo.filter(s => s.id !== id); lsSet('mk_stelo_v9', d); setStelo(d) }

  const flash = msg => { setToast(msg); setTimeout(() => setToast(''), 1600) }

  const L     = labs[0] || {}
  const crits = LABS.filter(f => L[f.key] && getStatus(f, L[f.key]) === 'crit')

  const critBadge = crits.length > 0
    ? <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'4px 10px', fontSize:11, color:'#DC2626', fontWeight:700 }}>⚠ {crits.length} critical</div>
    : null

  const headers = {
    home:    { title:'Mikail Kocak',   subtitle:'46 yrs · Los Angeles, CA', right:critBadge },
    upload:  { title:'Upload Result',  subtitle:'Albanian · English · Turkish · Spanish' },
    meds:    { title:'Medications',    subtitle:'Morning & night · prescribed and supplements' },
    doctors: { title:'My Doctors',     subtitle:'Tap any phone number to call' },
    history: { title:'History',        subtitle:labs.length+' labs · '+stelo.length+' Stelo entries' },
    chat:    { title:'AI Health Chat', subtitle:'Ask anything about your results' },
  }

  const hp = headers[tab] || headers.home

  return (
    <div style={{ minHeight:'100vh', paddingBottom:90, background:'#F9FAFB' }}>
      <Header title={hp.title} subtitle={hp.subtitle} right={hp.right} />
      <Toast message={toast} />

      {tab==='home'    && <HomeScreen    labs={labs} stelo={stelo} />}
      {tab==='upload'  && <UploadScreen  onLabSaved={entry => { addLab(entry); setTab('home') }} onSteloSaved={addStelo} />}
      {tab==='meds'    && <MedsScreen />}
      {tab==='doctors' && <DoctorsScreen />}
      {tab==='history' && <HistoryScreen labs={labs} stelo={stelo} onDeleteLab={delLab} onDeleteStelo={delStelo} />}
      {tab==='chat'    && <ChatScreen    labs={labs} stelo={stelo} />}

      <BottomNav tab={tab} setTab={setTab} />
    </div>
  )
}
