/**
 * VetVisitHistory.tsx — Clinical Sanctuary Edition
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowLeft, Plus, Stethoscope, ChevronDown, ChevronUp, Trash2, MapPin, Calendar } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AddVetVisitModal } from '@/components/modals/AddVetVisitModal';
import { usePet } from '@/hooks/usePets';
import { useVetVisits, useDeleteVetVisit } from '@/hooks/useVetVisits';
import { formatDate } from '@/utils/dateUtils';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};
const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

const VetVisitHistory = () => {
  const { id: petId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: petData } = usePet(petId!);
  const { data: visitsResponse, isLoading } = useVetVisits(petId!);
  const deleteVisit = useDeleteVetVisit();

  const pet = petData?.data;
  const vetVisits = visitsResponse?.data ?? [];
  const sorted = [...vetVisits].sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

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
            Vet Visits
          </h1>
          {pet && <p className="text-sm mt-0.5" style={{ color: '#6d7978' }}>{pet.name}'s medical history</p>}
        </div>
        <Button size="sm" pill className="gap-1.5" onClick={() => setShowAddModal(true)}>
          <Plus className="h-3.5 w-3.5" /> Add Visit
        </Button>
      </motion.div>

      {/* ── Summary ── */}
      {!isLoading && vetVisits.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06, ease: [0.16, 1, 0.3, 1] as const }}
          className="mb-8"
        >
          <div
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: 'rgba(79,182,178,.06)', border: '1px solid rgba(79,182,178,.12)' }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(79,182,178,.15)' }}>
              <Stethoscope className="h-6 w-6 text-[#4fb6b2]" />
            </div>
            <div>
              <p className="text-3xl font-black" style={{ color: '#006a67', fontFamily: 'Manrope, sans-serif' }}>{vetVisits.length}</p>
              <p className="text-[11px] font-semibold" style={{ color: '#6d7978' }}>{vetVisits.length === 1 ? 'Visit' : 'Total Visits'} Recorded</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Cards ── */}
      {isLoading ? (
        <div className="space-y-4">{[1, 2].map((i) => <SkeletonLoader key={i} variant="card" />)}</div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No vet visits"
          description="Record your pet's vet visits to keep a complete medical history."
        />
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
          {sorted.map((v) => {
            const isExpanded = expandedId === v._id;
            return (
              <motion.div key={v._id} variants={fadeUp}>
                <Card>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : v._id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start gap-4">
                      {/* Clinic icon */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'rgba(79,182,178,.1)' }}
                      >
                        <Stethoscope className="h-5 w-5 text-[#4fb6b2]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold truncate" style={{ color: '#131d1e' }}>{v.clinicName}</h3>
                          {v.cost !== undefined && (
                            <span
                              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(79,182,178,.1)', color: '#006a67' }}
                            >
                              ₹{v.cost}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs" style={{ color: '#bdc9c7' }}>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {v.veterinarianName}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(v.visitDate)}</span>
                        </div>
                        <p className="text-sm mt-1.5 line-clamp-1" style={{ color: '#3d4948' }}>{v.diagnosis}</p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(v._id); }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                          style={{ background: 'rgba(231,111,81,.08)', cursor: 'pointer' }}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-[#E76F51]" />
                        </button>
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: '#eaf6f5' }}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-[#6d7978]" /> : <ChevronDown className="h-4 w-4 text-[#6d7978]" />}
                        </div>
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
                        className="overflow-hidden"
                      >
                        <div
                          className="pt-4 mt-4 space-y-3"
                          style={{ borderTop: '1px solid rgba(189,201,199,.15)' }}
                        >
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#bdc9c7' }}>Diagnosis</p>
                            <p className="text-sm" style={{ color: '#131d1e' }}>{v.diagnosis}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#bdc9c7' }}>Treatment</p>
                            <p className="text-sm" style={{ color: '#131d1e' }}>{v.treatment}</p>
                          </div>
                          {v.notes && (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#bdc9c7' }}>Notes</p>
                              <p className="text-sm italic p-3 rounded-xl" style={{ background: '#eaf6f5', color: '#6d7978' }}>"{v.notes}"</p>
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
        </motion.div>
      )}

      <AddVetVisitModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        petId={petId!}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteVisit.mutate({ id: deleteTarget, petId: petId! });
          setDeleteTarget(null);
        }}
        title="Delete Vet Visit"
        message="Are you sure you want to delete this vet visit record? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default VetVisitHistory;
