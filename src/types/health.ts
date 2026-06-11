export interface HealthProfile {
  surgeries: string[];
  vaccines: string[];
  allergies: string[];
  emergencyContacts: { name: string; phone: string; relation: string }[];
  insurance: { provider: string; policyNumber: string };
  documents: { id: string; name: string; type: 'pdf' | 'image'; date: string; category: string }[];
}

export interface LabTest {
  id: string;
  name: string;
  value: number;
  unit: string;
  date: string;
  normalMin?: number;
  normalMax?: number;
  warningMin?: number;
  warningMax?: number;
  status: 'normal' | 'warning' | 'critical';
  previousValue?: number;
  previousDate?: string;
  previousStatus?: 'normal' | 'warning' | 'critical';
}

export interface GlucoseReading {
  id: string;
  timestamp: string; // ISO datetime
  value: number; // mg/dL
  mealType?: 'fasting' | 'before-meal' | 'after-meal';
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dose: string;
  schedule: { morning: boolean; afternoon: boolean; night: boolean };
  doctor: string;
  startDate: string;
  endDate: string;
  notes: string;
  remindersActive: boolean;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  hospital: string;
  phone: string;
  email?: string;
  address?: string;
  license?: string;
}
