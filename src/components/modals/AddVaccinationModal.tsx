import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Syringe } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCreateVaccination } from '@/hooks/useVaccinations';

const schema = z.object({
  vaccineName: z.string().min(1, 'Vaccine name is required'),
  dateAdministered: z.string().optional(),
  nextDueDate: z.string().min(1, 'Next due date is required'),
  veterinarianName: z.string().optional(),
  clinicName: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  petId: string;
}

export function AddVaccinationModal({ open, onClose, petId }: Props) {
  const createVacc = useCreateVaccination();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nextDueDate: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (open) reset({ nextDueDate: new Date().toISOString().split('T')[0] });
  }, [open, reset]);

  const onSubmit = async (data: FormData) => {
    const payload: Record<string, any> = {
      petId,
      vaccineName: data.vaccineName,
      nextDueDate: data.nextDueDate,
    };
    if (data.dateAdministered?.trim()) payload.dateAdministered = data.dateAdministered;
    if (data.veterinarianName?.trim()) payload.veterinarianName = data.veterinarianName;
    if (data.clinicName?.trim()) payload.clinicName = data.clinicName;
    if (data.notes?.trim()) payload.notes = data.notes;

    await createVacc.mutateAsync(payload);
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Vaccination" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#E6EEEE]">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#CFEDEA]">
            <Syringe className="h-4 w-4 text-[#4FB6B2]" />
          </div>
          <p className="text-sm text-[#7A8A8A]">Add a vaccination record for your pet</p>
        </div>

        <Input
          label="Vaccine Name"
          placeholder="e.g. Rabies, Distemper, Parvovirus"
          error={errors.vaccineName?.message}
          {...register('vaccineName')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Date Given (optional)"
            type="date"
            {...register('dateAdministered')}
          />
          <Input
            label="Next Due Date"
            type="date"
            error={errors.nextDueDate?.message}
            {...register('nextDueDate')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Veterinarian (optional)"
            placeholder="e.g. Dr. Sharma"
            {...register('veterinarianName')}
          />
          <Input
            label="Clinic (optional)"
            placeholder="e.g. PetCare Clinic"
            {...register('clinicName')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2F3A3A] mb-1.5">Notes (optional)</label>
          <textarea
            placeholder="Any additional notes..."
            className="w-full rounded-lg border border-[#E6EEEE] px-3.5 py-2.5 text-sm text-[#2F3A3A] placeholder:text-[#7A8A8A]/60 resize-none focus:outline-none focus:ring-2 focus:ring-[#4FB6B2] focus:border-transparent"
            rows={2}
            {...register('notes')}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={() => { reset(); onClose(); }} fullWidth>
            Cancel
          </Button>
          <Button type="submit" fullWidth isLoading={createVacc.isPending}>
            Add Vaccination
          </Button>
        </div>
      </form>
    </Modal>
  );
}
