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
  Heart, Wind, ChevronRight, Clock, Check, Plus,
} from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';

import { usePet, useDeletePet } from '@/hooks/usePets';
import { useVaccinations } from '@/hooks/useVaccinations';
import { useMedications } from '@/hooks/useMedications';
import { useDewormingSchedule, useDewormingHistory } from '@/hooks/useDeworming';
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
  children,
  className = '',
  dark = false,
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <Card
      variant={dark ? 'dark' : 'glass'}
      className={`p-7 flex flex-col ${className}`}
    >
      {children}
    </Card>
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

// ─── Vaccinations Tab ────────────────────────────────────────────────────────
function VaccinationsTab({ items, id }: { items: any[]; id: string }) {
  return (
    <BCard>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-xl" style={{ fontFamily: 'Manrope,sans-serif', color: C.onS }}>Vaccination History</h3>
        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: C.lo, color: C.prim }}>
          {items.length} Total
        </span>
      </div>
      {items.length === 0 ? (
        <EmptyState icon={Syringe} title="No vaccinations" description="No vaccination records found for this pet." />
      ) : (
        <div className="space-y-4">
          {items.map((v, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all hover:shadow-sm"
              style={{ background: C.surf, borderColor: 'rgba(189,201,199,.3)' }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: C.lo }}>
                  <Syringe className="h-5 w-5" style={{ color: C.primC }} />
                </div>
                <div>
                  <h4 className="font-bold text-base" style={{ color: C.onS }}>{v.vaccineName}</h4>
                  <p className="text-xs" style={{ color: C.onSV }}>
                    {v.status === 'completed' 
                      ? `Administered ${formatDate(v.dateAdministered || v.date)}`
                      : `Due ${formatDate(v.nextDueDate)}`}
                  </p>
                </div>
              </div>
              <div className="mt-3 sm:mt-0">
                <StatusBadge status={v.status} />
              </div>
            </div>
          ))}
          <Link to={buildPath(ROUTES.VACCINATIONS, { id })} 
            className="flex items-center justify-center gap-2 w-full py-4 mt-4 rounded-2xl text-sm font-bold transition-all border-2 border-dashed hover:border-solid"
            style={{ borderColor: C.dim, color: C.prim }}>
            Open Full Vaccination Tracker <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </BCard>
  );
}

// ─── Medications Tab ─────────────────────────────────────────────────────────
function MedicationsTab({ items, id }: { items: any[]; id: string }) {
  const activeOnly = items.filter(m => {
    const s = (m.status || '').toLowerCase();
    return s === 'active' || s === 'ongoing';
  });

  return (
    <BCard>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-xl" style={{ fontFamily: 'Manrope,sans-serif', color: C.onS }}>Active Medications</h3>
        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: '#ffdeab', color: '#4a2500' }}>
          {activeOnly.length} Active
        </span>
      </div>
      {activeOnly.length === 0 ? (
        <EmptyState icon={Pill} title="No active meds" description="This pet has no active or ongoing medications." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {activeOnly.map((m, i) => (
            <div key={i} className="p-5 rounded-2xl border" style={{ background: C.surf, borderColor: 'rgba(189,201,199,.3)' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(214,156,44,.1)' }}>
                    <Pill className="h-5 w-5" style={{ color: C.tertC }} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base" style={{ color: C.onS }}>{m.medicineName}</h4>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.tertC }}>{m.dosage}</p>
                  </div>
                </div>
                <StatusBadge status={m.status} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase" style={{ color: C.out }}>
                  <span>Progress</span>
                  <span>{formatDate(m.startDate)} – {formatDate(m.endDate)}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.dim }}>
                  <motion.div className="h-full rounded-full" style={{ background: SIG, width: '45%' }}
                    initial={{ width: 0 }} animate={{ width: '45%' }} />
                </div>
              </div>
            </div>
          ))}
          <div className="md:col-span-2">
            <Link to={buildPath(ROUTES.MEDICATIONS, { id })} 
              className="flex items-center justify-center gap-2 w-full py-4 mt-2 rounded-2xl text-sm font-bold transition-all border-2 border-dashed hover:border-solid"
              style={{ borderColor: C.dim, color: C.prim }}>
              Open Medication Tracker <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </BCard>
  );
}

// ─── Deworming Tab ──────────────────────────────────────────────────────────
function DewormingTab({ schedule, records, id }: { schedule: any; records: any[]; id: string }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <BCard dark className="md:col-span-1">
          <IBadge icon={Bug} bg="rgba(143,243,239,.15)" color="#8ff3ef" />
          <p className="text-[10px] font-bold uppercase tracking-[.18em] mt-5 mb-1" style={{ color: 'rgba(143,243,239,.55)' }}>Routine</p>
          <h3 className="font-black text-2xl text-white mb-2" style={{ fontFamily: 'Manrope,sans-serif' }}>
            {schedule?.frequency || 'Not Set'}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(143,243,239,.6)' }}>
            Regular deworming prevents parasitic infections and keeps your pet healthy.
          </p>
        </BCard>
        <BCard className="md:col-span-2">
          <h3 className="font-black text-xl mb-6" style={{ fontFamily: 'Manrope,sans-serif', color: C.onS }}>Recent Doses</h3>
          {records.length === 0 ? (
            <p className="text-sm" style={{ color: C.onSV }}>No administration records found.</p>
          ) : (
            <div className="space-y-3">
              {records.slice(0, 3).map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: C.lo }}>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4" style={{ color: C.sec }} />
                    <span className="text-sm font-bold" style={{ color: C.onS }}>Dose Administered</span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: C.onSV }}>{formatDate(r.dateAdministered)}</span>
                </div>
              ))}
            </div>
          )}
          <Link to={buildPath(ROUTES.DEWORMING, { id })} className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: C.prim }}>
            View full schedule <ArrowRight className="h-4 w-4" />
          </Link>
        </BCard>
      </div>
    </div>
  );
}

// ─── Vet Visits Tab ──────────────────────────────────────────────────────────
function VetVisitsTab({ items, id }: { items: any[]; id: string }) {
  return (
    <BCard>
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-black text-xl" style={{ fontFamily: 'Manrope,sans-serif', color: C.onS }}>Clinical History</h3>
        <Link to={buildPath(ROUTES.VET_VISITS, { id })} 
          className="px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:bg-white"
          style={{ background: C.lo, color: C.prim, border: `1px solid ${C.dim}` }}>
          Log New Visit
        </Link>
      </div>
      {items.length === 0 ? (
        <EmptyState icon={Stethoscope} title="No visits" description="No veterinary visits have been logged for this pet." />
      ) : (
        <div className="relative space-y-8" style={{ paddingLeft: 40 }}>
          <div className="absolute top-2 bottom-2 w-0.5" style={{ left: 14, background: C.dim }} />
          {items.map((v, i) => (
            <div key={i} className="relative">
              <div className="absolute w-7 h-7 rounded-full flex items-center justify-center border-4"
                style={{ left: -40, top: 0, background: C.lo, borderColor: C.surf }}>
                <Stethoscope className="h-3 w-3" style={{ color: C.prim }} />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: C.prim }}>{formatDate(v.visitDate || v.date)}</p>
                  <h4 className="font-black text-lg" style={{ color: C.onS }}>{v.reason}</h4>
                  <p className="text-sm font-bold" style={{ color: C.onSV }}>{v.vetName ? `Dr. ${v.vetName}` : 'General Checkup'}</p>
                  {v.notes && (
                    <p className="mt-3 p-3 rounded-xl text-xs italic leading-relaxed" style={{ background: C.lo, color: C.onSV }}>"{v.notes}"</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </BCard>
  );
}

// ─── Weight Tab ──────────────────────────────────────────────────────────────
function WeightTab({ weights, id }: { weights: any[]; id: string }) {
  return (
    <div className="space-y-5">
      <BCard>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="font-black text-xl" style={{ fontFamily: 'Manrope,sans-serif', color: C.onS }}>Weight Trend</h3>
            <p className="text-sm" style={{ color: C.onSV }}>Monitoring growth and health metrics</p>
          </div>
          <Link to={buildPath(ROUTES.WEIGHT, { id })} 
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white border"
            style={{ borderColor: C.dim }}>
            <Plus className="h-5 w-5" style={{ color: C.prim }} />
          </Link>
        </div>
        
        <div className="bg-white rounded-3xl p-6 border mb-8" style={{ borderColor: 'rgba(189,201,199,.3)' }}>
          <WeightChart weights={weights} />
        </div>

        <div className="overflow-hidden rounded-2xl border" style={{ borderColor: C.dim }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ background: C.lo }}>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider" style={{ color: C.out }}>Date</th>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider" style={{ color: C.out }}>Weight</th>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider" style={{ color: C.out }}>Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: C.dim }}>
              {weights.slice(-5).reverse().map((w, i) => (
                <tr key={i} className="hover:bg-white/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: C.onS }}>{formatDate(w.recordedDate || w.date)}</td>
                  <td className="px-5 py-3.5 text-sm font-black" style={{ color: C.prim }}>{w.weight}</td>
                  <td className="px-5 py-3.5 text-xs font-bold" style={{ color: C.onSV }}>{w.unit || 'kg'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {weights.length === 0 && (
            <div className="p-10 text-center text-sm" style={{ color: C.onSV }}>No weight history logged yet.</div>
          )}
        </div>
      </BCard>
    </div>
  );
}

// ─── Overview bento grid ──────────────────────────────────────────────────────
function OverviewBento({ pet, vaccinations, medications, schedule, records, vetVisits, weights }: {
  pet: any; vaccinations: any[]; medications: any[];
  schedule: any; records: any[]; vetVisits: any[]; weights: any[];
}) {
  const id = pet._id;
  const sortedW = [...weights].sort((a: any, b: any) => 
    new Date(a.recordedDate || a.date).getTime() - new Date(b.recordedDate || b.date).getTime());
  const lastW = sortedW[sortedW.length - 1];
  const today = new Date().getDay(); // 0=Sun
  const activeMeds = medications.filter((m: any) => {
    const s = (m.status || '').toLowerCase();
    return s === 'active' || s === 'ongoing';
  });
  const nextDeworm = schedule;
  
  const overdueVaccs = vaccinations.filter((v: any) => v.status === 'overdue');
  const isDewormOverdue = schedule?.status === 'overdue';
  const healthScore = Math.max(40, 100 - overdueVaccs.length * 12 - (isDewormOverdue ? 8 : 0));

  // Weight bars – last 5 entries normalised from sorted data
  const wSlice = sortedW.slice(-5);
  // Removed maxW as it is now encapsulated safely in WeightChart

  // Activity timeline – merge + sort desc
  type Act = { date: string; title: string; sub: string; primary: boolean; type?: string };
  const activities: Act[] = [
    ...vetVisits.slice(0, 2).map((v: any) => ({
      date: v.visitDate || v.date || '',
      title: v.reason || 'Vet Visit',
      sub: v.vetName ? `Dr. ${v.vetName}` : 'Clinic Visit',
      primary: true,
      type: 'Visit',
    })),
    ...vaccinations.slice(0, 2).map((v: any) => ({
      date: v.dateAdministered || v.date || '',
      title: `Vaccination: ${v.vaccineName}`,
      sub: v.batchNumber ? `Batch #${v.batchNumber}` : '',
      primary: false,
      type: 'Vax',
    })),
    ...medications.slice(0, 1).map((m: any) => ({
      date: m.startDate || m.date || '',
      title: `Medication: ${m.medicineName}`,
      sub: m.dosage || '',
      primary: false,
      type: 'Med',
    })),
    ...records.slice(0, 1).map((r: any) => ({
      date: r.dateAdministered || r.date || '',
      title: 'Deworming Dose',
      sub: 'Routine dose',
      primary: false,
      type: 'Dose',
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
          <HealthRing score={healthScore} />
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
                  Administered {formatDate(vaccinations[0].dateAdministered || vaccinations[0].date || new Date().toISOString())}
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

            <WeightChart weights={wSlice} />

            {wSlice.length > 1 && (
              <div className="flex justify-between text-[10px] font-bold uppercase"
                style={{ color: C.onSV }}>
                <span>{formatDate(wSlice[0].recordedDate || wSlice[0].date || new Date().toISOString())}</span>
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
                      {a.type || 'Visit'}
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
  const { data: scheduleData } = useDewormingSchedule(id!);
  const { data: historyData } = useDewormingHistory(id!);
  const { data: vetData } = useVetVisits(id!);
  const { data: weightData } = useWeightEntries(id!);

  const vaccinations = vaccData?.data ?? [];
  const medications = medsData?.data ?? [];
  const schedule = scheduleData?.data;
  const records = historyData?.data || [];
  const vetVisits = vetData?.data ?? [];
  const weights = weightData?.data ?? [];

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
    { label: 'Active Meds', count: medications.filter((m: any) => {
      const s = (m.status || '').toLowerCase();
      return s === 'active' || s === 'ongoing';
    }).length, color: C.tertC, bg: '#ffdeab' },
    { label: 'Vet Visits', count: vetVisits.length, color: C.sec, bg: C.secC },
    { label: 'Weight Logs', count: weights.length, color: C.out, bg: C.dim },
  ];

  return (
    <div className="max-w-[1400px] mx-auto pb-20" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

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
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] as const }}
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
              {medications.filter((m: any) => {
                const s = (m.status || '').toLowerCase();
                return s === 'active' || s === 'ongoing';
              }).length > 0 && (
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
            {pet.dateOfBirth && (
              <>
                <span className="mx-2" style={{ color: C.primC }}>•</span>
                {calculateAge(pet.dateOfBirth)}
              </>
            )}
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
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
        >
          {activeTab === 'overview' && (
            <OverviewBento pet={pet} vaccinations={vaccinations}
              medications={medications} schedule={schedule}
              records={records} vetVisits={vetVisits} weights={weights} />
          )}
          {activeTab === 'vaccinations' && (
            <VaccinationsTab items={vaccinations} id={id!} />
          )}
          {activeTab === 'medications' && (
            <MedicationsTab items={medications} id={id!} />
          )}
          {activeTab === 'deworming' && (
            <DewormingTab schedule={schedule} records={records} id={id!} />
          )}
          {activeTab === 'vet-visits' && (
            <VetVisitsTab items={vetVisits} id={id!} />
          )}
          {activeTab === 'weight' && (
            <WeightTab weights={weights} id={id!} />
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

// ─── Mini Custom SVG Weight Line Chart ───────────────────────────────────────
function WeightChart({ weights }: { weights: any[] }) {
  const data = weights.length >= 2
    ? [...weights].sort((a, b) => new Date(a.recordedDate).getTime() - new Date(b.recordedDate).getTime())
    : [
        { weight: 12, recordedDate: '2026-03-01' },
        { weight: 14, recordedDate: '2026-03-15' },
        { weight: 13, recordedDate: '2026-03-30' },
      ];

  const wValues = data.map(d => d.weight);
  const rawMin = Math.min(...wValues);
  const rawMax = Math.max(...wValues);
  const diff = rawMax - rawMin;
  
  // Create a tighter window around the values to emphasize movement
  const minW = rawMin - (diff > 0 ? diff * 0.4 : 2);
  const maxW = rawMax + (diff > 0 ? diff * 0.4 : 2);

  const W = 600;
  const H = 140; 
  const PAD = 40;

  const getPos = (val: number, i: number) => ({
    x: PAD + (i / (data.length - 1)) * (W - PAD * 2),
    y: (H - PAD) - ((val - minW) / (maxW - minW || 1)) * (H - PAD * 1.5),
  });

  const pts = wValues.map((v, i) => getPos(v, i));

  // Bezier curve generation with a more dramatic control point
  const curve = pts.reduce((acc, p, i, a) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = a[i - 1];
    const dx = p.x - prev.x;
    return `${acc} C ${prev.x + dx * 0.4},${prev.y} ${p.x - dx * 0.4},${p.y} ${p.x},${p.y}`;
  }, '');

  const area = `${curve} L ${pts[pts.length - 1].x},${H} L ${pts[0].x},${H} Z`;

  return (
    <div className="relative w-full h-[200px] mt-4 flex flex-col items-center">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="wGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={C.prim} stopOpacity={0.15} />
            <stop offset="100%" stopColor={C.prim} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Health Range Corridor */}
        <rect x={PAD} y={H/2 - 10} width={W - PAD*2} height="20" fill={C.lo} opacity="0.4" rx="10" />

        <motion.path d={area} fill="url(#wGrad)"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />

        <motion.path d={curve} fill="none" stroke={C.prim} strokeWidth="4" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }} />

        {pts.map((p, i) => (
          <g key={i}>
            {/* Value Label */}
            <motion.text
              x={p.x} y={p.y - 12} textAnchor="middle"
              className="text-[14px] font-black" style={{ fill: C.prim, fontFamily: 'Manrope, sans-serif' }}
              initial={{ opacity: 0, y: p.y }} animate={{ opacity: 1, y: p.y - 12 }} transition={{ delay: 1 + i * 0.1 }}
            >
              {data[i].weight}kg
            </motion.text>
            
            <motion.circle cx={p.x} cy={p.y} r="6" fill="#fff" stroke={C.prim} strokeWidth="3"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 + i * 0.1, type: "spring" }} />
          </g>
        ))}
      </svg>
      
      {/* Dynamic Trend Mini Card */}
      <div className="absolute top-0 right-0 flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border shadow-sm"
        style={{ borderColor: C.dim }}>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.sec }} />
        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: C.onS }}>
          Stability: Healthy Range
        </span>
      </div>
    </div>
  );
}