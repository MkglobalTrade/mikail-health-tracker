'use client'
import { useState } from 'react'
import { LABS, STELO, CAT_ORDER, CAT_COLOR, getStatus, STATUS_C, STATUS_BG } from '../../lib/data'

export default function HistoryScreen({ labs, stelo, onDeleteLab, onDeleteStelo }) {
  const [exp, setExp] = useState(null)

  const byMonth = {}
  const allEntries = [
    ...labs.map(e  => ({ ...e, _t:'lab' })),
    ...stelo.map(e => ({ ...e, _t:'stelo' }))
  ]
  allEntries.forEach(e => {
    const m = e.date?.slice(0,7) || 'Unknown'
    if (!byMonth[m]) byMonth[m] = []
    byMonth[m].push(e)
  })

  const monthName = m => {
    if (m === 'Unknown') return 'Unknown date'
    const [y, mo] = m.split('-')
    return new Date(parseInt(y), parseInt(mo)-1).toLocaleString('en', { month:'long', year:'numeric' })
  }

  if (labs.length === 0 && stelo.length === 0) {
    return (
      <div style={{ padding:'16px 16px 0', textAlign:'center', paddingTop:64 }}>
        <div style={{ fontSize:36, marginBottom:10, opacity:.15 }}>📋</div>
        <div style={{ fontSize:14, color:'#6B7280' }}>No history yet. Upload your first results.</div>
      </div>
    )
  }

  return (
    <div style={{ padding:'16px 16px 0' }}>
      <div style={{ fontSize:12, color:'#6B7280', marginBottom:16 }}>
        {labs.length} lab results · {stelo.length} Stelo entries · organized by month
      </div>

      {Object.keys(byMonth).sort((a,b) => b.localeCompare(a)).map(month => (
        <div key={month} style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#9CA3AF', letterSpacing:1.5, textTransform:'uppercase', marginBottom:10 }}>
            {monthName(month)}
          </div>

          {byMonth[month].sort((a,b) => (b.date||'').localeCompare(a.date||'')).map(entry => {
            const isLab  = entry._t === 'lab'
            const isOpen = exp === entry.id
            const labFields  = isLab ? LABS.filter(f => entry[f.key] != null) : []
            const critCount  = labFields.filter(f => getStatus(f, entry[f.key]) === 'crit').length

            return (
              <div key={entry.id} onClick={() => setExp(isOpen ? null : entry.id)}
                style={{ background:'#fff', border:'1px solid '+(isOpen?'#C7D2FE':'#E5E7EB'), borderRadius:14, padding:'12px 14px', marginBottom:8, cursor:'pointer', transition:'border-color .2s' }}>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:14, fontWeight:600, color:'#1F2937' }}>{entry.date}</span>
                      {isLab ? (
                        critCount > 0
                          ? <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:20, background:'#FEF2F2', color:'#DC2626', border:'1px solid #FECACA' }}>{critCount} critical</span>
                          : <span style={{ fontSize:9, fontWeight:600, padding:'2px 7px', borderRadius:20, background:'#EEF2FF', color:'#4338CA', border:'1px solid #C7D2FE' }}>Lab</span>
                      ) : (
                        <span style={{ fontSize:9, fontWeight:600, padding:'2px 7px', borderRadius:20, background:'#EDE9FE', color:'#6D28D9', border:'1px solid #DDD6FE' }}>Stelo</span>
                      )}
                    </div>
                    <div style={{ fontSize:10, color:'#9CA3AF', marginTop:2 }}>
                      {entry.src==='upload' ? 'Uploaded · Claude' : 'Manual entry'}
                      {!isLab && entry.feeling ? ' · '+entry.feeling : ''}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <span style={{ fontSize:12, color:'#D1D5DB' }}>{isOpen?'▲':'▼'}</span>
                    <button onClick={e => { e.stopPropagation(); isLab ? onDeleteLab(entry.id) : onDeleteStelo(entry.id) }}
                      style={{ background:'none', border:'none', color:'#D1D5DB', fontSize:16, padding:0 }}>✕</button>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid #F3F4F6' }}>
                    {isLab ? (
                      <>
                        {CAT_ORDER.map(cat => {
                          const fields = LABS.filter(f => f.cat===cat && entry[f.key]!=null)
                          if (!fields.length) return null
                          return (
                            <div key={cat} style={{ marginBottom:12 }}>
                              <div style={{ fontSize:9, fontWeight:700, color:CAT_COLOR[cat]||'#6B7280', letterSpacing:1, textTransform:'uppercase', marginBottom:7 }}>{cat}</div>
                              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                                {fields.map(f => {
                                  const s  = getStatus(f, entry[f.key])
                                  const sc = STATUS_C[s]
                                  const bg = STATUS_BG[s]
                                  return (
                                    <div key={f.key} style={{ background:bg, borderRadius:10, padding:'7px 11px', borderLeft:'3px solid '+sc }}>
                                      <div style={{ fontSize:9, color:'#9CA3AF', marginBottom:2 }}>{f.label}</div>
                                      <div style={{ fontSize:14, fontWeight:600, color:sc }}>{entry[f.key]} <span style={{ fontSize:8, opacity:.5 }}>{f.unit}</span></div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                        {entry.alerts?.map((a,i) => <div key={i} style={{ fontSize:11, color:'#DC2626', padding:'3px 0' }}>⚠ {a}</div>)}
                        {entry.summary && <div style={{ fontSize:11, color:'#6B7280', marginTop:8, fontStyle:'italic', lineHeight:1.6 }}>{entry.summary}</div>}
                      </>
                    ) : (
                      <>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:8 }}>
                          {STELO.map(f => {
                            if (!entry[f.key]) return null
                            const s  = getStatus(f, entry[f.key])
                            const sc = STATUS_C[s]
                            const bg = STATUS_BG[s]
                            return (
                              <div key={f.key} style={{ background:bg, borderRadius:10, padding:'7px 11px', borderLeft:'3px solid '+sc }}>
                                <div style={{ fontSize:9, color:'#9CA3AF', marginBottom:2 }}>{f.label}</div>
                                <div style={{ fontSize:14, fontWeight:600, color:sc }}>{entry[f.key]} <span style={{ fontSize:8, opacity:.5 }}>{f.unit}</span></div>
                              </div>
                            )
                          })}
                        </div>
                        {entry.notes && <div style={{ fontSize:11, color:'#9CA3AF', fontStyle:'italic' }}>{entry.notes}</div>}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
