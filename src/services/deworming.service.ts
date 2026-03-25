import type { DewormingRecord } from '@/types';
import { mockDeworming } from '@/data/mockData';

export const dewormingService = {
  getAll: async (petId: string): Promise<DewormingRecord[]> => {
    await new Promise((r) => setTimeout(r, 400));
    return mockDeworming.filter((d) => d.pet === petId);
  },

  getById: async (id: string): Promise<DewormingRecord | undefined> => {
    await new Promise((r) => setTimeout(r, 200));
    return mockDeworming.find((d) => d._id === id);
  },

  create: async (
    data: Omit<DewormingRecord, '_id'>,
  ): Promise<DewormingRecord> => {
    await new Promise((r) => setTimeout(r, 400));
    return { ...data, _id: `dew-${Date.now()}` };
  },

  update: async (
    id: string,
    data: Partial<DewormingRecord>,
  ): Promise<DewormingRecord> => {
    await new Promise((r) => setTimeout(r, 300));
    const existing = mockDeworming.find((d) => d._id === id);
    return { ...existing!, ...data };
  },

  delete: async (_id: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 300));
  },
};
