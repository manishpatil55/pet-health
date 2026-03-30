/**
 * Sidebar.tsx — Clinical Sanctuary Edition
 * Premium sidebar with gradient logo, accent indicators, and refined typography.
 */

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
        transition-all duration-200
        ${isActive
          ? 'text-[#006a67]'
          : 'text-[#6d7978] hover:text-[#3d4948] hover:bg-[#eaf6f5]'
        }
      `}
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Active indicator bar */}
      {isActive && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
          style={{ background: 'linear-gradient(180deg, #006a67 0%, #4fb6b2 100%)' }}
        />
      )}

      {/* Icon container */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200
          ${isActive
            ? 'bg-gradient-to-br from-[#006a67] to-[#4fb6b2] shadow-[0_4px_12px_rgba(0,106,103,0.25)]'
            : 'bg-[#eaf6f5] group-hover:bg-[#dfebea]'
          }
        `}
      >
        <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-[#6d7978] group-hover:text-[#3d4948]'}`} />
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
    <aside
      className="hidden lg:flex lg:flex-col lg:w-[260px] lg:fixed lg:inset-y-0"
      style={{
        background: '#ffffff',
        borderRight: '1px solid rgba(189,201,199,.18)',
        boxShadow: '4px 0 24px rgba(19,29,30,.03)',
      }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div
          className="h-10 w-10 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #006a67 0%, #4fb6b2 100%)',
            boxShadow: '0 4px 16px rgba(0,106,103,0.3)',
          }}
        >
          <PawPrint className="h-5 w-5 text-white" />
        </div>
        <div>
          <span
            className="text-lg font-black text-[#006a67] block leading-tight"
            style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.025em' }}
          >
            PawHealth
          </span>
          <span className="text-[10px] font-semibold text-[#bdc9c7] tracking-wider uppercase">
            Clinical Care
          </span>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-5 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(189,201,199,.3), transparent)' }} />

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {/* Section label */}
        <div className="flex items-center gap-2 px-3 mb-3">
          <div className="w-1 h-1 rounded-full bg-[#4fb6b2]" />
          <p
            className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#bdc9c7]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Menu
          </p>
        </div>

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

        {/* Health Tracking section */}
        <div className="pt-5">
          <div className="flex items-center gap-2 px-3 mb-3">
            <div className="w-1 h-1 rounded-full bg-[#93f59c]" />
            <p
              className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#bdc9c7]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Health Tracking
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
                    toast('Select a pet first from My Pets or Dashboard', { icon: '🐾' });
                  }
                }}
              />
            );
          })}
        </div>
      </nav>

      {/* ── Bottom section ── */}
      <div className="px-3 py-4 space-y-1">
        <div className="mx-2 h-px mb-3" style={{ background: 'linear-gradient(90deg, transparent, rgba(189,201,199,.3), transparent)' }} />

        <NavItem
          to={ROUTES.SETTINGS}
          icon={Settings}
          label="Settings"
          isActive={location.pathname === ROUTES.SETTINGS}
        />

        <button
          onClick={handleLogout}
          className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[13px] font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-all duration-200"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#ffdad6]/50 group-hover:bg-[#ffdad6] transition-colors">
            <LogOut className="h-4 w-4" />
          </div>
          Logout
        </button>
      </div>
    </aside>
  );
};

export { Sidebar };
