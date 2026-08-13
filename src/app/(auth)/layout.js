'use client';

import { BackendStatusProvider } from '@/context/BackendStatusContext';
import BackendOfflineScreen from '@/components/ui/BackendOfflineScreen';

/**
 * AuthLayout
 * Shared glassmorphism container and background effects for login/forgot-password.
 */
export default function AuthLayout({ children }) {
  return (
    <BackendStatusProvider>
      <BackendOfflineScreen />
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden">
        {/* Background glowing blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary-600/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>
        
        {/* Glass card container */}
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative z-10 shadow-2xl border border-white/10">
          {children}
        </div>
      </div>
    </BackendStatusProvider>
  );
}

