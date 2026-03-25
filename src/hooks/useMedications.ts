import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationsService } from '@/services/medications.service';
import type { Medication } from '@/types';
import toast from 'react-hot-toast';

/** Get all medications for a pet — returns { success, data: Medication[] } */
export const useMedications = (petId: string) =>
  useQuery({
    queryKey: ['medications', petId],
    queryFn: () => medicationsService.getAll(petId),
    enabled: !!petId,
  });

/** Get single medication with progress info */
export const useMedicationDetail = (id: string) =>
  useQuery({
    queryKey: ['medication', id],
    queryFn: () => medicationsService.getById(id),
    enabled: !!id,
  });

/** Get dose logs for a medication */
export const useDoseLogs = (medicationId: string) =>
  useQuery({
    queryKey: ['doses', medicationId],
    queryFn: () => medicationsService.getDoses(medicationId),
    enabled: !!medicationId,
  });

export const useCreateMedication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Medication, '_id' | 'createdBy' | 'status'>) =>
      medicationsService.create(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['medications', res.data.pet] });
      toast.success('Medication added');
    },
    onError: () => toast.error('Failed to add medication'),
  });
};

export const useUpdateMedication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Medication> }) =>
      medicationsService.update(id, data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['medications', res.data.pet] });
      qc.invalidateQueries({ queryKey: ['medication', res.data._id] });
      toast.success('Medication updated');
    },
    onError: () => toast.error('Failed to update'),
  });
};

export const useDeleteMedication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, petId }: { id: string; petId: string }) =>
      medicationsService.delete(id).then((r) => ({ ...r, petId })),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['medications', res.petId] });
      toast.success('Medication removed');
    },
    onError: () => toast.error('Failed to remove medication'),
  });
};

export const useMarkDose = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (doseId: string) => medicationsService.markDose(doseId),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['doses', res.data.medication] });
      qc.invalidateQueries({ queryKey: ['medications'] });
      toast.success('Dose marked as taken');
    },
    onError: () => toast.error('Failed to mark dose'),
  });
};
