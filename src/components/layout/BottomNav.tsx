/**
 * BottomNav.tsx — Clinical Sanctuary Edition
 * Premium mobile bottom navigation with glassmorphism and gradient active indicator.
 */

import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PawPrint,
  FileText,
  Settings,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: ROUTES.DASHBOARD },
  { label: 'My Pets', icon: PawPrint, path: ROUTES.PETS },
  { label: 'Documents', icon: FileText, path: ROUTES.DOCUMENTS },
  { label: 'Settings', icon: Settings, path: ROUTES.SETTINGS },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '1px solid rgba(189,201,199,.2)',
        boxShadow: '0 -4px 24px rgba(19,29,30,.04)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== ROUTES.DASHBOARD &&
              location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl min-w-[56px] transition-all duration-200 relative"
            >
              {/* Active glow dot */}
              {isActive && (
                <div
                  className="absolute -top-1.5 w-5 h-[3px] rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #006a67, #4fb6b2)',
                    boxShadow: '0 2px 8px rgba(0,106,103,0.4)',
                  }}
                />
              )}

              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-br from-[#006a67] to-[#4fb6b2] shadow-[0_4px_12px_rgba(0,106,103,0.25)]'
                    : ''
                }`}
              >
                <item.icon
                  className={`h-[18px] w-[18px] transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-[#6d7978]'
                  }`}
                />
              </div>

              <span
                className={`text-[10px] font-bold transition-colors duration-200 ${
                  isActive ? 'text-[#006a67]' : 'text-[#bdc9c7]'
                }`}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export { BottomNav };
