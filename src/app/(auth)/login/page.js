'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, BookOpen, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { loginAction } from '@/actions/authActions';
import { loginSchema } from '@/validators/authSchemas';
import { notifySuccess, notifyError } from '@/lib/notify';

/**
 * Dedicated School Portal Login Page
 * Features Yup schema validation & Notiflix toast notifications.
 */
export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    // 1. Run client-side Yup schema validation
    try {
      await loginSchema.validate({ email, password }, { abortEarly: false });
    } catch (yupErr) {
      if (yupErr.inner) {
        const errorsObj = {};
        yupErr.inner.forEach((err) => {
          if (err.path && !errorsObj[err.path]) {
            errorsObj[err.path] = err.message;
          }
        });
        setFieldErrors(errorsObj);
        notifyError('Please fix the form errors highlighted in red.');
      } else {
        notifyError(yupErr.message);
      }
      setLoading(false);
      return;
    }

    try {
      // 2. Invoke Server Action
      const result = await loginAction({ email, password });

      if (!result.success) {
        if (result.errors) {
          const errs = {};
          Object.entries(result.errors).forEach(([field, msgs]) => {
            errs[field] = Array.isArray(msgs) ? msgs.join(', ') : msgs;
          });
          setFieldErrors(errs);
        }
        notifyError(result.message || 'Invalid email or password.');
        return;
      }

      notifySuccess(`${result.message || 'Authentication successful'}. Redirecting...`);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);

    } catch (err) {
      notifyError(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo & Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center shadow-lg shadow-primary-500/20">
          <BookOpen size={24} className="text-white" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-wide">School Portal Login</h2>
        <p className="text-slate-400 text-xs">Enter your credentials to access your account</p>
      </div>

      {/* Login Form */}
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          icon={Mail}
          value={email}
          error={fieldErrors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFieldErrors((prev) => ({ ...prev, email: '' }));
          }}
          placeholder="school@gmail.com"
        />

        <div className="space-y-1">
          <div className="flex justify-end pb-1">
            <Link href="/forgot-password" className="text-xs text-primary-500 hover:underline transition font-medium">
              Forgot password?
            </Link>
          </div>
          <Input
            label="Password"
            type="password"
            icon={Lock}
            value={password}
            error={fieldErrors.password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((prev) => ({ ...prev, password: '' }));
            }}
            placeholder="••••••••"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          fullWidth
        >
          Sign In to School Portal
        </Button>
      </form>

      {/* Back Link */}
      <div className="text-center pt-2">
        <Link href="/" className="text-xs text-slate-400 hover:text-white transition inline-flex items-center gap-1.5">
          <ArrowLeft size={14} /> Back to Homepage
        </Link>
      </div>
    </div>
  );
}
