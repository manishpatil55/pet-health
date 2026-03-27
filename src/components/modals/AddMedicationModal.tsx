import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pill } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useCreateMedication } from '@/hooks/useMedications';

const schema = z.object({
  medicineName: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.enum(['once-daily', 'twice-daily', 'three-times', 'custom']),
  customIntervalHours: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface AddMedicationModalProps {
  open: boolean;
  onClose: () => void;
  petId: string;
}

const frequencyOptions = [
  { value: 'once-daily', label: 'Once daily' },
  { value: 'twice-daily', label: 'Twice daily' },
  { value: 'three-times', label: 'Three times daily' },
  { value: 'custom', label: 'Custom interval' },
];

export function AddMedicationModal({ open, onClose, petId }: AddMedicationModalProps) {
  const createMed = useCreateMedication();
  const [selectedFreq, setSelectedFreq] = useState('once-daily');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      frequency: 'once-daily',
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: FormData) => {
    const payload: Record<string, any> = {
      petId,
      medicineName: data.medicineName,
      dosage: data.dosage,
      frequency: data.frequency,
      startDate: data.startDate,
      endDate: data.endDate,
    };
    if (data.frequency === 'custom' && data.customIntervalHours) {
      payload.customIntervalHours = Number(data.customIntervalHours);
    }
    if (data.notes?.trim()) payload.notes = data.notes.trim();

    await createMed.mutateAsync(payload);
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Medication" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Header icon */}
        <div className="flex items-center gap-2 pb-2 border-b border-[#E6EEEE]">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#CFEDEA]">
            <Pill className="h-4 w-4 text-[#4FB6B2]" />
          </div>
          <p className="text-sm text-[#7A8A8A]">Create a medication plan for your pet</p>
        </div>

        <Input
          label="Medicine Name"
          placeholder="e.g. Amoxicillin"
          error={errors.medicineName?.message}
          {...register('medicineName')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Dosage"
            placeholder="e.g. 10mg"
            error={errors.dosage?.message}
            {...register('dosage')}
          />
          <Select
            label="Frequency"
            options={frequencyOptions}
            error={errors.frequency?.message}
            {...register('frequency', {
              onChange: (e) => setSelectedFreq(e.target.value),
            })}
          />
        </div>

        {selectedFreq === 'custom' && (
          <Input
            label="Interval (hours)"
            type="number"
            placeholder="e.g. 8"
            error={errors.customIntervalHours?.message}
            {...register('customIntervalHours')}
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate')}
          />
          <Input
            label="End Date"
            type="date"
            error={errors.endDate?.message}
            {...register('endDate')}
          />
        </div>

        <Input
          label="Notes (optional)"
          placeholder="e.g. Take after food"
          {...register('notes')}
        />

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
            isLoading={createMed.isPending}
          >
            Add Medication
          </Button>
        </div>
      </form>
    </Modal>
  );
}
