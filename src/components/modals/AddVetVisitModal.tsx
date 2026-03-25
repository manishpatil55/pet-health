import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stethoscope } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCreateVetVisit } from '@/hooks/useVetVisits';

const schema = z.object({
  visitDate: z.string().min(1, 'Visit date is required'),
  clinicName: z.string().min(1, 'Clinic name is required'),
  veterinarianName: z.string().min(1, 'Vet name is required'),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  treatmentDetails: z.string().min(1, 'Treatment details are required'),
  cost: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface AddVetVisitModalProps {
  open: boolean;
  onClose: () => void;
  petId: string;
}

export function AddVetVisitModal({ open, onClose, petId }: AddVetVisitModalProps) {
  const createVisit = useCreateVetVisit();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await createVisit.mutateAsync({
      pet: petId,
      visitDate: data.visitDate,
      clinicName: data.clinicName,
      veterinarianName: data.veterinarianName,
      diagnosis: data.diagnosis,
      treatment: data.treatmentDetails,
      treatmentDetails: data.treatmentDetails,
      cost: data.cost ? Number(data.cost) : undefined,
      notes: data.notes || undefined,
    });
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Record Vet Visit" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Header icon */}
        <div className="flex items-center gap-2 pb-2 border-b border-[#E6EEEE]">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#CFEDEA]">
            <Stethoscope className="h-4 w-4 text-[#4FB6B2]" />
          </div>
          <p className="text-sm text-[#7A8A8A]">Record a vet visit for your pet</p>
        </div>

        <Input
          label="Visit Date"
          type="date"
          error={errors.visitDate?.message}
          {...register('visitDate')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Clinic Name"
            placeholder="e.g. PetCare Clinic"
            error={errors.clinicName?.message}
            {...register('clinicName')}
          />
          <Input
            label="Veterinarian"
            placeholder="e.g. Dr. Smith"
            error={errors.veterinarianName?.message}
            {...register('veterinarianName')}
          />
        </div>

        <Input
          label="Diagnosis"
          placeholder="e.g. Seasonal allergies"
          error={errors.diagnosis?.message}
          {...register('diagnosis')}
        />

        <div>
          <label className="block text-sm font-medium text-[#2F3A3A] mb-1.5">
            Treatment Details
          </label>
          <textarea
            placeholder="e.g. Prescribed medication, follow-up in 2 weeks"
            className={`
              w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-[#2F3A3A]
              placeholder:text-[#7A8A8A]/60 resize-none
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-[#4FB6B2] focus:border-transparent
              ${errors.treatmentDetails ? 'border-[#E76F51]' : 'border-[#E6EEEE] hover:border-[#4FB6B2]/40'}
            `}
            rows={3}
            {...register('treatmentDetails')}
          />
          {errors.treatmentDetails && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-[#E76F51]">
              {errors.treatmentDetails.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Cost (₹)"
            type="number"
            placeholder="e.g. 1200"
            {...register('cost')}
          />
          <Input
            label="Notes (optional)"
            placeholder="Follow-up notes..."
            {...register('notes')}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => { reset(); onClose(); }}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            type="submit"
            fullWidth
            isLoading={createVisit.isPending}
          >
            Save Visit
          </Button>
        </div>
      </form>
    </Modal>
  );
}
