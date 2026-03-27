import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { weightService } from '@/services/weight.service';
import toast from 'react-hot-toast';

export const useWeightEntries = (petId: string) =>
  useQuery({
    queryKey: ['weight', petId],
    queryFn: () => weightService.getAll(petId),
    enabled: !!petId,
  });

export const useLatestWeight = (petId: string) =>
  useQuery({
    queryKey: ['weight', petId, 'latest'],
    queryFn: () => weightService.getLatest(petId),
    enabled: !!petId,
  });

export const useWeightStats = (petId: string) =>
  useQuery({
    queryKey: ['weight', petId, 'stats'],
    queryFn: () => weightService.getStats(petId),
    enabled: !!petId,
  });

export const useAddWeight = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { petId: string; weight: number; unit: string; recordedDate: string; notes?: string }) =>
      weightService.create(data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['weight', vars.petId] });
      toast.success('Weight recorded');
    },
    onError: () => toast.error('Failed to record weight'),
  });
};

export const useUpdateWeight = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ logId, data }: { logId: string; petId: string; data: { weight?: number; notes?: string } }) =>
      weightService.update(logId, data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['weight', vars.petId] });
      toast.success('Weight updated');
    },
    onError: () => toast.error('Failed to update weight'),
  });
};

export const useDeleteWeight = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ logId }: { logId: string; petId: string }) =>
      weightService.delete(logId),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['weight', vars.petId] });
      toast.success('Weight entry deleted');
    },
    onError: () => toast.error('Failed to delete entry'),
  });
};
