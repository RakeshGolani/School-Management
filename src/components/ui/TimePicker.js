'use client';
import { useState, useRef, useEffect } from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';

/**
 * Modern Ultra-Sleek Dynamic TimePicker Component
 * Supports 12-Hour format (01-12, 00-59, AM/PM) & Outputs standard HH:mm (24h)
 */
export default function TimePicker({
  label,
  value = '08:00',
  onChange,
  placeholder = 'Select Time',
  disabled = false,
  required = false,
  className = '',
  error
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Helper to parse HH:mm 24-hr string to 12-hr parts
  const parse24To12 = (val24) => {
    if (!val24) return { hour: '08', minute: '00', period: 'AM' };
    const [hStr, mStr] = val24.split(':');
    let h = parseInt(hStr || '8', 10);
    const m = (mStr || '00').padStart(2, '0');
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return {
      hour: h.toString().padStart(2, '0'),
      minute: m,
      period
    };
  };

  // Helper to convert 12-hr parts back to HH:mm (24h)
  const format12To24 = (h12, min, period) => {
    let h = parseInt(h12, 10);
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${min}`;
  };

  const current12 = parse24To12(value);
  const displayFormatted = `${current12.hour}:${current12.minute} ${current12.period}`;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectHour = (h) => {
    const new24 = format12To24(h, current12.minute, current12.period);
    if (onChange) {
      onChange({ target: { value: new24 } });
    }
  };

  const handleSelectMinute = (m) => {
    const new24 = format12To24(current12.hour, m, current12.period);
    if (onChange) {
      onChange({ target: { value: new24 } });
    }
  };

  const handleSelectPeriod = (p) => {
    const new24 = format12To24(current12.hour, current12.minute, p);
    if (onChange) {
      onChange({ target: { value: new24 } });
    }
  };

  const hoursList = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutesList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  return (
    <div className={`space-y-1.5 w-full relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Input Display Button */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border rounded-xl flex items-center justify-between text-xs font-medium cursor-pointer transition-all duration-200 shadow-2xs ${
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:border-primary-400'
        } ${
          isOpen
            ? 'border-primary-500 ring-2 ring-primary-500/15 shadow-sm'
            : error
            ? 'border-rose-400 text-rose-600'
            : 'border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
        }`}
      >
        <span className="font-semibold">{displayFormatted}</span>
        <Clock className={`w-4 h-4 transition-colors ${isOpen ? 'text-primary-600' : 'text-slate-400'}`} />
      </div>

      {error && <p className="text-[11px] text-rose-500 font-medium mt-0.5">{error}</p>}

      {/* Sleek TimePicker Floating Popover Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 w-64 space-y-3 animate-fadeIn">
          {/* Top Time Header Banner */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100/60 dark:from-slate-800 dark:to-slate-800/80 p-2.5 rounded-xl flex items-center justify-between text-center border border-primary-200/50 dark:border-slate-700">
            <span className="text-base font-black text-primary-700 dark:text-primary-300 tracking-wider mx-auto">
              {displayFormatted}
            </span>
          </div>

          {/* 3 Column Selector: Hours | Minutes | AM/PM */}
          <div className="grid grid-cols-3 gap-2">
            {/* Hours Column */}
            <div className="space-y-1">
              <span className="block text-[10px] font-bold uppercase text-slate-400 text-center tracking-wider mb-1">
                Hour
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-0.5 custom-scrollbar">
                {hoursList.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleSelectHour(h)}
                    className={`w-full py-1 text-center text-xs font-bold rounded-lg transition ${
                      current12.hour === h
                        ? 'bg-primary-600 text-white shadow-2xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes Column */}
            <div className="space-y-1">
              <span className="block text-[10px] font-bold uppercase text-slate-400 text-center tracking-wider mb-1">
                Minute
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-0.5 custom-scrollbar">
                {minutesList.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSelectMinute(m)}
                    className={`w-full py-1 text-center text-xs font-bold rounded-lg transition ${
                      current12.minute === m
                        ? 'bg-primary-600 text-white shadow-2xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* AM / PM Column */}
            <div className="space-y-1">
              <span className="block text-[10px] font-bold uppercase text-slate-400 text-center tracking-wider mb-1">
                Period
              </span>
              <div className="space-y-1.5 pt-1">
                {['AM', 'PM'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleSelectPeriod(p)}
                    className={`w-full py-2 text-center text-xs font-black rounded-lg transition ${
                      current12.period === p
                        ? 'bg-primary-600 text-white shadow-2xs'
                        : 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Done Button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-white transition"
          >
            Apply Time
          </button>
        </div>
      )}
    </div>
  );
}
