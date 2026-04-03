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
      <header className="md:hidden fixed top-4 left-4 right-4 z-[60]">
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
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="group flex items-center gap-2 pl-3 pr-1 py-1 rounded-full transition-all hover:bg-black/5"
            style={{ border: '1px solid rgba(189,201,199,.3)' }}
          >
            <span className="text-[11px] font-bold text-[#131d1e] tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity">
              {isMobileMenuOpen ? 'Close' : 'Menu'}
            </span>
            <div className="w-6 h-6 rounded-full bg-[#006a67] flex flex-col items-center justify-center shadow-[0_2px_8px_rgba(0,106,103,0.3)]">
              <div className={`w-2.5 h-[1.5px] rounded-full bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-[0.5px]' : 'group-hover:w-3 -translate-y-[1.5px]'}`} />
              <div className={`w-2.5 h-[1.5px] rounded-full bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-[0.5px]' : 'group-hover:w-1.5 translate-y-[1.5px]'}`} />
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
      <main className="pt-28 md:pt-0 md:ml-[110px] lg:ml-[252px] pb-6 lg:pb-0 transition-all duration-300">
        <div className="p-4 md:p-6 lg:p-8 max-w-8xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export { AppLayout };
