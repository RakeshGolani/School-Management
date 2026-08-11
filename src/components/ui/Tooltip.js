'use client';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Tooltip({
  content,
  children,
  position = 'top', // 'top' | 'bottom' | 'left' | 'right'
  delay = 150
}) {
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({});
  const timeoutRef = useRef(null);
  const animationTimerRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    };
  }, []);

  const calculateCoords = () => {
    if (!triggerRef.current) return {};
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    switch (position) {
      case 'bottom':
        return {
          position: 'absolute',
          top: `${rect.bottom + scrollTop + 8}px`,
          left: `${rect.left + scrollLeft + rect.width / 2}px`,
          transform: 'translate(-50%, 0)',
          zIndex: 9999,
        };
      case 'left':
        return {
          position: 'absolute',
          top: `${rect.top + scrollTop + rect.height / 2}px`,
          left: `${rect.left + scrollLeft - 8}px`,
          transform: 'translate(-100%, -50%)',
          zIndex: 9999,
        };
      case 'right':
        return {
          position: 'absolute',
          top: `${rect.top + scrollTop + rect.height / 2}px`,
          left: `${rect.right + scrollLeft + 8}px`,
          transform: 'translate(0, -50%)',
          zIndex: 9999,
        };
      case 'top':
      default:
        return {
          position: 'absolute',
          top: `${rect.top + scrollTop - 8}px`,
          left: `${rect.left + scrollLeft + rect.width / 2}px`,
          transform: 'translate(-50%, -100%)',
          zIndex: 9999,
        };
    }
  };

  const showTip = () => {
    if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    timeoutRef.current = setTimeout(() => {
      // Calculate coordinates BEFORE showing state
      const initialCoords = calculateCoords();
      setCoords(initialCoords);
      setActive(true);
      // Double rAF ensures coordinates apply in DOM BEFORE transition starts
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    }, delay);
  };

  const hideTip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
    // Wait for exit animation duration before unmounting
    animationTimerRef.current = setTimeout(() => {
      setActive(false);
    }, 150);
  };

  useEffect(() => {
    if (active) {
      const updateCoords = () => setCoords(calculateCoords());
      window.addEventListener('scroll', updateCoords, { passive: true });
      window.addEventListener('resize', updateCoords);
      return () => {
        window.removeEventListener('scroll', updateCoords);
        window.removeEventListener('resize', updateCoords);
      };
    }
  }, [active, position]);

  // Caret position mapper
  const getArrowClasses = () => {
    switch (position) {
      case 'bottom':
        return 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900 border-x-transparent border-t-transparent';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 border-l-slate-900 border-y-transparent border-r-transparent';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 border-r-slate-900 border-y-transparent border-l-transparent';
      case 'top':
      default:
        return 'top-full left-1/2 -translate-x-1/2 border-t-slate-900 border-x-transparent border-b-transparent';
    }
  };

  if (!content) return children;

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex items-center"
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
    >
      {children}
      {active && mounted && createPortal(
        <div 
          style={coords}
          className={`absolute z-50 whitespace-nowrap bg-slate-900/95 backdrop-blur-md border border-slate-700/80 px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-slate-100 shadow-2xl shadow-black/50 pointer-events-none transition-all duration-150 ease-out ${
            visible 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-2 scale-95'
          }`}
        >
          {content}
          {/* Caret / Arrow */}
          <div className={`absolute border-4 ${getArrowClasses()}`} />
        </div>,
        document.body
      )}
    </div>
  );
}
