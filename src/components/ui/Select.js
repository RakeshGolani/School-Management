'use client';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, Check, X, CheckSquare, Square } from 'lucide-react';

/**
 * Reusable Select2 Searchable Dropdown Component
 * Supports single selection and multiple selection (multiple={true}).
 */
export default function Select({
  label,
  options = [],
  value,
  onChange,
  error,
  icon: Icon,
  placeholder = 'Select an option',
  disabled = false,
  searchable = true,
  clearable = true,
  multiple = false,
  className = '',
  id,
  name,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0, width: 200 });
  const containerRef = useRef(null);
  const dropdownMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize selected values for single vs multiple
  const selectedValues = multiple
    ? (Array.isArray(value) ? value.map(String) : (value && value !== 'all' ? [String(value)] : []))
    : [];

  const selectedOptions = multiple
    ? options.filter(opt => selectedValues.includes(String(opt.value)))
    : [];

  const selectedOption = !multiple
    ? options.find((opt) => String(opt.value) === String(value)) || null
    : null;

  const isDefaultValue = multiple
    ? selectedValues.length === 0
    : (!value || String(value) === 'all' || String(value) === '');
    
  const isCustomSelected = multiple ? selectedValues.length > 0 : (selectedOption && !isDefaultValue);

  // Filter options based on search query
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        dropdownMenuRef.current && !dropdownMenuRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Dynamic positioning using React Portal coordinates
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        
        const optionsHeight = Math.min(options.length * 38, 220);
        const searchHeight = searchable ? 42 : 0;
        const padding = 16;
        const estimatedHeight = optionsHeight + searchHeight + padding;
        
        let top = rect.bottom + 4;
        if (spaceBelow < estimatedHeight && rect.top > estimatedHeight) {
          top = rect.top - estimatedHeight - 4;
        }

        setMenuCoords({
          top: Math.max(8, top),
          left: rect.left,
          width: Math.max(rect.width, 220)
        });
      }
    };

    updatePosition();

    if (isOpen) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, options.length, searchable]);

  const handleSelectOption = (optValue) => {
    if (multiple) {
      const valStr = String(optValue);
      let newValues;
      if (selectedValues.includes(valStr)) {
        newValues = selectedValues.filter(v => v !== valStr);
      } else {
        newValues = [...selectedValues, valStr];
      }
      if (onChange) {
        onChange({
          target: {
            name: name || id,
            value: newValues
          }
        });
      }
    } else {
      if (onChange) {
        onChange({
          target: {
            name: name || id,
            value: optValue
          }
        });
      }
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange({
        target: {
          name: name || id,
          value: multiple ? [] : ''
        }
      });
    }
  };

  const handleRemoveBadge = (e, valToRemove) => {
    e.stopPropagation();
    if (multiple && onChange) {
      const newVals = selectedValues.filter(v => v !== String(valToRemove));
      onChange({
        target: {
          name: name || id,
          value: newVals
        }
      });
    }
  };

  return (
    <div className={`space-y-1.5 w-full relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* Select Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-50/70 dark:bg-slate-800/50 border ${
          error 
            ? 'border-rose-500/50 focus:border-rose-500' 
            : isOpen 
              ? 'border-primary-500 ring-2 ring-primary-500/20 bg-white dark:bg-slate-900' 
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
        } rounded-xl py-2 ${
          Icon ? 'pl-9' : 'pl-3'
        } pr-9 text-xs sm:text-sm text-left transition-all duration-200 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } flex items-center justify-between shadow-2xs relative min-h-[38px]`}
      >
        {Icon && (
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Icon size={15} />
          </span>
        )}

        {/* Display Badges or Single Selected Label */}
        <div className="flex flex-wrap items-center gap-1.5 max-w-[calc(100%-28px)] py-0.5">
          {multiple ? (
            selectedOptions.length > 0 ? (
              selectedOptions.map(opt => (
                <span
                  key={opt.value}
                  className="inline-flex items-center gap-1 bg-primary-50 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 font-bold text-[11px] px-2 py-0.5 rounded-md border border-primary-200/80 dark:border-primary-800 shrink-0 shadow-2xs"
                >
                  <span className="truncate max-w-[120px]">{opt.label}</span>
                  <X
                    size={11}
                    className="hover:text-rose-600 transition cursor-pointer"
                    onClick={(e) => handleRemoveBadge(e, opt.value)}
                  />
                </span>
              ))
            ) : (
              <span className="text-slate-400 font-normal">{placeholder}</span>
            )
          ) : (
            <span className={`block truncate ${isCustomSelected ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500 font-normal'}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          )}
        </div>

        <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5 pointer-events-none">
          {clearable && isCustomSelected && (
            <span
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer pointer-events-auto flex items-center justify-center"
              title="Clear selection"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary-600' : ''}`} />
        </span>
      </button>

      {/* Floating Searchable Dropdown Menu with React Portal */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownMenuRef}
          style={{
            position: 'fixed',
            top: `${menuCoords.top}px`,
            left: `${menuCoords.left}px`,
            width: `${menuCoords.width}px`,
            zIndex: 99999
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 space-y-1.5 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Box inside dropdown */}
          {searchable && (
            <div className="relative pb-1 border-b border-slate-100 dark:border-slate-800">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search option..."
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl py-1.5 pl-8 pr-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
              />
            </div>
          )}

          {/* Scrollable Option List with Custom Primary Scrollbar */}
          <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1">
            {filteredOptions.length === 0 ? (
              <div className="p-2.5 text-center text-xs text-slate-400">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const optValStr = String(opt.value);
                const isSelected = multiple
                  ? selectedValues.includes(optValStr)
                  : String(opt.value) === String(value);

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectOption(opt.value)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold border border-primary-100 dark:border-primary-900'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {multiple && (
                        <span className="shrink-0">
                          {isSelected ? (
                            <CheckSquare size={15} className="text-primary-600 dark:text-primary-400" />
                          ) : (
                            <Square size={15} className="text-slate-400" />
                          )}
                        </span>
                      )}
                      <span className="truncate">{opt.label}</span>
                    </div>

                    {!multiple && isSelected && <Check size={13} className="text-primary-600 shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}

      {error && (
        <p className="text-xs text-rose-500 font-medium pl-1">{error}</p>
      )}
    </div>
  );
}
