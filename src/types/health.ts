export interface HealthProfile {
  surgeries: string[];
  vaccines: string[];
  allergies: string[];
  emergencyContacts: { name: string; phone: string; relation: string }[];
  insurance: { provider: string; policyNumber: string };
  documents: { id: string; name: string; type: 'pdf' | 'image'; date: string; category: string }[];
}

export interface GlucoseData {
  timestamp: string;
  value: number; // mg/dL
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
