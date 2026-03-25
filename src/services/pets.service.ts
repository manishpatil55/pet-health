import api from './api';
import type { Pet, PaginatedResponse } from '@/types';

export const petsService = {
  getAll: async (
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<Pet>> => {
    const res = await api.get('/pets', { params: { page, limit } });
    return res.data;
  },

  getById: async (id: string): Promise<{ success: boolean; data: Pet }> => {
    const res = await api.get(`/pets/${id}`);
    return res.data;
  },

  create: async (
    data: Omit<Pet, '_id' | 'owner'>,
  ): Promise<{ success: boolean; data: Pet }> => {
    const res = await api.post('/pets', data);
    return res.data;
  },

  update: async (
    id: string,
    data: Partial<Pet>,
  ): Promise<{ success: boolean; data: Pet }> => {
    const res = await api.put(`/pets/${id}`, data);
    return res.data;
  },

  delete: async (
    id: string,
  ): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/pets/${id}`);
    return res.data;
  },
};
