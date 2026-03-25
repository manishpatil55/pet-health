import type { WeightEntry } from '@/types';
import { mockWeightEntries } from '@/data/mockData';

export const weightService = {
  getAll: async (petId: string): Promise<WeightEntry[]> => {
    await new Promise((r) => setTimeout(r, 400));
    return mockWeightEntries.filter((w) => w.pet === petId);
  },

  create: async (data: Omit<WeightEntry, '_id'>): Promise<WeightEntry> => {
    await new Promise((r) => setTimeout(r, 400));
    return { ...data, _id: `w-${Date.now()}` };
  },

  delete: async (_id: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 300));
  },
};
