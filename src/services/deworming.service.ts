import api from './api';
import type { DewormingSchedule, DewormingRecord } from '@/types';

export const dewormingService = {
  // ─── SCHEDULES ──────────────────────────────────────────────────────────
  createSchedule: async (data: { petId: string; frequency: string }): Promise<{ success: boolean; data: DewormingSchedule }> => {
    const res = await api.post('/deworming/schedules/', data);
    return res.data;
  },
  getSchedule: async (petId: string): Promise<{ success: boolean; data: DewormingSchedule }> => {
    const res = await api.get(`/deworming/schedules/${petId}/`);
    return res.data;
  },
  updateSchedule: async (scheduleId: string, frequency: string): Promise<{ success: boolean; data: DewormingSchedule }> => {
    const res = await api.patch(`/deworming/schedules/${scheduleId}/`, { frequency });
    return res.data;
  },
  deactivateSchedule: async (scheduleId: string): Promise<{ success: boolean }> => {
    const res = await api.delete(`/deworming/schedules/${scheduleId}/`);
    return res.data;
  },

  // ─── RECORDS ────────────────────────────────────────────────────────────
  addRecord: async (data: Omit<DewormingRecord, '_id' | 'status'>): Promise<{ success: boolean; data: DewormingRecord }> => {
    const res = await api.post('/deworming/records/', data);
    return res.data;
  },
  getHistory: async (petId: string): Promise<{ success: boolean; data: DewormingRecord[] }> => {
    const res = await api.get(`/deworming/records/${petId}/history`);
    return res.data;
  },
  getRecord: async (recordId: string): Promise<{ success: boolean; data: DewormingRecord }> => {
    const res = await api.get(`/deworming/records/record/${recordId}/`);
    return res.data;
  },
  updateRecord: async (recordId: string, data: Partial<DewormingRecord>): Promise<{ success: boolean; data: DewormingRecord }> => {
    const res = await api.patch(`/deworming/records/record/${recordId}/`, data);
    return res.data;
  },
  deleteRecord: async (recordId: string): Promise<{ success: boolean }> => {
    const res = await api.delete(`/deworming/records/record/${recordId}/`);
    return res.data;
  },
};
