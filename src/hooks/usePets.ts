import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petsService } from '@/services/pets.service';
import type { Pet } from '@/types';
import toast from 'react-hot-toast';

export const usePets = (page = 1, limit = 10) =>
  useQuery({
    queryKey: ['pets', page, limit],
    queryFn: () => petsService.getAll(page, limit),
  });

export const usePet = (id: string) =>
  useQuery({
    queryKey: ['pet', id],
    queryFn: () => petsService.getById(id),
    enabled: !!id,
  });

export const useCreatePet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Pet, '_id' | 'owner'>) => petsService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pets'] });
      toast.success('Pet added!');
    },
    onError: () => toast.error('Failed to add pet'),
  });
};

export const useUpdatePet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pet> }) =>
      petsService.update(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['pets'] });
      qc.invalidateQueries({ queryKey: ['pet', vars.id] });
      toast.success('Pet updated');
    },
    onError: () => toast.error('Failed to update pet'),
  });
};

export const useDeletePet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: petsService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pets'] });
      toast.success('Pet removed');
    },
    onError: () => toast.error('Failed to remove pet'),
  });
};
