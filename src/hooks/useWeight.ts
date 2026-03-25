import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { weightService } from '@/services/weight.service';
import type { WeightEntry } from '@/types';
import toast from 'react-hot-toast';

export const useWeightEntries = (petId: string) =>
  useQuery({
    queryKey: ['weight', petId],
    queryFn: () => weightService.getAll(petId),
    enabled: !!petId,
  });

export const useAddWeight = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<WeightEntry, '_id'>) => weightService.create(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['weight', res.pet] });
      toast.success('Weight recorded');
    },
    onError: () => toast.error('Failed to record weight'),
  });
};
