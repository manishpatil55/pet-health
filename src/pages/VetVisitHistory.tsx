import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Stethoscope, ChevronDown, ChevronUp } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { AddVetVisitModal } from '@/components/modals/AddVetVisitModal';
import { usePet } from '@/hooks/usePets';
import { useVetVisits } from '@/hooks/useVetVisits';
import { formatDate } from '@/utils/dateUtils';

const VetVisitHistory = () => {
  const { id: petId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: petData } = usePet(petId!);
  const { data: visitsResponse, isLoading } = useVetVisits(petId!);

  const pet = petData?.data;
  const vetVisits = visitsResponse?.data ?? [];
  const sorted = [...vetVisits].sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

  return (
    <>
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-[#7A8A8A] hover:text-[#2F3A3A]"><ArrowLeft className="h-5 w-5" /></button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#2F3A3A]">Vet Visits</h1>
          {pet && <p className="text-sm text-[#7A8A8A]">{pet.name}</p>}
        </div>
        <Button size="sm" className="gap-1" onClick={() => setShowAddModal(true)}><Plus className="h-4 w-4" /> Add Visit</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2].map((i) => <SkeletonLoader key={i} variant="card" />)}</div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No vet visits"
          description="Record your pet's vet visits to keep a complete medical history."
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((v, index) => {
            const isExpanded = expandedId === v._id;
            return (
              <motion.div key={v._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                <Card>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : v._id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-[#2F3A3A]">{v.clinicName}</h3>
                          {v.cost !== undefined && (
                            <span className="text-xs font-medium text-[#4FB6B2]">₹{v.cost}</span>
                          )}
                        </div>
                        <p className="text-xs text-[#7A8A8A]">
                          {v.veterinarianName} · {formatDate(v.visitDate)}
                        </p>
                        <p className="text-sm text-[#2F3A3A] mt-1 line-clamp-1">{v.diagnosis}</p>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-[#7A8A8A]" /> : <ChevronDown className="h-4 w-4 text-[#7A8A8A]" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 mt-3 border-t border-[#E6EEEE] space-y-2">
                          <div>
                            <p className="text-xs font-medium text-[#7A8A8A] mb-0.5">Diagnosis</p>
                            <p className="text-sm text-[#2F3A3A]">{v.diagnosis}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-[#7A8A8A] mb-0.5">Treatment</p>
                            <p className="text-sm text-[#2F3A3A]">{v.treatment}</p>
                          </div>
                          {v.notes && (
                            <div>
                              <p className="text-xs font-medium text-[#7A8A8A] mb-0.5">Notes</p>
                              <p className="text-sm text-[#2F3A3A] italic">{v.notes}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>

    <AddVetVisitModal
      open={showAddModal}
      onClose={() => setShowAddModal(false)}
      petId={petId!}
    />
    </>
  );
};

export default VetVisitHistory;
