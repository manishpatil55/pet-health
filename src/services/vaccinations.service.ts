import api from './api';
import type { Vaccination } from '@/types';

export const vaccinationsService = {
  getAll: async (
    petId: string,
  ): Promise<{ success: boolean; data: Vaccination[] }> => {
    const res = await api.get(`/vaccinations/pet/${petId}`);
    return res.data;
  },

  getUpcoming: async (
    petId: string,
  ): Promise<{ success: boolean; data: Vaccination[] }> => {
    const res = await api.get(`/vaccinations/pet/${petId}/upcoming`);
    return res.data;
  },

  getOverdue: async (
    petId: string,
  ): Promise<{ success: boolean; data: Vaccination[] }> => {
    const res = await api.get(`/vaccinations/pet/${petId}/overdue`);
    return res.data;
  },

  getById: async (
    id: string,
  ): Promise<{ success: boolean; data: Vaccination }> => {
    const res = await api.get(`/vaccinations/${id}`);
    return res.data;
  },

  create: async (
    data: Omit<Vaccination, '_id' | 'createdBy' | 'status'>,
  ): Promise<{ success: boolean; data: Vaccination }> => {
    const res = await api.post('/vaccinations', data);
    return res.data;
  },

  autoGenerate: async (
    petId: string,
  ): Promise<{ success: boolean; data: Vaccination[] }> => {
    const res = await api.post(`/vaccinations/pet/${petId}/auto-generate`);
    return res.data;
  },

  update: async (
    id: string,
    data: Partial<Vaccination>,
  ): Promise<{ success: boolean; data: Vaccination }> => {
    const res = await api.put(`/vaccinations/${id}`, data);
    return res.data;
  },

  markComplete: async (
    id: string,
  ): Promise<{ success: boolean; data: Vaccination }> => {
    const res = await api.patch(`/vaccinations/${id}/complete`);
    return res.data;
  },

  delete: async (
    id: string,
  ): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/vaccinations/${id}`);
    return res.data;
  },
};
