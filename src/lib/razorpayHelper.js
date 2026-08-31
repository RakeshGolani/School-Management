import { triggerMockPaymentAction } from '@/actions/school/billingActions';

/**
 * Load Razorpay Checkout SDK Script
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Reusable Dynamic Razorpay Checkout Handler
 * Handles both live Razorpay payment modal with signature verification and dev fallback.
 */
export async function openRazorpayCheckout({
  checkoutResponse,
  planType = 'monthly',
  packageCode = 'FULL_SUITE',
  studentsLimit = 50,
  busesLimit = 5,
  themeColor = '#0047AB',
  onSuccess,
  onError,
  onDismiss
}) {
  try {
    const data = checkoutResponse?.data || checkoutResponse || {};
    const details = data.checkoutDetails || {};
    const razorpayKey = details.razorpay_key;
    const orderId = details.order_id || data.transaction?.gateway_transaction_id;
    const isMock = details.is_mock;
    const isSdkLoaded = await loadRazorpayScript();

    // Extract school primary branding color dynamically
    let resolvedThemeColor = details.primary_color || themeColor;
    if (!resolvedThemeColor || resolvedThemeColor === '#0047AB') {
      if (typeof window !== 'undefined') {
        const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--theme-primary-500')?.trim()
                    || getComputedStyle(document.documentElement).getPropertyValue('--theme-primary-600')?.trim();
        const storedTheme = localStorage.getItem('theme_primary');
        resolvedThemeColor = cssVar || storedTheme || '#0047AB';
      }
    }

    // 1. Live / Test Mode Razorpay Gateway Modal
    if (isSdkLoaded && window.Razorpay && razorpayKey && !isMock) {
      const options = {
        key: razorpayKey,
        amount: Math.round(Number(details.total || 0) * 100),
        currency: 'INR',
        // Super Admin / Merchant Receiving Payment
        name: details.merchant_name || 'Vidyadmin Systems Inc.',
        description: `School Subscription Renewal - ${details.school_name || 'School'} (${planType === 'yearly' ? 'Yearly' : 'Monthly'})`,
        image: details.merchant_logo || undefined,
        order_id: orderId,
        // School Payer Prefill Details
        prefill: {
          name: details.school_name || 'School Administrator',
          email: details.school_email || 'admin@school.com',
          contact: details.school_phone || ''
        },
        theme: {
          color: resolvedThemeColor
        },
        handler: async function (response) {
          try {
            const verifyRes = await triggerMockPaymentAction({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              gateway_transaction_id: response.razorpay_order_id || orderId,
              amount: details.total,
              subtotal: details.subtotal,
              tax: details.tax,
              max_students_limit: studentsLimit,
              max_buses_limit: busesLimit,
              plan_type: planType,
              package_code: packageCode,
              status: 'success'
            });

            if (verifyRes.success) {
              if (onSuccess) await onSuccess(verifyRes);
            } else {
              if (onError) onError(verifyRes.message || 'Payment signature verification failed.');
            }
          } catch (err) {
            console.error('Error verifying Razorpay signature:', err);
            if (onError) onError('Failed to verify payment with server.');
          }
        },
        modal: {
          ondismiss: function () {
            if (onDismiss) onDismiss();
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async function (response) {
        console.error('Razorpay payment failed:', response.error);
        try {
          await triggerMockPaymentAction({
            status: 'failed',
            gateway_transaction_id: response.error?.metadata?.order_id || orderId,
            razorpay_payment_id: response.error?.metadata?.payment_id || null,
            error_code: response.error?.code || 'PAYMENT_FAILED',
            error_description: response.error?.description || response.error?.reason || 'Transaction declined by bank/gateway',
            amount: details.total,
            plan_type: planType,
            package_code: packageCode
          });
        } catch (e) {
          console.warn('Could not record failed payment to backend:', e);
        }

        if (onError) onError(`Payment failed: ${response.error?.description || 'Transaction declined'}`);
        if (onDismiss) onDismiss();
      });
      rzp.open();
      return;
    }

    // 2. Dev Fallback Simulation Mode (when Razorpay keys are not active or in local test mock)
    const paymentRes = await triggerMockPaymentAction({
      gateway_transaction_id: orderId,
      max_students_limit: studentsLimit,
      max_buses_limit: busesLimit,
      plan_type: planType,
      package_code: packageCode,
      status: 'success'
    });

    if (paymentRes.success) {
      if (onSuccess) await onSuccess(paymentRes);
    } else {
      if (onError) onError(paymentRes.message || 'Payment simulation failed.');
    }
  } catch (err) {
    console.error('Error during checkout initiation:', err);
    if (onError) onError('An unexpected error occurred during payment.');
    if (onDismiss) onDismiss();
  }
}
