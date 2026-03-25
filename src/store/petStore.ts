import { create } from 'zustand';

interface PetStore {
  activePetId: string | null;
  setActivePetId: (id: string) => void;
  clearActivePet: () => void;
}

export const usePetStore = create<PetStore>((set) => ({
  activePetId: null,

  setActivePetId: (id) => set({ activePetId: id }),

  clearActivePet: () => set({ activePetId: null }),
}));
