import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { format, subDays } from 'date-fns'

export interface SugarReading {
  id: string
  value: number
  unit: string
  date: string
  timeOfDay: string
  mealType: string
  notes: string
  imageUrl?: string
}

export interface BloodPressureReading {
  id: string
  systolic: number
  diastolic: number
  pulse?: number
  date: string
  timeOfDay: string
  notes: string
}

export interface LabResult {
  id: string
  title: string
  category: string
  date: string
  fileUrl?: string
  fileType?: string
  rawText?: string
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: string
  active: boolean
  notes?: string
  takenToday?: boolean
  lastTaken?: string
}

export interface MedicationLog {
  id: string
  medicationId: string
  takenAt: string
  timeOfDay: string
  notes?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  sessionId: string
}

export interface HealthNews {
  id: string
  title: string
  content: string
  category: string
  sourceUrl?: string
  publishedAt: string
}

const STORAGE_KEYS = {
  sugar: 'vitatrack_sugar',
  bp: 'vitatrack_bp',
  labs: 'vitatrack_labs',
  medications: 'vitatrack_medications',
  medLogs: 'vitatrack_med_logs',
  chat: 'vitatrack_chat',
  news: 'vitatrack_news',
  user: 'vitatrack_user',
}

function load<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch {
    return defaultValue
  }
}

function save<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export function useHealthData() {
  const [sugarReadings, setSugarReadings] = useState<SugarReading[]>([])
  const [bpReadings, setBpReadings] = useState<BloodPressureReading[]>([])
  const [labResults, setLabResults] = useState<LabResult[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const [medLogs, setMedLogs] = useState<MedicationLog[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [news, setNews] = useState<HealthNews[]>([])
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    setSugarReadings(load(STORAGE_KEYS.sugar, []))
    setBpReadings(load(STORAGE_KEYS.bp, []))
    setLabResults(load(STORAGE_KEYS.labs, []))
    setMedications(load(STORAGE_KEYS.medications, []))
    setMedLogs(load(STORAGE_KEYS.medLogs, []))
    setChatMessages(load(STORAGE_KEYS.chat, []))
    setNews(load(STORAGE_KEYS.news, []))
    setInitialized(true)
  }, [])

  useEffect(() => { if (initialized) save(STORAGE_KEYS.sugar, sugarReadings) }, [sugarReadings, initialized])
  useEffect(() => { if (initialized) save(STORAGE_KEYS.bp, bpReadings) }, [bpReadings, initialized])
  useEffect(() => { if (initialized) save(STORAGE_KEYS.labs, labResults) }, [labResults, initialized])
  useEffect(() => { if (initialized) save(STORAGE_KEYS.medications, medications) }, [medications, initialized])
  useEffect(() => { if (initialized) save(STORAGE_KEYS.medLogs, medLogs) }, [medLogs, initialized])
  useEffect(() => { if (initialized) save(STORAGE_KEYS.chat, chatMessages) }, [chatMessages, initialized])
  useEffect(() => { if (initialized) save(STORAGE_KEYS.news, news) }, [news, initialized])

  const addSugarReading = useCallback((data: Omit<SugarReading, 'id'>) => {
    const reading: SugarReading = { id: uuidv4(), ...data }
    setSugarReadings(prev => [reading, ...prev])
    return reading
  }, [])

  const addBPReading = useCallback((data: Omit<BloodPressureReading, 'id'>) => {
    const reading: BloodPressureReading = { id: uuidv4(), ...data }
    setBpReadings(prev => [reading, ...prev])
    return reading
  }, [])

  const addLabResult = useCallback((data: Omit<LabResult, 'id'>) => {
    const lab: LabResult = { id: uuidv4(), ...data }
    setLabResults(prev => [lab, ...prev])
    return lab
  }, [])

  const addMedication = useCallback((data: Omit<Medication, 'id'>) => {
    const med: Medication = { id: uuidv4(), ...data }
    setMedications(prev => [med, ...prev])
    return med
  }, [])

  const takeMedication = useCallback((medId: string, timeOfDay: string) => {
    const log: MedicationLog = { id: uuidv4(), medicationId: medId, takenAt: new Date().toISOString(), timeOfDay }
    setMedLogs(prev => [log, ...prev])
    setMedications(prev => prev.map(m => m.id === medId ? { ...m, takenToday: true, lastTaken: new Date().toISOString() } : m))
    return log
  }, [])

  const addChatMessage = useCallback((data: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const msg: ChatMessage = { id: uuidv4(), timestamp: new Date().toISOString(), ...data }
    setChatMessages(prev => [...prev, msg])
    return msg
  }, [])

  const addNews = useCallback((data: Omit<HealthNews, 'id'>) => {
    const item: HealthNews = { id: uuidv4(), ...data }
    setNews(prev => [item, ...prev])
    return item
  }, [])

  const deleteSugarReading = useCallback((id: string) => {
    setSugarReadings(prev => prev.filter(r => r.id !== id))
  }, [])

  const deleteBPReading = useCallback((id: string) => {
    setBpReadings(prev => prev.filter(r => r.id !== id))
  }, [])

  const deleteLabResult = useCallback((id: string) => {
    setLabResults(prev => prev.filter(r => r.id !== id))
  }, [])

  const deleteMedication = useCallback((id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id))
    setMedLogs(prev => prev.filter(l => l.medicationId !== id))
  }, [])

  const clearChat = useCallback((sessionId: string) => {
    setChatMessages(prev => prev.filter(m => m.sessionId !== sessionId))
  }, [])

  const getTodaySugar = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return sugarReadings.filter(r => r.date.startsWith(today))
  }, [sugarReadings])

  const getTodayBP = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return bpReadings.filter(r => r.date.startsWith(today))
  }, [bpReadings])

  const getSugarStats = useCallback((days: number = 7) => {
    const since = subDays(new Date(), days)
    const recent = sugarReadings.filter(r => new Date(r.date) >= since)
    if (recent.length === 0) return null
    const values = recent.map(r => r.value)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    return { avg, min, max, count: recent.length }
  }, [sugarReadings])

  const getBPStats = useCallback((days: number = 7) => {
    const since = subDays(new Date(), days)
    const recent = bpReadings.filter(r => new Date(r.date) >= since)
    if (recent.length === 0) return null
    const systolic = recent.map(r => r.systolic)
    const diastolic = recent.map(r => r.diastolic)
    return {
      avgSystolic: Math.round(systolic.reduce((a, b) => a + b, 0) / systolic.length),
      avgDiastolic: Math.round(diastolic.reduce((a, b) => a + b, 0) / diastolic.length),
      count: recent.length,
    }
  }, [bpReadings])

  const getLabsByCategory = useCallback(() => {
    const grouped: Record<string, LabResult[]> = {}
    labResults.forEach(lab => {
      if (!grouped[lab.category]) grouped[lab.category] = []
      grouped[lab.category].push(lab)
    })
    return grouped
  }, [labResults])

  const getTodayMedications = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const takenIds = new Set(medLogs.filter(l => l.takenAt.startsWith(today)).map(l => l.medicationId))
    return medications.filter(m => m.active).map(m => ({
      ...m,
      morningTaken: takenIds.has(m.id) && m.frequency !== 'evening',
      eveningTaken: takenIds.has(m.id) && m.frequency !== 'morning',
    }))
  }, [medications, medLogs])

  return {
    sugarReadings,
    bpReadings,
    labResults,
    medications,
    medLogs,
    chatMessages,
    news,
    addSugarReading,
    addBPReading,
    addLabResult,
    addMedication,
    takeMedication,
    addChatMessage,
    addNews,
    deleteSugarReading,
    deleteBPReading,
    deleteLabResult,
    deleteMedication,
    clearChat,
    getTodaySugar,
    getTodayBP,
    getSugarStats,
    getBPStats,
    getLabsByCategory,
    getTodayMedications,
  }
}
