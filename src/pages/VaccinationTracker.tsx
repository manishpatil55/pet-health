/**
 * VaccinationTracker.tsx — Clinical Sanctuary Edition
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowLeft, Plus, Syringe, Zap, Check, Trash2, ShieldCheck, AlertTriangle, Clock } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AddVaccinationModal } from '@/components/modals/AddVaccinationModal';

import { usePet } from '@/hooks/usePets';
import {
  useVaccinations,
  useAutoGenerateVaccinations,
  useMarkVaccinationComplete,
  useDeleteVaccination,
} from '@/hooks/useVaccinations';
import { formatDate, formatCountdown } from '@/utils/dateUtils';
import type { VaccinationStatus } from '@/types';

type Filter = 'all' | VaccinationStatus;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};
const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

const statusIcon: Record<string, React.ElementType> = {
  completed: ShieldCheck,
  upcoming: Clock,
  overdue: AlertTriangle,
};
const statusColor: Record<string, string> = {
  completed: '#6BCB77',
  upcoming: '#4fb6b2',
  overdue: '#E76F51',
};

const VaccinationTracker = () => {
  const { id: petId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: petData } = usePet(petId!);
  const { data: vaccData, isLoading } = useVaccinations(petId!);
  const autoGenerate = useAutoGenerateVaccinations();
  const markComplete = useMarkVaccinationComplete();
  const deleteVacc = useDeleteVaccination();

  const pet = petData?.data;
  const allVaccinations = vaccData?.data ?? [];

  const overdueCount = allVaccinations.filter((v) => v.status === 'overdue').length;
  const upcomingCount = allVaccinations.filter((v) => v.status === 'upcoming').length;
  const completedCount = allVaccinations.filter((v) => v.status === 'completed').length;

  const filtered = filter === 'all' ? allVaccinations : allVaccinations.filter((v) => v.status === filter);
  const sorted = [...filtered].sort((a, b) => {
    const priority: Record<string, number> = { overdue: 0, upcoming: 1, completed: 2 };
    return (priority[a.status] ?? 3) - (priority[b.status] ?? 3);
  });

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: allVaccinations.length },
    { key: 'overdue', label: 'Overdue', count: overdueCount },
    { key: 'upcoming', label: 'Upcoming', count: upcomingCount },
    { key: 'completed', label: 'Completed', count: completedCount },
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-center gap-4 mb-8"
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
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#eaf6f5';
            e.currentTarget.style.borderColor = '#4fb6b2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.borderColor = 'rgba(189,201,199,.4)';
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-[200px]">
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
            Vaccinations
          </h1>
          {pet && <p className="text-sm mt-0.5" style={{ color: '#6d7978' }}>{pet.name}'s immunization record</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            pill
            className="gap-1.5"
            onClick={() => autoGenerate.mutate(petId!)}
            isLoading={autoGenerate.isPending}
          >
            <Zap className="h-3.5 w-3.5" /> Auto
          </Button>
          <Button size="sm" pill className="gap-1.5" onClick={() => setShowAddModal(true)}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </motion.div>

      {/* ── Summary Cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-3 gap-3 mb-8"
      >
        {[
          { label: 'Completed', count: completedCount, color: '#6BCB77', bg: 'rgba(107,203,119,.08)', icon: ShieldCheck },
          { label: 'Upcoming', count: upcomingCount, color: '#4fb6b2', bg: 'rgba(79,182,178,.08)', icon: Clock },
          { label: 'Overdue', count: overdueCount, color: '#E76F51', bg: 'rgba(231,111,81,.08)', icon: AlertTriangle },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4 text-center"
            style={{ background: s.bg, border: `1px solid ${s.color}15` }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: `${s.color}18` }}>
              <s.icon className="h-4 w-4" style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-black" style={{ color: s.color, fontFamily: 'Manrope, sans-serif' }}>{s.count}</p>
            <p className="text-[11px] font-semibold" style={{ color: '#6d7978' }}>{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Filter Pills ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="flex gap-2 overflow-x-auto pb-1 mb-6"
      >
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200"
            style={{
              background: filter === f.key
                ? 'linear-gradient(135deg, #006a67, #4fb6b2)'
                : '#ffffff',
              color: filter === f.key ? '#ffffff' : '#6d7978',
              border: filter === f.key ? 'none' : '1.5px solid rgba(189,201,199,.3)',
              boxShadow: filter === f.key ? '0 4px 16px rgba(0,106,103,0.25)' : 'none',
              cursor: 'pointer',
            }}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </motion.div>

      {/* ── Cards ── */}
      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <SkeletonLoader key={i} variant="card" />)}</div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={Syringe}
          title={filter === 'all' ? 'No vaccinations yet' : `No ${filter} vaccinations`}
          description="Use Auto-Generate to create a vaccination schedule or add one manually."
        />
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
          {sorted.map((v) => {
            const SIcon = statusIcon[v.status] || Syringe;
            const sColor = statusColor[v.status] || '#4fb6b2';

            return (
              <motion.div key={v._id} variants={fadeUp}>
                <Card
                  className={v.status === 'overdue' ? '!border-l-4 !border-l-[#E76F51]' : ''}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="flex items-start gap-4">
                    {/* Status icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${sColor}15` }}
                    >
                      <SIcon className="h-5 w-5" style={{ color: sColor }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className="text-sm font-bold truncate"
                          style={{ color: '#131d1e' }}
                        >
                          {v.vaccineName}
                        </h3>
                        <StatusBadge status={v.status} />
                      </div>
                      <p className="text-xs" style={{ color: '#6d7978' }}>
                        {v.status === 'completed' && v.dateAdministered
                          ? `Given on ${formatDate(v.dateAdministered)}`
                          : `Due: ${formatDate(v.nextDueDate)}`}
                        {v.status === 'upcoming' && ` · ${formatCountdown(v.nextDueDate)}`}
                      </p>
                      {v.veterinarianName && (
                        <p className="text-xs mt-1" style={{ color: '#bdc9c7' }}>
                          {v.veterinarianName}{v.clinicName ? ` · ${v.clinicName}` : ''}
                        </p>
                      )}
                      {v.notes && <p className="text-xs mt-1 italic" style={{ color: '#bdc9c7' }}>{v.notes}</p>}
                    </div>

                    <div className="flex gap-1.5 flex-shrink-0">
                      {v.status !== 'completed' && (
                        <button
                          onClick={() => markComplete.mutate(v._id)}
                          disabled={markComplete.isPending}
                          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                          style={{ background: 'rgba(107,203,119,.1)', cursor: 'pointer' }}
                          title="Mark Complete"
                        >
                          <Check className="h-4 w-4 text-[#6BCB77]" />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget(v._id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                        style={{ background: 'rgba(231,111,81,.08)', cursor: 'pointer' }}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-[#E76F51]" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteVacc.mutate({ id: deleteTarget, petId: petId! });
          setDeleteTarget(null);
        }}
        title="Delete Vaccination"
        message="Are you sure you want to delete this vaccination record?"
        confirmLabel="Delete"
        variant="danger"
      />

      {petId && (
        <AddVaccinationModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          petId={petId}
        />
      )}
    </div>
  );
};

export default VaccinationTracker;
