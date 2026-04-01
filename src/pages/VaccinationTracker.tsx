/**
 * VaccinationTracker.tsx — Production Edition
 *
 * How it works:
 * 1. Templates = vaccine definitions (name, species, booster interval)
 * 2. "Record Vaccination" → pick a template (pre-fills form) or add custom
 * 3. Overdue/upcoming cards show what's actionable
 * 4. Completed section is collapsible
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  ArrowLeft, Plus, Syringe, Check, Trash2, ShieldCheck, AlertTriangle,
  Clock, Settings2, CalendarCheck, ChevronDown, ChevronUp,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AddVaccinationModal } from '@/components/modals/AddVaccinationModal';
import { VaccinationTemplatesModal } from '@/components/modals/VaccinationTemplatesModal';

import { usePet } from '@/hooks/usePets';
import {
  useVaccinations,
  useVaccinationTemplates,
  useMarkVaccinationComplete,
  useDeleteVaccination,
} from '@/hooks/useVaccinations';
import { formatDate, formatCountdown } from '@/utils/dateUtils';
import type { VaccinationStatus } from '@/types';

// ─── Design tokens ────────────────────────────────────────────────
const C = {
  onS: '#131d1e',
  onSV: '#3d4948',
  out: '#6d7978',
  outV: '#bdc9c7',
  prim: '#006a67',
  primC: '#4fb6b2',
  green: '#6BCB77',
  red: '#E76F51',
} as const;

const HEAD = 'Manrope, sans-serif';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};
const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

const statusMeta: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  completed: { icon: ShieldCheck, color: C.green, bg: 'rgba(107,203,119,.08)', label: 'Completed' },
  upcoming: { icon: Clock, color: C.primC, bg: 'rgba(79,182,178,.08)', label: 'Upcoming' },
  overdue: { icon: AlertTriangle, color: C.red, bg: 'rgba(231,111,81,.08)', label: 'Overdue' },
};

// ═══════════════════════════════════════════════════════════════════

const VaccinationTracker = () => {
  const { id: petId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<'all' | VaccinationStatus>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const { data: petData } = usePet(petId!);
  const { data: vaccData, isLoading } = useVaccinations(petId!);
  const { data: templatesData } = useVaccinationTemplates();
  const markComplete = useMarkVaccinationComplete();
  const deleteVacc = useDeleteVaccination();

  const pet = petData?.data;
  const allVaccinations = vaccData?.data ?? [];
  const allTemplates = templatesData?.data ?? [];

  // Filter templates matching this pet's type
  const matchingTemplates = pet?.type
    ? allTemplates.filter((t) => t.petType.toLowerCase() === pet.type.toLowerCase())
    : [];

  const overdue = allVaccinations.filter((v) => v.status === 'overdue');
  const upcoming = allVaccinations.filter((v) => v.status === 'upcoming');
  const completed = allVaccinations.filter((v) => v.status === 'completed');

  const filtered = filter === 'all' ? allVaccinations : allVaccinations.filter((v) => v.status === filter);
  const actionable = filtered.filter((v) => v.status !== 'completed');
  const completedFiltered = filtered.filter((v) => v.status === 'completed');

  const sortedActionable = [...actionable].sort((a, b) => {
    const priority: Record<string, number> = { overdue: 0, upcoming: 1 };
    const diff = (priority[a.status] ?? 2) - (priority[b.status] ?? 2);
    if (diff !== 0) return diff;
    return new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
  });

  const sortedCompleted = [...completedFiltered].sort((a, b) => {
    const dateA = a.dateAdministered ? new Date(a.dateAdministered).getTime() : 0;
    const dateB = b.dateAdministered ? new Date(b.dateAdministered).getTime() : 0;
    return dateB - dateA;
  });

  const isEmpty = !isLoading && allVaccinations.length === 0;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ═══ Page Header ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-center gap-4 mb-8"
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-[#eaf6f5] hover:border-[#4fb6b2]"
          style={{
            background: '#ffffff',
            border: '1.5px solid rgba(189,201,199,.4)',
            cursor: 'pointer',
            color: C.onSV,
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-[200px]">
          <h1
            className="font-black tracking-tight"
            style={{ fontFamily: HEAD, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: C.onS, letterSpacing: '-0.025em', lineHeight: 1.1 }}
          >
            Vaccinations
          </h1>
          {pet && <p className="text-sm mt-0.5" style={{ color: C.out }}>{pet.name}'s immunization record</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowTemplatesModal(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-[#eaf6f5]"
            style={{ color: C.out, cursor: 'pointer' }}
            title="Manage vaccine templates"
          >
            <Settings2 className="h-4 w-4" />
          </button>
          <Button size="sm" pill className="gap-1.5" onClick={() => setShowAddModal(true)}>
            <Plus className="h-3.5 w-3.5" /> Record Vaccination
          </Button>
        </div>
      </motion.div>

      {/* ═══ Loading ═══ */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <SkeletonLoader key={i} variant="card" />)}
        </div>
      )}

      {/* ═══ Empty State ═══ */}
      {isEmpty && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card variant="glass" className="text-center py-14 px-8">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'linear-gradient(135deg, #006a67, #4fb6b2)' }}
            >
              <Syringe className="h-10 w-10 text-white" />
            </div>

            <h2 className="text-2xl font-black mb-2" style={{ fontFamily: HEAD, color: C.onS }}>
              Record {pet?.name || 'your pet'}'s vaccinations
            </h2>
            <p className="text-sm max-w-md mx-auto mb-8" style={{ color: C.out }}>
              Keep track of all immunizations. Pick from your vaccine templates for quick entry,
              or add a custom record manually.
            </p>

            {/* Show matching template suggestions */}
            {matchingTemplates.length > 0 && (
              <div className="mb-8">
                <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: C.outV }}>
                  Suggested for {pet?.type?.toLowerCase()}s
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {matchingTemplates.slice(0, 6).map((t) => (
                    <button
                      key={t._id}
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all hover:scale-105"
                      style={{
                        background: t.isCoreVaccine ? 'rgba(0,106,103,.06)' : 'rgba(79,182,178,.06)',
                        color: t.isCoreVaccine ? C.prim : C.primC,
                        border: `1px solid ${t.isCoreVaccine ? 'rgba(0,106,103,.15)' : 'rgba(79,182,178,.15)'}`,
                        cursor: 'pointer',
                      }}
                    >
                      <Syringe className="h-3 w-3" />
                      {t.vaccineName}
                      {t.isCoreVaccine && <span className="text-[8px] opacity-60">CORE</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" pill className="gap-2" onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4" /> Record Vaccination
              </Button>
            </div>

            {matchingTemplates.length === 0 && (
              <p className="text-[11px] mt-6" style={{ color: C.outV }}>
                No templates found for {pet?.type?.toLowerCase() || 'this pet type'}.{' '}
                <button
                  onClick={() => setShowTemplatesModal(true)}
                  className="underline hover:text-[#006a67] transition-colors"
                  style={{ color: C.primC, cursor: 'pointer' }}
                >
                  Create templates
                </button>{' '}
                for quick-fill when recording vaccinations.
              </p>
            )}
          </Card>
        </motion.div>
      )}

      {/* ═══ Has Vaccinations ═══ */}
      {!isLoading && allVaccinations.length > 0 && (
        <>
          {/* ── Overdue Alert Banner ── */}
          {overdue.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="flex items-center gap-3 p-4 rounded-2xl mb-6"
              style={{ background: 'rgba(231,111,81,.06)', border: '1px solid rgba(231,111,81,.15)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(231,111,81,.12)' }}>
                <AlertTriangle className="h-5 w-5" style={{ color: C.red }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: C.red }}>
                  {overdue.length} overdue vaccination{overdue.length > 1 ? 's' : ''}
                </p>
                <p className="text-xs" style={{ color: C.out }}>
                  {pet?.name} has vaccines past their due date. Contact your vet to catch up.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Summary Stats (clickable filters) ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            {Object.entries(statusMeta).map(([key, s]) => {
              const count = key === 'completed' ? completed.length : key === 'upcoming' ? upcoming.length : overdue.length;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(filter === key ? 'all' : key as VaccinationStatus)}
                  className="rounded-2xl p-4 text-center transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: filter === key ? `${s.color}18` : s.bg,
                    border: filter === key ? `2px solid ${s.color}40` : `1px solid ${s.color}12`,
                    cursor: 'pointer',
                  }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: `${s.color}18` }}>
                    <s.icon className="h-4 w-4" style={{ color: s.color }} />
                  </div>
                  <p className="text-2xl font-black" style={{ color: s.color, fontFamily: HEAD }}>{count}</p>
                  <p className="text-[11px] font-semibold" style={{ color: C.out }}>{s.label}</p>
                </button>
              );
            })}
          </motion.div>

          {/* ── Active filter indicator ── */}
          {filter !== 'all' && (
            <div className="flex items-center gap-2 mb-4">
              <p className="text-xs font-semibold" style={{ color: C.out }}>
                Showing: <span style={{ color: C.prim }}>{statusMeta[filter]?.label}</span>
              </p>
              <button
                onClick={() => setFilter('all')}
                className="text-xs font-bold px-2 py-0.5 rounded-full transition-colors hover:bg-[#eaf6f5]"
                style={{ color: C.primC, cursor: 'pointer' }}
              >
                Clear
              </button>
            </div>
          )}

          {/* ── Actionable Vaccinations (Overdue + Upcoming) ── */}
          {sortedActionable.length > 0 && (
            <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3 mb-6">
              {sortedActionable.map((v) => {
                const meta = statusMeta[v.status] || statusMeta.upcoming;
                const SIcon = meta.icon;

                return (
                  <motion.div key={v._id} variants={fadeUp}>
                    <Card
                      style={{
                        overflow: 'hidden',
                        borderLeft: v.status === 'overdue' ? `4px solid ${C.red}` : undefined,
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: meta.bg }}
                        >
                          <SIcon className="h-5 w-5" style={{ color: meta.color }} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-bold truncate" style={{ color: C.onS }}>{v.vaccineName}</h3>
                            <StatusBadge status={v.status} />
                          </div>
                          <p className="text-xs" style={{ color: C.out }}>
                            Due: {formatDate(v.nextDueDate)}
                            {v.status === 'upcoming' && ` · ${formatCountdown(v.nextDueDate)}`}
                            {v.status === 'overdue' && ' · Past due'}
                          </p>
                          {v.notes && <p className="text-xs mt-1 italic" style={{ color: C.outV }}>{v.notes}</p>}
                        </div>

                        <div className="flex gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => markComplete.mutate(v._id)}
                            disabled={markComplete.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                            style={{ background: 'rgba(107,203,119,.1)', color: C.green, cursor: 'pointer' }}
                            title="Mark as given"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Done</span>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(v._id)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                            style={{ background: 'rgba(231,111,81,.06)', cursor: 'pointer' }}
                            title="Remove"
                          >
                            <Trash2 className="h-3.5 w-3.5" style={{ color: C.red }} />
                          </button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* ── Completed Section (collapsible) ── */}
          {sortedCompleted.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 mb-3 text-sm font-bold transition-colors hover:text-[#006a67]"
                style={{ color: C.out, cursor: 'pointer' }}
              >
                <CalendarCheck className="h-4 w-4" />
                Completed ({sortedCompleted.length})
                {showCompleted ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {showCompleted && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                  {sortedCompleted.map((v) => (
                    <div
                      key={v._id}
                      className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/60 group"
                      style={{ border: '1px solid rgba(189,201,199,.15)' }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(107,203,119,.08)' }}>
                        <ShieldCheck className="h-4 w-4" style={{ color: C.green }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: C.onS }}>{v.vaccineName}</p>
                        <p className="text-[11px]" style={{ color: C.outV }}>
                          {v.dateAdministered ? `Given ${formatDate(v.dateAdministered)}` : 'Completed'}
                          {v.veterinarianName && ` · ${v.veterinarianName}`}
                          {v.clinicName && ` · ${v.clinicName}`}
                        </p>
                      </div>
                      <button
                        onClick={() => setDeleteTarget(v._id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ cursor: 'pointer' }}
                        title="Remove record"
                      >
                        <Trash2 className="h-3.5 w-3.5" style={{ color: C.outV }} />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          {/* ── No results for current filter ── */}
          {sortedActionable.length === 0 && sortedCompleted.length === 0 && (
            <div className="text-center py-12">
              <Syringe className="h-10 w-10 mx-auto mb-3" style={{ color: C.outV }} />
              <p className="text-sm font-semibold" style={{ color: C.out }}>
                No {statusMeta[filter]?.label.toLowerCase()} vaccinations
              </p>
            </div>
          )}
        </>
      )}

      {/* ═══ Modals ═══ */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteVacc.mutate({ id: deleteTarget, petId: petId! });
          setDeleteTarget(null);
        }}
        title="Delete Vaccination"
        message="Are you sure you want to delete this vaccination record? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />

      {petId && (
        <AddVaccinationModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          petId={petId}
          petType={pet?.type}
        />
      )}

      <VaccinationTemplatesModal
        open={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
      />
    </div>
  );
};

export default VaccinationTracker;
