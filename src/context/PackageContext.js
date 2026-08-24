'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { getSessionAction } from '@/actions/school/authActions';

const PackageContext = createContext(null);

export function PackageProvider({ children }) {
  const [packageInfo, setPackageInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPackageInfo = async () => {
    try {
      setLoading(true);
      const session = await getSessionAction();
      if (session?.user?.id) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
        const res = await fetch(`${apiUrl}/profile?schoolId=${session.user.id}`, { cache: 'no-store' });
        const data = await res.json();
        
        if (data?.success && data?.data?.package) {
          setPackageInfo(data.data.package);
        } else if (session?.user?.package) {
          setPackageInfo(session.user.package);
        }
      }
    } catch (err) {
      console.warn('Could not load package info in PackageContext:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackageInfo();
    window.addEventListener('sessionUpdated', fetchPackageInfo);
    return () => window.removeEventListener('sessionUpdated', fetchPackageInfo);
  }, []);

  const modules = Array.isArray(packageInfo?.modules) ? packageInfo.modules : [];

  const hasModule = (moduleKey) => {
    if (!moduleKey || moduleKey === 'always' || moduleKey === 'students') return true;
    if (loading) return true; // prevent flash while loading
    return modules.includes(moduleKey);
  };

  const isTransportOnly = packageInfo?.code === 'TRANSPORT_ONLY' || (hasModule('transport') && !hasModule('academics'));
  const isSchoolOnly = packageInfo?.code === 'SCHOOL_ONLY' || (!hasModule('transport') && hasModule('academics'));
  const isFullSuite = packageInfo?.code === 'FULL_SUITE' || (hasModule('transport') && hasModule('academics'));

  return (
    <PackageContext.Provider
      value={{
        packageInfo,
        modules,
        loading,
        hasModule,
        isTransportOnly,
        isSchoolOnly,
        isFullSuite,
        refreshPackage: fetchPackageInfo
      }}
    >
      {children}
    </PackageContext.Provider>
  );
}

export function usePackage() {
  const context = useContext(PackageContext);
  if (!context) {
    return {
      packageInfo: {
        code: 'FULL_SUITE',
        name: 'Full Suite',
        modules: ['academics', 'teachers', 'students', 'timetable', 'fees', 'attendance', 'academic_years', 'transport']
      },
      modules: ['academics', 'teachers', 'students', 'timetable', 'fees', 'attendance', 'academic_years', 'transport'],
      loading: false,
      hasModule: () => true,
      isTransportOnly: false,
      isSchoolOnly: false,
      isFullSuite: true,
      refreshPackage: () => {}
    };
  }
  return context;
}
