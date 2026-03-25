/**
 * PetList.tsx — Clinical Sanctuary redesign
 * Drop-in replacement. All hooks/logic unchanged.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, PawPrint, Search, ArrowRight, Dog, Cat, Rabbit } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { usePets } from '@/hooks/usePets';
import { calculateAge } from '@/utils/dateUtils';
import { ROUTES, buildPath } from '@/constants/routes';

// ─── Design tokens (inline so no extra files needed) ─────────────────────────
const CS = {
  bg: '#f0fcfb',
  surfLo: '#eaf6f5',
  surfHi: '#dfebea',
  surf0: '#ffffff',
  surfDim: '#d9e5e4',
  primary: '#006a67',
  primaryC: '#4fb6b2',
  primaryF: '#8ff3ef',
  primaryDk: '#004442',
  secondary: '#006e29',
  secC: '#93f59c',
  tertC: '#d69c2c',
  error: '#ba1a1a',
  onSurf: '#131d1e',
  onSurfV: '#3d4948',
  outline: '#6d7978',
  outlineV: '#bdc9c7',
} as const;

const sigGrad = 'linear-gradient(135deg, #006a67 0%, #4fb6b2 100%)';

// ─── Filter types ─────────────────────────────────────────────────────────────
type FilterType = 'All' | 'Dog' | 'Cat' | 'Other';

const FILTER_ICONS: Record<FilterType, React.ElementType> = {
  All: PawPrint,
  Dog: Dog,
  Cat: Cat,
  Other: Rabbit,
};


// ─── Pet Card ─────────────────────────────────────────────────────────────────
function PetCard({
  pet,
  index,
}: {
  pet: {
    _id: string;
    name: string;
    breed: string;
    type: string;
    gender: string;
    dateOfBirth: string;
    photo?: string;
  };
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={buildPath(ROUTES.PET_PROFILE, { id: pet._id })} className="block group">
        <div
          className="relative rounded-3xl p-7 flex flex-col items-center text-center overflow-hidden transition-all duration-300"
          style={{
            background: CS.surf0,
            boxShadow: '0 4px 24px rgba(19,29,30,0.07)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 48px rgba(0,106,103,0.14)';
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(19,29,30,0.07)';
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
          }}
        >
          {/* Top accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
            style={{ background: sigGrad }}
          />

          {/* Avatar */}
          <div className="relative mb-5 mt-2">
            <div
              className="w-24 h-24 rounded-full overflow-hidden p-0.5"
              style={{
                background: sigGrad,
                boxShadow: '0 8px 24px rgba(0,106,103,0.2)',
              }}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-white">
                <Avatar src={pet.photo} name={pet.name} size="lg" className="w-full h-full" />
              </div>
            </div>
            {/* Status dot */}
            <div
              className="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full border-2 border-white"
              style={{ background: CS.secC }}
              title="Healthy"
            />
          </div>

          {/* Name + breed */}
          <h3
            className="text-lg font-black mb-0.5"
            style={{ fontFamily: 'Manrope, sans-serif', color: CS.onSurf }}
          >
            {pet.name}
          </h3>
          <p
            className="text-sm font-semibold mb-5"
            style={{ color: CS.primary }}
          >
            {pet.breed}
          </p>

          {/* Stats row */}
          <div
            className="w-full flex items-center justify-center gap-5 mb-5 py-3 rounded-2xl"
            style={{ background: CS.surfLo }}
          >
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5" style={{ color: CS.outline }}>
                Type
              </p>
              <p className="text-xs font-bold" style={{ color: CS.onSurf }}>{pet.type}</p>
            </div>
            <div className="w-px h-6" style={{ background: CS.outlineV }} />
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5" style={{ color: CS.outline }}>
                Age
              </p>
              <p className="text-xs font-bold" style={{ color: CS.onSurf }}>{calculateAge(pet.dateOfBirth)}</p>
            </div>
            <div className="w-px h-6" style={{ background: CS.outlineV }} />
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5" style={{ color: CS.outline }}>
                Sex
              </p>
              <p className="text-xs font-bold" style={{ color: CS.onSurf }}>{pet.gender}</p>
            </div>
          </div>

          {/* View profile CTA */}
          <div
            className="flex items-center gap-1.5 text-sm font-bold transition-all duration-200 group-hover:gap-2.5"
            style={{ color: CS.primary }}
          >
            View Profile
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Add New Pet card ─────────────────────────────────────────────────────────
function AddPetCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={ROUTES.ADD_PET} className="block group">
        <div
          className="rounded-3xl p-7 flex flex-col items-center justify-center text-center h-full min-h-[280px] transition-all duration-300 cursor-pointer"
          style={{
            background: CS.surfLo,
            border: `2px dashed rgba(0,106,103,0.25)`,
            boxShadow: 'none',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,106,103,0.5)';
            (e.currentTarget as HTMLDivElement).style.background = CS.surfHi;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,106,103,0.25)';
            (e.currentTarget as HTMLDivElement).style.background = CS.surfLo;
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
            style={{ background: CS.surf0, boxShadow: '0 4px 16px rgba(0,106,103,0.12)' }}
          >
            <Plus className="h-7 w-7" style={{ color: CS.primary }} />
          </div>
          <h3
            className="text-base font-black mb-1.5"
            style={{ fontFamily: 'Manrope, sans-serif', color: CS.onSurf }}
          >
            Add New Pet
          </h3>
          <p className="text-xs leading-relaxed max-w-[140px]" style={{ color: CS.onSurfV }}>
            Grow your pet family in PawHealth
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyStateView({ onAction }: { onAction: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-32 text-center"
    >
      <div
        className="w-28 h-28 rounded-full flex items-center justify-center mb-8"
        style={{ background: 'linear-gradient(135deg,#eaf6f5,#8ff3ef)' }}
      >
        <PawPrint className="h-12 w-12" style={{ color: CS.primary }} />
      </div>
      <h3
        className="text-2xl font-black mb-3"
        style={{ fontFamily: 'Manrope, sans-serif', color: CS.onSurf }}
      >
        Your sanctuary is empty
      </h3>
      <p className="text-base max-w-sm leading-relaxed mb-8" style={{ color: CS.onSurfV }}>
        Add your first companion to begin tracking their clinical wellness in your private sanctuary.
      </p>
      <button
        onClick={onAction}
        className="flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white transition-all"
        style={{
          background: sigGrad,
          boxShadow: '0 8px 28px rgba(0,106,103,0.28)',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <Plus className="h-4 w-4" />
        Add Your First Pet
      </button>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const PetList = () => {
  const navigate = useNavigate();
  const { data, isLoading } = usePets();
  const pets = data?.data ?? [];

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('All');

  const filtered = pets.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.breed.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || p.type === filter;
    return matchesSearch && matchesFilter;
  });

  const filterTypes: FilterType[] = ['All', 'Dog', 'Cat', 'Other'];

  return (
    <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10"
      >
        <div>
          <h1
            className="font-black tracking-tight mb-2"
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: CS.onSurf,
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
            }}
          >
            My Pets
          </h1>
          <p className="text-base leading-relaxed max-w-md" style={{ color: CS.onSurfV }}>
            Manage your companions and monitor their clinical wellness.
          </p>
        </div>

        <Link to={ROUTES.ADD_PET}>
          <button
            className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white flex-shrink-0 transition-all active:scale-95"
            style={{
              background: sigGrad,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,106,103,0.25)',
            }}
          >
            <Plus className="h-4 w-4" />
            Add Pet
          </button>
        </Link>
      </motion.div>

      {/* ── Search + filter bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="flex flex-col sm:flex-row gap-3 mb-10 p-3 rounded-2xl"
        style={{ background: CS.surfLo }}
      >
        {/* Search input */}
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: CS.onSurfV }}
          />
          <input
            type="text"
            placeholder="Search by name or breed…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
            style={{
              background: CS.surf0,
              border: '1.5px solid transparent',
              color: CS.onSurf,
            }}
            onFocus={e => {
              e.target.style.borderColor = 'rgba(0,106,103,0.3)';
              e.target.style.boxShadow = '0 0 0 3px rgba(0,106,103,0.08)';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'transparent';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap">
          {filterTypes.map(f => {
            const Icon = FILTER_ICONS[f];
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all"
                style={{
                  background: active ? CS.primary : CS.surf0,
                  color: active ? '#fff' : CS.onSurfV,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: active ? '0 4px 12px rgba(0,106,103,0.25)' : 'none',
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                {f}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <SkeletonLoader key={i} variant="card" />)}
        </div>
      ) : pets.length === 0 ? (
        <EmptyStateView onAction={() => navigate(ROUTES.ADD_PET)} />
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((pet, i) => (
              <PetCard key={pet._id} pet={pet} index={i} />
            ))}
            <AddPetCard />
          </div>

          {filtered.length === 0 && search && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-base font-medium" style={{ color: CS.onSurfV }}>
                No pets found for "{search}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default PetList;