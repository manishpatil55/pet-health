import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Pill, Trash2, StopCircle, Calendar, Clock } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AddMedicationModal } from '@/components/modals/AddMedicationModal';
import { usePet } from '@/hooks/usePets';
import { useMedications, useUpdateMedication, useDeleteMedication } from '@/hooks/useMedications';
import { formatDate } from '@/utils/dateUtils';

type Tab = 'active' | 'completed';

// Helper: is a medication currently active?
const isActive = (m: any) => {
  const status = (m.status || '').toLowerCase();
  return status === 'active' || status === 'ongoing';
};

const MedicationTracker = () => {
  const { id: petId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('active');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [stopTarget, setStopTarget] = useState<string | null>(null);

  const { data: petData } = usePet(petId!);
  const { data: medsResponse, isLoading } = useMedications(petId!);
  const updateMed = useUpdateMedication();
  const deleteMed = useDeleteMedication();

  const pet = petData?.data;
  const allMeds = medsResponse?.data ?? [];

  const activeMeds = allMeds.filter(isActive);
  const completedMeds = allMeds.filter((m) => !isActive(m));
  const filtered = tab === 'active' ? activeMeds : completedMeds;

  const handleStop = () => {
    if (!stopTarget) return;
    updateMed.mutate(
      { id: stopTarget, data: { status: 'stopped' as any }, petId: petId! },
      { onSuccess: () => setStopTarget(null) },
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMed.mutate(
      { id: deleteTarget, petId: petId! },
      { onSuccess: () => setDeleteTarget(null) },
    );
  };

  return (
    <>
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-[#7A8A8A] hover:text-[#2F3A3A]"><ArrowLeft className="h-5 w-5" /></button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#2F3A3A]">Medications</h1>
          {pet && <p className="text-sm text-[#7A8A8A]">{pet.name}</p>}
        </div>
        <Button size="sm" className="gap-1" onClick={() => setShowAddModal(true)}><Plus className="h-4 w-4" /> Add</Button>
      </div>

      {/* Summary cards */}
      {!isLoading && allMeds.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="!p-4 text-center">
            <p className="text-2xl font-bold text-[#4FB6B2]">{activeMeds.length}</p>
            <p className="text-xs text-[#7A8A8A] mt-0.5">Active</p>
          </Card>
          <Card className="!p-4 text-center">
            <p className="text-2xl font-bold text-[#6BCB77]">{completedMeds.length}</p>
            <p className="text-xs text-[#7A8A8A] mt-0.5">Completed / Stopped</p>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(['active', 'completed'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              tab === t ? 'bg-[#4FB6B2] text-white' : 'bg-[#F7FAFA] text-[#7A8A8A] hover:bg-[#CFEDEA]'
            }`}
          >
            {t} ({t === 'active' ? activeMeds.length : completedMeds.length})
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">{[1, 2].map((i) => <SkeletonLoader key={i} variant="card" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Pill}
          title={tab === 'active' ? 'No active medications' : 'No completed medications'}
          description={tab === 'active' ? 'Add a medication to start tracking dosage and schedule.' : 'Completed and stopped medications will appear here.'}
          actionLabel={tab === 'active' ? 'Add Medication' : undefined}
          onAction={tab === 'active' ? () => setShowAddModal(true) : undefined}
        />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filtered.map((m, index) => {
              const total = Math.ceil((new Date(m.endDate).getTime() - new Date(m.startDate).getTime()) / (1000 * 60 * 60 * 24));
              const elapsed = Math.ceil((Date.now() - new Date(m.startDate).getTime()) / (1000 * 60 * 60 * 24));
              const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
              const daysLeft = Math.max(0, total - elapsed);

              const freqLabel: Record<string, string> = {
                'once-daily': 'Once daily',
                'twice-daily': 'Twice daily',
                'three-times': '3× daily',
                custom: m.customIntervalHours ? `Every ${m.customIntervalHours}h` : 'Custom',
              };

              const statusColors: Record<string, { bg: string; text: string }> = {
                active: { bg: 'bg-[#F2B544]/15', text: 'text-[#F2B544]' },
                ongoing: { bg: 'bg-[#F2B544]/15', text: 'text-[#F2B544]' },
                completed: { bg: 'bg-[#6BCB77]/15', text: 'text-[#6BCB77]' },
                stopped: { bg: 'bg-[#E76F51]/15', text: 'text-[#E76F51]' },
              };
              const sc = statusColors[m.status] || statusColors.completed;

              return (
                <motion.div
                  key={m._id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#CFEDEA] flex items-center justify-center flex-shrink-0">
                          <Pill className="h-5 w-5 text-[#4FB6B2]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-[#2F3A3A]">{m.medicineName}</h3>
                          <p className="text-xs text-[#7A8A8A]">{m.dosage} · {freqLabel[m.frequency] ?? m.frequency}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${sc.bg} ${sc.text}`}>
                        {m.status}
                      </span>
                    </div>

                    {/* Date range */}
                    <div className="flex items-center gap-4 text-xs text-[#7A8A8A] mb-3">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(m.startDate)} → {formatDate(m.endDate)}</span>
                      {isActive(m) && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {daysLeft}d left</span>}
                    </div>

                    {/* Progress bar for active */}
                    {isActive(m) && (
                      <div className="mb-3">
                        <div className="h-2 bg-[#E6EEEE] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#4FB6B2] to-[#6BCB77] rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6 }}
                          />
                        </div>
                        <p className="text-xs text-[#7A8A8A] mt-1 text-right">{Math.round(pct)}% complete</p>
                      </div>
                    )}

                    {m.notes && <p className="text-xs text-[#7A8A8A] bg-[#F5F7F7] p-2 rounded-lg italic mb-3">"{m.notes}"</p>}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-[#F0F4F4]">
                      {isActive(m) && (
                        <button
                          onClick={() => setStopTarget(m._id)}
                          className="flex items-center gap-1 text-xs font-medium text-[#F2B544] hover:bg-[#F2B544]/10 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <StopCircle className="h-3.5 w-3.5" /> Stop
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget(m._id)}
                        className="flex items-center gap-1 text-xs font-medium text-[#E76F51] hover:bg-[#E76F51]/10 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </motion.div>

    <AddMedicationModal
      open={showAddModal}
      onClose={() => setShowAddModal(false)}
      petId={petId!}
    />

    {/* Stop confirmation */}
    <ConfirmDialog
      open={!!stopTarget}
      onClose={() => setStopTarget(null)}
      title="Stop Medication"
      message="Are you sure you want to stop this medication? You can still view it in the Completed tab."
      confirmLabel="Stop Medication"
      onConfirm={handleStop}
    />

    {/* Delete confirmation */}
    <ConfirmDialog
      open={!!deleteTarget}
      onClose={() => setDeleteTarget(null)}
      title="Delete Medication"
      message="This will permanently delete this medication and all its dose logs. This cannot be undone."
      confirmLabel="Delete"
      variant="danger"
      onConfirm={handleDelete}
    />
    </>
  );
};

export default MedicationTracker;
