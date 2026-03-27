import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { useCreateDewormingSchedule, useUpdateDewormingSchedule } from '@/hooks/useDeworming';

const schema = z.object({
  frequency: z.string().min(1, 'Frequency is required'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  existingSchedule?: { _id: string; frequency: string };
}

export const SetDewormingScheduleModal = ({ isOpen, onClose, petId, existingSchedule }: Props) => {
  const createSchedule = useCreateDewormingSchedule();
  const updateSchedule = useUpdateDewormingSchedule();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { frequency: existingSchedule?.frequency || 'monthly' }
  });

  useEffect(() => {
    if (isOpen) {
      reset({ frequency: existingSchedule?.frequency || 'monthly' });
    }
  }, [isOpen, existingSchedule, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (existingSchedule) {
        await updateSchedule.mutateAsync({ scheduleId: existingSchedule._id, frequency: data.frequency });
      } else {
        await createSchedule.mutateAsync({ petId, frequency: data.frequency });
      }
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }} className="relative z-50 w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#2F3A3A]">{existingSchedule ? 'Update Schedule' : 'Set Schedule'}</h2>
            <button onClick={onClose} className="p-2 text-[#7A8A8A] hover:bg-[#F5F7F7] rounded-full"><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2F3A3A] mb-1">Frequency</label>
              <select {...register('frequency')} className="w-full px-4 py-3 rounded-xl border border-[#E5E9E9] focus:outline-none focus:ring-2 focus:ring-[#E76F51] bg-[#F5F7F7]">
                <option value="monthly">Monthly</option>
                <option value="bi-monthly">Bi-monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
              {errors.frequency && <p className="text-sm text-red-500 mt-1">{errors.frequency.message}</p>}
            </div>
            <div className="pt-4 flex gap-3">
              <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="flex-1" isLoading={createSchedule.isPending || updateSchedule.isPending}>Save</Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
