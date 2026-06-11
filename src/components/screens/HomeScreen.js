'use client'
import { LABS, STELO, CAT_ORDER, CAT_COLOR, getStatus, STATUS_COLOR, gc, lsGet } from '../../lib/data'
import { SectionCard, ValRow, Spark, Chip, Bar } from '../ui'

function TrendChart({ labs, stelo }) {
  const [sel, setSel] = require('react').useState('hba1c')
  const allF = [...LABS, ...STELO]
  const field = allF.find(f => f.key === sel)
  const src = ['glucose_fasting','glucose_peak','glucose_avg','time_in_range'].includes(sel) ? stelo : labs
  const data = [...src].reverse().filter(e => e[sel] != null).map(e => ({ date: e.date, val: parseFloat(e[sel]) }))
  const available = allF.filter(f => {
    const s = ['glucose_fasting','glucose_peak','glucose_avg','time_in_range'].includes(f.key) ? stelo : labs
    return s.some(e => e[f.key] != null)
  })
  if (!available.length) return null
  const vals = data.map(d => d.val)
  const mn = vals.length ? Math.min(...vals) : 0
  const mx = vals.length ? Math.max(...vals) : 100
  const rng = mx - mn || 1
  const W = 280, H = 100, WP = 28, TP = 12, BP = 20
  const color = field ? (CAT_COLOR[field.cat] || '#4F46E5') : '#4F46E5'
  const pts = data.map((d, i) => ({
    x: WP + (i / Math.max(data.length - 1, 1)) * (W - WP * 2),
    y: TP + (1 - (d.val - mn) / rng) * (H - TP - BP),
    d
  }))
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: 16, marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Trend analysis</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
        {available.slice(0, 8).map(f => (
          <button key={f.key} onClick={() => setSel(f.key)} style={{
            padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 500,
            border: `1px solid ${sel === f.key ? (CAT_COLOR[f.cat]||'#4F46E5') : '#E5E7EB'}`,
            background: sel === f.key ? (CAT_COLOR[f.cat]||'#4F46E5') : '#fff',
            color: sel === f.key ? '#fff' : '#6B7280'
          }}>{f.label}</button>
        ))}
      </div>
      {data.length < 2 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#9CA3AF', fontSize: 12 }}>
          Need at least 2 data points for {field?.label}
        </div>
      ) : (
        <>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
            {field?.hi && !isNaN((1 - (field.hi - mn) / rng)) && (
              <line x1={WP} x2={W - WP}
                y1={TP + (1 - (field.hi - mn) / rng) * (H - TP - BP)}
                y2={TP + (1 - (field.hi - mn) / rng) * (H - TP - BP)}
                stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,3" />
            )}
            {pts.length > 1 && (
              <polyline points={pts.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none" stroke={color} strokeWidth="2.5"
                strokeLinejoin="round" strokeLinecap="round" />
            )}
            {pts.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="4" fill="#fff" stroke={color} strokeWidth="2" />
                <text x={p.x} y={H - 4} textAnchor="middle" fontSize="8" fill="#9CA3AF">
                  {p.d.date?.slice(5)}
                </text>
              </g>
            ))}
            <text x={WP - 3} y={TP + 4} textAnchor="end" fontSize="8" fill="#9CA3AF">{mx.toFixed(1)}</text>
            <text x={WP - 3} y={H - BP} textAnchor="end" fontSize="8" fill="#9CA3AF">{mn.toFixed(1)}</text>
          </svg>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, paddingTop: 10, borderTop: '1px solid #F3F4F6' }}>
            {[['First', data[0].val, '#F9FAFB', '#374151'], ['Latest', data[data.length-1].val, '#ECFDF5', gc(field, data[data.length-1].val)]].map(([lbl, v, bg, tc]) => (
              <div key={lbl} style={{ flex: 1, background: bg, borderRadius: 10, padding: '8px 10px' }}>
                <div style={{ fontSize: 9, color: '#9CA3AF', marginBottom: 2 }}>{lbl.toUpperCase()}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: tc }}>{v}</div>
              </div>
            ))}
            <div style={{ flex: 1, borderRadius: 10, padding: '8px 10px', background: data[data.length-1].val < data[0].val ? '#ECFDF5' : '#FEF2F2' }}>
              <div style={{ fontSize: 9, color: '#9CA3AF', marginBottom: 2 }}>CHANGE</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: data[data.length-1].val < data[0].val ? '#10B981' : '#EF4444' }}>
                {(data[data.length-1].val - data[0].val) > 0 ? '+' : ''}{(data[data.length-1].val - data[0].val).toFixed(1)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function HomeScreen({ labs, stelo }) {
  const L = labs[0] || {}, S = stelo[0] || {}
  const crits = LABS.filter(f => L[f.key] && getStatus(f, L[f.key]) === 'crit')
  const hist = key => [...labs].reverse().filter(l => l[key] != null).map(l => l[key])
  const sHist = key => [...stelo].reverse().filter(s => s[key] != null).map(s => s[key])
  if (labs.length === 0 && stelo.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '72px 24px' }}>
        <div style={{ fontSize: 52, marginBottom: 16, opacity: .12 }}>🩺</div>
        <div style={{ fontSize: 17, fontWeight: 600, color: '#4B5563', marginBottom: 8 }}>No data yet</div>
        <div style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.7 }}>
          Go to <span style={{ color: '#4F46E5', fontWeight: 600 }}>Upload</span> to add your first lab results.<br />
          Albanian · English · Turkish · Spanish all supported.
        </div>
      </div>
    )
  }
  return (
    <div style={{ padding: '16px 16px 0' }}>
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
      {CAT_ORDER.map(cat => {
        const fields = LABS.filter(f => f.cat === cat && L[f.key] != null)
        if (!fields.length) return null
        const cc = CAT_COLOR[cat] || '#6B7280'
        return (
          <SectionCard key={cat} title={cat} color={cc} date={L.date}>
            {fields.map(f => <ValRow key={f.key} field={f} value={L[f.key]} history={hist(f.key)} />)}
          </SectionCard>
        )
      })}
      {stelo.length > 0 && (
        <SectionCard title="Stelo CGM — Latest" color="#7C3AED">
          <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 8 }}>📅 {S.date}</div>
          {STELO.map(f => {
            const v = S[f.key]; if (!v) return null
            return (
              <div key={f.key} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F9FAFB', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, color: '#4B5563', fontWeight: 500 }}>{f.label}</span>
                    <Chip field={f} value={v} />
                  </div>
                  <span style={{ fontSize: 20, fontWeight: 600, color: gc(f, v) }}>{v}</span>
                  <span style={{ fontSize: 10, color: '#9CA3AF', marginLeft: 3 }}>{f.unit}</span>
                  <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>Target: {f.target}</div>
                  <Bar field={f} value={v} />
                </div>
                <Spark data={sHist(f.key)} color="#7C3AED" />
              </div>
            )
          })}
        </SectionCard>
      )}
      <TrendChart labs={labs} stelo={stelo} />
    </div>
  )
}
