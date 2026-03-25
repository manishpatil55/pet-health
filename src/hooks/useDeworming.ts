import { useQuery } from '@tanstack/react-query';
import { dewormingService } from '@/services/deworming.service';

export const useDeworming = (petId: string) =>
  useQuery({
    queryKey: ['deworming', petId],
    queryFn: () => dewormingService.getAll(petId),
    enabled: !!petId,
  });
