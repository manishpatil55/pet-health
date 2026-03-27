import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAddWeight } from '@/hooks/useWeight';

const schema = z.object({
  weight: z.string().min(1, 'Weight is required').transform(Number).pipe(z.number().positive('Weight must be positive')),
  unit: z.enum(['kg', 'lbs']),
  recordedDate: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

type FormInput = {
  weight: string;
  unit: 'kg' | 'lbs';
  recordedDate: string;
  notes?: string;
};
type FormOutput = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
}

export const AddWeightModal = ({ isOpen, onClose, petId }: Props) => {
  const addWeight = useAddWeight();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      weight: '',
      unit: 'kg',
      recordedDate: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (isOpen) reset({ weight: '', unit: 'kg', recordedDate: new Date().toISOString().split('T')[0] });
  }, [isOpen, reset]);

  const onSubmit = (data: any) => {
    const parsed = data as FormOutput;
    addWeight.mutate(
      { petId, weight: parsed.weight, unit: parsed.unit, recordedDate: parsed.recordedDate, notes: parsed.notes },
      { onSuccess: () => { reset(); onClose(); } },
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#2F3A3A]">Record Weight</h2>
              <button onClick={onClose} className="p-2 text-[#7A8A8A] hover:bg-[#F5F7F7] rounded-full"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input label="Weight" type="number" step="0.1" placeholder="e.g. 12.5" {...register('weight')} error={errors.weight?.message} />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-[#2F3A3A] mb-1.5">Unit</label>
                  <select
                    {...register('unit')}
                    className="w-full rounded-lg border border-[#E6EEEE] px-3 py-2.5 text-sm text-[#2F3A3A] focus:outline-none focus:ring-2 focus:ring-[#4FB6B2]"
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                  </select>
                </div>
              </div>
              <Input label="Date" type="date" {...register('recordedDate')} error={errors.recordedDate?.message} />
              <div>
                <label className="block text-sm font-medium text-[#2F3A3A] mb-1.5">Notes (optional)</label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  placeholder="e.g. After morning walk"
                  className="w-full rounded-lg border border-[#E6EEEE] px-3.5 py-2.5 text-sm text-[#2F3A3A] placeholder:text-[#7A8A8A]/60 focus:outline-none focus:ring-2 focus:ring-[#4FB6B2]"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
                <Button type="submit" className="flex-1" isLoading={addWeight.isPending}>Save</Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
