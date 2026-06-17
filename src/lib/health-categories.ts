export const LAB_CATEGORIES = [
  { id: 'blood_work', label: 'Blood Work', color: '#ef4444', icon: 'Droplets' },
  { id: 'metabolic', label: 'Metabolic Panel', color: '#f59e0b', icon: 'Flame' },
  { id: 'lipid', label: 'Lipid Panel', color: '#8b5cf6', icon: 'Heart' },
  { id: 'thyroid', label: 'Thyroid', color: '#0ea5e9', icon: 'Activity' },
  { id: 'vitamin', label: 'Vitamins', color: '#10b981', icon: 'Sun' },
  { id: 'hormone', label: 'Hormones', color: '#ec4899', icon: 'Zap' },
  { id: 'urinalysis', label: 'Urinalysis', color: '#6366f1', icon: 'Beaker' },
  { id: 'imaging', label: 'Imaging', color: '#14b8a6', icon: 'Scan' },
  { id: 'stelo', label: 'Stelo CGM', color: '#f97316', icon: 'TrendingUp' },
  { id: 'other', label: 'Other', color: '#6b7280', icon: 'FileText' },
] as const

export const SUGAR_UNITS = [
  { value: 'mg/dL', label: 'mg/dL' },
  { value: 'mmol/L', label: 'mmol/L' },
] as const

export const TIME_OF_DAY = [
  { value: 'morning', label: 'Morning 🌅', time: '06:00-11:59' },
  { value: 'afternoon', label: 'Afternoon ☀️', time: '12:00-16:59' },
  { value: 'evening', label: 'Evening 🌆', time: '17:00-20:59' },
  { value: 'night', label: 'Night 🌙', time: '21:00-05:59' },
] as const

export const MEAL_TYPE = [
  { value: 'fasting', label: 'Fasting' },
  { value: 'before_meal', label: 'Before Meal' },
  { value: 'after_meal', label: 'After Meal (1h)' },
  { value: 'after_meal_2h', label: 'After Meal (2h)' },
  { value: 'bedtime', label: 'Bedtime' },
] as const

export const MEDICATION_FREQUENCY = [
  { value: 'morning', label: 'Morning Only 🌅' },
  { value: 'evening', label: 'Evening Only 🌙' },
  { value: 'both', label: 'Morning & Evening 🌅🌙' },
] as const

export function getSugarStatus(value: number, unit: string = 'mg/dL'): { status: string; color: string } {
  const mgdl = unit === 'mmol/L' ? value * 18 : value
  if (mgdl < 70) return { status: 'Low', color: '#ef4444' }
  if (mgdl < 100) return { status: 'Normal', color: '#10b981' }
  if (mgdl < 126) return { status: 'Elevated', color: '#f59e0b' }
  if (mgdl < 180) return { status: 'High', color: '#f97316' }
  return { status: 'Very High', color: '#ef4444' }
}

export function getBPStatus(systolic: number, diastolic: number): { status: string; color: string } {
  if (systolic < 90 || diastolic < 60) return { status: 'Low', color: '#f59e0b' }
  if (systolic < 120 && diastolic < 80) return { status: 'Normal', color: '#10b981' }
  if (systolic < 130 && diastolic < 80) return { status: 'Elevated', color: '#fbbf24' }
  if (systolic < 140 || diastolic < 90) return { status: 'Stage 1', color: '#f97316' }
  if (systolic < 180 && diastolic < 120) return { status: 'Stage 2', color: '#ef4444' }
  return { status: 'Crisis', color: '#7f1d1d' }
}

export function getCategoryById(id: string) {
  return LAB_CATEGORIES.find(c => c.id === id) || LAB_CATEGORIES[9]
}
