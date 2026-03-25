import api from './api';
import type { Medication, DoseLog } from '@/types';

interface MedResponse { success: boolean; data: Medication }
interface MedListResponse { success: boolean; data: Medication[] }
interface MedDetailResponse {
  success: boolean;
  data: {
    medication: Medication;
    progress: number;
    takenDoses: number;
    totalDoses: number;
  };
}
interface DoseListResponse { success: boolean; data: DoseLog[] }
interface DoseResponse { success: boolean; data: DoseLog }

export const medicationsService = {
  /** Get all medication treatments for a pet */
  getAll: async (petId: string): Promise<MedListResponse> => {
    const res = await api.get(`/medications/pet/${petId}`);
    return res.data;
  },

  /** Get single medication with progress info */
  getById: async (id: string): Promise<MedDetailResponse> => {
    const res = await api.get(`/medications/${id}`);
    return res.data;
  },

  /** Create a new medication treatment */
  create: async (
    data: Omit<Medication, '_id' | 'createdBy' | 'status'>,
  ): Promise<MedResponse> => {
    const res = await api.post('/medications', data);
    return res.data;
  },

  /** Update a medication treatment (uses PATCH per backend spec) */
  update: async (
    id: string,
    data: Partial<Medication>,
  ): Promise<MedResponse> => {
    const res = await api.patch(`/medications/${id}`, data);
    return res.data;
  },

  /** Delete a medication treatment and all dose logs */
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/medications/${id}`);
    return res.data;
  },

  // ─── Dose tracking ───────────────────────────────────────────

  /** Mark a dose as taken */
  markDose: async (doseId: string): Promise<DoseResponse> => {
    const res = await api.post(`/medications/dose/${doseId}`);
    return res.data;
  },

  /** Get all dose logs for a medication */
  getDoses: async (medicationId: string): Promise<DoseListResponse> => {
    const res = await api.get(`/medications/${medicationId}/doses`);
    return res.data;
  },

  /** Update a dose log (e.g. mark missed, fix taken time) */
  updateDose: async (
    doseId: string,
    data: { status?: string; takenTime?: string },
  ): Promise<DoseResponse> => {
    const res = await api.patch(`/medications/dose/${doseId}`, data);
    return res.data;
  },
};
