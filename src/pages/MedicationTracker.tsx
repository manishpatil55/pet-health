/**
 * MedicationTracker.tsx — Clinical Sanctuary Edition
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowLeft, Plus, Pill, Trash2, StopCircle, Calendar, Clock, Activity } from 'lucide-react';

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

const isActiveMed = (m: any) => {
  const status = (m.status || '').toLowerCase();
  return status === 'active' || status === 'ongoing';
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};
const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

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

  const activeMeds = allMeds.filter(isActiveMed);
  const completedMeds = allMeds.filter((m) => !isActiveMed(m));
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
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
        className="flex items-center gap-4 mb-8"
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{
            background: '#ffffff',
            border: '1.5px solid rgba(189,201,199,.4)',
            cursor: 'pointer',
            color: '#3d4948',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#eaf6f5'; e.currentTarget.style.borderColor = '#4fb6b2'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = 'rgba(189,201,199,.4)'; }}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1
            className="font-black tracking-tight"
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              color: '#131d1e',
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
            }}
          >
            Medications
          </h1>
          {pet && <p className="text-sm mt-0.5" style={{ color: '#6d7978' }}>{pet.name}'s prescriptions & dosages</p>}
        </div>
        <Button size="sm" pill className="gap-1.5" onClick={() => setShowAddModal(true)}>
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </motion.div>

      {/* ── Summary Cards ── */}
      {!isLoading && allMeds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06, ease: [0.16, 1, 0.3, 1] as const }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: 'rgba(79,182,178,.06)', border: '1px solid rgba(79,182,178,.12)' }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: 'rgba(79,182,178,.15)' }}>
              <Activity className="h-4.5 w-4.5 text-[#4fb6b2]" />
            </div>
            <p className="text-3xl font-black" style={{ color: '#006a67', fontFamily: 'Manrope, sans-serif' }}>{activeMeds.length}</p>
            <p className="text-[11px] font-semibold" style={{ color: '#6d7978' }}>Active</p>
          </div>
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: 'rgba(107,203,119,.06)', border: '1px solid rgba(107,203,119,.12)' }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: 'rgba(107,203,119,.15)' }}>
              <Pill className="h-4.5 w-4.5 text-[#6BCB77]" />
            </div>
            <p className="text-3xl font-black" style={{ color: '#6BCB77', fontFamily: 'Manrope, sans-serif' }}>{completedMeds.length}</p>
            <p className="text-[11px] font-semibold" style={{ color: '#6d7978' }}>Completed / Stopped</p>
          </div>
        </motion.div>
      )}

      {/* ── Tab Pills ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="flex gap-2 mb-6"
      >
        {(['active', 'completed'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-5 py-2 rounded-full text-xs font-bold capitalize transition-all duration-200"
            style={{
              background: tab === t
                ? 'linear-gradient(135deg, #006a67, #4fb6b2)'
                : '#ffffff',
              color: tab === t ? '#ffffff' : '#6d7978',
              border: tab === t ? 'none' : '1.5px solid rgba(189,201,199,.3)',
              boxShadow: tab === t ? '0 4px 16px rgba(0,106,103,0.25)' : 'none',
              cursor: 'pointer',
            }}
          >
            {t} ({t === 'active' ? activeMeds.length : completedMeds.length})
          </button>
        ))}
      </motion.div>

      {/* ── Cards ── */}
      {isLoading ? (
        <div className="space-y-4">{[1, 2].map((i) => <SkeletonLoader key={i} variant="card" />)}</div>
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
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
            {filtered.map((m) => {
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
                active: { bg: '#F2B544', text: '#F2B544' },
                ongoing: { bg: '#F2B544', text: '#F2B544' },
                completed: { bg: '#6BCB77', text: '#6BCB77' },
                stopped: { bg: '#E76F51', text: '#E76F51' },
              };
              const sc = statusColors[m.status] || statusColors.completed;

              return (
                <motion.div key={m._id} variants={fadeUp} layout>
                  <Card>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(79,182,178,.1)' }}
                        >
                          <Pill className="h-5 w-5 text-[#4fb6b2]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold" style={{ color: '#131d1e' }}>{m.medicineName}</h3>
                          <p className="text-xs" style={{ color: '#6d7978' }}>{m.dosage} · {freqLabel[m.frequency] ?? m.frequency}</p>
                        </div>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full capitalize"
                        style={{ background: `${sc.bg}15`, color: sc.text }}
                      >
                        {m.status}
                      </span>
                    </div>

                    {/* Date range */}
                    <div className="flex items-center gap-4 text-xs mb-4" style={{ color: '#bdc9c7' }}>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(m.startDate)} → {formatDate(m.endDate)}</span>
                      {isActiveMed(m) && <span className="flex items-center gap-1 font-semibold" style={{ color: '#006a67' }}><Clock className="h-3.5 w-3.5" /> {daysLeft}d left</span>}
                    </div>

                    {/* Progress bar */}
                    {isActiveMed(m) && (
                      <div className="mb-4">
                        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#eaf6f5' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #006a67, #4fb6b2)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
                          />
                        </div>
                        <p className="text-[11px] mt-1.5 text-right font-semibold" style={{ color: '#6d7978' }}>{Math.round(pct)}% complete</p>
                      </div>
                    )}

                    {m.notes && (
                      <p
                        className="text-xs italic mb-4 p-3 rounded-xl"
                        style={{ background: '#eaf6f5', color: '#6d7978' }}
                      >
                        "{m.notes}"
                      </p>
                    )}

                    {/* Actions */}
                    <div
                      className="flex gap-2 pt-3"
                      style={{ borderTop: '1px solid rgba(189,201,199,.15)' }}
                    >
                      {isActiveMed(m) && (
                        <button
                          onClick={() => setStopTarget(m._id)}
                          className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
                          style={{ color: '#F2B544', background: 'rgba(242,181,68,.08)', cursor: 'pointer' }}
                        >
                          <StopCircle className="h-3.5 w-3.5" /> Stop
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget(m._id)}
                        className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
                        style={{ color: '#E76F51', background: 'rgba(231,111,81,.08)', cursor: 'pointer' }}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

      <AddMedicationModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        petId={petId!}
      />

      <ConfirmDialog
        open={!!stopTarget}
        onClose={() => setStopTarget(null)}
        title="Stop Medication"
        message="Are you sure you want to stop this medication? You can still view it in the Completed tab."
        confirmLabel="Stop Medication"
        onConfirm={handleStop}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Medication"
        message="This will permanently delete this medication and all its dose logs. This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default MedicationTracker;
