import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookTemplate, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useState } from 'react';
import {
  useVaccinationTemplates,
  useCreateVaccinationTemplate,
  useDeleteVaccinationTemplate,
} from '@/hooks/useVaccinations';
import type { VaccinationTemplate } from '@/types';

const schema = z.object({
  petType: z.string().min(1, 'Pet type is required'),
  vaccineName: z.string().min(1, 'Vaccine name is required'),
  isCoreVaccine: z.boolean(),
  recommendedAgeWeeks: z.number().min(1, 'Must be at least 1 week'),
  boosterIntervalWeeks: z.number().min(1, 'Must be at least 1 week'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function VaccinationTemplatesModal({ open, onClose }: Props) {
  const { data: templatesData, isLoading } = useVaccinationTemplates();
  const createTemplate = useCreateVaccinationTemplate();
  const deleteTemplate = useDeleteVaccinationTemplate();

  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const templates: VaccinationTemplate[] = templatesData?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      petType: 'dog',
      isCoreVaccine: true,
      recommendedAgeWeeks: 8,
      boosterIntervalWeeks: 52,
    },
  });

  useEffect(() => {
    if (open) {
      setShowForm(false);
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: FormData) => {
    await createTemplate.mutateAsync({
      petType: data.petType,
      vaccineName: data.vaccineName,
      isCoreVaccine: data.isCoreVaccine,
      recommendedAgeWeeks: data.recommendedAgeWeeks,
      boosterIntervalWeeks: data.boosterIntervalWeeks,
      description: data.description || '',
    });
    reset();
    setShowForm(false);
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title="Vaccination Templates" size="lg">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E6EEEE]">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#CFEDEA]">
                <BookTemplate className="h-4 w-4 text-[#4FB6B2]" />
              </div>
              <p className="text-sm text-[#7A8A8A]">
                Create reusable vaccine templates for auto-scheduling
              </p>
            </div>
            {!showForm && (
              <Button size="sm" pill onClick={() => setShowForm(true)}>
                + New
              </Button>
            )}
          </div>

          {/* Create form */}
          {showForm && (
            <Card className="!p-4 space-y-3 !bg-[#f8fdfc]">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#2F3A3A] mb-1.5">Pet Type</label>
                    <select
                      {...register('petType')}
                      className="w-full rounded-lg border border-[#E6EEEE] bg-white px-3.5 py-2.5 text-sm text-[#2F3A3A] focus:outline-none focus:ring-2 focus:ring-[#4FB6B2] focus:border-transparent"
                    >
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                      <option value="rabbit">Rabbit</option>
                      <option value="bird">Bird</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <Input
                    label="Vaccine Name"
                    placeholder="e.g. Rabies"
                    error={errors.vaccineName?.message}
                    {...register('vaccineName')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Recommended Age (weeks)"
                    type="number"
                    error={errors.recommendedAgeWeeks?.message}
                    {...register('recommendedAgeWeeks', { valueAsNumber: true })}
                  />
                  <Input
                    label="Booster Interval (weeks)"
                    type="number"
                    error={errors.boosterIntervalWeeks?.message}
                    {...register('boosterIntervalWeeks', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2F3A3A] mb-1.5">Description (optional)</label>
                  <textarea
                    placeholder="Describe this vaccine..."
                    className="w-full rounded-lg border border-[#E6EEEE] px-3.5 py-2.5 text-sm text-[#2F3A3A] placeholder:text-[#7A8A8A]/60 resize-none focus:outline-none focus:ring-2 focus:ring-[#4FB6B2] focus:border-transparent"
                    rows={2}
                    {...register('description')}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isCoreVaccine"
                    {...register('isCoreVaccine')}
                    className="rounded border-[#E6EEEE] text-[#006a67] focus:ring-[#4FB6B2]"
                  />
                  <label htmlFor="isCoreVaccine" className="text-sm text-[#2F3A3A]">
                    Core vaccine (essential for all pets)
                  </label>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => { reset(); setShowForm(false); }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" isLoading={createTemplate.isPending}>
                    Create Template
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Templates list */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <SkeletonLoader key={i} variant="card" />)}
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-10">
              <BookTemplate className="h-10 w-10 mx-auto mb-3 text-[#bdc9c7]" />
              <p className="text-sm font-semibold text-[#6d7978]">No templates yet</p>
              <p className="text-xs text-[#bdc9c7] mt-1">
                Create a template to auto-generate vaccination schedules
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[360px] overflow-y-auto custom-scrollbar">
              {templates.map((t) => (
                <div
                  key={t._id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[#E6EEEE] hover:bg-[#f8fdfc] transition-colors group"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: t.isCoreVaccine ? 'rgba(0,106,103,.08)' : 'rgba(109,121,120,.08)' }}
                  >
                    <BookTemplate className="h-4 w-4" style={{ color: t.isCoreVaccine ? '#006a67' : '#6d7978' }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#131d1e] truncate">{t.vaccineName}</span>
                      {t.isCoreVaccine && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#006a67]/10 text-[#006a67]">
                          Core
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#4fb6b2]/10 text-[#4fb6b2]">
                        {t.petType}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6d7978] mt-0.5">
                      Age: {t.recommendedAgeWeeks}w · Booster: every {t.boosterIntervalWeeks}w
                      {t.description ? ` · ${t.description}` : ''}
                    </p>
                  </div>

                  <button
                    onClick={() => setDeleteTarget(t._id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#ffdad6]/40"
                    title="Delete template"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-[#E76F51]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteTemplate.mutate(deleteTarget);
          setDeleteTarget(null);
        }}
        title="Delete Template"
        message="This will permanently remove this vaccine template. Existing vaccination records created from it won't be affected."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}
