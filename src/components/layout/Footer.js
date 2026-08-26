'use client';

/**
 * Dynamic Dashboard Footer Component
 */
export default function Footer() {
  return (
    <footer className="mt-auto py-6 px-8 border-t border-white/5 text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse"></span>
        <span className="text-slate-400 font-medium">Vidyadmin System Engine v2.0 • Online</span>
      </div>
      <p>© 2026 Vidyadmin Systems Inc. All rights reserved.</p>
    </footer>
  );
}
