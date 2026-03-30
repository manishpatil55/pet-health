/**
 * AppLayout.tsx — Clinical Sanctuary Edition
 * Global layout wrapper with proper font family and max-width content area.
 */

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

const AppLayout = () => {
  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
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
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="lg:ml-[240px] pb-24 lg:pb-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-8xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
};

export { AppLayout };
