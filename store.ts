// GlucoTrack Pro v2.0 — Hospital-grade data layer
// All data stored locally via localStorage. No server required.

const KEYS = {
  GLUCOSE: 'gp_glucose',
  LABS: 'gp_labs',
  MEDS: 'gp_meds',
  CHAT: 'gp_chat',
  PROFILE: 'gp_profile',
  APIKEY: 'gp_apikey',
};

function load(key: string, fallback: any): any {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, data: any): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

// ─── Glucose ─────────────────────────────────────────────
export function getGlucose(): any[] {
  return load(KEYS.GLUCOSE, []);
}
export function addGlucose(entry: any): void {
  const list = getGlucose();
  list.push(entry);
  save(KEYS.GLUCOSE, list);
}
export function removeGlucose(id: string): void {
  save(KEYS.GLUCOSE, getGlucose().filter((r: any) => r.id !== id));
}

// ─── Labs ────────────────────────────────────────────────
export function getLabs(): any[] {
  return load(KEYS.LABS, []);
}
export function addLab(entry: any): void {
  const list = getLabs();
  list.push(entry);
  save(KEYS.LABS, list);
}
export function removeLab(id: string): void {
  save(KEYS.LABS, getLabs().filter((r: any) => r.id !== id));
}

// ─── Medications ─────────────────────────────────────────
export function getMeds(): any[] {
  return load(KEYS.MEDS, []);
}
export function addMed(entry: any): void {
  const list = getMeds();
  list.push(entry);
  save(KEYS.MEDS, list);
}
export function updateMed(id: string, updates: any): void {
  save(KEYS.MEDS, getMeds().map((m: any) => (m.id === id ? { ...m, ...updates } : m)));
}
export function removeMed(id: string): void {
  save(KEYS.MEDS, getMeds().filter((m: any) => m.id !== id));
}

// ─── Chat ────────────────────────────────────────────────
export function getChat(): any[] {
  return load(KEYS.CHAT, []);
}
export function addChat(msg: any): void {
  const list = getChat();
  list.push(msg);
  save(KEYS.CHAT, list);
}
export function clearChat(): void {
  save(KEYS.CHAT, []);
}

// ─── Profile ─────────────────────────────────────────────
export function getProfile(): any {
  return load(KEYS.PROFILE, {
    name: 'Mikail KOCAK',
    birthDate: '1979-07-23',
    photoUrl: '',
  });
}
export function saveProfile(p: any): void {
  save(KEYS.PROFILE, p);
}

// ─── API Key ─────────────────────────────────────────────
export function getApiKey(): string {
  return load(KEYS.APIKEY, '');
}
export function saveApiKey(k: string): void {
  save(KEYS.APIKEY, k);
}

// ─── Clinical Calculations ───────────────────────────────
// HbA1c estimation (ADAG Study formula)
// HbA1c(%) = (Average Glucose mg/dL + 46.7) / 28.7
export function estimateHbA1c(avgGlucose: number): number {
  if (avgGlucose <= 0) return 0;
  return Math.round(((avgGlucose + 46.7) / 28.7) * 10) / 10;
}

// Lab result status classification (hospital standard)
export function classifyLab(value: number, refMin: number, refMax: number): string {
  const range = refMax - refMin;
  if (value < refMin * 0.7 || value > refMax * 1.3) return 'critical';
  if (value < refMin - range * 0.1) return 'low';
  if (value > refMax + range * 0.1) return 'high';
  if (value < refMin || value > refMax) return 'borderline';
  return 'normal';
}
