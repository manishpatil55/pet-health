import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAddDewormingRecord } from '@/hooks/useDeworming';

const schema = z.object({
  dateAdministered: z.string().min(1, 'Date is required'),
  productName: z.string().min(1, 'Product name is required'),
  administeredBy: z.string().min(1, 'Administered by is required'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
}

export const AddDewormingRecordModal = ({ isOpen, onClose, petId }: Props) => {
  const addRecord = useAddDewormingRecord();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      dateAdministered: new Date().toISOString().split('T')[0],
      productName: '',
      administeredBy: '',
      notes: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        dateAdministered: new Date().toISOString().split('T')[0],
        productName: '',
        administeredBy: '',
        notes: ''
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await addRecord.mutateAsync({ petId, ...data });
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
        <motion.div initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }} className="relative z-50 w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#2F3A3A]">Add Record</h2>
            <button onClick={onClose} className="p-2 text-[#7A8A8A] hover:bg-[#F5F7F7] rounded-full"><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Date Administered" type="date" {...register('dateAdministered')} error={errors.dateAdministered?.message} />
            <Input label="Product Name" placeholder="e.g. Drontal Plus" {...register('productName')} error={errors.productName?.message} />
            <Input label="Administered By" placeholder="e.g. Dr. Smith or John Doe" {...register('administeredBy')} error={errors.administeredBy?.message} />
            
            <div>
              <label className="block text-sm font-medium text-[#2F3A3A] mb-1">Notes</label>
              <textarea {...register('notes')} className="w-full px-4 py-3 rounded-xl border border-[#E5E9E9] focus:outline-none focus:ring-2 focus:ring-[#E76F51] bg-[#F5F7F7] resize-none h-24" placeholder="Any reactions or notes..."></textarea>
            </div>
            
            <div className="pt-4 flex gap-3">
              <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="flex-1" isLoading={addRecord.isPending}>Save</Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
