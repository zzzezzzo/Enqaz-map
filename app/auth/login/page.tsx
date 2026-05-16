'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { authService } from '@/services/auth';
import { resolvePostLoginDestination } from '@/lib/postRegisterRedirect';
import CustomerFooter from '@/components/layout/CustomerFooter';
import CustomerNav from '@/components/layout/CustomerNav';
import RegisterForm from '@/components/auth/RegisterForm';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const isRegister = searchParams.get('register') === '1';

  if (isRegister) {
    return (
      <>
        <CustomerNav />
        <div className="min-h-screen bg-slate-50 px-4 py-10">
          <div className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-200 bg-white/90 shadow-sm">
            <div className="grid overflow-hidden rounded-3xl lg:grid-cols-[1.05fr_1fr]">
              <div className="hidden bg-[#0f2744] p-10 text-white lg:flex lg:flex-col lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-orange-300">ENQAZ</p>
                  <h1 className="mt-3 text-3xl font-bold leading-tight">
                    Join the Roadside Assistance Network
                  </h1>
                  <p className="mt-4 text-sm text-slate-200">
                    Create your account to request help quickly or manage your workshop services.
                  </p>
                </div>
                <p className="text-xs text-slate-300">
                  Fast response. Trusted providers. Real-time request tracking.
                </p>
              </div>
              <div className="p-6 sm:p-8 lg:p-10">
                <RegisterForm />
              </div>
            </div>
          </div>
        </div>
        <CustomerFooter />
      </>
    );
  }

  return <LoginForm />;
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await authService.login({ email, password });

      const next = await resolvePostLoginDestination();
      router.push(next);
    } catch (error: unknown) {
      console.error('Login error:', error);
      const err = error as { response?: { status?: number; data?: { message?: string } } };

      if (err.response?.status === 401) {
        setErrors({ general: 'Invalid email or password' });
      } else if (err.response?.data?.message) {
        setErrors({ general: err.response.data.message });
      } else {
        setErrors({ general: 'An error occurred during login. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CustomerNav />
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-200 bg-white/90 shadow-sm">
          <div className="grid overflow-hidden rounded-3xl lg:grid-cols-[1.05fr_1fr]">
            <div className="hidden bg-[#0f2744] p-10 text-white lg:flex lg:flex-col lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-orange-300">Welcome Back</p>
                <h1 className="mt-3 text-3xl font-bold leading-tight">Sign in to continue with ENQAZ</h1>
                <p className="mt-4 text-sm text-slate-200">
                  Access your dashboard, track requests, and get roadside support instantly.
                </p>
              </div>
              <p className="text-xs text-slate-300">
                Need help now? ENQAZ is ready 24/7.
              </p>
            </div>
            <div className="p-6 sm:p-8 lg:p-10">
        <div className="max-w-md w-full space-y-8 mx-auto">
          <div>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-[#0f2744]">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link
                href="/auth/login?register=1"
                className="font-semibold text-orange-500 hover:text-orange-600"
              >
                create a new account
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {errors.general}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full rounded-xl border py-2.5 pl-10 pr-3 text-gray-900 shadow-sm placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 sm:text-sm ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full rounded-xl border py-2.5 pl-10 pr-10 text-gray-900 shadow-sm placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 sm:text-sm ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-orange-500 hover:text-orange-600">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-xl border border-transparent bg-[#f59e0b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d48806] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
          </div>
        </div>
      </div>
      <CustomerFooter />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-600">
          Loading…
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
