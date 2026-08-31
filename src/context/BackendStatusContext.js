'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const BackendStatusContext = createContext({
  isOffline: false,
  isChecking: false,
  lastChecked: null,
  checkHealth: async () => {},
});

export const BackendStatusProvider = ({ children }) => {
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(`${apiUrl}/health`, {
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        setIsOffline(false);
      } else if (res.status >= 500) {
        setIsOffline(true);
      } else {
        // Any response code from server means backend process is UP
        setIsOffline(false);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      setIsOffline(true);
    } finally {
      setIsChecking(false);
      setLastChecked(new Date());
    }
  }, [apiUrl]);

  // Listen to browser network online/offline events without aggressive background API polling
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


  return (
    <BackendStatusContext.Provider value={{ isOffline, isChecking, lastChecked, checkHealth }}>
      {children}
    </BackendStatusContext.Provider>
  );
};

export const useBackendStatus = () => useContext(BackendStatusContext);
