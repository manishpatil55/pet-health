import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Syringe, Zap, Check, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

import { usePet } from '@/hooks/usePets';
import {
  useVaccinations,
  useAutoGenerateVaccinations,
  useMarkVaccinationComplete,
  useDeleteVaccination,
} from '@/hooks/useVaccinations';
import { formatDate, formatCountdown } from '@/utils/dateUtils';
import type { VaccinationStatus } from '@/types';

type Filter = 'all' | VaccinationStatus;

const VaccinationTracker = () => {
  const { id: petId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: petData } = usePet(petId!);
  const { data: vaccData, isLoading } = useVaccinations(petId!);
  const autoGenerate = useAutoGenerateVaccinations();
  const markComplete = useMarkVaccinationComplete();
  const deleteVacc = useDeleteVaccination();

  const pet = petData?.data;
  const allVaccinations = vaccData?.data ?? [];

  const filtered = filter === 'all' ? allVaccinations : allVaccinations.filter((v) => v.status === filter);

  const sorted = [...filtered].sort((a, b) => {
    const priority: Record<string, number> = { overdue: 0, upcoming: 1, completed: 2 };
    return (priority[a.status] ?? 3) - (priority[b.status] ?? 3);
  });

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: `All (${allVaccinations.length})` },
    { key: 'overdue', label: `Overdue (${allVaccinations.filter((v) => v.status === 'overdue').length})` },
    { key: 'upcoming', label: `Upcoming (${allVaccinations.filter((v) => v.status === 'upcoming').length})` },
    { key: 'completed', label: `Completed (${allVaccinations.filter((v) => v.status === 'completed').length})` },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-[#7A8A8A] hover:text-[#2F3A3A]">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#2F3A3A]">Vaccinations</h1>
          {pet && <p className="text-sm text-[#7A8A8A]">{pet.name}</p>}
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="gap-1"
            onClick={() => autoGenerate.mutate(petId!)}
            isLoading={autoGenerate.isPending}
          >
            <Zap className="h-4 w-4" /> Auto-Generate
          </Button>
          <Button size="sm" className="gap-1" onClick={() => toast.success('Manual add coming soon!')}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f.key
                ? 'bg-[#4FB6B2] text-white'
                : 'bg-[#F7FAFA] text-[#7A8A8A] hover:bg-[#CFEDEA]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <SkeletonLoader key={i} variant="card" />)}</div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={Syringe}
          title={filter === 'all' ? 'No vaccinations' : `No ${filter} vaccinations`}
          description="Use Auto-Generate to create a vaccination schedule or add one manually."
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((v, index) => (
            <motion.div
              key={v._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className={v.status === 'overdue' ? '!border-l-4 !border-l-[#E76F51]' : ''}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-[#2F3A3A]">{v.vaccineName}</h3>
                      <StatusBadge status={v.status} />
                    </div>
                    <p className="text-xs text-[#7A8A8A]">
                      {v.status === 'completed' && v.dateAdministered
                        ? `Given on ${formatDate(v.dateAdministered)}`
                        : `Due: ${formatDate(v.nextDueDate)}`}
                      {v.status === 'upcoming' && ` · ${formatCountdown(v.nextDueDate)}`}
                    </p>
                    {v.veterinarianName && (
                      <p className="text-xs text-[#7A8A8A] mt-1">
                        {v.veterinarianName}{v.clinicName ? ` · ${v.clinicName}` : ''}
                      </p>
                    )}
                    {v.notes && <p className="text-xs text-[#7A8A8A] mt-1 italic">{v.notes}</p>}
                  </div>
                  <div className="flex gap-1.5">
                    {v.status !== 'completed' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markComplete.mutate(v._id)}
                        disabled={markComplete.isPending}
                        className="!p-1.5"
                        title="Mark Complete"
                      >
                        <Check className="h-4 w-4 text-[#6BCB77]" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteTarget(v._id)}
                      className="!p-1.5"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-[#E76F51]" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteVacc.mutate({ id: deleteTarget, petId: petId! });
          setDeleteTarget(null);
        }}
        title="Delete Vaccination"
        message="Are you sure you want to delete this vaccination record?"
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  );
};

export default VaccinationTracker;
