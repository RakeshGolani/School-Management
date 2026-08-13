'use client';

import React, { useState } from 'react';
import { useBackendStatus } from '@/context/BackendStatusContext';
import { RefreshCw, ServerOff, WifiOff, AlertTriangle, Terminal, CheckCircle2 } from 'lucide-react';

export default function BackendOfflineScreen() {
  const { isOffline, isChecking, lastChecked, checkHealth } = useBackendStatus();
  const [manualSpin, setManualSpin] = useState(false);

  if (!isOffline) return null;

  const handleRefreshClick = async () => {
    setManualSpin(true);
    await checkHealth();
    setTimeout(() => setManualSpin(false), 500);
  };

  const isSpinning = isChecking || manualSpin;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Background ambient glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-center space-y-6">
        
        {/* Top Status Header Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold tracking-wide shadow-sm">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          Server Connection Offline
        </div>

        {/* Icon & Pulse Rings */}
        <div className="relative flex justify-center items-center py-2">
          <div className="absolute w-24 h-24 rounded-full bg-rose-100 dark:bg-rose-950/40 animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white">
            <ServerOff size={38} className="animate-bounce" />
          </div>
        </div>

        {/* Heading & Details */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Unable to Connect to Server
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            We cannot reach the school database right now. Please check your connection or server status and try again.
          </p>
        </div>

        {/* Diagnostic / Solution Box */}
        <div className="text-left bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 text-xs">
            <AlertTriangle size={15} className="text-rose-500" />
            What you can do:
          </div>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">•</span>
              <span>Check if your device is connected to the network.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">•</span>
              <span>Make sure the backend server application is turned on.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">•</span>
              <span>Click the button below to retry connection.</span>
            </li>
          </ul>
        </div>

        {/* Refresh Action Buttons & Status */}
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={handleRefreshClick}
            disabled={isSpinning}
            className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-700 hover:to-amber-700 active:scale-[0.98] transition-all shadow-lg shadow-rose-500/25 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer text-sm"
          >
            <RefreshCw size={18} className={isSpinning ? 'animate-spin' : ''} />
            {isSpinning ? 'Checking Connection...' : 'Check Connection / Retry'}
          </button>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Auto-retrying in background...</span>
            {lastChecked && (
              <span>Last checked: {new Date(lastChecked).toLocaleTimeString()}</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );

}
