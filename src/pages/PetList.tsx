/**
 * PetList.tsx — Clinical Sanctuary redesign (Premium Bento Aesthetic)
 * Drop-in replacement. All hooks/logic unchanged.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, PawPrint, Search, ArrowRight, Dog, Cat, Rabbit, Settings2, HeartPulse } from 'lucide-react';

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
const HEAD = 'Manrope, sans-serif';
const BODY = 'Plus Jakarta Sans, sans-serif';

// ─── Framer variants ─────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

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
}) {
  return (
    <motion.div variants={fadeUp} className="h-full">
      <Link to={buildPath(ROUTES.PET_PROFILE, { id: pet._id })} className="block h-full group outline-none">
        <div
          className="relative h-full rounded-[2rem] p-7 flex flex-col items-center text-center overflow-hidden transition-all duration-500 bg-white"
          style={{
            border: `1px solid rgba(189,201,199,.25)`,
            boxShadow: '0 4px 24px rgba(0,0,0,.02)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(79,182,178,.3)'; // CS.primaryC with opacity
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 24px 48px rgba(0,106,103,.08)';
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(189,201,199,.25)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(0,0,0,.02)';
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
          }}
        >
          {/* Subtle top ambient glow */}
          <div
            className="absolute top-0 left-0 right-0 h-32 opacity-30 transition-opacity duration-500 group-hover:opacity-60 pointer-events-none"
            style={{ background: 'radial-gradient(circle at top, #eaf6f5 0%, transparent 70%)' }}
          />

          {/* Avatar Area */}
          <div className="relative mb-6 z-10 mt-2">
            <div
              className="w-28 h-28 rounded-full overflow-hidden shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_8px_24px_rgba(0,106,103,.15)] bg-white p-1"
              style={{ background: `linear-gradient(135deg, ${CS.surf0} 0%, ${CS.surfLo} 100%)` }}
            >
              <div className="w-full h-full rounded-full overflow-hidden">
                <Avatar src={pet.photo} name={pet.name} size="lg" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Live Health Status Dot */}
            <div className="absolute bottom-0 right-1 flex items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping" style={{ background: CS.secC }}></span>
              <div
                className="relative w-6 h-6 rounded-full border-[2.5px] border-white flex items-center justify-center shadow-sm"
                style={{ background: CS.secC }}
                title="Active Record"
              />
            </div>
          </div>

          {/* Clinical Badge */}
          <div className="flex items-center gap-1 mb-2.5 z-10 opacity-0 transform translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
            <HeartPulse className="w-3.5 h-3.5" style={{ color: CS.primaryC }} />
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: CS.primaryC }}>Active Patient</span>
          </div>

          {/* Name & Breed */}
          <div className="mb-5 z-10 w-full transition-transform duration-500 group-hover:-translate-y-1">
            <h3
              className="text-2xl font-black mb-1 truncate px-2"
              style={{ fontFamily: HEAD, color: CS.onSurf, letterSpacing: '-0.02em' }}
            >
              {pet.name}
            </h3>
            <p className="text-sm font-semibold truncate px-4" style={{ color: CS.onSurfV }}>
              {pet.breed}
            </p>
          </div>

          {/* Bento Stats Row */}
          <div className="flex w-full items-center justify-center gap-3 mb-6 z-10">
            <div className="flex flex-col items-center px-3 py-2 rounded-xl" style={{ background: CS.surfLo }}>
              <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: CS.outline }}>Type</span>
              <span className="text-xs font-bold" style={{ color: CS.onSurf }}>{pet.type}</span>
            </div>
            <div className="flex flex-col items-center px-3 py-2 rounded-xl" style={{ background: CS.surfLo }}>
              <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: CS.outline }}>Age</span>
              <span className="text-xs font-bold" style={{ color: CS.onSurf }}>{calculateAge(pet.dateOfBirth)}</span>
            </div>
            <div className="flex flex-col items-center px-3 py-2 rounded-xl" style={{ background: CS.surfLo }}>
              <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: CS.outline }}>Sex</span>
              <span className="text-xs font-bold" style={{ color: CS.onSurf }}>{pet.gender}</span>
            </div>
          </div>

          {/* View profile CTA */}
          <div
            className="mt-auto w-full pt-5 flex items-center justify-between text-sm font-bold transition-all duration-300 z-10 relative overflow-hidden"
            style={{ color: CS.primary, borderTop: `1px solid ${CS.surfDim}` }}
          >
            <span>Open Profile</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-[#eaf6f5]">
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Add New Pet card (Redesigned) ────────────────────────────────────────────
function AddPetCard() {
  return (
    <motion.div variants={fadeUp} className="h-full">
      <Link to={ROUTES.ADD_PET} className="block group h-full outline-none">
        <div
          className="rounded-[2rem] p-7 flex flex-col items-center justify-center text-center h-full min-h-[340px] transition-all duration-500 cursor-pointer relative overflow-hidden"
          style={{
            background: 'transparent',
            border: `2px dashed rgba(189,201,199,.6)`, // Default dashed outline
            boxShadow: 'none',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = CS.primaryC; // Brighten border
            (e.currentTarget as HTMLDivElement).style.borderStyle = 'solid'; // Make solid
            (e.currentTarget as HTMLDivElement).style.background = CS.surf0; // Solid white bg
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 24px 48px rgba(0,106,103,.08)'; // Soft, elegant glow
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(189,201,199,.6)';
            (e.currentTarget as HTMLDivElement).style.borderStyle = 'dashed';
            (e.currentTarget as HTMLDivElement).style.background = 'transparent';
            (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
          }}
        >
          {/* Subtle elegant gradient overlay on hover (no heavy green block) */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(234,246,245,0.5) 100%)' }}
          />

          {/* Icon Wrapper */}
          <div
            className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-90 group-hover:shadow-[0_8px_20px_rgba(0,106,103,.12)]"
            style={{ background: CS.surfLo }}
          >
            <Plus className="h-7 w-7 transition-colors duration-500" style={{ color: CS.primary }} />
          </div>

          <h3
            className="relative z-10 text-xl font-black mb-2 transition-colors duration-500"
            style={{ fontFamily: HEAD, color: CS.onSurf }}
          >
            Add New Pet
          </h3>
          <p className="relative z-10 text-sm leading-relaxed max-w-[180px]" style={{ color: CS.onSurfV }}>
            Register a new companion to your clinical sanctuary.
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
      variants={fadeUp}
      className="flex flex-col items-center justify-center py-24 text-center rounded-[2.5rem] mt-4 border border-dashed relative overflow-hidden"
      style={{ borderColor: CS.outlineV, background: 'rgba(255,255,255,0.4)' }}
    >
      <motion.div
        className="w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm relative z-10"
        style={{ background: CS.surfLo }}
        animate={{ scale: [1, 1.03, 1], rotate: [0, -3, 3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <PawPrint className="h-10 w-10" style={{ color: CS.primaryC }} />
      </motion.div>
      <h3
        className="text-2xl font-black mb-3 tracking-tight relative z-10"
        style={{ fontFamily: HEAD, color: CS.onSurf }}
      >
        Your sanctuary is empty
      </h3>
      <p className="text-base max-w-md leading-relaxed mb-8 relative z-10" style={{ color: CS.onSurfV }}>
        Register your first companion to begin tracking their clinical wellness, vaccinations, and daily vitals.
      </p>
      <button
        onClick={onAction}
        className="relative z-10 flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm text-white transition-all active:scale-95 hover:shadow-[0_12px_30px_rgba(0,106,103,.3)]"
        style={{
          background: sigGrad,
          boxShadow: '0 8px 24px rgba(0,106,103,0.2)',
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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      style={{ fontFamily: BODY }}
      className="max-w-7xl mx-auto pb-10"
    >
      {/* ── Page header ── */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div>
          <h1
            className="font-black tracking-tight mb-2"
            style={{
              fontFamily: HEAD,
              fontSize: 'clamp(2rem, 4vw, 2.8rem)',
              color: CS.onSurf,
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
            }}
          >
            My Pets
          </h1>
          <p className="text-base" style={{ color: CS.onSurfV }}>
            Manage your companions and monitor their clinical wellness.
          </p>
        </div>

        <Link to={ROUTES.ADD_PET}>
          <button
            className="flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm text-white transition-all active:scale-95 hover:shadow-[0_12px_30px_rgba(0,106,103,.3)]"
            style={{
              background: sigGrad,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,106,103,0.2)',
            }}
          >
            <Plus className="h-4 w-4" />
            Register Pet
          </button>
        </Link>
      </motion.div>

      {/* ── Bento-style Search & Filter bar ── */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col md:flex-row items-center gap-4 mb-10 p-2 rounded-full transition-all"
        style={{
          background: CS.surf0,
          border: `1px solid rgba(189,201,199,.4)`,
          boxShadow: '0 4px 20px rgba(0,0,0,.02)'
        }}
      >
        {/* Search input */}
        <div className="relative flex-1 w-full md:w-auto flex items-center">
          <Search className="absolute left-5 h-4 w-4" style={{ color: CS.onSurfV }} />
          <input
            type="text"
            placeholder="Search patients by name or breed…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full text-sm font-medium outline-none bg-transparent"
            style={{ color: CS.onSurf }}
          />
        </div>

        {/* Divider (desktop only) */}
        <div className="hidden md:block w-px h-8" style={{ background: CS.surfDim }} />

        {/* Filter chips */}
        <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 px-2 md:px-0 hide-scrollbar">
          <div className="flex items-center gap-1.5 mr-2 ml-1 opacity-50">
            <Settings2 className="h-4 w-4" style={{ color: CS.onSurfV }} />
          </div>
          {filterTypes.map(f => {
            const Icon = FILTER_ICONS[f];
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all flex-shrink-0"
                style={{
                  background: active ? CS.primary : 'transparent',
                  color: active ? '#fff' : CS.onSurfV,
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget.style.background = CS.surfLo);
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget.style.background = 'transparent');
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                {f}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Grid Content ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <SkeletonLoader key={i} variant="card" />)}
        </div>
      ) : pets.length === 0 ? (
        <EmptyStateView onAction={() => navigate(ROUTES.ADD_PET)} />
      ) : (
        <AnimatePresence>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch"
          >
            {filtered.map((pet) => (
              <PetCard key={pet._id} pet={pet} />
            ))}
            <AddPetCard />
          </motion.div>

          {filtered.length === 0 && search && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 rounded-[2rem] mt-8"
              style={{ border: `1px dashed ${CS.outlineV}`, background: CS.surfLo }}
            >
              <Search className="h-10 w-10 mx-auto mb-4 opacity-50" style={{ color: CS.onSurfV }} />
              <p className="text-lg font-bold" style={{ fontFamily: HEAD, color: CS.onSurf }}>
                No records found
              </p>
              <p className="text-sm font-medium mt-1" style={{ color: CS.onSurfV }}>
                We couldn't find any patients matching "{search}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* CSS for hiding scrollbar on mobile filters */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
};

export default PetList;