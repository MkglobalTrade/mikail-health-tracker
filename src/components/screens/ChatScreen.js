'use client'
import { useState, useRef, useEffect } from 'react'
import { LABS, STELO } from '../../lib/data'

function buildContext(labs, stelo) {
  if (!labs.length && !stelo.length) return 'No lab data available yet.'
  let ctx = 'PATIENT: Mikail Kocak, 46 years old, Los Angeles CA.\n\n'
  if (labs.length) {
    ctx += 'LAB RESULTS (most recent first):\n'
    labs.slice(0,5).forEach(l => {
      const vals = LABS.filter(f => l[f.key]!=null).map(f => f.label+': '+l[f.key]+' '+f.unit).join(', ')
      if (vals) ctx += '• '+l.date+': '+vals+'\n'
    })
  }
  if (stelo.length) {
    ctx += '\nSTELO CGM (most recent first):\n'
    stelo.slice(0,7).forEach(s => {
      const vals = STELO.filter(f => s[f.key]!=null).map(f => f.label+': '+s[f.key]+' '+f.unit).join(', ')
      if (vals) ctx += '• '+s.date+': '+vals+(s.feeling?' · '+s.feeling:'')+'\n'
    })
  }
  return ctx
}

const SUGGESTIONS = [
  'Explain my ACR result and what it means for my kidneys',
  'Compare my August 2025 vs June 2026 labs',
  'Why is my LDL higher now than before?',
  'Am I making progress with my diabetes?',
  'What should I prioritize improving first?',
  'Is my Losartan dose enough for my ACR level?',
]

export default function ChatScreen({ labs, stelo }) {
  const [messages, setMessages] = useState([
    { role:'assistant', content:'Hello Mikail. I have access to all your lab results and health history. Ask me anything — I can explain your values, compare results over time, or help you understand what to prioritize.' }
  ])
  const [input,   setInput  ] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    const updated = [...messages, { role:'user', content:msg }]
    setMessages(updated)
    setLoading(true)
    try {
      const res  = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ messages:updated, context:buildContext(labs,stelo) }) })
      const json = await res.json()
      setMessages(prev => [...prev, { role:'assistant', content: json.ok ? json.message : 'Error: '+json.error }])
    } catch {
      setMessages(prev => [...prev, { role:'assistant', content:'Connection error. Check your internet and try again.' }])
    }
    setLoading(false)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 160px)' }}>
      <div style={{ flex:1, overflowY:'auto', padding:'16px 16px 8px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom:12, display:'flex', flexDirection:'column', alignItems:m.role==='user'?'flex-end':'flex-start' }}>
            {m.role==='assistant' && (
              <div style={{ fontSize:9, color:'#4F46E5', fontWeight:700, letterSpacing:1, marginBottom:4 }}>MK HEALTH AI</div>
            )}
            <div style={{ maxWidth:'85%', padding:'10px 13px', borderRadius:m.role==='user'?'14px 14px 3px 14px':'14px 14px 14px 3px', background:m.role==='user'?'#4F46E5':'#F9FAFB', color:m.role==='user'?'#fff':'#1F2937', fontSize:13, lineHeight:1.6, border:m.role==='assistant'?'1px solid #E5E7EB':'none' }}>
              {m.content.split('\n').map((line, j, arr) => (
                <span key={j}>{line}{j < arr.length-1 && <br />}</span>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:9, color:'#4F46E5', fontWeight:700, letterSpacing:1, marginBottom:4 }}>MK HEALTH AI</div>
            <div style={{ padding:'10px 13px', borderRadius:'14px 14px 14px 3px', background:'#F9FAFB', border:'1px solid #E5E7EB', display:'inline-flex', gap:5, alignItems:'center' }}>
              {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#9CA3AF', animation:'pulse 1.1s ease-in-out '+(i*.18)+'s infinite' }} />)}
            </div>
          </div>
        )}

        {messages.length === 1 && (
          <div style={{ marginTop:8 }}>
            <div style={{ fontSize:11, color:'#9CA3AF', marginBottom:8 }}>Suggested questions:</div>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => send(s)} style={{ display:'block', width:'100%', textAlign:'left', background:'#fff', border:'1px solid #E5E7EB', borderRadius:10, padding:'9px 12px', marginBottom:6, fontSize:12, color:'#374151', cursor:'pointer' }}>
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div style={{ padding:'8px 16px 16px', background:'#fff', borderTop:'1px solid #E5E7EB' }}>
        <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()} }} placeholder="Ask about your results..." style={{ flex:1, background:'#F9FAFB', border:'1px solid #E5E7EB', borderRadius:12, padding:'10px 13px', fontSize:13, resize:'none', height:42, outline:'none', lineHeight:1.4 }} />
          <button onClick={() => send()} disabled={!input.trim()||loading} style={{ width:40, height:40, borderRadius:12, flexShrink:0, background:(input.trim()&&!loading)?'#4F46E5':'#E5E7EB', border:'none', color:'#fff', fontSize:16, cursor:(input.trim()&&!loading)?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', transition:'background .2s' }}>↑</button>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.1)}}`}</style>
    </div>
  )
}
