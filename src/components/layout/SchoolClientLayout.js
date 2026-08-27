'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { encryptCookieKey } from '@/lib/cookieKeys';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AcademicYearProvider } from '@/context/AcademicYearContext';
import { PackageProvider } from '@/context/PackageContext';
import AcademicYearGuard from '@/components/layout/AcademicYearGuard';
import PackageRouteGuard from '@/components/layout/PackageRouteGuard';

import { BackendStatusProvider } from '@/context/BackendStatusContext';
import BackendOfflineScreen from '@/components/ui/BackendOfflineScreen';

/**
 * School Dashboard Client Layout
 * Receives initialCollapsed from the server component (via cookie) 
 * to avoid FOUC flash on refresh.
 */
export default function SchoolClientLayout({ initialCollapsed = false, children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(initialCollapsed);
  const pathname = usePathname();

  const handleToggleCollapse = () => {
    setSidebarCollapsed((prev) => {
      const nextState = !prev;
      localStorage.setItem('school_sidebar_collapsed', String(nextState));
      const encKey = encryptCookieKey('school_sidebar_collapsed');
      document.cookie = `${encKey}=${nextState}; path=/; max-age=31536000; SameSite=Lax`;
      return nextState;
    });
  };

  const isPrintPage = pathname?.endsWith('/print');

  if (isPrintPage) {
    return (
      <div className="min-h-screen bg-white text-slate-900 font-sans">
        {children}
      </div>
    );
  }

  return (
    <BackendStatusProvider>
      <BackendOfflineScreen />
      <PackageProvider>
        <AcademicYearProvider>
          <div className="flex h-screen overflow-hidden text-slate-900 font-sans bg-[var(--background)]">
            {/* Sidebar */}
            <Sidebar 
              mobileOpen={mobileMenuOpen} 
              onClose={() => setMobileMenuOpen(false)}
              collapsed={sidebarCollapsed}
              onToggleCollapse={handleToggleCollapse}
            />

            {/* Main Workspace */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto transition-all duration-300">
              {/* Header */}
              <Header 
                onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                sidebarCollapsed={sidebarCollapsed}
                onToggleSidebarCollapse={handleToggleCollapse}
              />

              {/* Dynamic Page View */}
              <main className="flex-1 px-4 md:px-8 py-6 relative">
                <PackageRouteGuard>
                  <AcademicYearGuard>
                    {children}
                  </AcademicYearGuard>
                </PackageRouteGuard>
              </main>

              {/* Footer */}
              <Footer />
            </div>
          </div>
        </AcademicYearProvider>
      </PackageProvider>
    </BackendStatusProvider>
  );
}


