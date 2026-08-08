'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

/**
 * Reusable Select2 Searchable Dropdown Component
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
  className = '',
  id,
  name,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState('bottom');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Find currently selected option object
  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value)
  ) || null;

  // Check if current value is default/empty/all
  const isDefaultValue = !value || String(value) === 'all' || String(value) === '';
  const isCustomSelected = selectedOption && !isDefaultValue;

  // Filter options based on search query
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
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

  // Dynamic positioning based on screen space
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        
        const optionsHeight = Math.min(options.length * 36, 192);
        const searchHeight = searchable ? 42 : 0;
        const padding = 16;
        const estimatedHeight = optionsHeight + searchHeight + padding;
        
        if (spaceBelow < estimatedHeight && rect.top > spaceBelow) {
          setDropdownPosition('top');
        } else {
          setDropdownPosition('bottom');
        }
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
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange({
        target: {
          name: name || id,
          value: 'all'
        }
      });
    }
  };

  return (
    <div className={`space-y-1.5 w-full relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
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
        } rounded-xl py-2.5 ${
          Icon ? 'pl-9' : 'pl-3.5'
        } pr-10 text-xs sm:text-sm text-left transition-all duration-200 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } flex items-center justify-between shadow-xs relative`}
      >
        {Icon && (
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Icon size={15} />
          </span>
        )}

        <span className={`block truncate ${isCustomSelected ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500 font-normal'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <span className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5 pointer-events-none">
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

      {/* Floating Searchable Dropdown Menu */}
      {isOpen && (
        <div className={`absolute left-0 right-0 ${dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'} z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 space-y-1.5 animate-fadeIn min-w-[200px]`}>
          
          {/* Search Box inside dropdown */}
          {searchable && (
            <div className="relative pb-1 border-b border-slate-100">
              <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search option..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1 pl-8 pr-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500"
              />
            </div>
          )}

          {/* Scrollable Option List */}
          <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-thin">
            {filteredOptions.length === 0 ? (
              <div className="p-2.5 text-center text-xs text-slate-400">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectOption(opt.value)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-primary-50 text-primary-600 font-bold border border-primary-100'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check size={13} className="text-primary-600 shrink-0 ml-2" />}
                  </button>
                );
              })
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
