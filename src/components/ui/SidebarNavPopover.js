'use client';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * SidebarNavPopover
 * Renders a tooltip popover via a DOM portal so it is never clipped
 * by any parent overflow:hidden or z-index stacking context.
 *
 * Props:
 *  - icon       : Lucide icon component
 *  - label      : string  — menu item name
 *  - badge      : string? — optional badge value
 *  - isActive   : bool
 *  - children   : the trigger element (the icon-only link)
 */
export default function SidebarNavPopover({ icon: Icon, label, badge, isActive, children }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const show = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({
        top: rect.top + rect.height / 2,
        left: rect.right + 8, // 8px gap after the sidebar right edge
      });
    }
    setVisible(true);
  };

  const hide = () => setVisible(false);

  // Hide on scroll so popover doesn't float away from anchor
  useEffect(() => {
    if (!visible) return;
    const handler = () => hide();
    window.addEventListener('scroll', handler, true);
    return () => window.removeEventListener('scroll', handler, true);
  }, [visible]);

  const popover = visible ? (
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{ top: pos.top, left: pos.left, transform: 'translateY(-50%)' }}
    >
      <div className="flex items-center gap-1.5 animate-fadeIn">
        {/* Arrow */}
        <div className="w-2 h-2 bg-slate-900 rotate-45 shrink-0 rounded-sm shadow-md" />
        {/* Label pill */}
        <div className="flex items-center gap-2 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap border border-white/10 -ml-1">
          {Icon && <Icon size={13} className={isActive ? 'text-primary-400' : 'text-slate-400'} />}
          <span>{label}</span>
          {badge && (
            <span className="bg-primary-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-extrabold">
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div
      ref={triggerRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      className="relative"
    >
      {children}
      {typeof document !== 'undefined' && createPortal(popover, document.body)}
    </div>
  );
}
