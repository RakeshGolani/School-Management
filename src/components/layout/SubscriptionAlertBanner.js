'use client';
import { usePackage } from '@/context/PackageContext';
import { ShieldAlert, Zap, ArrowRight } from 'lucide-react';
import SubscriptionRenewalModal from '@/components/modals/SubscriptionRenewalModal';

/**
 * SubscriptionAlertBanner
 * Renders an unobtrusive but clear alert banner across the school admin layout when subscription is expired/inactive.
 */
export default function SubscriptionAlertBanner() {
  const { 
    isExpired, 
    subscription, 
    packageInfo, 
    billingConfig, 
    renewalModalOpen, 
    openRenewalModal, 
    closeRenewalModal,
    refreshPackage 
  } = usePackage();

  if (!isExpired) {
    return (
      <SubscriptionRenewalModal
        isOpen={renewalModalOpen}
        onClose={closeRenewalModal}
        subscription={subscription}
        currentPackage={packageInfo}
        billingConfig={billingConfig}
        onSuccess={refreshPackage}
      />
    );
  }

  const expiryDate = subscription?.ends_at 
    ? new Date(subscription.ends_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'recently';

  return (
    <>
      <div className="bg-amber-50/90 backdrop-blur-sm text-amber-950 px-4 py-2.5 shadow-xs flex items-center justify-between gap-3 text-xs z-30 shrink-0 border-b border-amber-200/80">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <span className="font-medium text-amber-900">
            <strong className="font-black text-amber-950 tracking-wide">License Inactive:</strong> Your school subscription expired on {expiryDate}. Access to administrative modules is restricted.
          </span>
        </div>
        <button
          onClick={openRenewalModal}
          className="px-3.5 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-black text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-md shadow-primary-600/30 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Renew Subscription Now</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <SubscriptionRenewalModal
        isOpen={isExpired || renewalModalOpen}
        onClose={closeRenewalModal}
        isMandatory={isExpired}
        subscription={subscription}
        currentPackage={packageInfo}
        billingConfig={billingConfig}
        onSuccess={async () => {
          if (refreshPackage) await refreshPackage();
        }}
      />
    </>
  );
}
