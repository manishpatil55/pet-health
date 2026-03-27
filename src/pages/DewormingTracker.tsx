import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bug, CalendarCheck } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SetDewormingScheduleModal } from '@/components/modals/SetDewormingScheduleModal';
import { AddDewormingRecordModal } from '@/components/modals/AddDewormingRecordModal';
import { usePet } from '@/hooks/usePets';
import { useDewormingSchedule, useDewormingHistory } from '@/hooks/useDeworming';
import { formatDate, formatCountdown } from '@/utils/dateUtils';
import { calculateNextDue, getComputedStatus } from '@/utils/dewormingUtils';
import type { DewormingStatus } from '@/types';



const DewormingTracker = () => {
  const { id: petId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  const { data: petData } = usePet(petId!);
  const { data: scheduleData, isLoading: isLoadingSchedule } = useDewormingSchedule(petId!);
  const { data: historyData, isLoading: isLoadingHistory } = useDewormingHistory(petId!);

  const pet = petData?.data;
  const schedule = scheduleData?.data;
  const records = historyData?.data || [];
  
  const isLoading = isLoadingSchedule || isLoadingHistory;

  // Compute next due based on schedule & latest record
  let nextDueDateStr: string | null = null;
  let nextDueStatus: DewormingStatus | null = null;

  if (schedule) {
    if (records.length > 0) {
      // Assuming array is sorted by highest date first, or we just sort it safely
      const sortedRecords = [...records].sort((a, b) => new Date(b.dateAdministered).getTime() - new Date(a.dateAdministered).getTime());
      const latestRecord = sortedRecords[0];
      nextDueDateStr = calculateNextDue(latestRecord.dateAdministered, schedule.frequency);
      nextDueStatus = getComputedStatus(nextDueDateStr);
    } else {
      // If there's a schedule but no records, it's due today basically
      nextDueDateStr = new Date().toISOString();
      nextDueStatus = 'overdue';
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6 pb-24">
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
        <SkeletonLoader variant="card" />
      ) : !schedule ? (
        <EmptyState
          icon={Bug}
          title="No Deworming Schedule"
          description="Set up a frequency schedule first, then you can start logging records."
          actionLabel="Set Schedule"
          onAction={() => setIsScheduleModalOpen(true)}
        />
      ) : (
        <>
          {nextDueDateStr && nextDueStatus && (
            <Card className={nextDueStatus === 'overdue' ? '!border-l-4 !border-l-[#E76F51]' : '!border-l-4 !border-l-[#F2B544]'}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[#2F3A3A] mb-1">
                    {nextDueStatus === 'overdue' ? 'Overdue!' : 'Next Due'}
                  </h3>
                  <p className="text-3xl font-bold text-[#2F3A3A] mb-1">{formatCountdown(nextDueDateStr)}</p>
                  <p className="text-xs text-[#7A8A8A]">
                    {formatDate(nextDueDateStr)} · {schedule.frequency}
                  </p>
                </div>
                <StatusBadge status={nextDueStatus} />
              </div>
            </Card>
          )}

          <div>
            <h3 className="text-base font-semibold text-[#2F3A3A] mb-3">Dose History</h3>
            
            {records.length === 0 ? (
               <div className="text-center py-8 bg-[#F5F7F7] rounded-2xl border border-dashed border-[#E5E9E9]">
                 <p className="text-[#7A8A8A]">No doses recorded yet.</p>
               </div>
            ) : (
              <div className="space-y-3">
                {[...records].sort((a, b) => new Date(b.dateAdministered).getTime() - new Date(a.dateAdministered).getTime()).map((d, index) => (
                  <motion.div key={d._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                    <Card>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-base font-medium text-[#2F3A3A]">
                            {d.productName}
                          </p>
                          <p className="text-xs text-[#7A8A8A] mt-1 mb-2">
                             Given on {formatDate(d.dateAdministered)} · By {d.administeredBy}
                          </p>
                          {d.notes && <p className="text-xs text-[#7A8A8A] mt-1 bg-[#F5F7F7] p-2 rounded-lg italic">"{d.notes}"</p>}
                        </div>
                        <StatusBadge status="completed" />
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

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
    </motion.div>
  );
};

export default DewormingTracker;
