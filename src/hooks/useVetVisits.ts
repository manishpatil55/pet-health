import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vetVisitsService } from '@/services/vetVisits.service';
import type { VetVisit } from '@/types';
import toast from 'react-hot-toast';

/** Get all vet visits for a pet — returns { success, data: VetVisit[] } */
export const useVetVisits = (petId: string) =>
  useQuery({
    queryKey: ['vetVisits', petId],
    queryFn: () => vetVisitsService.getAll(petId),
    enabled: !!petId,
  });

export const useCreateVetVisit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<VetVisit, '_id'>) => vetVisitsService.create(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['vetVisits', res.data.pet] });
      toast.success('Visit recorded');
    },
    onError: () => toast.error('Failed to record visit'),
  });
};

export const useUpdateVetVisit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VetVisit> }) =>
      vetVisitsService.update(id, data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['vetVisits', res.data.pet] });
      toast.success('Visit updated');
    },
    onError: () => toast.error('Failed to update visit'),
  });
};

export const useDeleteVetVisit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, petId }: { id: string; petId: string }) =>
      vetVisitsService.delete(id).then((r) => ({ ...r, petId })),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['vetVisits', res.petId] });
      toast.success('Visit removed');
    },
    onError: () => toast.error('Failed to remove visit'),
  });
};
