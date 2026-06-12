'use client'
import { getStatus, STATUS_COLOR, STATUS_BG, STATUS_BD, STATUS_LABEL, normalRange, gc, CAT_COLOR } from '../lib/data'

// ─── STATUS CHIP ──────────────────────────────────────────────────────────────

export function Chip({ field, value }) {
  const s = getStatus(field, value)
  if (s === 'ok') return null
  const c = STATUS_COLOR[s], bg = STATUS_BG[s], bd = STATUS_BD[s]
  const nr = normalRange(field)
  return (
    <span style={{
      display: 'inline-block', fontSize: 10, fontWeight: 600,
      padding: '2px 7px', borderRadius: 20,
      background: bg, color: c, border: `1px solid ${bd}`
    }}>
      {STATUS_LABEL[s]}{nr ? ` · ${nr} ${field.unit}` : ''}
    </span>
  )
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────

export function Bar({ field, value }) {
  if (!value) return null
  const v = parseFloat(value)
  const c = gc(field, v)
  const ref = field.cHi || (field.hi ? field.hi * 1.5 : field.cLo ? field.cLo * 0.5 : 100)
  const pct = Math.min(95, Math.max(5, (v / ref) * 100))
  return (
    <div style={{ height: 3, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden', marginTop: 5, width: '100%' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: c, borderRadius: 2, transition: 'width .5s ease' }} />
    </div>
  )
}

// ─── SPARKLINE ────────────────────────────────────────────────────────────────

export function Spark({ data, color, width = 72, height = 28 }) {
  if (!data || data.length < 2) return null
  const nums = data.map(Number).filter(v => !isNaN(v))
  if (nums.length < 2) return null
  const mn = Math.min(...nums), mx = Math.max(...nums), rng = mx - mn || 1
  const W = width, H = height, p = 3
  const pts = nums.map((v, i) =>
    `${(i / (nums.length - 1)) * (W - p * 2) + p},${H - p - ((v - mn) / rng) * (H - p * 2)}`
  ).join(' ')
  const last = pts.trim().split(' ').pop().split(',')
  const trend = nums[nums.length - 1] - nums[0]
  const tc = trend > rng * 0.05 ? '#EF4444' : trend < -rng * 0.05 ? '#10B981' : '#9CA3AF'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
      <svg width={W} height={H} style={{ display: 'block' }}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" opacity=".75" />
        <circle cx={parseFloat(last[0])} cy={parseFloat(last[1])} r="3" fill={color} />
      </svg>
      <span style={{ fontSize: 9, fontWeight: 600, color: tc }}>
        {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(parseFloat(trend.toFixed(1)))}
      </span>
    </div>
  )
}

// ─── VALUE ROW ────────────────────────────────────────────────────────────────

export function ValRow({ field, value, history }) {
  const s = getStatus(field, value)
  const c = STATUS_COLOR[s]
  const cc = CAT_COLOR[field.cat] || '#6B7280'
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #F9FAFB', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: '#4B5563', fontWeight: 500 }}>{field.label}</span>
          <Chip field={field} value={value} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div>
            <span style={{ fontSize: 20, fontWeight: 600, color: c }}>{value}</span>
            <span style={{ fontSize: 10, color: '#9CA3AF', marginLeft: 3 }}>{field.unit}</span>
          </div>
        </div>
        <Bar field={field} value={value} />
      </div>
      {history && history.length > 1 && <Spark data={history} color={cc} />}
    </div>
  )
}

// ─── SECTION CARD ─────────────────────────────────────────────────────────────

export function SectionCard({ title, color, date, children }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16,
      padding: '16px', marginBottom: 12, boxShadow: '0 1px 2px rgba(0,0,0,.04)'
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color,
        letterSpacing: 1.5, textTransform: 'uppercase',
        marginBottom: 12, paddingBottom: 8,
        borderBottom: `1px solid ${color}22`
      }}>
        {title}
      </div>
      {children}
      {date && (
        <div style={{ fontSize: 10, color: '#D1D5DB', marginTop: 8, textAlign: 'right' }}>
          Date: {date}
        </div>
      )}
    </div>
  )
}

// ─── FORM FIELD ───────────────────────────────────────────────────────────────

export function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{
        fontSize: 11, color: '#6B7280', display: 'block',
        marginBottom: 4, letterSpacing: .5, textTransform: 'uppercase'
      }}>{label}</label>
      {children}
    </div>
  )
}

// ─── PRIMARY BUTTON ───────────────────────────────────────────────────────────

export function PrimaryBtn({ onClick, children, color = '#4F46E5', disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', background: disabled ? '#E5E7EB' : color,
      border: 'none', borderRadius: 12, padding: '13px',
      color: disabled ? '#9CA3AF' : '#fff',
      fontSize: 14, fontWeight: 600, marginTop: 8,
      cursor: disabled ? 'not-allowed' : 'pointer'
    }}>
      {children}
    </button>
  )
}

// ─── GHOST BUTTON ────────────────────────────────────────────────────────────

export function GhostBtn({ onClick, children, color = '#4F46E5' }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', background: 'transparent',
      border: `1.5px dashed ${color}66`, borderRadius: 12,
      padding: '11px', color, fontSize: 13, fontWeight: 600
    }}>
      {children}
    </button>
  )
}

// ─── TOAST ────────────────────────────────────────────────────────────────────

export function Toast({ message }) {
  if (!message) return null
  return (
    <div style={{
      position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
      background: '#10B981', color: '#fff', borderRadius: 10,
      padding: '10px 20px', fontSize: 13, fontWeight: 600,
      zIndex: 500, boxShadow: '0 4px 12px rgba(0,0,0,.15)',
      whiteSpace: 'nowrap', pointerEvents: 'none'
    }}>
      {message}
    </div>
  )
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────

export function BottomNav({ tab, setTab }) {
  const items = [
    { id: 'home',    label: 'Home',    icon: '⌂' },
    { id: 'upload',  label: 'Upload',  icon: '↑' },
    { id: 'meds',    label: 'Meds',    icon: '⊕' },
    { id: 'doctors', label: 'Doctors', icon: '☎' },
    { id: 'history', label: 'History', icon: '≡' },
    { id: 'chat',    label: 'AI Chat', icon: '✦' },
  ]
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430, background: '#fff',
      borderTop: '1px solid #E5E7EB', display: 'flex', zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
      boxShadow: '0 -1px 6px rgba(0,0,0,.06)'
    }}>
      {items.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{
          flex: 1, padding: '9px 2px 10px', background: 'none', border: 'none',
          borderTop: `2px solid ${tab === t.id ? '#4F46E5' : 'transparent'}`,
          color: tab === t.id ? '#4F46E5' : '#9CA3AF',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2
        }}>
          <span style={{ fontSize: 17, lineHeight: 1 }}>{t.icon}</span>
          <span style={{ fontSize: 8, fontWeight: tab === t.id ? 700 : 400, letterSpacing: .5, textTransform: 'uppercase' }}>
            {t.label}
          </span>
        </button>
      ))}
    </div>
  )
}

// ─── SCREEN HEADER ────────────────────────────────────────────────────────────

export function Header({ title, subtitle, right }) {
  return (
    <div style={{
      padding: '18px 18px 14px', background: '#fff',
      borderBottom: '1px solid #E5E7EB',
      position: 'sticky', top: 0, zIndex: 50,
      boxShadow: '0 1px 3px rgba(0,0,0,.06)'
    }}>
      <div style={{ fontSize: 9, color: '#4F46E5', letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
        HEALTH MONITOR
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 21, fontWeight: 700, color: '#111827', letterSpacing: -.4 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{subtitle}</div>}
        </div>
        {right}
      </div>
    </div>
  )
}
