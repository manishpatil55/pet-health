import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Pill } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { AddMedicationModal } from '@/components/modals/AddMedicationModal';
import { usePet } from '@/hooks/usePets';
import { useMedications } from '@/hooks/useMedications';

type Tab = 'active' | 'completed';

const MedicationTracker = () => {
  const { id: petId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('active');
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: petData } = usePet(petId!);
  const { data: medsResponse, isLoading } = useMedications(petId!);

  const pet = petData?.data;
  const allMeds = medsResponse?.data ?? [];
  const filtered = allMeds.filter((m) => (tab === 'active' ? m.status === 'active' || m.status === 'ongoing' : m.status === 'completed' || m.status === 'stopped'));

  return (
    <>
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-[#7A8A8A] hover:text-[#2F3A3A]"><ArrowLeft className="h-5 w-5" /></button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#2F3A3A]">Medications</h1>
          {pet && <p className="text-sm text-[#7A8A8A]">{pet.name}</p>}
        </div>
        <Button size="sm" className="gap-1" onClick={() => setShowAddModal(true)}><Plus className="h-4 w-4" /> Add</Button>
      </div>

      <div className="flex gap-2">
        {(['active', 'completed'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              tab === t ? 'bg-[#4FB6B2] text-white' : 'bg-[#F7FAFA] text-[#7A8A8A] hover:bg-[#CFEDEA]'
            }`}
          >
            {t} ({allMeds.filter((m) => (t === 'active' ? m.status === 'active' : m.status !== 'active')).length})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2].map((i) => <SkeletonLoader key={i} variant="card" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Pill}
          title={`No ${tab} medications`}
          description="Add a medication to track dosage and schedule."
        />
      ) : (
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
              custom: 'Custom',
            };

            return (
              <motion.div key={m._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                <Card>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-[#2F3A3A]">{m.medicineName}</h3>
                      <p className="text-xs text-[#7A8A8A]">{m.dosage} · {freqLabel[m.frequency] ?? m.frequency}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      m.status === 'active' ? 'bg-[#F2B544]/15 text-[#F2B544]' : 'bg-[#6BCB77]/15 text-[#6BCB77]'
                    }`}>{m.status}</span>
                  </div>
                  {m.status === 'active' && (
                    <>
                      <div className="h-2 bg-[#E6EEEE] rounded-full overflow-hidden mb-2">
                        <motion.div
                          className="h-full bg-[#4FB6B2] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-[#7A8A8A]">
                        <span>{Math.round(pct)}% complete</span>
                        <span>{daysLeft} days remaining</span>
                      </div>
                    </>
                  )}
                  {m.notes && <p className="text-xs text-[#7A8A8A] mt-2 italic">{m.notes}</p>}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>

    <AddMedicationModal
      open={showAddModal}
      onClose={() => setShowAddModal(false)}
      petId={petId!}
    />
    </>
  );
};

export default MedicationTracker;
