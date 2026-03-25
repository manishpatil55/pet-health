import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bug, CalendarCheck } from 'lucide-react';
import toast from 'react-hot-toast';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { usePet } from '@/hooks/usePets';
import { useDeworming } from '@/hooks/useDeworming';
import { formatDate, formatCountdown } from '@/utils/dateUtils';

const DewormingTracker = () => {
  const { id: petId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: petData } = usePet(petId!);
  const { data: records, isLoading } = useDeworming(petId!);

  const pet = petData?.data;
  const dewormings = records ?? [];
  const nextDue = dewormings.find((d) => d.status === 'upcoming' || d.status === 'overdue');

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-[#7A8A8A] hover:text-[#2F3A3A]"><ArrowLeft className="h-5 w-5" /></button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#2F3A3A]">Deworming</h1>
          {pet && <p className="text-sm text-[#7A8A8A]">{pet.name}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="gap-1" onClick={() => toast.success('Schedule setup coming soon!')}><CalendarCheck className="h-4 w-4" /> Set Schedule</Button>
          <Button size="sm" className="gap-1" onClick={() => toast.success('Mark done coming soon!')}><Bug className="h-4 w-4" /> Mark Done</Button>
        </div>
      </div>

      {isLoading ? (
        <SkeletonLoader variant="card" />
      ) : dewormings.length === 0 ? (
        <EmptyState
          icon={Bug}
          title="No deworming schedule"
          description="Set up a deworming schedule to keep your pet protected."
        />
      ) : (
        <>
          {nextDue && (
            <Card className={nextDue.status === 'overdue' ? '!border-l-4 !border-l-[#E76F51]' : '!border-l-4 !border-l-[#F2B544]'}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[#2F3A3A] mb-1">
                    {nextDue.status === 'overdue' ? 'Overdue!' : 'Next Due'}
                  </h3>
                  <p className="text-3xl font-bold text-[#2F3A3A] mb-1">{formatCountdown(nextDue.nextDueDate)}</p>
                  <p className="text-xs text-[#7A8A8A]">
                    {formatDate(nextDue.nextDueDate)} · {nextDue.frequency} schedule
                  </p>
                </div>
                <StatusBadge status={nextDue.status} />
              </div>
            </Card>
          )}

          <div>
            <h3 className="text-base font-semibold text-[#2F3A3A] mb-3">History</h3>
            <div className="space-y-3">
              {dewormings.map((d, index) => (
                <motion.div key={d._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                  <Card>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#2F3A3A]">
                          Last: {formatDate(d.lastDate)}
                        </p>
                        <p className="text-xs text-[#7A8A8A]">
                          Next due: {formatDate(d.nextDueDate)} · {d.frequency}
                        </p>
                        {d.notes && <p className="text-xs text-[#7A8A8A] mt-1 italic">{d.notes}</p>}
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default DewormingTracker;
