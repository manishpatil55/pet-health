import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vaccinationsService } from '@/services/vaccinations.service';
import type { Vaccination } from '@/types';
import toast from 'react-hot-toast';

export const useVaccinations = (petId: string) =>
  useQuery({
    queryKey: ['vaccinations', petId],
    queryFn: () => vaccinationsService.getAll(petId),
    enabled: !!petId,
  });

export const useUpcomingVaccinations = (petId: string) =>
  useQuery({
    queryKey: ['vaccinations', petId, 'upcoming'],
    queryFn: () => vaccinationsService.getUpcoming(petId),
    enabled: !!petId,
  });

export const useOverdueVaccinations = (petId: string) =>
  useQuery({
    queryKey: ['vaccinations', petId, 'overdue'],
    queryFn: () => vaccinationsService.getOverdue(petId),
    enabled: !!petId,
  });

export const useAutoGenerateVaccinations = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (petId: string) => vaccinationsService.autoGenerate(petId),
    onSuccess: (_, petId) => {
      qc.invalidateQueries({ queryKey: ['vaccinations', petId] });
      toast.success('Vaccination schedule generated!');
    },
    onError: () => toast.error('Failed to generate schedule'),
  });
};

export const useCreateVaccination = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Vaccination, '_id' | 'createdBy' | 'status'>) =>
      vaccinationsService.create(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['vaccinations', res.data.pet] });
      toast.success('Vaccination added');
    },
    onError: () => toast.error('Failed to add vaccination'),
  });
};

export const useMarkVaccinationComplete = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vaccinationsService.markComplete(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['vaccinations', res.data.pet] });
      toast.success('Marked as complete');
    },
    onError: () => toast.error('Failed to mark as complete'),
  });
};

export const useDeleteVaccination = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, petId }: { id: string; petId: string }) =>
      vaccinationsService.delete(id).then((r) => ({ ...r, petId })),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['vaccinations', res.petId] });
      toast.success('Vaccination removed');
    },
    onError: () => toast.error('Failed to remove vaccination'),
  });
};
