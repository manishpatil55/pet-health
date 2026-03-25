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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E6EEEE] lg:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== ROUTES.DASHBOARD &&
              location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg
                transition-colors duration-150 min-w-[64px]
                ${
                  isActive
                    ? 'text-[#4FB6B2]'
                    : 'text-[#7A8A8A] hover:text-[#2F3A3A]'
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export { BottomNav };
