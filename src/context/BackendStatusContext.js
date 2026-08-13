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

  // Initial check on mount + set interval
  useEffect(() => {
    checkHealth();

    const interval = setInterval(() => {
      checkHealth();
    }, 10000); // Check every 10s

    const handleOnline = () => checkHealth();
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkHealth]);

  // Intercept fetch network failures globally
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        // If a server response of 502/503/504 Bad Gateway occurs
        if ([502, 503, 504].includes(response.status)) {
          setIsOffline(true);
        }
        return response;
      } catch (error) {
        // If fetch failed due to network / backend down
        const urlStr = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
        if (urlStr.includes(apiUrl) || urlStr.includes('5000')) {
          setIsOffline(true);
        }
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [apiUrl]);

  return (
    <BackendStatusContext.Provider value={{ isOffline, isChecking, lastChecked, checkHealth }}>
      {children}
    </BackendStatusContext.Provider>
  );
};

export const useBackendStatus = () => useContext(BackendStatusContext);
