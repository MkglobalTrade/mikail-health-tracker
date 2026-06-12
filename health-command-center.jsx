import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Activity, Upload, Pill, FolderClock, Stethoscope, Newspaper,
  Plus, Trash2, RefreshCw, Send, FileText, Image as ImageIcon,
  Download, Sun, Moon, AlertTriangle, CheckCircle2, Loader2
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceLine
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Design tokens — navy / gold clinical theme                         */
/* ------------------------------------------------------------------ */
const T = {
  bg: "#0C1626",        // deep navy
  panel: "#13223A",     // panel navy
  panelSoft: "#1A2D4A", // raised navy
  line: "#24395C",      // hairline
  gold: "#C9A24B",      // accent
  text: "#E9EEF6",
  dim: "#8FA1BC",
  green: "#3DCB7D",
  yellow: "#E8B83A",
  red: "#E5544B",
};

const STATUS = {
  green: { color: T.green, label: "GOOD" },
  yellow: { color: T.yellow, label: "WATCH" },
  red: { color: T.red, label: "CRITICAL" },
};

/* ------------------------------------------------------------------ */
/*  Clinical categorization (ADA / AHA standard ranges)                */
/* ------------------------------------------------------------------ */
function glucoseStatus(v) {
  const n = Number(v);
  if (!n || isNaN(n)) return "yellow";
  if (n < 70) return "red";          // hypoglycemia
  if (n <= 99) return "green";       // normal fasting
  if (n <= 125) return "yellow";     // prediabetes range
  return "red";                      // diabetes range
}
function bpStatus(sys, dia) {
  const s = Number(sys), d = Number(dia);
  if (!s || !d) return "yellow";
  if (s >= 180 || d >= 120) return "red"; // hypertensive crisis
  if (s >= 140 || d >= 90) return "red";  // stage 2
  if (s >= 120 || d >= 80) return "yellow"; // elevated / stage 1
  return "green";
}
function worst(list) {
  if (list.includes("red")) return "red";
  if (list.includes("yellow")) return "yellow";
  return "green";
}

/* ------------------------------------------------------------------ */
/*  Storage                                                            */
/* ------------------------------------------------------------------ */
const KEY = "mk-health-center-v1";
const EMPTY = { readings: [], labs: [], meds: [], docs: [], chat: [], news: null };

async function loadAll() {
  try {
    const r = await window.storage.get(KEY);
    return r ? { ...EMPTY, ...JSON.parse(r.value) } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}
async function saveAll(data) {
  try { await window.storage.set(KEY, JSON.stringify(data)); } catch (e) { console.error("save failed", e); }
}

/* ------------------------------------------------------------------ */
/*  Anthropic API helpers                                              */
/* ------------------------------------------------------------------ */
async function callClaude(messages, tools) {
  const body = { model: "claude-sonnet-4-6", max_tokens: 1000, messages };
  if (tools) body.tools = tools;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("API error " + res.status);
  const data = await res.json();
  return (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
}
function parseJSON(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found");
  return JSON.parse(clean.slice(start, end + 1));
}
function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });
}

/* ------------------------------------------------------------------ */
/*  Small UI pieces                                                    */
/* ------------------------------------------------------------------ */
function StatusDot({ status, size = 10 }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size, borderRadius: "50%",
      background: STATUS[status]?.color || T.dim,
      boxShadow: `0 0 ${size}px ${STATUS[status]?.color || T.dim}66`
    }} />
  );
}
function Panel({ children, style }) {
  return (
    <div style={{
      background: T.panel, border: `1px solid ${T.line}`,
      borderRadius: 14, padding: 18, ...style
    }}>{children}</div>
  );
}
function Eyebrow({ children }) {
  return (
    <div style={{
      fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
      color: T.gold, fontWeight: 600, marginBottom: 8
    }}>{children}</div>
  );
}
function Btn({ children, onClick, disabled, kind = "gold", style }) {
  const bg = kind === "gold" ? T.gold : kind === "ghost" ? "transparent" : T.panelSoft;
  const fg = kind === "gold" ? "#13223A" : T.text;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: bg, color: fg, border: kind === "ghost" ? `1px solid ${T.line}` : "none",
      borderRadius: 10, padding: "10px 16px", fontWeight: 600, fontSize: 13,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
      display: "inline-flex", alignItems: "center", gap: 8, ...style
    }}>{children}</button>
  );
}
const inputStyle = {
  background: T.bg, border: `1px solid ${T.line}`, borderRadius: 10,
  color: T.text, padding: "10px 12px", fontSize: 14, outline: "none", width: "100%"
};

/* ================================================================== */
/*  MAIN APP                                                           */
/* ================================================================== */
export default function HealthCommandCenter() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("dashboard");

  useEffect(() => { loadAll().then(setData); }, []);

  const update = useCallback((fn) => {
    setData(prev => {
      const next = fn(structuredClone(prev));
      saveAll(next);
      return next;
    });
  }, []);

  if (!data) {
    return (
      <div style={{ background: T.bg, minHeight: 480, display: "flex", alignItems: "center", justifyContent: "center", color: T.dim, fontFamily: "system-ui" }}>
        <Loader2 size={20} style={{ marginRight: 8 }} className="spin" /> Loading your health center…
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "upload", label: "Upload Labs", icon: Upload },
    { id: "meds", label: "Medications", icon: Pill },
    { id: "history", label: "History", icon: FolderClock },
    { id: "doctor", label: "AI Doctor", icon: Stethoscope },
    { id: "news", label: "Health News", icon: Newspaper },
  ];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::placeholder { color: ${T.dim}88; }
        button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible { outline: 2px solid ${T.gold}; outline-offset: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "20px 20px 0", maxWidth: 980, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, margin: 0, fontWeight: 600 }}>
            Health <span style={{ color: T.gold }}>Command Center</span>
          </h1>
          <span style={{ fontSize: 12, color: T.dim }}>Personal monitoring · glucose · blood pressure · labs</span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginTop: 16, overflowX: "auto", paddingBottom: 2 }}>
          {tabs.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                background: active ? T.panelSoft : "transparent",
                border: `1px solid ${active ? T.gold : T.line}`,
                color: active ? T.gold : T.dim,
                borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 7, cursor: "pointer", whiteSpace: "nowrap"
              }}>
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: 20, display: "grid", gap: 16 }}>
        {tab === "dashboard" && <Dashboard data={data} />}
        {tab === "upload" && <UploadTab data={data} update={update} />}
        {tab === "meds" && <MedsTab data={data} update={update} />}
        {tab === "history" && <HistoryTab data={data} update={update} />}
        {tab === "doctor" && <DoctorTab data={data} update={update} />}
        {tab === "news" && <NewsTab data={data} update={update} />}

        <div style={{ fontSize: 11, color: T.dim, textAlign: "center", padding: "8px 0 20px", lineHeight: 1.5 }}>
          This app is for personal tracking and general information only — it is not medical advice,
          diagnosis, or treatment. Always confirm decisions with your physician.
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  DASHBOARD                                                          */
/* ================================================================== */
function Dashboard({ data }) {
  const glucose = data.readings.filter(r => r.type === "glucose").sort((a, b) => a.date.localeCompare(b.date));
  const bp = data.readings.filter(r => r.type === "bp").sort((a, b) => a.date.localeCompare(b.date));
  const lastG = glucose[glucose.length - 1];
  const lastBP = bp[bp.length - 1];

  const gStatus = lastG ? glucoseStatus(lastG.value) : null;
  const bStatus = lastBP ? bpStatus(lastBP.sys, lastBP.dia) : null;
  const labStatuses = data.labs.flatMap(l => (l.values || []).map(v => v.status)).filter(Boolean);
  const overall = worst([gStatus, bStatus, ...labStatuses].filter(Boolean).length
    ? [gStatus, bStatus, ...labStatuses].filter(Boolean) : ["yellow"]);

  const hasAny = lastG || lastBP || data.labs.length > 0;

  return (
    <>
      {/* Overall status banner — the signature element */}
      <Panel style={{
        borderLeft: `4px solid ${hasAny ? STATUS[overall].color : T.line}`,
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap"
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
          border: `3px solid ${hasAny ? STATUS[overall].color : T.line}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: hasAny ? `0 0 28px ${STATUS[overall].color}44` : "none"
        }}>
          {hasAny
            ? (overall === "green" ? <CheckCircle2 color={T.green} size={28} /> : <AlertTriangle color={STATUS[overall].color} size={28} />)
            : <Activity color={T.dim} size={28} />}
        </div>
        <div>
          <Eyebrow>Overall status</Eyebrow>
          <div style={{ fontSize: 22, fontWeight: 700, color: hasAny ? STATUS[overall].color : T.dim, fontFamily: "Georgia, serif" }}>
            {hasAny ? STATUS[overall].label : "No data yet"}
          </div>
          <div style={{ fontSize: 13, color: T.dim, marginTop: 2 }}>
            {hasAny
              ? "Based on your latest glucose, blood pressure, and lab results."
              : "Upload a lab report or add a reading to activate monitoring."}
          </div>
        </div>
      </Panel>

      {/* Latest value cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <Panel>
          <Eyebrow>Latest glucose</Eyebrow>
          {lastG ? (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 36, fontWeight: 700, fontFamily: "Georgia, serif", color: STATUS[gStatus].color }}>{lastG.value}</span>
                <span style={{ color: T.dim, fontSize: 13 }}>mg/dL</span>
                <StatusDot status={gStatus} />
              </div>
              <div style={{ fontSize: 12, color: T.dim, marginTop: 4 }}>{lastG.date} · Normal fasting: 70–99</div>
            </>
          ) : <div style={{ color: T.dim, fontSize: 13 }}>No glucose readings yet.</div>}
        </Panel>
        <Panel>
          <Eyebrow>Latest blood pressure</Eyebrow>
          {lastBP ? (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 36, fontWeight: 700, fontFamily: "Georgia, serif", color: STATUS[bStatus].color }}>{lastBP.sys}/{lastBP.dia}</span>
                <span style={{ color: T.dim, fontSize: 13 }}>mmHg</span>
                <StatusDot status={bStatus} />
              </div>
              <div style={{ fontSize: 12, color: T.dim, marginTop: 4 }}>{lastBP.date} · Normal: under 120/80</div>
            </>
          ) : <div style={{ color: T.dim, fontSize: 13 }}>No blood pressure readings yet.</div>}
        </Panel>
      </div>

      {/* Charts */}
      {glucose.length > 1 && (
        <Panel>
          <Eyebrow>Glucose trend (mg/dL)</Eyebrow>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={glucose}>
              <CartesianGrid stroke={T.line} strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke={T.dim} fontSize={11} />
              <YAxis stroke={T.dim} fontSize={11} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: T.panelSoft, border: `1px solid ${T.line}`, borderRadius: 8, color: T.text }} />
              <ReferenceLine y={99} stroke={T.green} strokeDasharray="4 4" />
              <ReferenceLine y={126} stroke={T.red} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="value" name="Glucose" stroke={T.gold} strokeWidth={2} dot={{ fill: T.gold, r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      )}
      {bp.length > 1 && (
        <Panel>
          <Eyebrow>Blood pressure trend (mmHg)</Eyebrow>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={bp}>
              <CartesianGrid stroke={T.line} strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke={T.dim} fontSize={11} />
              <YAxis stroke={T.dim} fontSize={11} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: T.panelSoft, border: `1px solid ${T.line}`, borderRadius: 8, color: T.text }} />
              <Legend />
              <ReferenceLine y={140} stroke={T.red} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="sys" name="Systolic" stroke={T.gold} strokeWidth={2} dot={{ r: 3, fill: T.gold }} />
              <Line type="monotone" dataKey="dia" name="Diastolic" stroke="#6FA8DC" strokeWidth={2} dot={{ r: 3, fill: "#6FA8DC" }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      )}

      {/* Latest lab panel */}
      {data.labs.length > 0 && (
        <Panel>
          <Eyebrow>Latest lab report — {data.labs[data.labs.length - 1].date}</Eyebrow>
          <LabTable lab={data.labs[data.labs.length - 1]} />
        </Panel>
      )}
    </>
  );
}

function LabTable({ lab }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {(lab.values || []).map((v, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 12, padding: "8px 10px",
          background: T.bg, borderRadius: 8, border: `1px solid ${T.line}`
        }}>
          <StatusDot status={v.status || "yellow"} />
          <div style={{ flex: 1, fontSize: 14 }}>{v.name}</div>
          <div style={{ fontWeight: 700, color: STATUS[v.status]?.color || T.text, fontSize: 14 }}>
            {v.value} {v.unit || ""}
          </div>
          {v.normalRange && <div style={{ fontSize: 11, color: T.dim }}>ref: {v.normalRange}</div>}
        </div>
      ))}
      {lab.summary && <div style={{ fontSize: 13, color: T.dim, lineHeight: 1.5, marginTop: 4 }}>{lab.summary}</div>}
    </div>
  );
}

/* ================================================================== */
/*  UPLOAD TAB                                                         */
/* ================================================================== */
function UploadTab({ data, update }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const fileRef = useRef(null);

  // Manual entry state
  const today = new Date().toISOString().slice(0, 10);
  const [gVal, setGVal] = useState(""); const [gDate, setGDate] = useState(today);
  const [sys, setSys] = useState(""); const [dia, setDia] = useState(""); const [bDate, setBDate] = useState(today);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setMsg(null);
    try {
      const b64 = await fileToBase64(file);
      const isPdf = file.type === "application/pdf";
      const block = isPdf
        ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } }
        : { type: "image", source: { type: "base64", media_type: file.type || "image/jpeg", data: b64 } };

      const prompt = `You are a clinical lab report analyzer. Extract all test results from this document.
Respond ONLY with raw JSON, no markdown, no preamble, in this exact shape:
{
 "date": "YYYY-MM-DD (the report/collection date; if absent use ${today})",
 "values": [
   {"name": "Test name", "value": "numeric or text result", "unit": "unit or empty",
    "normalRange": "reference range or empty",
    "status": "green (within range) | yellow (borderline / slightly out) | red (clearly abnormal or critical)"}
 ],
 "summary": "2-3 sentence plain-English summary of what stands out",
 "glucose": numeric fasting/serum glucose in mg/dL if present else null,
 "systolic": numeric if blood pressure present else null,
 "diastolic": numeric if blood pressure present else null
}`;

      const text = await callClaude([{ role: "user", content: [block, { type: "text", text: prompt }] }]);
      const parsed = parseJSON(text);

      update(d => {
        const lab = {
          id: Date.now(), date: parsed.date || today, fileName: file.name,
          fileType: isPdf ? "pdf" : "image", values: parsed.values || [], summary: parsed.summary || ""
        };
        d.labs.push(lab);
        d.labs.sort((a, b) => a.date.localeCompare(b.date));
        d.docs.push({ id: lab.id, date: lab.date, kind: "Lab report", name: file.name, detail: `${(parsed.values || []).length} values extracted` });
        if (parsed.glucose) d.readings.push({ id: Date.now() + 1, type: "glucose", value: Number(parsed.glucose), date: lab.date, source: file.name });
        if (parsed.systolic && parsed.diastolic) d.readings.push({ id: Date.now() + 2, type: "bp", sys: Number(parsed.systolic), dia: Number(parsed.diastolic), date: lab.date, source: file.name });
        return d;
      });
      setMsg({ ok: true, text: `Report analyzed: ${(parsed.values || []).length} values extracted and categorized.` });
    } catch (err) {
      console.error(err);
      setMsg({ ok: false, text: "Could not analyze this file. Try a clearer photo or a text-based PDF." });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function addGlucose() {
    const v = Number(gVal);
    if (!v) return;
    update(d => {
      d.readings.push({ id: Date.now(), type: "glucose", value: v, date: gDate, source: "manual" });
      d.docs.push({ id: Date.now(), date: gDate, kind: "Glucose reading", name: `${v} mg/dL`, detail: "manual entry" });
      return d;
    });
    setGVal("");
    setMsg({ ok: true, text: "Glucose reading saved." });
  }
  function addBP() {
    const s = Number(sys), di = Number(dia);
    if (!s || !di) return;
    update(d => {
      d.readings.push({ id: Date.now(), type: "bp", sys: s, dia: di, date: bDate, source: "manual" });
      d.docs.push({ id: Date.now(), date: bDate, kind: "Blood pressure", name: `${s}/${di} mmHg`, detail: "manual entry" });
      return d;
    });
    setSys(""); setDia("");
    setMsg({ ok: true, text: "Blood pressure reading saved." });
  }

  return (
    <>
      <Panel>
        <Eyebrow>Upload lab report — photo or PDF</Eyebrow>
        <p style={{ fontSize: 13, color: T.dim, margin: "0 0 14px", lineHeight: 1.5 }}>
          The AI reads the document, extracts every value with its date, categorizes each one
          (<span style={{ color: T.green }}>green</span> / <span style={{ color: T.yellow }}>yellow</span> / <span style={{ color: T.red }}>red</span>),
          and feeds glucose and blood pressure into your trend charts automatically.
        </p>
        <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleFile} style={{ display: "none" }} id="labfile" />
        <Btn onClick={() => fileRef.current?.click()} disabled={busy}>
          {busy ? <Loader2 size={16} className="spin" /> : <Upload size={16} />}
          {busy ? "Analyzing report…" : "Choose photo or PDF"}
        </Btn>
        <span style={{ marginLeft: 12, fontSize: 12, color: T.dim }}>
          <ImageIcon size={12} style={{ verticalAlign: "-2px" }} /> JPG · PNG · <FileText size={12} style={{ verticalAlign: "-2px" }} /> PDF
        </span>
        {msg && (
          <div style={{ marginTop: 12, fontSize: 13, color: msg.ok ? T.green : T.red }}>
            {msg.text}
          </div>
        )}
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <Panel>
          <Eyebrow>Quick glucose entry</Eyebrow>
          <div style={{ display: "grid", gap: 10 }}>
            <input style={inputStyle} type="number" placeholder="Glucose (mg/dL)" value={gVal} onChange={e => setGVal(e.target.value)} />
            <input style={inputStyle} type="date" value={gDate} onChange={e => setGDate(e.target.value)} />
            <Btn onClick={addGlucose} kind="soft"><Plus size={15} /> Save reading</Btn>
          </div>
        </Panel>
        <Panel>
          <Eyebrow>Quick blood pressure entry</Eyebrow>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input style={inputStyle} type="number" placeholder="Systolic" value={sys} onChange={e => setSys(e.target.value)} />
              <input style={inputStyle} type="number" placeholder="Diastolic" value={dia} onChange={e => setDia(e.target.value)} />
            </div>
            <input style={inputStyle} type="date" value={bDate} onChange={e => setBDate(e.target.value)} />
            <Btn onClick={addBP} kind="soft"><Plus size={15} /> Save reading</Btn>
          </div>
        </Panel>
      </div>
    </>
  );
}

/* ================================================================== */
/*  MEDICATIONS                                                        */
/* ================================================================== */
function MedsTab({ data, update }) {
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [time, setTime] = useState("morning");

  function add() {
    if (!name.trim()) return;
    update(d => {
      d.meds.push({ id: Date.now(), name: name.trim(), dose: dose.trim(), time });
      return d;
    });
    setName(""); setDose("");
  }
  function remove(id) {
    update(d => { d.meds = d.meds.filter(m => m.id !== id); return d; });
  }

  const morning = data.meds.filter(m => m.time === "morning" || m.time === "both");
  const night = data.meds.filter(m => m.time === "night" || m.time === "both");

  const MedList = ({ items, icon: Icon, title, tint }) => (
    <Panel style={{ flex: 1, minWidth: 240 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Icon size={18} color={tint} />
        <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
        <span style={{ fontSize: 12, color: T.dim }}>({items.length})</span>
      </div>
      {items.length === 0 && <div style={{ fontSize: 13, color: T.dim }}>Nothing scheduled.</div>}
      <div style={{ display: "grid", gap: 8 }}>
        {items.map(m => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, background: T.bg, border: `1px solid ${T.line}`, borderRadius: 8, padding: "8px 10px" }}>
            <Pill size={14} color={tint} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</div>
              {m.dose && <div style={{ fontSize: 12, color: T.dim }}>{m.dose}</div>}
            </div>
            {m.time === "both" && <span style={{ fontSize: 10, color: T.gold, border: `1px solid ${T.gold}66`, borderRadius: 6, padding: "2px 6px" }}>2×/day</span>}
            <button onClick={() => remove(m.id)} aria-label="Delete medication" style={{ background: "none", border: "none", cursor: "pointer", color: T.dim }}>
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </Panel>
  );

  return (
    <>
      <Panel>
        <Eyebrow>Add medication</Eyebrow>
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "2fr 1.5fr 1fr auto", alignItems: "center" }}>
          <input style={inputStyle} placeholder="Medication name" value={name} onChange={e => setName(e.target.value)} />
          <input style={inputStyle} placeholder="Dose (e.g. 500 mg)" value={dose} onChange={e => setDose(e.target.value)} />
          <select style={inputStyle} value={time} onChange={e => setTime(e.target.value)}>
            <option value="morning">Morning</option>
            <option value="night">Night</option>
            <option value="both">Twice a day</option>
          </select>
          <Btn onClick={add}><Plus size={15} /> Add</Btn>
        </div>
      </Panel>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <MedList items={morning} icon={Sun} title="Day — morning" tint={T.gold} />
        <MedList items={night} icon={Moon} title="Night — evening" tint="#6FA8DC" />
      </div>
    </>
  );
}

/* ================================================================== */
/*  HISTORY                                                            */
/* ================================================================== */
function HistoryTab({ data, update }) {
  const items = [...data.docs].sort((a, b) => b.date.localeCompare(a.date));

  function downloadReport() {
    const rows = items.map(i => `<tr><td>${i.date}</td><td>${i.kind}</td><td>${i.name}</td><td>${i.detail || ""}</td></tr>`).join("");
    const labBlocks = data.labs.map(l => `
      <h3>Lab report — ${l.date} (${l.fileName || ""})</h3>
      <table><tr><th>Test</th><th>Result</th><th>Reference</th><th>Status</th></tr>
      ${(l.values || []).map(v => `<tr><td>${v.name}</td><td>${v.value} ${v.unit || ""}</td><td>${v.normalRange || ""}</td><td style="color:${STATUS[v.status]?.color || "#888"}">${(v.status || "").toUpperCase()}</td></tr>`).join("")}
      </table><p>${l.summary || ""}</p>`).join("");
    const meds = data.meds.map(m => `<li>${m.name} ${m.dose || ""} — ${m.time === "both" ? "twice a day" : m.time}</li>`).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Health Report</title>
      <style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;color:#1a2538}
      h1{border-bottom:3px solid #C9A24B;padding-bottom:8px} table{width:100%;border-collapse:collapse;margin:10px 0}
      td,th{border:1px solid #ccc;padding:6px 10px;font-size:13px;text-align:left}</style></head><body>
      <h1>Personal Health Report</h1><p>Generated ${new Date().toLocaleString()}</p>
      <h2>Activity history</h2><table><tr><th>Date</th><th>Type</th><th>Item</th><th>Detail</th></tr>${rows}</table>
      <h2>Lab reports</h2>${labBlocks || "<p>None.</p>"}
      <h2>Current medications</h2><ul>${meds || "<li>None.</li>"}</ul>
      <p style="font-size:11px;color:#777">For personal records only — not medical advice.</p></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `health-report-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function removeItem(id) {
    update(d => {
      d.docs = d.docs.filter(x => x.id !== id);
      d.labs = d.labs.filter(x => x.id !== id);
      return d;
    });
  }

  return (
    <Panel>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <Eyebrow>Everything you've uploaded or recorded</Eyebrow>
        <Btn onClick={downloadReport} kind="soft"><Download size={15} /> Download full report (print to PDF)</Btn>
      </div>
      {items.length === 0 && <div style={{ color: T.dim, fontSize: 13 }}>Your history is empty. Upload a lab report or add a reading to start.</div>}
      <div style={{ display: "grid", gap: 8 }}>
        {items.map(i => (
          <div key={i.id} style={{ display: "flex", alignItems: "center", gap: 12, background: T.bg, border: `1px solid ${T.line}`, borderRadius: 8, padding: "10px 12px" }}>
            <FolderClock size={16} color={T.gold} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{i.kind}: {i.name}</div>
              <div style={{ fontSize: 12, color: T.dim }}>{i.date} {i.detail ? `· ${i.detail}` : ""}</div>
            </div>
            <button onClick={() => removeItem(i.id)} aria-label="Delete entry" style={{ background: "none", border: "none", cursor: "pointer", color: T.dim }}>
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ================================================================== */
/*  AI DOCTOR CHAT                                                     */
/* ================================================================== */
function DoctorTab({ data, update }) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [data.chat.length, busy]);

  function buildContext() {
    const g = data.readings.filter(r => r.type === "glucose").slice(-10);
    const bp = data.readings.filter(r => r.type === "bp").slice(-10);
    const lastLab = data.labs[data.labs.length - 1];
    return `PATIENT CONTEXT (personal tracking app data):
Recent glucose (mg/dL): ${g.map(r => `${r.date}: ${r.value}`).join("; ") || "none"}
Recent blood pressure: ${bp.map(r => `${r.date}: ${r.sys}/${r.dia}`).join("; ") || "none"}
Latest lab (${lastLab?.date || "none"}): ${lastLab ? lastLab.values.map(v => `${v.name}=${v.value}${v.unit || ""} [${v.status}]`).join("; ") : "none"}
Medications: ${data.meds.map(m => `${m.name} ${m.dose || ""} (${m.time})`).join("; ") || "none"}`;
  }

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    update(d => { d.chat.push({ role: "user", text: q, ts: Date.now() }); return d; });
    setBusy(true);
    try {
      const history = [...data.chat, { role: "user", text: q }].slice(-12)
        .map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
      const sys = `You are Dr. Assistant, a careful clinical analysis AI inside a personal health-tracking app. Analyze the patient's own data, explain values plainly, flag anything concerning, and always remind that final decisions belong to their real physician. Be direct and concise. Lead with what matters most, not validation.\n\n${buildContext()}`;
      history[history.length - 1].content = sys + "\n\nPATIENT QUESTION: " + q;
      const text = await callClaude(history);
      update(d => { d.chat.push({ role: "ai", text, ts: Date.now() }); return d; });
    } catch (e) {
      update(d => { d.chat.push({ role: "ai", text: "Connection error — try again.", ts: Date.now() }); return d; });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel style={{ display: "flex", flexDirection: "column", height: 540 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Stethoscope size={18} color={T.gold} />
        <span style={{ fontWeight: 700 }}>AI Doctor</span>
        <span style={{ fontSize: 11, color: T.green, display: "flex", alignItems: "center", gap: 5 }}>
          <StatusDot status="green" size={7} /> ready — sees your latest data
        </span>
        {data.chat.length > 0 && (
          <button onClick={() => update(d => { d.chat = []; return d; })}
            style={{ marginLeft: "auto", background: "none", border: "none", color: T.dim, fontSize: 12, cursor: "pointer" }}>
            Clear chat
          </button>
        )}
      </div>
      <div style={{ flex: 1, overflowY: "auto", display: "grid", gap: 10, alignContent: "start", paddingRight: 4 }}>
        {data.chat.length === 0 && (
          <div style={{ color: T.dim, fontSize: 13, lineHeight: 1.6 }}>
            Ask anything about your results — for example: "Analyze my latest labs",
            "Is my glucose trend improving?", "Which of my values should worry me most?"
          </div>
        )}
        {data.chat.map((m, i) => (
          <div key={i} style={{
            justifySelf: m.role === "user" ? "end" : "start",
            maxWidth: "85%", background: m.role === "user" ? T.gold : T.panelSoft,
            color: m.role === "user" ? "#13223A" : T.text,
            borderRadius: 12, padding: "10px 14px", fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-wrap"
          }}>{m.text}</div>
        ))}
        {busy && <div style={{ color: T.dim, fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}><Loader2 size={14} className="spin" /> Analyzing…</div>}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input style={{ ...inputStyle, flex: 1 }} placeholder="Ask the AI doctor…" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") send(); }} />
        <Btn onClick={send} disabled={busy || !input.trim()}><Send size={15} /></Btn>
      </div>
    </Panel>
  );
}

/* ================================================================== */
/*  NEWS                                                               */
/* ================================================================== */
const THREE_HOURS = 3 * 60 * 60 * 1000;

function NewsTab({ data, update }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const fetchNews = useCallback(async () => {
    setBusy(true); setErr(null);
    try {
      const prompt = `Search the web for today's most important health news on: longevity research, blood sugar / diabetes management, blood pressure / cardiovascular health, and major medical breakthroughs.
After searching, respond ONLY with raw JSON (no markdown fences, no preamble):
{"items":[{"title":"...","summary":"2 sentences in your own words","source":"publication name","topic":"longevity|glucose|cardio|breakthrough"}]}
Return 5-6 items, most important first.`;
      const text = await callClaude(
        [{ role: "user", content: prompt }],
        [{ type: "web_search_20250305", name: "web_search" }]
      );
      const parsed = parseJSON(text);
      update(d => { d.news = { items: parsed.items || [], fetchedAt: Date.now() }; return d; });
    } catch (e) {
      console.error(e);
      setErr("Could not load news right now. Try refresh again.");
    } finally {
      setBusy(false);
    }
  }, [update]);

  // Auto-refresh every 3 hours while the app is open; also refresh if stale on open
  useEffect(() => {
    if (!data.news || Date.now() - data.news.fetchedAt > THREE_HOURS) fetchNews();
    const id = setInterval(fetchNews, THREE_HOURS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topicColor = { longevity: T.gold, glucose: T.green, cardio: "#E5544B", breakthrough: "#6FA8DC" };

  return (
    <Panel>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <Eyebrow>Health news — longevity · glucose · cardio</Eyebrow>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          {data.news && <span style={{ fontSize: 11, color: T.dim }}>Updated {new Date(data.news.fetchedAt).toLocaleTimeString()}</span>}
          <Btn onClick={fetchNews} disabled={busy} kind="soft">
            {busy ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />} Refresh
          </Btn>
        </div>
      </div>
      <div style={{ fontSize: 11, color: T.dim, marginBottom: 12 }}>
        Auto-refreshes every 3 hours while the app is open.
      </div>
      {err && <div style={{ color: T.red, fontSize: 13, marginBottom: 10 }}>{err}</div>}
      {busy && !data.news && <div style={{ color: T.dim, fontSize: 13 }}><Loader2 size={14} className="spin" style={{ verticalAlign: "-2px" }} /> Searching the latest health news…</div>}
      <div style={{ display: "grid", gap: 10 }}>
        {(data.news?.items || []).map((n, i) => (
          <div key={i} style={{ background: T.bg, border: `1px solid ${T.line}`, borderLeft: `3px solid ${topicColor[n.topic] || T.gold}`, borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: 14, flex: 1, minWidth: 200 }}>{n.title}</span>
              <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: topicColor[n.topic] || T.gold }}>{n.topic}</span>
            </div>
            <div style={{ fontSize: 13, color: T.dim, lineHeight: 1.55, marginTop: 4 }}>{n.summary}</div>
            {n.source && <div style={{ fontSize: 11, color: T.dim, marginTop: 6, fontStyle: "italic" }}>{n.source}</div>}
          </div>
        ))}
      </div>
    </Panel>
  );
}
