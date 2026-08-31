'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { getSessionAction } from '@/actions/school/authActions';
import { getSchoolProfileAction } from '@/actions/school/profileActions';

import { getSubscriptionDetailsAction } from '@/actions/school/billingActions';

const PackageContext = createContext(null);

export function PackageProvider({ children }) {
  const [packageInfo, setPackageInfo] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [billingConfig, setBillingConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [renewalModalOpen, setRenewalModalOpen] = useState(false);

  const fetchPackageAndSubscription = async () => {
    try {
      setLoading(true);
      const session = await getSessionAction();
      let resolvedPkg = session?.user?.package || null;

      if (!resolvedPkg && session?.user?.id) {
        const res = await getSchoolProfileAction();
        if (res?.success && res?.data?.package) {
          resolvedPkg = res.data.package;
        }
      }

      if (resolvedPkg) {
        setPackageInfo(resolvedPkg);
        try {
          localStorage.setItem('school_package_info', JSON.stringify(resolvedPkg));
        } catch (e) {}
      }

      // Fetch subscription details
      if (session?.user?.id) {
        const subRes = await getSubscriptionDetailsAction();
        if (subRes?.success && subRes.data) {
          if (subRes.data.subscription) {
            setSubscription(subRes.data.subscription);
            try {
              localStorage.setItem('school_subscription_info', JSON.stringify(subRes.data.subscription));
            } catch (e) {}
          }
          if (subRes.data.currentPackage) setPackageInfo(subRes.data.currentPackage);
          if (subRes.data.billingConfig) setBillingConfig(subRes.data.billingConfig);
        }
      }
    } catch (err) {
      console.warn('Could not load package/subscription in PackageContext:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const cached = localStorage.getItem('school_package_info');
      if (cached) {
        setPackageInfo(JSON.parse(cached));
      }
      const cachedSub = localStorage.getItem('school_subscription_info');
      if (cachedSub) {
        setSubscription(JSON.parse(cachedSub));
      }
    } catch (e) {}

    fetchPackageAndSubscription();
    window.addEventListener('sessionUpdated', fetchPackageAndSubscription);
    return () => window.removeEventListener('sessionUpdated', fetchPackageAndSubscription);
  }, []);

  const modules = Array.isArray(packageInfo?.modules) ? packageInfo.modules : [];

  const hasModule = (moduleKey) => {
    if (!moduleKey || moduleKey === 'always') return true;
    if (!packageInfo && loading) return false;
    return modules.includes(moduleKey);
  };

  const isTransportOnly = packageInfo?.code === 'TRANSPORT_ONLY' || (hasModule('transport') && !hasModule('academics'));
  const isSchoolOnly = packageInfo?.code === 'SCHOOL_ONLY' || (!hasModule('transport') && hasModule('academics'));
  const isFullSuite = packageInfo?.code === 'FULL_SUITE' || (hasModule('transport') && hasModule('academics'));

  const isExpired = subscription && (
    subscription.status === 'expired' || 
    subscription.status === 'inactive' || 
    (subscription.ends_at && new Date(subscription.ends_at) < new Date())
  );

  return (
    <PackageContext.Provider
      value={{
        packageInfo,
        subscription,
        billingConfig,
        modules,
        loading,
        hasModule,
        isTransportOnly,
        isSchoolOnly,
        isFullSuite,
        isExpired,
        renewalModalOpen,
        openRenewalModal: () => setRenewalModalOpen(true),
        closeRenewalModal: () => setRenewalModalOpen(false),
        refreshPackage: fetchPackageAndSubscription
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
