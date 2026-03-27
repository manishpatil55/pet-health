import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Sort records newest first
  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => new Date(b.dateAdministered).getTime() - new Date(a.dateAdministered).getTime()),
    [records],
  );

  // Compute next due
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

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-[#7A8A8A] hover:text-[#2F3A3A]"><ArrowLeft className="h-5 w-5" /></button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#2F3A3A]">Deworming</h1>
          {pet && <p className="text-sm text-[#7A8A8A]">{pet.name}</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {schedule && (
            <Button size="sm" className="gap-1" onClick={() => setIsRecordModalOpen(true)}>
              <Bug className="h-4 w-4" /> Log Dose
            </Button>
          )}
          <Button variant="secondary" size="sm" className="gap-1" onClick={() => setIsScheduleModalOpen(true)}>
            <CalendarCheck className="h-4 w-4" /> {schedule ? 'Edit Schedule' : 'Set Schedule'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2].map((i) => <SkeletonLoader key={i} variant="card" />)}</div>
      ) : !schedule ? (
        <EmptyState
          icon={Bug}
          title="No Deworming Schedule"
          description="Set up a deworming frequency first, then log each dose to keep track."
          actionLabel="Set Schedule"
          onAction={() => setIsScheduleModalOpen(true)}
        />
      ) : (
        <>
          {/* Summary row */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="!p-4">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-4 w-4 text-[#4FB6B2]" />
                <p className="text-xs text-[#7A8A8A]">Schedule</p>
              </div>
              <p className="text-lg font-bold text-[#2F3A3A]">{freqLabels[schedule.frequency] || schedule.frequency}</p>
            </Card>
            <Card className="!p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-[#6BCB77]" />
                <p className="text-xs text-[#7A8A8A]">Total Doses</p>
              </div>
              <p className="text-lg font-bold text-[#2F3A3A]">{records.length}</p>
            </Card>
          </div>

          {/* Next due banner */}
          {nextDueDateStr && nextDueStatus && (
            <Card className={`!border-l-4 ${nextDueStatus === 'overdue' ? '!border-l-[#E76F51] bg-[#E76F51]/[0.03]' : nextDueStatus === 'upcoming' ? '!border-l-[#F2B544] bg-[#F2B544]/[0.03]' : '!border-l-[#6BCB77] bg-[#6BCB77]/[0.03]'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {nextDueStatus === 'overdue' ? (
                      <AlertTriangle className="h-4 w-4 text-[#E76F51]" />
                    ) : (
                      <Calendar className="h-4 w-4 text-[#F2B544]" />
                    )}
                    <h3 className="text-sm font-semibold text-[#2F3A3A]">
                      {nextDueStatus === 'overdue' ? 'Overdue!' : 'Next Due'}
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-[#2F3A3A] mb-0.5">{formatCountdown(nextDueDateStr)}</p>
                  <p className="text-xs text-[#7A8A8A]">{formatDate(nextDueDateStr)}</p>
                </div>
                <StatusBadge status={nextDueStatus} />
              </div>
            </Card>
          )}

          {/* Dose history (timeline style) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-[#2F3A3A]">Dose History</h3>
              <span className="text-xs text-[#7A8A8A]">{records.length} record{records.length !== 1 ? 's' : ''}</span>
            </div>

            {records.length === 0 ? (
              <div className="text-center py-10 bg-[#F5F7F7] rounded-2xl border border-dashed border-[#E5E9E9]">
                <Bug className="h-8 w-8 text-[#7A8A8A]/40 mx-auto mb-2" />
                <p className="text-sm text-[#7A8A8A]">No doses recorded yet.</p>
                <p className="text-xs text-[#7A8A8A] mt-1">Click "Log Dose" to record your pet's first treatment.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-5 top-3 bottom-3 w-px bg-[#E6EEEE]" />

                  <div className="space-y-3">
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
                        <div className="absolute left-3.5 top-4 w-3 h-3 rounded-full border-2 border-[#4FB6B2] bg-white z-10" />

                        <Card>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-semibold text-[#2F3A3A]">{d.productName}</h4>
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#6BCB77]/15 text-[#6BCB77]">
                                  <CheckCircle2 className="h-3 w-3 inline mr-0.5" />
                                  done
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-[#7A8A8A] mb-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" /> {formatDate(d.dateAdministered)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> By {d.administeredBy}
                                </span>
                              </div>
                              {d.notes && (
                                <p className="text-xs text-[#7A8A8A] bg-[#F5F7F7] p-2 rounded-lg italic mt-2">"{d.notes}"</p>
                              )}
                            </div>
                            <button
                              onClick={() => setDeleteTarget(d._id)}
                              className="p-2 text-[#7A8A8A] hover:text-[#E76F51] hover:bg-[#E76F51]/10 rounded-lg transition-colors flex-shrink-0"
                              title="Delete record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </AnimatePresence>
            )}
          </div>
        </>
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

      {/* Delete confirmation */}
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
    </motion.div>
  );
};

export default DewormingTracker;
