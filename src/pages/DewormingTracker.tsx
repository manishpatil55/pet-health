/**
 * DewormingTracker.tsx — Clinical Sanctuary Edition
 */

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  ArrowLeft, Bug, CalendarCheck, Trash2, Calendar, Clock,
  CheckCircle2, AlertTriangle, ShieldCheck,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SetDewormingScheduleModal } from '@/components/modals/SetDewormingScheduleModal';
import { AddDewormingRecordModal } from '@/components/modals/AddDewormingRecordModal';
import { usePet } from '@/hooks/usePets';
import { useDewormingSchedule, useDewormingHistory, useDeleteDewormingRecord } from '@/hooks/useDeworming';
import { formatDate, formatCountdown } from '@/utils/dateUtils';
import { calculateNextDue, getComputedStatus } from '@/utils/dewormingUtils';
import type { DewormingStatus } from '@/types';

const freqLabels: Record<string, string> = {
  monthly: 'Every month',
  'bi-monthly': 'Every 2 months',
  quarterly: 'Every 3 months',
  'semi-annually': 'Every 6 months',
  annually: 'Once a year',
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};
const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

const DewormingTracker = () => {
  const { id: petId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: petData } = usePet(petId!);
  const { data: scheduleData, isLoading: isLoadingSchedule } = useDewormingSchedule(petId!);
  const { data: historyData, isLoading: isLoadingHistory } = useDewormingHistory(petId!);
  const deleteRecord = useDeleteDewormingRecord();

  const pet = petData?.data;
  const schedule = scheduleData?.data;
  const records = historyData?.data || [];
  const isLoading = isLoadingSchedule || isLoadingHistory;

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => new Date(b.dateAdministered).getTime() - new Date(a.dateAdministered).getTime()),
    [records],
  );

  let nextDueDateStr: string | null = null;
  let nextDueStatus: DewormingStatus | null = null;

  if (schedule) {
    if (sortedRecords.length > 0) {
      nextDueDateStr = calculateNextDue(sortedRecords[0].dateAdministered, schedule.frequency);
      nextDueStatus = getComputedStatus(nextDueDateStr);
    } else {
      nextDueDateStr = new Date().toISOString();
      nextDueStatus = 'overdue';
    }
  }

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteRecord.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) });
  };

  const statusColor: Record<string, string> = {
    overdue: '#E76F51',
    upcoming: '#F2B544',
    completed: '#6BCB77',
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
            Deworming
          </h1>
          {pet && <p className="text-sm mt-0.5" style={{ color: '#6d7978' }}>{pet.name}'s parasite protection</p>}
        </div>
        <div className="flex gap-2">
          {schedule && (
            <Button size="sm" pill className="gap-1.5" onClick={() => setIsRecordModalOpen(true)}>
              <Bug className="h-3.5 w-3.5" /> Log Dose
            </Button>
          )}
          <Button variant="secondary" size="sm" pill className="gap-1.5" onClick={() => setIsScheduleModalOpen(true)}>
            <CalendarCheck className="h-3.5 w-3.5" /> {schedule ? 'Edit' : 'Set Schedule'}
          </Button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2].map((i) => <SkeletonLoader key={i} variant="card" />)}</div>
      ) : !schedule ? (
        <EmptyState
          icon={Bug}
          title="No Deworming Schedule"
          description="Set up a deworming frequency first, then log each dose to keep track."
          actionLabel="Set Schedule"
          onAction={() => setIsScheduleModalOpen(true)}
        />
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
          {/* ── Summary Row ── */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(79,182,178,.06)', border: '1px solid rgba(79,182,178,.12)' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: 'rgba(79,182,178,.15)' }}>
                <ShieldCheck className="h-4.5 w-4.5 text-[#4fb6b2]" />
              </div>
              <p className="text-lg font-black" style={{ color: '#006a67', fontFamily: 'Manrope, sans-serif' }}>
                {freqLabels[schedule.frequency] || schedule.frequency}
              </p>
              <p className="text-[11px] font-semibold" style={{ color: '#6d7978' }}>Schedule</p>
            </div>
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(107,203,119,.06)', border: '1px solid rgba(107,203,119,.12)' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: 'rgba(107,203,119,.15)' }}>
                <CheckCircle2 className="h-4.5 w-4.5 text-[#6BCB77]" />
              </div>
              <p className="text-3xl font-black" style={{ color: '#6BCB77', fontFamily: 'Manrope, sans-serif' }}>{records.length}</p>
              <p className="text-[11px] font-semibold" style={{ color: '#6d7978' }}>Total Doses</p>
            </div>
          </motion.div>

          {/* ── Next Due Banner ── */}
          {nextDueDateStr && nextDueStatus && (
            <motion.div variants={fadeUp}>
              <Card
                variant={nextDueStatus === 'overdue' ? 'default' : 'default'}
                style={{
                  borderLeft: `4px solid ${statusColor[nextDueStatus] || '#4fb6b2'}`,
                  background: `${statusColor[nextDueStatus] || '#4fb6b2'}08`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: `${statusColor[nextDueStatus]}15` }}
                      >
                        {nextDueStatus === 'overdue' ? (
                          <AlertTriangle className="h-4 w-4" style={{ color: statusColor[nextDueStatus] }} />
                        ) : (
                          <Calendar className="h-4 w-4" style={{ color: statusColor[nextDueStatus] }} />
                        )}
                      </div>
                      <h3 className="text-sm font-bold" style={{ color: '#131d1e' }}>
                        {nextDueStatus === 'overdue' ? 'Overdue!' : 'Next Due'}
                      </h3>
                    </div>
                    <p className="text-2xl font-black mb-0.5" style={{ color: '#131d1e', fontFamily: 'Manrope, sans-serif' }}>
                      {formatCountdown(nextDueDateStr)}
                    </p>
                    <p className="text-xs" style={{ color: '#6d7978' }}>{formatDate(nextDueDateStr)}</p>
                  </div>
                  <StatusBadge status={nextDueStatus} />
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── Dose History ── */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #006a67, #4fb6b2)' }} />
              <h3 className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: '#6d7978' }}>
                Dose History
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#eaf6f5', color: '#4fb6b2' }}>
                {records.length}
              </span>
            </div>

            {records.length === 0 ? (
              <div
                className="text-center py-12 rounded-3xl"
                style={{ background: '#eaf6f5', border: '2px dashed rgba(189,201,199,.3)' }}
              >
                <Bug className="h-10 w-10 mx-auto mb-3" style={{ color: '#bdc9c7' }} />
                <p className="text-sm font-semibold" style={{ color: '#6d7978' }}>No doses recorded yet.</p>
                <p className="text-xs mt-1" style={{ color: '#bdc9c7' }}>Click "Log Dose" to record treatment.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="relative">
                  {/* Timeline line */}
                  <div
                    className="absolute left-5 top-3 bottom-3 w-px"
                    style={{ background: 'linear-gradient(180deg, #4fb6b2, #eaf6f5)' }}
                  />

                  <div className="space-y-4">
                    {sortedRecords.map((d, index) => (
                      <motion.div
                        key={d._id}
                        layout
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.04 }}
                        className="relative pl-12"
                      >
                        {/* Timeline dot */}
                        <div
                          className="absolute left-3.5 top-5 w-3 h-3 rounded-full z-10"
                          style={{
                            background: '#ffffff',
                            border: '2.5px solid #4fb6b2',
                            boxShadow: '0 0 0 3px rgba(79,182,178,.15)',
                          }}
                        />

                        <Card>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1.5">
                                <h4 className="text-sm font-bold" style={{ color: '#131d1e' }}>{d.productName}</h4>
                                <span
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                                  style={{ background: 'rgba(107,203,119,.1)', color: '#6BCB77' }}
                                >
                                  <CheckCircle2 className="h-3 w-3" /> done
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs" style={{ color: '#bdc9c7' }}>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" /> {formatDate(d.dateAdministered)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> By {d.administeredBy}
                                </span>
                              </div>
                              {d.notes && (
                                <p
                                  className="text-xs italic mt-2 p-3 rounded-xl"
                                  style={{ background: '#eaf6f5', color: '#6d7978' }}
                                >
                                  "{d.notes}"
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => setDeleteTarget(d._id)}
                              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105 flex-shrink-0"
                              style={{ background: 'rgba(231,111,81,.08)', cursor: 'pointer' }}
                              title="Delete record"
                            >
                              <Trash2 className="h-4 w-4 text-[#E76F51]" />
                            </button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </AnimatePresence>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Modals */}
      {petId && (
        <>
          <SetDewormingScheduleModal
            isOpen={isScheduleModalOpen}
            onClose={() => setIsScheduleModalOpen(false)}
            petId={petId}
            existingSchedule={schedule}
          />
          <AddDewormingRecordModal
            isOpen={isRecordModalOpen}
            onClose={() => setIsRecordModalOpen(false)}
            petId={petId}
          />
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Record"
        message="Are you sure you want to delete this deworming record? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        isLoading={deleteRecord.isPending}
      />
    </div>
  );
};

export default DewormingTracker;
