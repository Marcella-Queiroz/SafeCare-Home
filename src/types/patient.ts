// Tipos e interfaces compartilhados para entidades de pacientes

export interface Metric {
  id?: string;
  value: number;
  date: string;
  time?: string;
  authorId?: string;
  authorName?: string;
}

export interface BloodPressure extends Metric {
  systolic: number;
  diastolic: number;
}

export interface Patient {
  id: string;
  name: string;
  cpf: string;
  status?: string;
  age: number;
  birthDate?: string;
  gender?: string;
  address?: string;
  phone?: string;
  conditions: string[];
  weight?: Metric[];
  glucose?: Metric[];
  temperature?: Metric[];
  bloodPressure?: BloodPressure[];
  heartRate?: Metric[];
  oxygen?: Metric[];
  lastCheck?: string;
  medications?: any[];
  appointments?: any[];
  observations?: any[];
  createdBy?: string;
  editedBy?: string;
  editedAt?: string;
}

export interface Observation {
  id?: string;
  text: string;
  date: string;
  time: string;
  authorId?: string;
  authorName?: string;
  createdAt?: string;
  createdBy?: string;
  editedBy?: string;
}

export interface Appointment {
  id?: string;
  title: string;
  date: string;
  time: string;
  description?: string;
  authorId?: string;
  authorName?: string;
}

export interface Medication {
  id?: string;
  name: string;
  dosage: string;
  frequency: string;
  notes?: string;
  authorId?: string;
  authorName?: string;
}
