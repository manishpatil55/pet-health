import type { Medication, DewormingRecord, VetVisit, WeightEntry } from '@/types';

export const mockMedications: Medication[] = [
  {
    _id: 'med-1',
    pet: 'pet-1',
    medicineName: 'Apoquel (Oclacitinib)',
    dosage: '16mg',
    frequency: 'once-daily',
    startDate: '2025-02-01',
    endDate: '2025-04-01',
    notes: 'For seasonal allergies — take with food',
    status: 'active',
  },
  {
    _id: 'med-2',
    pet: 'pet-1',
    medicineName: 'Omega-3 Fish Oil',
    dosage: '1000mg',
    frequency: 'once-daily',
    startDate: '2025-01-01',
    endDate: '2025-06-30',
    status: 'active',
  },
  {
    _id: 'med-3',
    pet: 'pet-1',
    medicineName: 'Amoxicillin',
    dosage: '250mg',
    frequency: 'twice-daily',
    startDate: '2024-11-10',
    endDate: '2024-11-20',
    status: 'completed',
  },
];

export const mockDeworming: DewormingRecord[] = [
  {
    _id: 'dew-1',
    petId: 'pet-1',
    dateAdministered: '2025-01-15',
    productName: 'Drontal Plus',
    administeredBy: 'Dr. Sharma',
    notes: 'Routine quarterly deworming',
  },
];

export const mockVetVisits: VetVisit[] = [
  {
    _id: 'vet-1',
    pet: 'pet-1',
    visitDate: '2025-02-14',
    clinicName: 'PetCare Clinic, Pune',
    veterinarianName: 'Dr. Priya Sharma',
    diagnosis: 'Seasonal allergies with mild skin inflammation',
    treatment:
      'Prescribed Apoquel 16mg. Recommended omega-3 supplementation. Dietary review advised.',
    cost: 1200,
    notes:
      'Follow up in 6 weeks if symptoms persist. Keep away from grass during spring.',
  },
  {
    _id: 'vet-2',
    pet: 'pet-1',
    visitDate: '2024-10-05',
    clinicName: 'Paws & Claws Vet Centre, Pune',
    veterinarianName: 'Dr. Ankit Mehta',
    diagnosis: 'Routine annual checkup — healthy',
    treatment:
      'Full physical examination. Blood work normal. Updated vaccination records.',
    cost: 800,
  },
];

export const mockWeightEntries: WeightEntry[] = [
  { _id: 'w-1', petId: 'pet-1', recordedDate: '2024-10-05', weight: 26.8, unit: 'kg' },
  { _id: 'w-2', petId: 'pet-1', recordedDate: '2024-11-12', weight: 27.2, unit: 'kg' },
  { _id: 'w-3', petId: 'pet-1', recordedDate: '2024-12-08', weight: 27.6, unit: 'kg' },
  { _id: 'w-4', petId: 'pet-1', recordedDate: '2025-01-05', weight: 27.9, unit: 'kg' },
  { _id: 'w-5', petId: 'pet-1', recordedDate: '2025-01-28', weight: 28.0, unit: 'kg' },
  { _id: 'w-6', petId: 'pet-1', recordedDate: '2025-02-18', weight: 28.3, unit: 'kg' },
  { _id: 'w-7', petId: 'pet-1', recordedDate: '2025-03-10', weight: 28.5, unit: 'kg' },
];
