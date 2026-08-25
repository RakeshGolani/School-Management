'use client';
import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, ChevronDown } from 'lucide-react';

export default function DatePicker({
  value,
  onChange,
  label,
  error,
  placeholder = 'Select date',
  required = false,
  disabled = false,
  disableFuture = false,
  disablePast = false,
  maxDate = null,
  minDate = null,
  clearable = true,
  id,
  name,
  className = '',
  triggerClassName = '',
  align = 'left', // 'left' | 'right'
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const containerRef = useRef(null);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const yearListRef = useRef(null);

  // Parse YYYY-MM-DD
  const parseDateStr = (dateStr) => {
    if (!dateStr) return null;
    const parts = String(dateStr).split('-');
    if (parts.length !== 3) return null;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const date = new Date(y, m, d);
    return isNaN(date.getTime()) ? null : date;
  };

  const selectedDate = parseDateStr(value);

  // Format date back to YYYY-MM-DD
  const formatDateStr = (date) => {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Format display date (e.g. 25 Aug 2026)
  const formatDisplayStr = (date) => {
    if (!date) return '';
    const d = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const m = months[date.getMonth()];
    const y = date.getFullYear();
    return `${d} ${m} ${y}`;
  };

  const displayValue = selectedDate ? formatDisplayStr(selectedDate) : '';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsMonthOpen(false);
        setIsYearOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns if datepicker popover closes
  useEffect(() => {
    if (!isOpen) {
      setIsMonthOpen(false);
      setIsYearOpen(false);
    }
  }, [isOpen]);

  // Scroll to active year when year selector opens
  useEffect(() => {
    if (isYearOpen && yearListRef.current) {
      const selectedEl = yearListRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'center' });
      }
    }
  }, [isYearOpen]);

  // When value changes or popup opens, sync the calendar month view to display the selected date
  useEffect(() => {
    if (value) {
      const parsed = parseDateStr(value);
      if (parsed) {
        setCurrentDate(parsed);
      }
    }
  }, [value, isOpen]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startDay = firstDayOfMonth.getDay();
  // Adjust Monday as start of week: Mon=0, Tue=1, ..., Sun=6
  const firstDayIndex = (startDay + 6) % 7;

  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Range of years for dropdown (e.g. 1950 to currentYear + 20)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 120 }, (_, i) => currentYear - 90 + i);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEffectiveMaxDate = () => {
    if (disableFuture) {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (maxDate) {
        const parsedMax = parseDateStr(maxDate);
        if (parsedMax) {
          parsedMax.setHours(23, 59, 59, 999);
          return parsedMax < today ? parsedMax : today;
        }
      }
      return today;
    }
    if (maxDate) {
      const parsedMax = parseDateStr(maxDate);
      if (parsedMax) {
        parsedMax.setHours(23, 59, 59, 999);
        return parsedMax;
      }
    }
    return null;
  };

  const getEffectiveMinDate = () => {
    if (disablePast) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (minDate) {
        const parsedMin = parseDateStr(minDate);
        if (parsedMin) {
          parsedMin.setHours(0, 0, 0, 0);
          return parsedMin > today ? parsedMin : today;
        }
      }
      return today;
    }
    if (minDate) {
      const parsedMin = parseDateStr(minDate);
      if (parsedMin) {
        parsedMin.setHours(0, 0, 0, 0);
        return parsedMin;
      }
    }
    return null;
  };

  const isCellDisabled = (cell) => {
    const cellDate = new Date(year, month + cell.offset, cell.day);
    const max = getEffectiveMaxDate();
    if (max) {
      const compareDate = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate(), 23, 59, 59, 999);
      if (compareDate > max) return true;
    }
    const min = getEffectiveMinDate();
    if (min) {
      const compareDate = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate(), 0, 0, 0, 0);
      if (compareDate < min) return true;
    }
    return false;
  };

  const selectDate = (day, offset = 0) => {
    if (disabled) return;
    const targetDate = new Date(year, month + offset, day);
    const max = getEffectiveMaxDate();
    const min = getEffectiveMinDate();
    if (max) {
      const compareMax = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);
      if (compareMax > max) return;
    }
    if (min) {
      const compareMin = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
      if (compareMin < min) return;
    }
    const dateString = formatDateStr(targetDate);
    if (onChange) {
      onChange({
        target: {
          name,
          value: dateString
        }
      });
    }
    setIsOpen(false);
  };

  const handleToday = () => {
    if (disabled) return;
    const today = new Date();
    const max = getEffectiveMaxDate();
    const min = getEffectiveMinDate();
    if (max && today > max) return;
    if (min && today < min) return;
    const dateString = formatDateStr(today);
    if (onChange) {
      onChange({
        target: {
          name,
          value: dateString
        }
      });
    }
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (disabled) return;
    if (onChange) {
      onChange({
        target: {
          name,
          value: ''
        }
      });
    }
    setIsOpen(false);
  };

  // Build grid: exactly 42 days (6 weeks) to prevent modal height resizing
  const dayCells = [];
  // Prev month cells
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    dayCells.push({
      day: prevMonthTotalDays - i,
      isCurrentMonth: false,
      offset: -1
    });
  }
  // Current month cells
  for (let d = 1; d <= totalDays; d++) {
    dayCells.push({
      day: d,
      isCurrentMonth: true,
      offset: 0
    });
  }
  // Next month cells
  const remaining = 42 - dayCells.length;
  for (let d = 1; d <= remaining; d++) {
    dayCells.push({
      day: d,
      isCurrentMonth: false,
      offset: 1
    });
  }

  const isCellSelected = (cell) => {
    if (!selectedDate) return false;
    const cellDate = new Date(year, month + cell.offset, cell.day);
    return selectedDate.getFullYear() === cellDate.getFullYear() &&
           selectedDate.getMonth() === cellDate.getMonth() &&
           selectedDate.getDate() === cellDate.getDate();
  };

  const isCellToday = (cell) => {
    const today = new Date();
    const cellDate = new Date(year, month + cell.offset, cell.day);
    return today.getFullYear() === cellDate.getFullYear() &&
           today.getMonth() === cellDate.getMonth() &&
           today.getDate() === cellDate.getDate();
  };

  const inputId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`space-y-1.5 w-full relative ${className}`} ref={containerRef}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          id={inputId}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between bg-slate-50/70 border ${
            error ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-primary-500'
          } rounded-2xl py-2.5 px-3.5 sm:px-4 text-xs sm:text-sm text-left ${
            displayValue ? 'text-slate-900 font-semibold' : 'text-slate-400 font-normal'
          } focus:outline-none focus:bg-white focus:ring-2 ${
            error ? 'focus:ring-rose-500/20' : 'focus:ring-primary-500/20'
          } transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-2xs ${triggerClassName}`}
          {...props}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Calendar size={16} className="text-primary-600 shrink-0" />
            <span className="truncate">{displayValue || placeholder || 'Select date'}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 shrink-0 ml-2">
            {displayValue && !disabled && clearable && !required && (
              <span 
                onClick={handleClear}
                className="hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60 transition cursor-pointer"
                title="Clear date"
              >
                <X size={14} />
              </span>
            )}
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>
      </div>

      {isOpen && (
        <div className={`absolute z-50 mt-1.5 w-full sm:w-[310px] p-3 sm:p-4 bg-white border border-slate-200 rounded-3xl shadow-xl animate-fadeIn focus:outline-none ${
          align === 'right' ? 'right-0 sm:right-0 sm:left-auto' : 'left-0 sm:left-0 sm:right-auto'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-700 transition cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1.5 relative">
              {/* Month Dropdown Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMonthOpen(!isMonthOpen);
                    setIsYearOpen(false);
                  }}
                  className="flex items-center gap-0.5 text-xs font-bold text-slate-700 hover:bg-slate-100 py-1 px-2 rounded-lg cursor-pointer transition"
                >
                  <span>{monthsList[month]}</span>
                  <span className={`transition-transform duration-200 text-slate-400 ${isMonthOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={12} />
                  </span>
                </button>

                {isMonthOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-28 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 animate-fadeIn">
                    {monthsList.map((m, idx) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setCurrentDate(new Date(year, idx, 1));
                          setIsMonthOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-slate-100 ${
                          idx === month 
                            ? 'text-primary-600 font-bold bg-primary-50/50' 
                            : 'text-slate-700'
                        } cursor-pointer`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Year Dropdown Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsYearOpen(!isYearOpen);
                    setIsMonthOpen(false);
                  }}
                  className="flex items-center gap-0.5 text-xs font-bold text-slate-700 hover:bg-slate-100 py-1 px-2 rounded-lg cursor-pointer transition"
                >
                  <span>{year}</span>
                  <span className={`transition-transform duration-200 text-slate-400 ${isYearOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={12} />
                  </span>
                </button>

                {isYearOpen && (
                  <div 
                    ref={yearListRef}
                    className="absolute left-1/2 -translate-x-1/2 mt-1 w-24 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 animate-fadeIn scroll-smooth"
                  >
                    {years.map((y) => (
                      <button
                        key={y}
                        type="button"
                        data-selected={y === year ? 'true' : 'false'}
                        onClick={() => {
                          setCurrentDate(new Date(y, month, 1));
                          setIsYearOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-slate-100 ${
                          y === year 
                            ? 'text-primary-600 font-bold bg-primary-50/50' 
                            : 'text-slate-700'
                        } cursor-pointer`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-700 transition cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 py-2">
            {weekdays.map((wd) => (
              <div key={wd}>{wd}</div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {dayCells.map((cell, idx) => {
              const selected = isCellSelected(cell);
              const today = isCellToday(cell);
              const isCellDis = isCellDisabled(cell);

              let btnClasses = "w-full aspect-square max-w-[34px] max-h-[34px] flex items-center justify-center text-xs rounded-xl transition-all focus:outline-none mx-auto ";
              if (isCellDis) {
                btnClasses += "text-slate-300 opacity-40 cursor-not-allowed pointer-events-none select-none ";
              } else if (selected) {
                btnClasses += "bg-primary-600 text-white font-black shadow-md shadow-primary-600/30 scale-105 cursor-pointer ";
              } else if (today) {
                btnClasses += "border border-primary-500 text-primary-600 font-bold hover:bg-primary-50/60 cursor-pointer ";
              } else if (!cell.isCurrentMonth) {
                btnClasses += "text-slate-300 hover:bg-slate-100/60 cursor-pointer ";
              } else {
                btnClasses += "text-slate-700 hover:bg-slate-100 font-medium cursor-pointer ";
              }

              return (
                <button
                  key={`${cell.offset}-${cell.day}-${idx}`}
                  type="button"
                  disabled={isCellDis}
                  onClick={() => !isCellDis && selectDate(cell.day, cell.offset)}
                  className={btnClasses}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Footer with Quick Action Buttons */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 mt-2.5 text-xs">
            <button
              type="button"
              onClick={handleToday}
              className="font-bold text-primary-600 hover:text-primary-700 transition hover:underline cursor-pointer"
            >
              Today
            </button>
            {value && clearable && !required && (
              <button
                type="button"
                onClick={handleClear}
                className="font-semibold text-slate-500 hover:text-slate-700 transition hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-500 font-medium pl-1">{error}</p>
      )}
    </div>
  );
}
