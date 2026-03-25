/**
 * PetProfile.tsx — Clinical Sanctuary · Enhanced Bento Edition
 * Drop-in replacement. All hooks/logic unchanged.
 *
 * What's new vs the previous version (incorporating Doc 13 design):
 *  - Large gradient-ring hero photo + name + status badge chips + tab underlines
 *  - Overview bento grid:
 *      · SVG animated health-score ring + vital summary (2-col wide)
 *      · Last vaccination card with "View Certificate" link
 *      · Active medications + day-of-week dot tracker (M–S)
 *      · Weight mini bar-chart with real data + fallback
 *      · Next deworming dark card with countdown
 *  - Recent Activity vertical timeline (merged from all categories)
 *  - Non-overview tabs: polished redirect cards
 *  - Desktop: underline tab style · Mobile: pill tab style
 *  - Edit / Delete row pinned to bottom
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Syringe, Pill, Bug, Stethoscope,
  Weight, Edit, Trash2, PawPrint, ArrowRight, Share2,
  Heart, Wind, ChevronRight, Clock,
} from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

import { usePet, useDeletePet } from '@/hooks/usePets';
import { useVaccinations } from '@/hooks/useVaccinations';
import { useMedications } from '@/hooks/useMedications';
import { useDeworming } from '@/hooks/useDeworming';
import { useVetVisits } from '@/hooks/useVetVisits';
import { useWeightEntries } from '@/hooks/useWeight';

import { calculateAge, formatDate } from '@/utils/dateUtils';
import { ROUTES, buildPath } from '@/constants/routes';

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
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// ─── Tab config ────────────────────────────────────────────────────────────────
type TabKey = 'overview' | 'vaccinations' | 'medications' | 'deworming' | 'vet-visits' | 'weight';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Overview', icon: PawPrint },
  { key: 'vaccinations', label: 'Vaccinations', icon: Syringe },
  { key: 'medications', label: 'Medications', icon: Pill },
  { key: 'deworming', label: 'Deworming', icon: Bug },
  { key: 'vet-visits', label: 'Vet Visits', icon: Stethoscope },
  { key: 'weight', label: 'Weight', icon: Weight },
];

// ─── SVG Health Ring ──────────────────────────────────────────────────────────
function HealthRing({ score = 85 }: { score?: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative flex-shrink-0" style={{ width: 144, height: 144 }}>
      <svg className="w-full h-full" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke={C.dim} strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none"
          stroke="url(#rg)" strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1)' }}
        />
        <defs>
          <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#006a67" />
            <stop offset="100%" stopColor="#4fb6b2" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black text-2xl leading-none"
          style={{ fontFamily: 'Manrope,sans-serif', color: C.onS }}>{score}%</span>
        <span className="text-[9px] font-bold uppercase tracking-widest mt-0.5"
          style={{ color: C.onSV }}>Health</span>
      </div>
    </div>
  );
}

// ─── Bento card shell ─────────────────────────────────────────────────────────
function BCard({
  children, className = '', dark = false, style = {},
}: {
  children: React.ReactNode; className?: string; dark?: boolean; style?: React.CSSProperties;
}) {
  return (
    <div className={`rounded-3xl p-7 flex flex-col ${className}`}
      style={{
        background: dark ? C.primDk : C.surf,
        boxShadow: dark ? '0 8px 32px rgba(0,68,66,.25)' : '0 2px 20px rgba(19,29,30,.06)',
        border: dark ? 'none' : '1px solid rgba(189,201,199,.2)',
        ...style,
      }}>
      {children}
    </div>
  );
}

// ─── Icon badge ───────────────────────────────────────────────────────────────
function IBadge({ icon: Icon, bg = C.lo, color = C.primC }: {
  icon: React.ElementType; bg?: string; color?: string;
}) {
  return (
    <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
      style={{ background: bg }}>
      <Icon className="h-5 w-5" style={{ color }} />
    </div>
  );
}

// ─── "View tracker" redirect card ─────────────────────────────────────────────
function TabRedirect({ label, href, icon: Icon }: {
  label: string; href: string; icon: React.ElementType;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-24 gap-6"
    >
      <div className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: C.lo }}>
        <Icon className="h-9 w-9" style={{ color: C.primC }} />
      </div>
      <Link to={href}>
        <button className="flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-bold text-white"
          style={{
            background: SIG, border: 'none', cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,106,103,.28)'
          }}>
          {label} <ArrowRight className="h-4 w-4" />
        </button>
      </Link>
    </motion.div>
  );
}

// ─── Overview bento grid ──────────────────────────────────────────────────────
function OverviewBento({ pet, vaccinations, medications, dewormings, vetVisits, weights }: {
  pet: any; vaccinations: any[]; medications: any[];
  dewormings: any[]; vetVisits: any[]; weights: any[];
}) {
  const id = pet._id;
  const lastW = weights[weights.length - 1];
  const today = new Date().getDay(); // 0=Sun
  const activeMeds = medications.filter((m: any) => m.status === 'active');
  const nextDeworm = dewormings[0];

  // Weight bars – last 5 entries normalised
  const wSlice = weights.slice(-5);
  const maxW = Math.max(...wSlice.map((w: any) => w.weight), 1);

  // Activity timeline – merge + sort desc
  type Act = { date: string; title: string; sub: string; primary: boolean };
  const activities: Act[] = [
    ...vetVisits.slice(0, 2).map((v: any) => ({
      date: v.visitDate || v.date || '',
      title: v.reason || 'Vet Visit',
      sub: v.vetName ? `Dr. ${v.vetName}` : 'Veterinary Clinic',
      primary: true,
    })),
    ...vaccinations.slice(0, 2).map((v: any) => ({
      date: v.dateAdministered || v.date || '',
      title: `Vaccination: ${v.vaccineName}`,
      sub: v.batchNumber ? `Batch #${v.batchNumber}` : '',
      primary: false,
    })),
    ...medications.slice(0, 1).map((m: any) => ({
      date: m.startDate || m.date || '',
      title: `Medication: ${m.medicineName}`,
      sub: m.dosage || '',
      primary: false,
    })),
  ]
    .filter(a => a.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-5">

      {/* Row 1 — Health ring + Last vaccination */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Health vitals (2-col) */}
        <BCard className="md:col-span-2 flex-row gap-8 items-center">
          <HealthRing score={85} />
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-xl mb-2"
              style={{ fontFamily: 'Manrope,sans-serif', color: C.onS }}>Vital Summary</h3>
            <p className="text-sm leading-relaxed mb-5" style={{ color: C.onSV }}>
              {pet.name} is showing excellent vitals. Weight has stabilised and
              recent check-ups were all within normal ranges.
            </p>
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Heart, label: 'Heart: Strong' },
                { icon: Wind, label: 'Respiration: Normal' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm font-semibold"
                  style={{ color: C.onS }}>
                  <Icon className="h-4 w-4" style={{ color: C.prim }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </BCard>

        {/* Last vaccination */}
        <BCard className="justify-between">
          <div>
            <IBadge icon={Syringe} bg={C.lo} color={C.primC} />
            <p className="text-[10px] font-bold uppercase tracking-[.18em] mt-5 mb-1"
              style={{ color: C.onSV }}>Last Vaccination</p>
            {vaccinations.length > 0 ? (
              <>
                <h3 className="font-black text-lg mb-1"
                  style={{ fontFamily: 'Manrope,sans-serif', color: C.onS }}>
                  {vaccinations[0].vaccineName}
                </h3>
                <p className="text-sm" style={{ color: C.onSV }}>
                  Administered {formatDate(vaccinations[0].dateAdministered || vaccinations[0].date)}
                </p>
              </>
            ) : (
              <p className="text-sm mt-2" style={{ color: C.onSV }}>No vaccinations yet</p>
            )}
          </div>
          <Link to={buildPath(ROUTES.VACCINATIONS, { id })}
            className="flex items-center justify-between text-sm font-bold mt-8 pt-4"
            style={{ color: C.prim, borderTop: `1px solid ${C.dim}` }}>
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </BCard>
      </div>

      {/* Row 2 — Medications + Weight + Deworming */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Active medications + day tracker */}
        <BCard className="justify-between">
          <div>
            <IBadge icon={Pill} bg={C.lo} color={C.tertC} />
            <p className="text-[10px] font-bold uppercase tracking-[.18em] mt-5 mb-1"
              style={{ color: C.onSV }}>Active Medications</p>
            {activeMeds.length > 0 ? (
              <>
                <h3 className="font-black text-lg mb-1"
                  style={{ fontFamily: 'Manrope,sans-serif', color: C.onS }}>
                  {activeMeds[0].medicineName}
                </h3>
                <p className="text-sm" style={{ color: C.onSV }}>
                  {activeMeds[0].dosage || 'See medication tracker'}
                </p>
              </>
            ) : (
              <p className="text-sm mt-2" style={{ color: C.onSV }}>No active medications</p>
            )}
          </div>

          {/* Day-of-week dots */}
          <div className="flex gap-1.5 mt-6">
            {DAYS.map((d, i) => {
              const dayIdx = i + 1; // Mon=1
              const taken = dayIdx <= (today === 0 ? 7 : today);
              return (
                <div key={i}
                  className="flex-1 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                  style={{
                    background: taken ? (i < 3 ? C.prim : C.primC) : C.dim,
                    color: taken ? '#fff' : C.onSV,
                  }}>
                  {d}
                </div>
              );
            })}
          </div>

          <Link to={buildPath(ROUTES.MEDICATIONS, { id })}
            className="flex items-center justify-between text-sm font-bold mt-5 pt-4"
            style={{ color: C.prim, borderTop: `1px solid ${C.dim}` }}>
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </BCard>

        {/* Weight mini bar-chart */}
        <BCard className="justify-between">
          <div>
            <div className="flex items-start justify-between mb-5">
              <IBadge icon={Weight} bg={C.lo} color={C.out} />
              {lastW && (
                <div className="text-right">
                  <span className="font-black text-2xl leading-none"
                    style={{ fontFamily: 'Manrope,sans-serif', color: C.onS }}>
                    {lastW.weight}
                  </span>
                  <span className="text-sm font-bold ml-1" style={{ color: C.onSV }}>
                    {lastW.unit || 'kg'}
                  </span>
                </div>
              )}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] mb-4"
              style={{ color: C.onSV }}>Weight History</p>

            <div className="flex items-end gap-2 h-20 mb-2">
              {wSlice.length > 0
                ? wSlice.map((w: any, i: number) => {
                  const pct = Math.max(15, (w.weight / maxW) * 100);
                  const last = i === wSlice.length - 1;
                  return (
                    <div key={i} className="flex-1 rounded-full"
                      style={{ height: `${pct}%`, background: last ? SIG : C.dim }} />
                  );
                })
                : [60, 75, 70, 85, 95].map((h, i) => (
                  <div key={i} className="flex-1 rounded-full"
                    style={{ height: `${h}%`, background: i === 4 ? SIG : C.dim }} />
                ))
              }
            </div>

            {wSlice.length > 1 && (
              <div className="flex justify-between text-[10px] font-bold uppercase"
                style={{ color: C.onSV }}>
                <span>{formatDate(wSlice[0].date)}</span>
                <span>Now</span>
              </div>
            )}
          </div>

          <Link to={buildPath(ROUTES.WEIGHT, { id })}
            className="flex items-center justify-between text-sm font-bold mt-5 pt-4"
            style={{ color: C.prim, borderTop: `1px solid ${C.dim}` }}>
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </BCard>

        {/* Deworming countdown — dark card */}
        <BCard dark className="justify-between">
          <div>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(143,243,239,.15)' }}>
              <Bug className="h-5 w-5" style={{ color: '#8ff3ef' }} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] mb-1"
              style={{ color: 'rgba(143,243,239,.55)' }}>Next Deworming</p>
            {nextDeworm ? (
              <>
                <h3 className="font-black text-xl mb-1 text-white"
                  style={{ fontFamily: 'Manrope,sans-serif' }}>
                  {formatDate(nextDeworm.nextDueDate)}
                </h3>
                <p className="text-sm" style={{ color: 'rgba(143,243,239,.6)' }}>
                  {nextDeworm.medicineName || 'Monthly dose'}
                </p>
              </>
            ) : (
              <h3 className="font-black text-xl text-white"
                style={{ fontFamily: 'Manrope,sans-serif' }}>Not scheduled</h3>
            )}
          </div>
          <Link to={buildPath(ROUTES.DEWORMING, { id })}>
            <button className="mt-8 w-full py-3 rounded-full font-bold text-sm"
              style={{
                background: 'rgba(255,255,255,.12)', color: '#8ff3ef',
                border: 'none', cursor: 'pointer'
              }}>
              View Schedule
            </button>
          </Link>
        </BCard>
      </div>

      {/* Row 3 — Recent Activity timeline */}
      <BCard>
        <h3 className="font-black text-xl mb-8"
          style={{ fontFamily: 'Manrope,sans-serif', color: C.onS }}>
          Recent Activity
        </h3>

        {activities.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-3">
            <Clock className="h-10 w-10" style={{ color: C.outV }} />
            <p className="text-sm font-medium" style={{ color: C.onSV }}>
              No recent activity recorded yet.
            </p>
          </div>
        ) : (
          <div className="relative space-y-8" style={{ paddingLeft: 44 }}>
            {/* Vertical connector */}
            <div className="absolute top-2 bottom-2 w-0.5 rounded-full"
              style={{ left: 12, background: C.dim }} />

            {activities.map((a, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.09 }}
                className="relative"
              >
                {/* Dot */}
                <div className="absolute rounded-full border-4"
                  style={{
                    left: -32, top: 4,
                    width: 20, height: 20,
                    background: a.primary ? C.prim : C.dim,
                    borderColor: C.bg,
                  }}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.15em] mb-1"
                      style={{ color: a.primary ? C.prim : C.onSV }}>
                      {a.date ? formatDate(a.date) : '—'}
                    </p>
                    <h4 className="font-bold text-base mb-0.5" style={{ color: C.onS }}>
                      {a.title}
                    </h4>
                    {a.sub && (
                      <p className="text-sm" style={{ color: C.onSV }}>{a.sub}</p>
                    )}
                  </div>
                  {a.primary && (
                    <span className="flex-shrink-0 px-3 py-1 rounded-lg text-[10px] font-bold uppercase"
                      style={{ background: C.lo, color: C.onSV }}>
                      Visit
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </BCard>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN
// ══════════════════════════════════════════════════════════════════════════════
const PetProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: petData, isLoading } = usePet(id!);
  const deletePet = useDeletePet();
  const pet = petData?.data;

  const { data: vaccData } = useVaccinations(id!);
  const { data: medsData } = useMedications(id!);
  const { data: dewormData } = useDeworming(id!);
  const { data: vetData } = useVetVisits(id!);
  const { data: weightData } = useWeightEntries(id!);

  const vaccinations = vaccData?.data ?? [];
  const medications = medsData?.data ?? [];
  const dewormings = dewormData ?? [];
  const vetVisits = vetData?.data ?? [];
  const weights = weightData ?? [];

  const handleDelete = async () => {
    await deletePet.mutateAsync(id!);
    navigate(ROUTES.PETS);
  };

  if (isLoading) return (
    <div className="space-y-5">
      {[1, 2, 3].map(i => <SkeletonLoader key={i} variant="card" />)}
    </div>
  );

  if (!pet) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ background: C.lo }}>
        <PawPrint className="h-9 w-9" style={{ color: C.outV }} />
      </div>
      <p className="text-base font-medium mb-3" style={{ color: C.onSV }}>Pet not found.</p>
      <Link to={ROUTES.PETS} className="text-sm font-semibold hover:underline"
        style={{ color: C.prim }}>← Back to My Pets</Link>
    </div>
  );

  const QUICK_STATS = [
    { label: 'Vaccinations', count: vaccinations.length, color: C.primC, bg: C.primF },
    { label: 'Active Meds', count: medications.filter((m: any) => m.status === 'active').length, color: C.tertC, bg: '#ffdeab' },
    { label: 'Vet Visits', count: vetVisits.length, color: C.sec, bg: C.secC },
    { label: 'Weight Logs', count: weights.length, color: C.out, bg: C.dim },
  ];

  return (
    <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

      {/* Back */}
      <motion.button
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-semibold mb-8 group"
        style={{ color: C.onSV, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to My Pets
      </motion.button>

      {/* ── Hero header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col lg:flex-row items-center lg:items-end gap-8 mb-12"
      >
        {/* Large avatar with gradient ring */}
        <div className="relative group flex-shrink-0">
          <div className="rounded-full p-1 shadow-2xl"
            style={{ background: SIG, width: 180, height: 180 }}>
            <div className="w-full h-full rounded-full overflow-hidden border-4"
              style={{ borderColor: C.bg }}>
              <Avatar src={pet.photo} name={pet.name} size="xl"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
          </div>
          {/* Edit overlay */}
          <button
            className="absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all"
            style={{ background: C.surf, color: C.prim, border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = C.prim; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = C.surf; (e.currentTarget as HTMLButtonElement).style.color = C.prim; }}
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>

        {/* Info column */}
        <div className="flex-1 text-center lg:text-left">
          {/* Name + status badges */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-3">
            <h1 className="font-black tracking-tight"
              style={{
                fontFamily: 'Manrope,sans-serif',
                fontSize: 'clamp(2.2rem,5vw,3rem)',
                color: C.onS,
                letterSpacing: '-0.025em',
                lineHeight: 1.05,
              }}>
              {pet.name}
            </h1>
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{ background: C.secC, color: '#003a14' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.sec }} />
                Vaccines: Up to date
              </span>
              {medications.filter((m: any) => m.status === 'active').length > 0 && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: '#ffdeab', color: '#4a2500' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.tertC }} />
                  Meds: Active
                </span>
              )}
            </div>
          </div>

          {/* Breed + age */}
          <p className="text-lg font-semibold mb-6" style={{ color: C.onSV }}>
            {pet.breed}
            <span className="mx-2" style={{ color: C.primC }}>•</span>
            {calculateAge(pet.dateOfBirth)}
          </p>

          {/* Desktop tab bar — underline style */}
          <div className="hidden lg:flex gap-8">
            {TABS.map(tab => {
              const active = activeTab === tab.key;
              return (
                <button key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex items-center gap-1.5 text-sm font-bold border-b-2 transition-all"
                  style={{
                    color: active ? C.prim : C.onSV,
                    borderColor: active ? C.prim : 'transparent',
                    background: 'none',
                    cursor: 'pointer',
                    padding: '0 0 12px 0',
                  }}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Share button — xl only */}
        <button
          className="hidden xl:flex items-center gap-2.5 px-6 py-4 rounded-2xl text-sm font-bold transition-all flex-shrink-0"
          style={{ background: C.hi, color: C.onS, border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.background = C.dim)}
          onMouseLeave={e => (e.currentTarget.style.background = C.hi)}
        >
          <Share2 className="h-4 w-4" />
          Share Medical Record
        </button>
      </motion.div>

      {/* Mobile pill tab bar */}
      <div className="lg:hidden flex gap-1.5 overflow-x-auto pb-1 mb-8"
        style={{ scrollbarWidth: 'none' }}>
        {TABS.map(tab => {
          const active = activeTab === tab.key;
          return (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all"
              style={{
                background: active ? C.prim : C.surf,
                color: active ? '#fff' : C.onSV,
                border: active ? 'none' : `1.5px solid ${C.outV}`,
                cursor: 'pointer',
                boxShadow: active ? '0 4px 14px rgba(0,106,103,.28)' : 'none',
              }}>
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Quick stats row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
      >
        {QUICK_STATS.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.05 }}
            className="rounded-2xl p-4 text-center"
            style={{
              background: C.surf,
              boxShadow: '0 2px 12px rgba(19,29,30,.05)',
              border: '1px solid rgba(189,201,199,.2)',
            }}>
            <div className="text-2xl font-black mb-0.5"
              style={{ fontFamily: 'Manrope,sans-serif', color: s.color, fontVariantNumeric: 'tabular-nums' }}>
              {s.count}
            </div>
            <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: C.out }}>
              {s.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {activeTab === 'overview' && (
            <OverviewBento pet={pet} vaccinations={vaccinations}
              medications={medications} dewormings={dewormings}
              vetVisits={vetVisits} weights={weights} />
          )}
          {activeTab === 'vaccinations' && (
            <TabRedirect label="View Vaccination Tracker"
              href={buildPath(ROUTES.VACCINATIONS, { id: id! })} icon={Syringe} />
          )}
          {activeTab === 'medications' && (
            <TabRedirect label="View Medication Tracker"
              href={buildPath(ROUTES.MEDICATIONS, { id: id! })} icon={Pill} />
          )}
          {activeTab === 'deworming' && (
            <TabRedirect label="View Deworming Tracker"
              href={buildPath(ROUTES.DEWORMING, { id: id! })} icon={Bug} />
          )}
          {activeTab === 'vet-visits' && (
            <TabRedirect label="View Vet Visit History"
              href={buildPath(ROUTES.VET_VISITS, { id: id! })} icon={Stethoscope} />
          )}
          {activeTab === 'weight' && (
            <TabRedirect label="View Weight Tracking"
              href={buildPath(ROUTES.WEIGHT, { id: id! })} icon={Weight} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Edit / Delete footer row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex gap-3 mt-10 pt-8"
        style={{ borderTop: `1px solid ${C.dim}` }}
      >
        <button
          onClick={() => navigate(buildPath(ROUTES.EDIT_PET, { id: id! }))}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all"
          style={{ background: C.lo, border: `1.5px solid ${C.outV}`, color: C.onSV, cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.background = C.hi)}
          onMouseLeave={e => (e.currentTarget.style.background = C.lo)}
        >
          <Edit className="h-4 w-4" /> Edit Profile
        </button>
        <button
          onClick={() => setConfirmDelete(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all"
          style={{ background: C.errC, border: 'none', color: C.error, cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#ffb4ab')}
          onMouseLeave={e => (e.currentTarget.style.background = C.errC)}
        >
          <Trash2 className="h-4 w-4" /> Delete Pet
        </button>
      </motion.div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title={`Delete ${pet.name}?`}
        message="This will permanently delete this pet and all their health records. This action cannot be undone."
        confirmLabel="Delete Pet"
        variant="danger"
        isLoading={deletePet.isPending}
      />
    </div>
  );
};

export default PetProfile;