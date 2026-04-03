# Navigation Component Export

As requested, here is the complete code for the new Top Navigation and Sidebar design. You can securely copy-paste these into your older working version of the app to apply the successful navbar/sidebar aesthetic without taking any of the other changes.

## 1. AppLayout.tsx
Copy this into `src/components/layout/AppLayout.tsx`:

```tsx
/**
 * AppLayout.tsx — Clinical Sanctuary Edition
 * Global layout wrapper with proper font family and max-width content area.
 */

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { PawPrint } from 'lucide-react';
import { motion } from 'framer-motion';

const AppLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div
      className="min-h-screen relative overflow-x-clip"
      style={{
        backgroundColor: 'var(--cs-bg)',
        fontFamily: "'Plus Jakarta Sans', 'DM Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Premium Mesh Background */}
      <div className="mesh-bg">
        <div className="mesh-blob mesh-blob-1" />
        <div className="mesh-blob mesh-blob-2" />
      </div>

      {/* ── Floating Mobile Action Island (Dynamic) ── */}
      <header className="md:hidden fixed top-4 left-4 right-4 z-30">
        <motion.div 
          className="flex items-center justify-between px-4 py-3 rounded-3xl"
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 8px 32px rgba(0, 106, 103, 0.08), inset 0 2px 4px rgba(255,255,255,0.8)',
          }}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #006a67 0%, #4fb6b2 100%)',
                boxShadow: '0 4px 12px rgba(0,106,103,0.25)',
              }}
            >
              <PawPrint className="h-4 w-4 text-white" />
            </div>
            <span
              className="text-[17px] font-black text-[#006a67] block leading-none tracking-tight"
              style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.04em' }}
            >
              PawHealth
            </span>
          </div>
          
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="group flex items-center gap-2 pl-3 pr-1 py-1 rounded-full transition-all hover:bg-black/5"
            style={{ border: '1px solid rgba(189,201,199,.3)' }}
          >
            <span className="text-[11px] font-bold text-[#131d1e] tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity">
              Menu
            </span>
            <div className="w-6 h-6 rounded-full bg-[#006a67] flex flex-col items-center justify-center gap-[3px] shadow-[0_2px_8px_rgba(0,106,103,0.3)]">
              <div className="w-2.5 h-[1.5px] rounded-full bg-white transition-all group-hover:w-3" />
              <div className="w-2.5 h-[1.5px] rounded-full bg-white transition-all group-hover:w-1.5" />
            </div>
          </button>
        </motion.div>
      </header>

      {/* Responsive Sidebar */}
      <Sidebar 
        isMobileOpen={isMobileMenuOpen} 
        onCloseMobile={() => setIsMobileMenuOpen(false)} 
      />

      {/* Main Content */}
      <main className="pt-28 md:pt-0 md:ml-[110px] lg:ml-[250px] pb-6 lg:pb-0 transition-all duration-300">
        <div className="p-4 md:p-6 lg:p-8 max-w-8xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export { AppLayout };
```

---

## 2. Sidebar.tsx
Copy this into `src/components/layout/Sidebar.tsx`:

```tsx
import { motion, AnimatePresence } from 'framer-motion';
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
  onCloseMobile,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onCloseMobile?: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={(e) => {
        if (onClick) onClick(e);
        if (onCloseMobile && !e.defaultPrevented) onCloseMobile();
      }}
      className={() => `
        group relative flex items-center px-3 py-2.5 rounded-2xl text-[13px] font-semibold
        transition-all duration-300 gap-3 
        justify-start md:justify-center lg:justify-start md:px-0 lg:px-3
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
          className="absolute inset-x-0 md:inset-x-2 lg:inset-x-0 inset-y-0 bg-white/60 rounded-2xl -z-10 shadow-sm"
          initial={false}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}

      {/* Active indicator dot */}
      {isActive && (
        <div
          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#006a67] block md:hidden lg:block"
        />
      )}

      {/* Icon container */}
      <div
        className={`w-8 h-8 rounded-xl flex flex-shrink-0 items-center justify-center transition-all duration-300
          ${isActive
            ? 'bg-gradient-to-br from-[#006a67] to-[#4fb6b2] shadow-[0_4px_12px_rgba(0,106,103,0.2)]'
            : 'bg-white/40 group-hover:bg-white group-hover:shadow-sm'
          }
        `}
      >
        <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-white' : 'text-[#6d7978] group-hover:text-[#131d1e]'}`} />
      </div>

      <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis block md:hidden lg:block transition-all">{label}</span>

      {/* Hover chevron */}
      {isActive && (
        <ChevronRight className="h-3.5 w-3.5 text-[#4fb6b2] opacity-60 block md:hidden lg:block flex-shrink-0" />
      )}
    </NavLink>
  );
}

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const Sidebar = ({ isMobileOpen, onCloseMobile }: SidebarProps) => {
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
      if (onCloseMobile) onCloseMobile();
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
            className="fixed inset-0 z-40 md:hidden bg-[#131d1e]/20 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`
          fixed z-50 flex flex-col overflow-hidden shadow-2xl border border-white/40
          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          
          /* Unified Floating Island (Responsive Margins) */
          top-4 left-4 bottom-4 md:top-6 md:left-6 md:bottom-6
          rounded-[32px]

          /* Responsive Widths & Slide State */
          w-[230px] md:w-[78px] lg:w-[230px]
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-[150%]'} md:translate-x-0
        `}
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        }}
      >
        {/* ── Logo ── */}
        <div className="flex items-center gap-3 px-6 py-8 md:px-0 md:justify-center lg:px-6 lg:justify-start">
          <div
            className="h-11 w-11 flex-shrink-0 rounded-[1.2rem] flex items-center justify-center transition-transform hover:rotate-6"
            style={{
              background: 'linear-gradient(135deg, #006a67 0%, #4fb6b2 100%)',
              boxShadow: '0 8px 20px rgba(0,106,103,0.25)',
            }}
          >
            <PawPrint className="h-5.5 w-5.5 text-white" />
          </div>
          <div className="block md:hidden lg:block overflow-hidden">
            <span
              className="text-xl font-black text-[#006a67] block leading-tight truncate"
              style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.04em' }}
            >
              PawHealth
            </span>
            <span className="text-[10px] font-bold text-[#6d7978] tracking-[0.15em] uppercase opacity-60 block truncate">
              Clinical Care
            </span>
          </div>

          <button 
            className="md:hidden ml-auto w-8 h-8 flex items-center justify-center shrink-0 rounded-full hover:bg-black/5"
            onClick={onCloseMobile}
          >
            <ChevronRight className="h-5 w-5 text-[#6d7978] rotate-180" />
          </button>
        </div>

        {/* ── Divider ── */}
        <div className="mx-6 md:mx-4 h-px flex-shrink-0 bg-black/5" />

        {/* ── Navigation ── */}
        <nav className="flex-1 min-h-0 px-3 py-6 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">

          {mainNav.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              icon={item.icon}
              label={item.label}
              onCloseMobile={onCloseMobile}
              isActive={
                location.pathname === item.path ||
                (item.path !== ROUTES.DASHBOARD && location.pathname.startsWith(item.path))
              }
            />
          ))}

          {/* Clinical Records section */}
          <div className="pt-8 md:pt-6 lg:pt-8 w-full">
            <div className="flex items-center gap-2 px-3 mb-4 opacity-50 md:justify-center lg:justify-start">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4fb6b2] block md:hidden lg:hidden" />
              <div className="w-1 h-1 rounded-full bg-[#4fb6b2] hidden lg:block" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#4fb6b2] hidden md:block lg:hidden" title="Clinical Records" />
              <p
                className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6d7978] block md:hidden lg:block whitespace-nowrap"
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
                  onCloseMobile={onCloseMobile}
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
        <div className="flex-shrink-0 px-3 py-6 space-y-1 bg-white/20 backdrop-blur-sm mt-auto">
          <NavItem
            to={ROUTES.SETTINGS}
            icon={Settings}
            label="Settings"
            isActive={location.pathname === ROUTES.SETTINGS}
            onCloseMobile={onCloseMobile}
          />

          <button
            onClick={handleLogout}
            className="group w-full flex items-center md:justify-center lg:justify-start gap-3 px-3 md:px-0 lg:px-3 py-2.5 rounded-2xl text-[13px] font-bold text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-all duration-300"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <div className="w-8 h-8 rounded-xl flex flex-shrink-0 items-center justify-center bg-[#ffdad6]/40 group-hover:bg-[#ffdad6] transition-colors">
              <LogOut className="h-4 w-4" />
            </div>
            <span className="block md:hidden lg:block">Logout</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export { Sidebar };
```
