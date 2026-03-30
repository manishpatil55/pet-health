import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PawPrint,
  Syringe,
  Pill,
  Bug,
  Stethoscope,
  Weight,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { ROUTES, buildPath } from '@/constants/routes';
import { usePetStore } from '@/store/petStore';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import toast from 'react-hot-toast';

const mainNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: ROUTES.DASHBOARD },
  { label: 'My Pets', icon: PawPrint, path: ROUTES.PETS },
  { label: 'Documents', icon: FileText, path: ROUTES.DOCUMENTS },
];

const healthNav = [
  { label: 'Vaccinations', icon: Syringe, route: ROUTES.VACCINATIONS },
  { label: 'Medications', icon: Pill, route: ROUTES.MEDICATIONS },
  { label: 'Deworming', icon: Bug, route: ROUTES.DEWORMING },
  { label: 'Vet Visits', icon: Stethoscope, route: ROUTES.VET_VISITS },
  { label: 'Weight', icon: Weight, route: ROUTES.WEIGHT },
];

// ─── Shared nav item component ──────────────────────────────────────────────
function NavItem({
  to,
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={() => `
        group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[13px] font-semibold
        transition-all duration-300
        ${isActive
          ? 'text-[#006a67]'
          : 'text-[#6d7978] hover:text-[#131d1e] hover:bg-white/40'
        }
      `}
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Active background pill */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-pill"
          className="absolute inset-0 bg-white/60 rounded-2xl -z-10 shadow-sm"
          initial={false}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}

      {/* Active indicator dot */}
      {isActive && (
        <div
          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#006a67]"
        />
      )}

      {/* Icon container */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300
          ${isActive
            ? 'bg-gradient-to-br from-[#006a67] to-[#4fb6b2] shadow-[0_4px_12px_rgba(0,106,103,0.2)]'
            : 'bg-white/40 group-hover:bg-white group-hover:shadow-sm'
          }
        `}
      >
        <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-white' : 'text-[#6d7978] group-hover:text-[#131d1e]'}`} />
      </div>

      <span className="flex-1">{label}</span>

      {/* Hover chevron */}
      {isActive && (
        <ChevronRight className="h-3.5 w-3.5 text-[#4fb6b2] opacity-60" />
      )}
    </NavLink>
  );
}

const Sidebar = () => {
  const { googleSignOut } = useGoogleAuth();
  const location = useLocation();
  const activePetId = usePetStore((state) => state.activePetId);

  const match = location.pathname.match(/\/pets\/([a-zA-Z0-9_-]+)/);
  const currentPetId = match ? match[1] : activePetId;

  const getHealthPath = (baseRoute: string) => {
    if (baseRoute.includes(':id') && currentPetId) {
      return buildPath(baseRoute, { id: currentPetId });
    }
    return '';
  };

  const handleLogout = async () => {
    try {
      await googleSignOut();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <motion.aside
      className="fixed left-6 top-6 bottom-6 w-[220px] hidden lg:flex flex-col z-50 rounded-[32px] shadow-2xl overflow-hidden border border-white/40"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-6 py-8">
        <div
          className="h-11 w-11 rounded-[1.2rem] flex items-center justify-center transition-transform hover:rotate-6"
          style={{
            background: 'linear-gradient(135deg, #006a67 0%, #4fb6b2 100%)',
            boxShadow: '0 8px 20px rgba(0,106,103,0.25)',
          }}
        >
          <PawPrint className="h-5.5 w-5.5 text-white" />
        </div>
        <div>
          <span
            className="text-xl font-black text-[#006a67] block leading-tight"
            style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.04em' }}
          >
            PawHealth
          </span>
          <span className="text-[10px] font-bold text-[#6d7978] tracking-[0.15em] uppercase opacity-60">
            Clinical Care
          </span>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-6 h-px bg-black/5" />

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">

        {mainNav.map((item) => (
          <NavItem
            key={item.path}
            to={item.path}
            icon={item.icon}
            label={item.label}
            isActive={
              location.pathname === item.path ||
              (item.path !== ROUTES.DASHBOARD && location.pathname.startsWith(item.path))
            }
          />
        ))}

        {/* Clinical Records section */}
        <div className="pt-8">
          <div className="flex items-center gap-2 px-3 mb-4 opacity-50">
            <div className="w-1 h-1 rounded-full bg-[#4fb6b2]" />
            <p
              className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6d7978]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Clinical Records
            </p>
          </div>

          {healthNav.map((item) => {
            const resolvedPath = getHealthPath(item.route);
            const isActive = resolvedPath
              ? location.pathname === resolvedPath || location.pathname.startsWith(resolvedPath)
              : false;

            return (
              <NavItem
                key={item.label}
                to={resolvedPath || ROUTES.PETS}
                icon={item.icon}
                label={item.label}
                isActive={isActive}
                onClick={(e) => {
                  if (!resolvedPath) {
                    e.preventDefault();
                    toast('Select a pet to view clinical records', {
                      icon: '🐾',
                      style: { borderRadius: '16px', background: '#131d1e', color: '#fff' }
                    });
                  }
                }}
              />
            );
          })}
        </div>
      </nav>

      {/* ── Bottom section ── */}
      <div className="px-3 py-6 space-y-1 bg-white/20 backdrop-blur-sm mt-auto">
        <NavItem
          to={ROUTES.SETTINGS}
          icon={Settings}
          label="Settings"
          isActive={location.pathname === ROUTES.SETTINGS}
        />

        <button
          onClick={handleLogout}
          className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[13px] font-bold text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-all duration-300"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#ffdad6]/40 group-hover:bg-[#ffdad6] transition-colors">
            <LogOut className="h-4 w-4" />
          </div>
          Logout
        </button>
      </div>
    </motion.aside>
  );
};

export { Sidebar };
