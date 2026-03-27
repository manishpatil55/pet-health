import api from './api';
import type { WeightEntry } from '@/types';

interface WeightResponse { success: boolean; data: WeightEntry }
interface WeightListResponse { success: boolean; data: WeightEntry[] }

export const weightService = {
  /** Get all weight logs for a pet */
  getAll: async (petId: string): Promise<WeightListResponse> => {
    const res = await api.get(`/weightlogs/${petId}`);
    return res.data;
  },

  /** Get the latest weight for a pet */
  getLatest: async (petId: string): Promise<WeightResponse> => {
    const res = await api.get(`/weightlogs/${petId}/latest`);
    return res.data;
  },

  /** Get weight statistics for a pet */
  getStats: async (petId: string): Promise<{ success: boolean; data: any }> => {
    const res = await api.get(`/weightlogs/${petId}/stats`);
    return res.data;
  },

  /** Get a single weight log */
  getById: async (petId: string, logId: string): Promise<WeightResponse> => {
    const res = await api.get(`/weightlogs/${petId}/${logId}`);
    return res.data;
  },

  /** Add a weight log */
  create: async (data: {
    petId: string;
    weight: number;
    unit: string;
    recordedDate: string;
    notes?: string;
  }): Promise<WeightResponse> => {
    const res = await api.post('/weightlogs', data);
    return res.data;
  },

  /** Update a weight log */
  update: async (
    logId: string,
    data: { weight?: number; notes?: string },
  ): Promise<WeightResponse> => {
    const res = await api.patch(`/weightlogs/${logId}`, data);
    return res.data;
  },

  /** Delete a weight log */
  delete: async (logId: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/weightlogs/${logId}`);
    return res.data;
  },
};
