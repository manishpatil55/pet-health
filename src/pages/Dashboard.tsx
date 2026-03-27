/**
 * Dashboard.tsx — Clinical Sanctuary · Bento Dashboard Edition
 * Drop-in replacement. ALL hooks, derived data, and logic from Doc 15 unchanged.
 *
 * Design: merges Doc 14 (Stitch mockup) aesthetics into the Clinical Sanctuary
 * design system — gradient ring health score, hero pet card, urgent alert banner,
 * vitals bento grid with weight bar-chart + medication progress bars,
 * last vet visit wide card, animated quick-action cards.
 */

import { useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PawPrint, Syringe, Pill, Bug, Stethoscope, Weight,
  AlertTriangle, CalendarClock, TrendingUp, TrendingDown,
  Minus, ChevronRight, ArrowRight, Plus, Activity,
} from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';

import { usePets } from '@/hooks/usePets';
import { useVaccinations } from '@/hooks/useVaccinations';
import { useMedications } from '@/hooks/useMedications';
import { useDewormingSchedule, useDewormingHistory } from '@/hooks/useDeworming';
import { useVetVisits } from '@/hooks/useVetVisits';
import { useWeightEntries } from '@/hooks/useWeight';
import { useAuthStore } from '@/store/authStore';
import { usePetStore } from '@/store/petStore';

import { formatDate, calculateAge, formatCountdown, isWithinDays } from '@/utils/dateUtils';
import { calculateNextDue, getComputedStatus } from '@/utils/dewormingUtils';
import { ROUTES, buildPath } from '@/constants/routes';
import type { DewormingStatus } from '@/types';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: '#f0fcfb',
  lo: '#eaf6f5',
  hi: '#dfebea',
  dim: '#d9e5e4',
  surf: '#ffffff',
  prim: '#006a67',
  primC: '#4fb6b2',
  primF: '#8ff3ef',
  primDk: '#004442',
  sec: '#006e29',
  secC: '#93f59c',
  tertC: '#d69c2c',
  error: '#ba1a1a',
  errC: '#ffdad6',
  onS: '#131d1e',
  onSV: '#3d4948',
  out: '#6d7978',
  outV: '#bdc9c7',
} as const;

const SIG = 'linear-gradient(135deg,#006a67 0%,#4fb6b2 100%)';
const HEAD = 'Manrope, sans-serif';
const BODY = 'Plus Jakarta Sans, sans-serif';

// ─── Framer variants ─────────────────────────────────────────────────────────
const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};
const stagger: any = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

// ─── Bento card shell ─────────────────────────────────────────────────────────
function BC({
  children,
  className = '',
  dark = false,
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-3xl p-7 flex flex-col ${className}`}
      style={{
        background: dark ? C.primDk : C.surf,
        boxShadow: dark
          ? '0 8px 32px rgba(0,68,66,.22)'
          : '0 2px 20px rgba(19,29,30,.06)',
        border: dark ? 'none' : '1px solid rgba(189,201,199,.22)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Section header inside bento card ────────────────────────────────────────
function SHead({
  icon: Icon,
  title,
  to,
  dark = false,
}: {
  icon: React.ElementType;
  title: string;
  to: string;
  dark?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: dark ? 'rgba(143,243,239,.15)' : C.lo }}
        >
          <Icon
            className="h-4 w-4"
            style={{ color: dark ? C.primF : C.primC }}
          />
        </div>
        <h3
          className="text-sm font-bold"
          style={{ fontFamily: HEAD, color: dark ? '#fff' : C.onS }}
        >
          {title}
        </h3>
      </div>
      <Link
        to={to}
        className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
        style={{ color: dark ? 'rgba(143,243,239,.7)' : C.prim }}
      >
        View all
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

// ─── SVG Health Ring ──────────────────────────────────────────────────────────
function HealthRing({ score }: { score: number }) {
  const r = 62;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, score) / 100) * circ;
  return (
    <div className="relative flex-shrink-0" style={{ width: 160, height: 160 }}>
      <svg className="w-full h-full" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke={C.dim} strokeWidth="11" />
        <circle cx="70" cy="70" r={r} fill="none"
          stroke="url(#dg)" strokeWidth="11"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1)' }}
        />
        <defs>
          <linearGradient id="dg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#006a67" />
            <stop offset="100%" stopColor="#4fb6b2" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-black leading-none"
          style={{ fontFamily: HEAD, fontSize: 34, color: C.onS }}
        >
          {score}
        </span>
        <span
          className="text-[9px] font-bold uppercase tracking-widest mt-1"
          style={{ color: C.onSV }}
        >
          / 100
        </span>
      </div>
    </div>
  );
}

// ─── Mini weight bar chart ────────────────────────────────────────────────────
function WeightBars({ weights }: { weights: any[] }) {
  const slice = weights.slice(-6);
  const maxW = Math.max(...slice.map((w: any) => w.weight), 1);
  const bars = slice.length > 0
    ? slice
    : [{ weight: 0.6 }, { weight: 0.65 }, { weight: 0.55 }, { weight: 0.75 }, { weight: 0.85 }].map(s => ({ weight: maxW * s.weight }));

  return (
    <div className="flex items-end gap-2 h-24 mt-auto">
      {bars.map((w: any, i: number) => {
        const pct = Math.max(10, (w.weight / maxW) * 100);
        const last = i === bars.length - 1;
        return (
          <motion.div
            key={i}
            className="flex-1 rounded-full"
            style={{ background: last ? SIG : C.dim }}
            initial={{ height: 0 }}
            animate={{ height: `${pct}%` }}
            transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
          />
        );
      })}
    </div>
  );
}

// ─── Medication progress bar ──────────────────────────────────────────────────
function MedBar({ med }: { med: any }) {
  const total = Math.ceil(
    (new Date(med.endDate).getTime() - new Date(med.startDate).getTime()) / 86400000,
  );
  const elapsed = Math.ceil(
    (Date.now() - new Date(med.startDate).getTime()) / 86400000,
  );
  const pct = Math.min(100, Math.max(0, total > 0 ? (elapsed / total) * 100 : 100));
  const daysLeft = Math.max(0, total - elapsed);

  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm font-semibold" style={{ color: C.onS }}>{med.medicineName}</span>
        <span className="text-xs font-bold" style={{ color: pct >= 80 ? C.primC : C.onSV }}>
          {total > 0 ? `${daysLeft}d left` : 'Indefinite'}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: C.dim }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: SIG }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

// ─── Quick action card ────────────────────────────────────────────────────────
function QAction({
  icon: Icon,
  label,
  to,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  to: string;
  delay?: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ delay }}
      whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(0,106,103,.2)' }}
      whileTap={{ scale: 0.97 }}
    >
      <Link to={to} className="block">
        <div
          className="flex flex-col items-center gap-3 p-6 rounded-2xl transition-all duration-300 cursor-pointer group"
          style={{ background: C.surf, border: `1px solid rgba(189,201,199,.22)` }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.background = C.prim;
            (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.background = C.surf;
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(189,201,199,.22)';
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300"
            style={{ background: C.lo }}
          >
            <Icon className="h-6 w-6 transition-colors duration-300" style={{ color: C.primC }} />
          </div>
          <span
            className="text-xs font-bold text-center transition-colors duration-300"
            style={{ color: C.onS }}
          >
            {label}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
const Dashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const { activePetId, setActivePetId } = usePetStore();

  const { data: petsData, isLoading: petsLoading } = usePets();
  const pets = petsData?.data ?? [];

  // Auto-select first pet when data arrives and no pet is selected
  useEffect(() => {
    if (pets.length > 0 && !activePetId) {
      setActivePetId(pets[0]._id);
    }
  }, [pets, activePetId, setActivePetId]);

  const selectedPetId = activePetId || pets[0]?._id || '';
  const selectedPet = pets.find(p => p._id === selectedPetId);

  const { data: vaccData, isLoading: vaccLoading } = useVaccinations(selectedPetId);
  const { data: medsData } = useMedications(selectedPetId);
  const { data: scheduleData } = useDewormingSchedule(selectedPetId);
  const { data: historyData } = useDewormingHistory(selectedPetId);
  const { data: vetData } = useVetVisits(selectedPetId);
  const { data: weightData } = useWeightEntries(selectedPetId);

  const vaccinations = vaccData?.data ?? [];
  const medications = medsData?.data ?? [];
  const schedule = scheduleData?.data;
  const records = historyData?.data || [];
  const vetVisits = vetData?.data ?? [];
  const weights = weightData ?? [];

  // ── Derived data (unchanged from Doc 15) ──
  const overdueVaccinations = useMemo(
    () => vaccinations.filter(v => v.status === 'overdue'),
    [vaccinations],
  );
  const upcomingVaccinations = useMemo(
    () => vaccinations.filter(v => v.status === 'upcoming' && isWithinDays(v.nextDueDate, 7)),
    [vaccinations],
  );
  const activeMedications = useMemo(
    () => medications.filter((m: any) => m.status === 'active'),
    [medications],
  );
  const nextDeworming = useMemo(() => {
    if (!schedule) return null;
    let nextDueDateStr: string | null = null;
    let nextDueStatus: DewormingStatus | null = null;

    if (records.length > 0) {
      const sortedRecords = [...records].sort((a, b) => new Date(b.dateAdministered).getTime() - new Date(a.dateAdministered).getTime());
      const latestRecord = sortedRecords[0];
      nextDueDateStr = calculateNextDue(latestRecord.dateAdministered, schedule.frequency);
    } else {
      nextDueDateStr = calculateNextDue(new Date().toISOString(), schedule.frequency);
    }

    if (nextDueDateStr) {
      nextDueStatus = getComputedStatus(nextDueDateStr);
      return {
        nextDueDate: nextDueDateStr,
        status: nextDueStatus
      };
    }
    return null;
  }, [schedule, records]);
  const latestVetVisit = useMemo(
    () => vetVisits.length > 0
      ? [...vetVisits].sort((a: any, b: any) =>
        new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())[0]
      : null,
    [vetVisits],
  );
  const latestWeight = weights.length > 0 ? weights[weights.length - 1] : null;
  const prevWeight = weights.length > 1 ? weights[weights.length - 2] : null;
  const weightChange = latestWeight && prevWeight
    ? ((latestWeight.weight - prevWeight.weight) / prevWeight.weight * 100).toFixed(1)
    : null;

  // ── Loading ──
  if (petsLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="mb-6"><SkeletonLoader variant="card" /></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map(i => <SkeletonLoader key={i} variant="card" />)}
        </div>
      </motion.div>
    );
  }

  // ── Empty ──
  if (pets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <EmptyState
          icon={PawPrint}
          title="No pets yet"
          description="Add your first companion to start tracking their health."
          actionLabel="Add Pet"
          onAction={() => navigate(ROUTES.ADD_PET)}
        />
      </motion.div>
    );
  }

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  // ── Compute health score (simple heuristic — no overdue issues = 100, each overdue = -12) ──
  const healthScore = Math.max(
    40,
    100 - overdueVaccinations.length * 12 -
    (nextDeworming?.status === 'overdue' ? 8 : 0),
  );

  return (
    <motion.div
      key={`dashboard-${selectedPetId}`}
      variants={stagger}
      initial="hidden"
      animate="visible"
      style={{ fontFamily: BODY }}
    >
      {/* ── Greeting ── */}
      <motion.div variants={fadeUp} className="mb-10">
        <h1
          className="font-black tracking-tight mb-1.5"
          style={{
            fontFamily: HEAD,
            fontSize: 'clamp(1.8rem,4vw,2.6rem)',
            color: C.onS,
            letterSpacing: '-0.025em',
            lineHeight: 1.05,
          }}
        >
          Hi, {firstName} 👋
        </h1>
        <p className="text-base" style={{ color: C.onSV }}>
          {overdueVaccinations.length > 0
            ? `${selectedPet?.name ?? 'Your pet'} has ${overdueVaccinations.length} overdue item${overdueVaccinations.length > 1 ? 's' : ''}. Let's get caught up.`
            : `${selectedPet?.name ?? 'Your pet'} is looking healthy today. Keep up the great work!`
          }
        </p>
      </motion.div>

      {/* ── Row 1: Pet hero + Health ring ── */}
      <motion.div
        variants={fadeUp}
        className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5"
      >
        {/* Pet hero card */}
        <div
          className="lg:col-span-7 rounded-3xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8 overflow-hidden relative group"
          style={{
            background: C.surf,
            boxShadow: '0 2px 20px rgba(19,29,30,.06)',
            border: '1px solid rgba(189,201,199,.22)',
          }}
        >
          {/* Decorative blob */}
          <div
            className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full"
            style={{ background: 'rgba(79,182,178,.08)', filter: 'blur(50px)' }}
          />

          {/* Pet photo */}
          <div
            className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg"
            style={{ boxShadow: '0 12px 32px rgba(0,106,103,.18)' }}
          >
            {selectedPet?.photo ? (
              <img
                src={selectedPet.photo}
                alt={selectedPet.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: SIG }}
              >
                <PawPrint className="h-16 w-16 text-white opacity-60" />
              </div>
            )}
          </div>

          {/* Pet info */}
          <div className="flex-1 min-w-0 relative z-10">
            <div className="flex flex-wrap gap-2 mb-3">
              <span
                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{ background: 'rgba(79,182,178,.12)', color: C.prim }}
              >
                Primary Patient
              </span>
              <span
                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{ background: C.lo, color: C.onSV }}
              >
                {selectedPet?.type ?? 'Canine'}
              </span>
            </div>
            <h2
              className="font-black mb-1 tracking-tight"
              style={{
                fontFamily: HEAD,
                fontSize: 'clamp(2rem,4vw,2.8rem)',
                color: C.onS,
                letterSpacing: '-0.025em',
                lineHeight: 1.05,
              }}
            >
              {selectedPet?.name}
            </h2>
            <p className="text-lg font-medium mb-5" style={{ color: C.onSV }}>
              {selectedPet?.breed}
              {selectedPet?.dateOfBirth && (
                <span>, {calculateAge(selectedPet.dateOfBirth)}</span>
              )}
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-5">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.2em] mb-0.5" style={{ color: C.out }}>Sex</p>
                <p className="text-sm font-bold" style={{ color: C.onS }}>{selectedPet?.gender}</p>
              </div>
              <div className="w-px h-7" style={{ background: C.dim }} />
              {selectedPet?.microchipId && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[.2em] mb-0.5" style={{ color: C.out }}>Microchip</p>
                  <p className="text-sm font-bold" style={{ color: C.onS }}>#{selectedPet.microchipId}</p>
                </div>
              )}
              {pets.length > 1 && (
                <div className="ml-auto">
                  <Select
                    value={selectedPetId}
                    onChange={e => setActivePetId(e.target.value)}
                    options={pets.map(p => ({ value: p._id, label: p.name }))}
                    placeholder="Switch pet"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Health score ring */}
        <BC className="lg:col-span-5 items-center justify-center text-center gap-5">
          <HealthRing score={healthScore} />
          <div>
            <h4
              className="text-lg font-black mb-1.5"
              style={{ fontFamily: HEAD, color: C.onS }}
            >
              Overall Health Score
            </h4>
            <p className="text-sm leading-relaxed" style={{ color: C.onSV }}>
              {healthScore >= 88
                ? `${selectedPet?.name}'s metrics are above average for their breed.`
                : healthScore >= 70
                  ? 'A few items need attention. Check alerts below.'
                  : 'Several items are overdue. Please take action soon.'}
            </p>
          </div>
        </BC>
      </motion.div>

      {/* ── Urgent Alert Banner ── */}
      <AnimatePresence>
        {overdueVaccinations.length > 0 && (
          <motion.div
            key="alert"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-5"
            style={{
              background: 'rgba(186,26,26,.06)',
              borderLeft: `6px solid ${C.error}`,
              border: `1px solid rgba(186,26,26,.18)`,
              borderLeftWidth: 6,
            }}
          >
            <div className="flex items-start sm:items-center gap-5">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md"
                style={{ background: C.error }}
              >
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h5
                  className="text-lg font-black mb-1"
                  style={{ fontFamily: HEAD, color: C.error }}
                >
                  Urgent — Action Required
                </h5>
                <div className="space-y-1">
                  {overdueVaccinations.slice(0, 2).map((v: any) => (
                    <p key={v._id} className="text-sm font-medium" style={{ color: '#6b1414' }}>
                      <span className="font-bold">{v.vaccineName}</span> is overdue
                      {v.nextDueDate && ` since ${formatDate(v.nextDueDate)}`}.
                    </p>
                  ))}
                  {overdueVaccinations.length > 2 && (
                    <p className="text-xs font-semibold" style={{ color: C.error }}>
                      +{overdueVaccinations.length - 2} more overdue items
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Link to={buildPath(ROUTES.VACCINATIONS, { id: selectedPetId })}>
              <button
                className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-all active:scale-95"
                style={{
                  background: C.error, border: 'none', cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(186,26,26,.28)'
                }}
              >
                Schedule Now <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Vitals bento row ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">

        {/* Weight tracker */}
        <BC className="justify-between">
          <div>
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.2em] mb-2"
                  style={{ color: C.out }}>Weight Tracker</p>
                {latestWeight ? (
                  <div className="flex items-baseline gap-2">
                    <span className="font-black text-4xl"
                      style={{ fontFamily: HEAD, color: C.onS }}>
                      {latestWeight.weight}
                    </span>
                    <span className="text-lg font-bold" style={{ color: C.onSV }}>
                      {latestWeight.unit || 'kg'}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-medium" style={{ color: C.onSV }}>No data yet</span>
                )}
              </div>
              {weightChange && (
                <div
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: Number(weightChange) > 0 ? 'rgba(0,110,41,.1)' : 'rgba(186,26,26,.1)',
                    color: Number(weightChange) > 0 ? C.sec : C.error,
                  }}
                >
                  {Number(weightChange) > 0
                    ? <TrendingUp className="h-3.5 w-3.5" />
                    : Number(weightChange) < 0
                      ? <TrendingDown className="h-3.5 w-3.5" />
                      : <Minus className="h-3.5 w-3.5" />
                  }
                  {Math.abs(Number(weightChange))}%
                </div>
              )}
            </div>
          </div>
          <WeightBars weights={weights} />
          <Link to={buildPath(ROUTES.WEIGHT, { id: selectedPetId })}
            className="flex items-center justify-between text-xs font-bold mt-5 pt-4"
            style={{ color: C.prim, borderTop: `1px solid ${C.dim}` }}>
            View history <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </BC>

        {/* This Week — upcoming */}
        <BC className="justify-between">
          <SHead icon={CalendarClock} title="This Week" to={buildPath(ROUTES.VACCINATIONS, { id: selectedPetId })} />
          {vaccLoading ? (
            <div className="space-y-2">
              {[1, 2].map(i => <div key={i} className="h-10 rounded-xl" style={{ background: C.lo }} />)}
            </div>
          ) : upcomingVaccinations.length === 0 && activeMedications.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-6 text-center gap-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: C.lo }}>
                <Activity className="h-5 w-5" style={{ color: C.primC }} />
              </div>
              <p className="text-sm font-medium" style={{ color: C.onSV }}>
                Nothing due this week 🎉
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingVaccinations.slice(0, 2).map((v: any) => (
                <div key={v._id}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5"
                  style={{ background: 'rgba(214,156,44,.1)' }}>
                  <div className="flex items-center gap-2">
                    <Syringe className="h-4 w-4" style={{ color: C.tertC }} />
                    <span className="text-xs font-semibold" style={{ color: C.onS }}>{v.vaccineName}</span>
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: C.tertC }}>
                    {formatCountdown(v.nextDueDate)}
                  </span>
                </div>
              ))}
              {activeMedications.slice(0, 2).map((m: any) => (
                <div key={m._id}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5"
                  style={{ background: C.lo }}>
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4" style={{ color: C.primC }} />
                    <span className="text-xs font-semibold" style={{ color: C.onS }}>{m.medicineName}</span>
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: C.prim }}>Daily</span>
                </div>
              ))}
            </div>
          )}
        </BC>

        {/* Active medications */}
        <BC className="justify-between">
          <SHead icon={Pill} title="Medications" to={buildPath(ROUTES.MEDICATIONS, { id: selectedPetId })} />
          {activeMedications.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-6 text-center gap-2">
              <p className="text-sm font-medium" style={{ color: C.onSV }}>No active medications</p>
            </div>
          ) : (
            <div className="space-y-5">
              {activeMedications.slice(0, 3).map((m: any) => (
                <MedBar key={m._id} med={m} />
              ))}
              {activeMedications.length > 3 && (
                <Link to={buildPath(ROUTES.MEDICATIONS, { id: selectedPetId })}
                  className="flex items-center gap-1.5 text-xs font-bold"
                  style={{ color: C.prim }}>
                  View all prescriptions <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          )}
        </BC>
      </motion.div>

      {/* ── Row 3: Last Vet Visit (wide) + Deworming ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">

        {/* Last vet visit — wide */}
        <BC className="lg:col-span-8">
          <SHead icon={Stethoscope} title="Last Vet Visit" to={buildPath(ROUTES.VET_VISITS, { id: selectedPetId })} />
          {latestVetVisit ? (
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Vet info */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 16px rgba(0,106,103,.15)' }}>
                  <Avatar
                    src={(latestVetVisit as any).vetPhoto}
                    name={(latestVetVisit as any).veterinarianName || 'Dr.'}
                    size="lg"
                  />
                </div>
                <div>
                  <h5 className="font-black text-base" style={{ fontFamily: HEAD, color: C.onS }}>
                    {(latestVetVisit as any).veterinarianName ?? 'Veterinarian'}
                  </h5>
                  <p className="text-sm font-semibold" style={{ color: C.prim }}>
                    {(latestVetVisit as any).clinicName}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: C.onSV }}>
                    {formatDate((latestVetVisit as any).visitDate)}
                    {(latestVetVisit as any).reason && ` · ${(latestVetVisit as any).reason}`}
                  </p>
                </div>
              </div>

              {/* Notes / diagnosis */}
              {((latestVetVisit as any).diagnosis || (latestVetVisit as any).notes) && (
                <div
                  className="flex-1 italic text-sm leading-relaxed rounded-2xl p-4"
                  style={{
                    background: C.lo,
                    color: C.onSV,
                    borderLeft: `3px solid rgba(0,106,103,.2)`,
                  }}
                >
                  "{(latestVetVisit as any).diagnosis || (latestVetVisit as any).notes}"
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                {(latestVetVisit as any).cost !== undefined && (
                  <p className="text-xs font-bold text-center mb-1" style={{ color: C.primC }}>
                    ₹{(latestVetVisit as any).cost}
                  </p>
                )}
                <Link to={buildPath(ROUTES.VET_VISITS, { id: selectedPetId })}>
                  <button
                    className="w-full px-5 py-2.5 rounded-full text-xs font-bold transition-all"
                    style={{
                      background: C.lo, border: `1.5px solid ${C.outV}`,
                      color: C.onSV, cursor: 'pointer'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.hi)}
                    onMouseLeave={e => (e.currentTarget.style.background = C.lo)}
                  >
                    View Record
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 gap-3 text-center">
              <Stethoscope className="h-10 w-10" style={{ color: C.outV }} />
              <p className="text-sm font-medium" style={{ color: C.onSV }}>No vet visits recorded yet.</p>
              <Link to={buildPath(ROUTES.VET_VISITS, { id: selectedPetId })}>
                <button
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold text-white"
                  style={{ background: SIG, border: 'none', cursor: 'pointer' }}
                >
                  <Plus className="h-3.5 w-3.5" /> Add Vet Visit
                </button>
              </Link>
            </div>
          )}
        </BC>

        {/* Deworming countdown — dark */}
        <BC dark className="lg:col-span-4 justify-between">
          <div>
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(143,243,239,.15)' }}
            >
              <Bug className="h-5 w-5" style={{ color: C.primF }} />
            </div>
            <p
              className="text-[9px] font-bold uppercase tracking-[.2em] mb-1"
              style={{ color: 'rgba(143,243,239,.55)' }}
            >
              Next Deworming
            </p>
            {nextDeworming ? (
              <>
                <h3
                  className="font-black text-2xl text-white mb-1"
                  style={{ fontFamily: HEAD }}
                >
                  {formatCountdown(nextDeworming.nextDueDate)}
                </h3>
                <p className="text-sm" style={{ color: 'rgba(143,243,239,.6)' }}>
                  Due {formatDate(nextDeworming.nextDueDate)}
                </p>
                {nextDeworming.status === 'overdue' && (
                  <span
                    className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: 'rgba(186,26,26,.25)', color: '#ff8a8a' }}
                  >
                    <AlertTriangle className="h-3 w-3" /> Overdue
                  </span>
                )}
              </>
            ) : (
              <p className="font-black text-xl text-white" style={{ fontFamily: HEAD }}>
                Not scheduled
              </p>
            )}
          </div>
          <Link to={buildPath(ROUTES.DEWORMING, { id: selectedPetId })}>
            <button
              className="mt-8 w-full py-3 rounded-full text-sm font-bold"
              style={{
                background: 'rgba(255,255,255,.12)',
                color: C.primF,
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,.12)')}
            >
              Manage Schedule
            </button>
          </Link>
        </BC>
      </motion.div>

      {/* ── Quick Actions ── */}
      <motion.div variants={fadeUp}>
        <h3
          className="text-xl font-black mb-5"
          style={{ fontFamily: HEAD, color: C.onS, letterSpacing: '-0.02em' }}
        >
          Quick Actions
        </h3>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <QAction icon={Syringe} label="Log Vaccination" to={buildPath(ROUTES.VACCINATIONS, { id: selectedPetId })} delay={0} />
          <QAction icon={Pill} label="Add Medication" to={buildPath(ROUTES.MEDICATIONS, { id: selectedPetId })} delay={0.06} />
          <QAction icon={Weight} label="Record Weight" to={buildPath(ROUTES.WEIGHT, { id: selectedPetId })} delay={0.12} />
          <QAction icon={Stethoscope} label="Add Vet Visit" to={buildPath(ROUTES.VET_VISITS, { id: selectedPetId })} delay={0.18} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;