// ─── User & Auth ────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

// ─── Pet ────────────────────────────────────────────────────

export interface Pet {
  _id: string;
  owner: string;
  name: string;
  type: 'Dog' | 'Cat' | 'Other';
  breed: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  initialWeight: number;
  photo?: string;
  microchipId?: string;
}

// ─── Vaccination ────────────────────────────────────────────

export type VaccinationStatus = 'completed' | 'upcoming' | 'overdue';

export interface VaccinationDocument {
  url: string;
  type: 'image' | 'pdf';
  uploadedAt: string;
}

export interface Vaccination {
  _id: string;
  pet: string;
  vaccineTemplate?: string;
  vaccineName: string;
  dateAdministered?: string;
  nextDueDate: string;
  veterinarianName?: string;
  clinicName?: string;
  notes?: string;
  documents?: VaccinationDocument[];
  createdBy: string;
  status: VaccinationStatus;
}

// ─── Medication ─────────────────────────────────────────────

export type MedicationFrequency = 'once-daily' | 'twice-daily' | 'three-times' | 'custom';
export type MedicationStatus = 'active' | 'ongoing' | 'completed' | 'stopped';

export interface Medication {
  _id: string;
  pet: string;
  medicineName: string;
  dosage: string;
  frequency: MedicationFrequency;
  startDate: string;
  endDate: string;
  customIntervalHours?: number;
  notes?: string;
  status: MedicationStatus;
  createdBy?: string;
}

// ─── Dose Log ───────────────────────────────────────────────

export type DoseStatus = 'pending' | 'taken' | 'missed';

export interface DoseLog {
  _id: string;
  medication: string;
  scheduledTime: string;
  status: DoseStatus;
  takenTime?: string;
}

// ─── Deworming ──────────────────────────────────────────────

export type DewormingFrequency = 'monthly' | 'bi-monthly' | 'quarterly' | 'custom' | string;
export type DewormingStatus = 'completed' | 'upcoming' | 'overdue';

export interface DewormingSchedule {
  _id: string;
  petId: string;
  frequency: DewormingFrequency;
}

export interface DewormingRecord {
  _id: string;
  petId: string;
  dateAdministered: string;
  productName: string;
  administeredBy: string;
  notes?: string;
  // added locally by frontend hooks for UI purposes if needed, though usually omitted from raw Record
  status?: DewormingStatus;
}

// ─── Vet Visit ──────────────────────────────────────────────

export interface VetVisit {
  _id: string;
  pet: string;
  visitDate: string;
  clinicName: string;
  veterinarianName: string;
  diagnosis: string;
  treatment: string;
  treatmentDetails?: string;
  cost?: number;
  notes?: string;
  documents?: VaccinationDocument[];
}

// ─── Weight ─────────────────────────────────────────────────

export type WeightUnit = 'kg' | 'lbs';

export interface WeightEntry {
  _id: string;
  pet: string;
  date: string;
  weight: number;
  unit: WeightUnit;
}

// ─── API ────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  data: T[];
  page: number;
  pages: number;
  total: number;
}

export interface ApiError {
  success: false;
  code: string;
  message: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}
