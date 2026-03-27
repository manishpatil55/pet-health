import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dewormingService } from '@/services/deworming.service';
import type { DewormingRecord } from '@/types';
import toast from 'react-hot-toast';

// ─── SCHEDULES ──────────────────────────────────────────────────────────

export const useDewormingSchedule = (petId: string) =>
  useQuery({
    queryKey: ['deworming-schedule', petId],
    queryFn: () => dewormingService.getSchedule(petId),
    enabled: !!petId,
    retry: false, // Don't retry if 404 (no schedule yet)
  });

export const useCreateDewormingSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { petId: string; frequency: string }) => dewormingService.createSchedule(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deworming-schedule', variables.petId] });
      toast.success('Schedule created');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create schedule');
    },
  });
};

export const useUpdateDewormingSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ scheduleId, frequency }: { scheduleId: string; frequency: string }) =>
      dewormingService.updateSchedule(scheduleId, frequency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deworming-schedule'] });
      toast.success('Schedule updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update schedule');
    },
  });
};

// ─── RECORDS (HISTORY) ──────────────────────────────────────────────────

export const useDewormingHistory = (petId: string) =>
  useQuery({
    queryKey: ['deworming-history', petId],
    queryFn: () => dewormingService.getHistory(petId),
    enabled: !!petId,
  });

export const useAddDewormingRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<DewormingRecord, '_id' | 'status'>) => dewormingService.addRecord(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deworming-history', variables.petId] });
      toast.success('Record added successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add record');
    },
  });
};

export const useUpdateDewormingRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: string; data: Partial<DewormingRecord> }) =>
      dewormingService.updateRecord(recordId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deworming-history'] });
      toast.success('Record updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update record');
    },
  });
};

export const useDeleteDewormingRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recordId: string) => dewormingService.deleteRecord(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deworming-history'] });
      toast.success('Record deleted');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete record');
    },
  });
};

