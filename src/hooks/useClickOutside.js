'use client';
import { useEffect, useRef } from 'react';

/**
 * Custom hook that triggers a callback when user clicks outside of the referenced element
 * @param {Function} handler Callback function to call on outer click
 * @returns {React.RefObject} Ref object to attach to the container element
 */
export function useClickOutside(handler) {
  const domRef = useRef(null);

  useEffect(() => {
    function listener(event) {
      if (!domRef.current || domRef.current.contains(event.target)) {
        return;
      }
      handler(event);
    }

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler]);

  return domRef;
}
