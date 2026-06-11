'use client'
import { useState, useEffect } from 'react'
import { CONTACTS_DEFAULT, lsGet, lsSet } from '../../lib/data'
import { FormField, PrimaryBtn, GhostBtn } from '../ui'

export default function DoctorsScreen() {
  const [contacts, setContacts] = useState([])
  const [editing,  setEditing ] = useState(null)
  const [form,     setForm    ] = useState({})

  useEffect(() => setContacts(lsGet('mk_contacts_v9', CONTACTS_DEFAULT)), [])

  const save = d => { lsSet('mk_contacts_v9', d); setContacts(d) }
  const startEdit = c => { setEditing(c.id); setForm({ ...c }) }
  const saveEdit  = () => { save(contacts.map(c => c.id === editing ? { ...form, id: editing } : c)); setEditing(null) }
  const addNew    = () => {
    const nc = { id: 'c' + Date.now(), specialty: '', name: '', hospital: '', phone: '', address: '', notes: '' }
    const updated = [...contacts, nc]; save(updated); setEditing(nc.id); setForm(nc)
  }
  const del = id => { if (confirm('Delete this contact?')) save(contacts.filter(c => c.id !== id)) }
  const initials = c => (c.name || c.specialty || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  const SPEC_COLORS = { Nephrologist: '#0891B2', Cardiologist: '#DC2626', Endocrinologist: '#7C3AED', 'Primary Care': '#16A34A' }
  const specColor = spec => SPEC_COLORS[spec] || '#4F46E5'

  return (
    <div style={{ padding: '16px 16px 0' }}>
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 16, lineHeight: 1.6 }}>
        Your doctors and hospitals — always available, even offline. Tap any phone number to call directly.
      </div>

      {contacts.map(c => (
        <div key={c.id} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '16px', marginBottom: 10 }}>
          {editing === c.id ? (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#4F46E5', marginBottom: 14 }}>Edit contact</div>
              {[['specialty','Specialty','e.g. Nephrologist'], ['name','Full name','Dr. First Last'], ['hospital','Hospital / Clinic','e.g. Cedars-Sinai'], ['phone','Phone','+1 (310) 000-0000'], ['address','Address',''], ['notes','Notes','e.g. Appointments Tuesday PM']].map(([k, lbl, ph]) => (
                <FormField key={k} label={lbl}>
                  <input value={form[k] || ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} placeholder={ph} />
                </FormField>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => setEditing(null)} style={{ flex: 1, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '11px', color: '#6B7280', fontSize: 13, fontWeight: 500 }}>Cancel</button>
                <button onClick={saveEdit} style={{ flex: 2, background: '#4F46E5', border: 'none', borderRadius: 10, padding: '11px', color: '#fff', fontSize: 13, fontWeight: 700 }}>Save</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flex: 1 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: specColor(c.specialty), border: '1px solid #C7D2FE', flexShrink: 0 }}>
                    {initials(c)}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: c.name ? '#1F2937' : '#9CA3AF' }}>
                      {c.name || 'No name yet'}
                    </div>
                    <div style={{ fontSize: 12, color: specColor(c.specialty), fontWeight: 500 }}>
                      {c.specialty || 'Specialty'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => startEdit(c)} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 17, padding: 0 }}>✎</button>
                  <button onClick={() => del(c.id)} style={{ background: 'none', border: 'none', color: '#D1D5DB', fontSize: 17, padding: 0 }}>✕</button>
                </div>
              </div>
              {c.hospital && <InfoRow icon="🏥" text={c.hospital} />}
              {c.phone && <a href={`tel:${c.phone}`} style={{ textDecoration: 'none' }}><InfoRow icon="📞" text={c.phone} color="#4F46E5" bold /></a>}
              {c.address && <InfoRow icon="📍" text={c.address} />}
              {c.notes && <InfoRow icon="📝" text={c.notes} muted />}
              {!c.name && !c.hospital && !c.phone && (
                <div style={{ fontSize: 12, color: '#D1D5DB', fontStyle: 'italic' }}>Tap ✎ to add information</div>
              )}
            </div>
          )}
        </div>
      ))}

      <GhostBtn onClick={addNew}>+ Add doctor or hospital</GhostBtn>

      {/* Insurance section */}
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 10 }}>Insurance</div>
        <InsuranceSection />
      </div>
    </div>
  )
}

function InfoRow({ icon, text, color, bold, muted }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: color || (muted ? '#9CA3AF' : '#374151'), marginBottom: 5, fontWeight: bold ? 600 : 400, fontStyle: muted ? 'italic' : 'normal' }}>
      <span style={{ fontSize: 13, flexShrink: 0 }}>{icon}</span>
      <span>{text}</span>
    </div>
  )
}

function InsuranceSection() {
  const [data, setData] = useState({})
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState({})
  useEffect(() => { const d = lsGet('mk_insurance', {}); setData(d); setForm(d) }, [])
  const save = () => { lsSet('mk_insurance', form); setData(form); setEdit(false) }
  if (edit) {
    return (
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: 16 }}>
        {[['provider','Insurance Provider','e.g. Blue Cross Blue Shield'],['plan','Plan Name','e.g. PPO Gold'],['member_id','Member ID',''],['group_id','Group ID',''],['phone','Member Services Phone',''],['notes','Notes','']].map(([k,lbl,ph]) => (
          <FormField key={k} label={lbl}><input value={form[k]||''} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} placeholder={ph}/></FormField>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={() => setEdit(false)} style={{ flex: 1, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '11px', color: '#6B7280', fontSize: 13 }}>Cancel</button>
          <button onClick={save} style={{ flex: 2, background: '#4F46E5', border: 'none', borderRadius: 10, padding: '11px', color: '#fff', fontSize: 13, fontWeight: 700 }}>Save</button>
        </div>
      </div>
    )
  }
  if (!data.provider) {
    return (
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '14px 16px', cursor: 'pointer' }} onClick={() => setEdit(true)}>
        <div style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' }}>No insurance information added · tap to add</div>
      </div>
    )
  }
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2937', marginBottom: 4 }}>{data.provider}</div>
          {data.plan && <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 3 }}>{data.plan}</div>}
          {data.member_id && <InfoRow icon="🪪" text={`Member ID: ${data.member_id}`} />}
          {data.group_id && <InfoRow icon="#" text={`Group: ${data.group_id}`} />}
          {data.phone && <a href={`tel:${data.phone}`} style={{ textDecoration: 'none' }}><InfoRow icon="📞" text={data.phone} color="#4F46E5" bold /></a>}
          {data.notes && <InfoRow icon="📝" text={data.notes} muted />}
        </div>
        <button onClick={() => setEdit(true)} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 17, padding: 0 }}>✎</button>
      </div>
    </div>
  )
}
