import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Syringe, ChevronLeft, Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCreateVaccination, useVaccinationTemplates } from '@/hooks/useVaccinations';
import type { VaccinationTemplate } from '@/types';

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
  petType?: string; // 'Dog' | 'Cat' | 'Other'
}

function addWeeksToDate(weeks: number, fromDate?: Date): string {
  const date = fromDate || new Date();
  date.setDate(date.getDate() + weeks * 7);
  return date.toISOString().split('T')[0];
}

export function AddVaccinationModal({ open, onClose, petId, petType }: Props) {
  const createVacc = useCreateVaccination();
  const { data: templatesData } = useVaccinationTemplates();

  const [step, setStep] = useState<'pick' | 'form'>('pick');
  const [selectedTemplate, setSelectedTemplate] = useState<VaccinationTemplate | null>(null);

  // Filter templates to match the pet's type (case-insensitive)
  const allTemplates: VaccinationTemplate[] = templatesData?.data ?? [];
  const matchingTemplates = petType
    ? allTemplates.filter((t) => t.petType.toLowerCase() === petType.toLowerCase())
    : allTemplates;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nextDueDate: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (open) {
      setStep('pick');
      setSelectedTemplate(null);
      reset({ nextDueDate: new Date().toISOString().split('T')[0] });
    }
  }, [open, reset]);

  const handlePickTemplate = (template: VaccinationTemplate) => {
    setSelectedTemplate(template);
    setValue('vaccineName', template.vaccineName);
    // Calculate next due date: today + boosterIntervalWeeks
    setValue('nextDueDate', addWeeksToDate(template.boosterIntervalWeeks));
    setStep('form');
  };

  const handlePickCustom = () => {
    setSelectedTemplate(null);
    reset({ nextDueDate: new Date().toISOString().split('T')[0] });
    setStep('form');
  };

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
    <Modal
      open={open}
      onClose={onClose}
      title={step === 'pick' ? 'Record Vaccination' : selectedTemplate ? selectedTemplate.vaccineName : 'Custom Vaccination'}
      size="md"
    >
      {/* ═══ Step 1: Pick a template or custom ═══ */}
      {step === 'pick' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E6EEEE]">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#CFEDEA]">
              <Syringe className="h-4 w-4 text-[#4FB6B2]" />
            </div>
            <p className="text-sm text-[#7A8A8A]">
              {matchingTemplates.length > 0
                ? 'Pick a vaccine from your templates or add a custom one'
                : 'Add a vaccination record for your pet'}
            </p>
          </div>

          {/* Template cards */}
          {matchingTemplates.length > 0 && (
            <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar">
              {matchingTemplates.map((t) => (
                <button
                  key={t._id}
                  onClick={() => handlePickTemplate(t)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-[#E6EEEE] text-left transition-all hover:border-[#4FB6B2] hover:bg-[#f0fcfb] group"
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#006a67]/10"
                    style={{ background: t.isCoreVaccine ? 'rgba(0,106,103,.06)' : 'rgba(109,121,120,.06)' }}
                  >
                    <Syringe className="h-4.5 w-4.5" style={{ color: t.isCoreVaccine ? '#006a67' : '#6d7978' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#131d1e]">{t.vaccineName}</span>
                      {t.isCoreVaccine && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#006a67]/10 text-[#006a67]">
                          Core
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6d7978] mt-0.5">
                      Booster every {t.boosterIntervalWeeks} weeks
                      {t.description ? ` · ${t.description}` : ''}
                    </p>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-[#bdc9c7] rotate-180 group-hover:text-[#4FB6B2] transition-colors" />
                </button>
              ))}
            </div>
          )}

          {/* Custom option */}
          <button
            onClick={handlePickCustom}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 border-dashed border-[#E6EEEE] text-left transition-all hover:border-[#4FB6B2] hover:bg-[#f0fcfb]"
            style={{ cursor: 'pointer' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#f0f4f3]">
              <Plus className="h-4.5 w-4.5 text-[#6d7978]" />
            </div>
            <div>
              <span className="text-sm font-bold text-[#131d1e]">Custom vaccination</span>
              <p className="text-[11px] text-[#6d7978] mt-0.5">Enter vaccine details manually</p>
            </div>
          </button>
        </div>
      )}

      {/* ═══ Step 2: Fill the form ═══ */}
      {step === 'form' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Back + header */}
          <div className="flex items-center gap-2 pb-3 border-b border-[#E6EEEE]">
            <button
              type="button"
              onClick={() => setStep('pick')}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#eaf6f5] transition-colors"
              style={{ cursor: 'pointer' }}
            >
              <ChevronLeft className="h-4 w-4 text-[#6d7978]" />
            </button>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#CFEDEA]">
              <Syringe className="h-4 w-4 text-[#4FB6B2]" />
            </div>
            <div>
              <p className="text-sm text-[#7A8A8A]">
                {selectedTemplate ? 'From template — fill in the details' : 'Enter vaccination details'}
              </p>
            </div>
          </div>

          <Input
            label="Vaccine Name"
            placeholder="e.g. Rabies, Distemper, FVRCP"
            error={errors.vaccineName?.message}
            {...register('vaccineName')}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date Given (optional)"
              type="date"
              helperText="Leave empty if scheduling future"
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
              Save Vaccination
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
