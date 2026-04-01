import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vaccinationsService } from '@/services/vaccinations.service';
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
    onSuccess: (res, petId) => {
      qc.invalidateQueries({ queryKey: ['vaccinations', petId] });
      // Check if the backend actually generated specific new records
      if (res.data && res.data.length > 0) {
        toast.success(`Generated ${res.data.length} new vaccinations based on template!`);
      } else {
        // Sometimes backend returns 200 OK but 0 items because the pet already 
        // has them or does not match any template requirements (age/species)
        toast.success('Your pet is already up to date based on our templates.');
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to generate schedule';
      console.error('Auto-generate error:', err?.response?.data || err);
      toast.error(msg);
    },
  });
};

export const useCreateVaccination = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => vaccinationsService.create(data),
    onSuccess: (_res, vars) => {
      const pid = vars.petId || vars.pet;
      qc.invalidateQueries({ queryKey: ['vaccinations', pid] });
      toast.success('Vaccination added');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to add vaccination';
      console.error('Vaccination creation error:', err?.response?.data || err);
      toast.error(msg);
    },
  });
};

export const useMarkVaccinationComplete = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vaccinationsService.markComplete(id),
    onSuccess: (res) => {
      const pid = (res.data as any).petId || (res.data as any).pet;
      qc.invalidateQueries({ queryKey: ['vaccinations', pid] });
      toast.success('Marked as complete');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to mark as complete');
    },
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
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to remove vaccination');
    },
  });
};

// ─── Template Hooks ─────────────────────────────────────────────

export const useVaccinationTemplates = () =>
  useQuery({
    queryKey: ['vaccination-templates'],
    queryFn: () => vaccinationsService.getTemplates(),
  });

export const useCreateVaccinationTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      petType: string;
      vaccineName: string;
      isCoreVaccine: boolean;
      recommendedAgeWeeks: number;
      boosterIntervalWeeks: number;
      description: string;
    }) => vaccinationsService.createTemplate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vaccination-templates'] });
      toast.success('Template created');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create template');
    },
  });
};

export const useUpdateVaccinationTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      vaccinationsService.updateTemplate(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vaccination-templates'] });
      toast.success('Template updated');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update template');
    },
  });
};

export const useDeleteVaccinationTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vaccinationsService.deleteTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vaccination-templates'] });
      toast.success('Template deleted');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete template');
    },
  });
};
