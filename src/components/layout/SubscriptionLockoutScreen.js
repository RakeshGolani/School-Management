'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  CreditCard, 
  Calendar, 
  AlertTriangle,
  RefreshCw,
  Zap,
  LogOut
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { usePackage } from '@/context/PackageContext';
import SubscriptionRenewalModal from '@/components/modals/SubscriptionRenewalModal';
import { logoutAction } from '@/actions/school/authActions';

/**
 * SubscriptionLockoutScreen
 * Mandatory full-screen lockout when school subscription is expired or inactive.
 * Blocks access to all modules until renewed.
 */
export default function SubscriptionLockoutScreen() {
  const router = useRouter();
  const { 
    subscription, 
    packageInfo, 
    billingConfig, 
    refreshPackage 
  } = usePackage();

  const [renewalModalOpen, setRenewalModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const expiryDate = subscription?.ends_at 
    ? new Date(subscription.ends_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently';

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutAction();
    router.push('/login');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-scaleIn">
        
        {/* Top Header Banner in School/Slate Theme */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-7 text-white text-center relative border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-primary-600/30 border border-primary-500/40 text-primary-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock size={32} className="animate-pulse text-primary-400" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
            Institutional Access Suspended
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Subscription License Expired
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
            Your school&apos;s subscription plan expired on <strong className="underline text-white">{expiryDate}</strong>. Module access is locked until the plan is renewed.
          </p>
        </div>

        {/* Content Box */}
        <div className="p-6 sm:p-8 space-y-6 text-center">
          
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Locked Package Plan</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black border border-rose-200 uppercase">
                {subscription?.status || 'Inactive'}
              </span>
            </div>
            <p className="text-sm font-black text-slate-900">{packageInfo?.name || 'Full Institutional Suite'}</p>
            <p className="text-xs text-slate-500">
              Students Directory, Attendance, Classes, Fees, Timetable, Smart Bus Fleet, and Academic Years are locked.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setRenewalModalOpen(true)}
              className="w-full justify-center py-3.5 text-sm font-black shadow-lg shadow-primary-600/25"
            >
              <Zap className="w-4 h-4 mr-2" />
              Renew License &amp; Instant Unlock Portal
            </Button>

            <div className="flex items-center justify-center gap-3 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/billing')}
                icon={CreditCard}
              >
                Go to Billing &amp; Invoices
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                loading={loggingOut}
                icon={LogOut}
                className="text-slate-500 hover:text-rose-600"
              >
                Sign Out
              </Button>
            </div>
          </div>

        </div>

      </div>

      {/* Mandatory Non-Closable Renewal Modal */}
      <SubscriptionRenewalModal
        isOpen={renewalModalOpen}
        onClose={() => setRenewalModalOpen(false)}
        isMandatory={true}
        subscription={subscription}
        currentPackage={packageInfo}
        billingConfig={billingConfig}
        onSuccess={async () => {
          setRenewalModalOpen(false);
          if (refreshPackage) await refreshPackage();
        }}
      />
    </div>
  );
}
