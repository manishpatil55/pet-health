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

const Sidebar = () => {
  const { googleSignOut } = useGoogleAuth();
  const location = useLocation();
  const activePetId = usePetStore((state) => state.activePetId);
  
  // Try to extract pet ID from the URL first, fallback to Dashboard's activePetId
  const match = location.pathname.match(/\/pets\/([a-zA-Z0-9_-]+)/);
  const currentPetId = match ? match[1] : activePetId;

  // Dynamically resolve health tracker paths based on the current context
  const getHealthPath = (baseRoute: string) => {
    if (baseRoute.includes(':id') && currentPetId) {
      return buildPath(baseRoute, { id: currentPetId });
    }
    return ''; // Empty string signals "no pet selected"
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
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 bg-white border-r border-[#E6EEEE]">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-[#E6EEEE]">
        <div className="h-8 w-8 rounded-lg bg-[#4FB6B2] flex items-center justify-center">
          <PawPrint className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-[#2F3A3A]">PawHealth</span>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#7A8A8A] mb-2">
          Menu
        </p>
        {mainNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-colors duration-150
              ${
                isActive
                  ? 'bg-[#CFEDEA] text-[#4FB6B2]'
                  : 'text-[#7A8A8A] hover:bg-[#F7FAFA] hover:text-[#2F3A3A]'
              }
            `}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}

        <div className="pt-4">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#7A8A8A] mb-2">
            Health Tracking
          </p>
          {healthNav.map((item) => {
            const resolvedPath = getHealthPath(item.route);
            const isActive = location.pathname === resolvedPath || location.pathname.startsWith(resolvedPath);

            return (
              <NavLink
                key={item.label}
                to={resolvedPath || ROUTES.PETS}
                onClick={(e) => {
                  if (!resolvedPath) {
                    e.preventDefault();
                    toast('Select a pet first from My Pets or Dashboard', { icon: '🐾' });
                  }
                }}
                className={() => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors duration-150
                  ${
                    isActive
                      ? 'bg-[#CFEDEA] text-[#4FB6B2]'
                      : 'text-[#7A8A8A] hover:bg-[#F7FAFA] hover:text-[#2F3A3A]'
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-4 border-t border-[#E6EEEE] space-y-1">
        <NavLink
          to={ROUTES.SETTINGS}
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            transition-colors duration-150
            ${
              isActive
                ? 'bg-[#CFEDEA] text-[#4FB6B2]'
                : 'text-[#7A8A8A] hover:bg-[#F7FAFA] hover:text-[#2F3A3A]'
            }
          `}
        >
          <Settings className="h-5 w-5" />
          Settings
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#E76F51] hover:bg-[#E76F51]/10 transition-colors duration-150"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export { Sidebar };
