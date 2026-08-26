'use client';

import { BackendStatusProvider } from '@/context/BackendStatusContext';
import BackendOfflineScreen from '@/components/ui/BackendOfflineScreen';

/**
 * AuthLayout
 * Shared modern glassmorphic background & layout for authentication flows.
 * Uses dynamic school branding color variables for ambient glow & accents.
 */
export default function AuthLayout({ children }) {
  return (
    <BackendStatusProvider>
      <BackendOfflineScreen />
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-100/80 text-slate-900 p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans selection:bg-primary-500 selection:text-white">
        {/* Dynamic School Theme Glow Mesh Orbs (Light Mode) */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div 
            className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[140px] opacity-15"
            style={{ background: 'radial-gradient(circle, var(--theme-primary-500, #0047AB) 0%, transparent 70%)' }}
          ></div>
          <div 
            className="absolute bottom-[-10%] right-[-10%] w-[650px] h-[650px] rounded-full blur-[150px] opacity-15"
            style={{ background: 'radial-gradient(circle, var(--theme-primary-600, #003380) 0%, #38bdf8 50%, transparent 70%)' }}
          ></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#64748b0a_1px,transparent_1px),linear-gradient(to_bottom,#64748b0a_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
        </div>

        {/* Auth Content Container */}
        <div className="w-full max-w-5xl relative z-10 my-auto">
          {children}
        </div>
      </div>
    </BackendStatusProvider>
  );
}
