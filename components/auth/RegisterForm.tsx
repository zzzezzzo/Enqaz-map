'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Eye, EyeOff, Mail, Lock, User, MapPin } from 'lucide-react';
import api, { authService, readAuthApiErrorMessage } from '@/services/auth';
import { fetchServicesCatalog } from '@/lib/servicesCatalog';
import type { ServiceOption } from '@/app/providers/profile/types';
import { resolvePostRegisterDestination } from '@/lib/postRegisterRedirect';

type AccountType = 'customer' | 'provider';

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
  workShopName?: string;
  workshopLocation?: string;
};

export default function RegisterForm() {
  const [accountType, setAccountType] = useState<AccountType>('customer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [workShopName, setWorkShopName] = useState('');
  const [workshopDescription, setWorkshopDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [servicesCatalog, setServicesCatalog] = useState<ServiceOption[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const loadServicesCatalog = useCallback(async () => {
    setServicesLoading(true);
    setServicesError(null);
    const { services, error } = await fetchServicesCatalog(api);
    setServicesCatalog(services);
    setServicesError(error);
    setServicesLoading(false);
  }, []);

  useEffect(() => {
    loadServicesCatalog();
  }, [loadServicesCatalog]);

  const validateForm = () => {
    const newErrors: FieldErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (accountType === 'provider') {
      if (!workShopName.trim()) {
        newErrors.workShopName = 'Workshop name is required';
      }
      if (!latitude.trim() || !longitude.trim()) {
        newErrors.workshopLocation = 'Enter latitude and longitude, or use live location';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleService = (id: number) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const useLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(7));
        setLongitude(position.coords.longitude.toFixed(7));
        setLocationLoading(false);
      },
      () => {
        setLocationError('Unable to retrieve your location.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (accountType === 'customer') {
        await authService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
        });
      } else {
        await authService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
          role: 'provider',
          workShopName: workShopName.trim(),
          description: workshopDescription.trim(),
          latitude: latitude.trim(),
          longitude: longitude.trim(),
          services: selectedServiceIds,
        });
      }

      const next = await resolvePostRegisterDestination();
      router.push(next);
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        (error as { response?: { status?: number; data?: unknown } }).response?.status === 422
      ) {
        const data = (error as { response?: { data?: unknown } }).response?.data;
        const backendErrors =
          data &&
          typeof data === 'object' &&
          'errors' in data &&
          (data as { errors: unknown }).errors != null &&
          typeof (data as { errors: unknown }).errors === 'object' &&
          !Array.isArray((data as { errors: unknown }).errors)
            ? (data as { errors: Record<string, string[] | string | undefined> }).errors
            : undefined;

        const msg =
          data &&
          typeof data === 'object' &&
          'message' in data &&
          typeof (data as { message: unknown }).message === 'string'
            ? (data as { message: string }).message
            : 'Please fix the errors below.';

        setErrors({
          email: backendErrors?.email?.[0],
          name: backendErrors?.name?.[0],
          password: Array.isArray(backendErrors?.password)
            ? backendErrors.password[0]
            : typeof backendErrors?.password === 'string'
              ? backendErrors.password
              : undefined,
          confirmPassword: Array.isArray(backendErrors?.password_confirmation)
            ? backendErrors.password_confirmation[0]
            : undefined,
          workShopName:
            backendErrors?.workShopName?.[0] ??
            (backendErrors as { work_shop_name?: string[] })?.work_shop_name?.[0],
          workshopLocation: backendErrors?.latitude?.[0] ?? backendErrors?.longitude?.[0],
          general: msg,
        });
      } else {
        setErrors({ general: readAuthApiErrorMessage(error) });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.general}
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-900">I am registering as</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
              <input
                type="radio"
                name="accountType"
                checked={accountType === 'customer'}
                onChange={() => setAccountType('customer')}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-sm text-gray-800">Customer</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
              <input
                type="radio"
                name="accountType"
                checked={accountType === 'provider'}
                onChange={() => setAccountType('provider')}
                className="h-4 w-4 text-blue-600"
              />
              <span className="flex items-center gap-2 text-sm text-gray-800">
                <Building2 className="h-4 w-4 text-gray-500" aria-hidden />
                Workshop provider
              </span>
            </label>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Providers submit workshop details; an administrator approves your account before you can operate
            in the app.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700">
              Full name
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="reg-name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`block w-full pl-10 text-gray-900 pr-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`block w-full pl-10 text-gray-900 pr-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="reg-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleInputChange}
                className={`block w-full pl-10 text-gray-900 pr-10 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Create a password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
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

          <div>
            <label htmlFor="reg-confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="reg-confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`block w-full pl-10 text-gray-900 pr-10 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {accountType === 'provider' && (
          <div className="space-y-4 rounded-lg border border-amber-100 bg-amber-50/50 p-4">
            <p className="text-sm font-semibold text-gray-900">Workshop details</p>

            <div>
              <label htmlFor="workShopName" className="block text-sm font-medium text-gray-700">
                Workshop name
              </label>
              <input
                id="workShopName"
                type="text"
                value={workShopName}
                onChange={(e) => setWorkShopName(e.target.value)}
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 ${errors.workShopName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Your workshop name"
              />
              {errors.workShopName && (
                <p className="mt-1 text-sm text-red-600">{errors.workShopName}</p>
              )}
            </div>

            <div>
              <label htmlFor="workshopDescription" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="workshopDescription"
                value={workshopDescription}
                onChange={(e) => setWorkshopDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="What services do you offer?"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Latitude</label>
                <div className="mt-1 flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm">
                  <MapPin className="h-4 w-4 text-gray-400" aria-hidden />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full border-0 bg-transparent p-0 text-sm text-gray-900 outline-none"
                    placeholder="e.g. 30.61"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Longitude</label>
                <div className="mt-1 flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm">
                  <MapPin className="h-4 w-4 text-gray-400" aria-hidden />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full border-0 bg-transparent p-0 text-sm text-gray-900 outline-none"
                    placeholder="e.g. 31.44"
                  />
                </div>
              </div>
            </div>
            {errors.workshopLocation && (
              <p className="text-sm text-red-600">{errors.workshopLocation}</p>
            )}

            <div>
              <button
                type="button"
                onClick={useLiveLocation}
                disabled={locationLoading}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60"
              >
                {locationLoading ? 'Getting location…' : 'Use live location'}
              </button>
              {locationError && <p className="mt-2 text-xs text-red-600">{locationError}</p>}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">Services you offer</p>
              <p className="text-xs text-gray-500">
                Loaded from the API — optional; you can change these later in profile.
              </p>
              <div className="mt-2 rounded-md border border-gray-200 bg-white p-3">
                {servicesLoading ? (
                  <p className="text-sm text-gray-500">Loading services…</p>
                ) : servicesError ? (
                  <div className="space-y-2">
                    <p className="text-sm text-red-600">{servicesError}</p>
                    <button
                      type="button"
                      onClick={() => loadServicesCatalog()}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Retry
                    </button>
                  </div>
                ) : servicesCatalog.length === 0 ? (
                  <p className="text-sm text-gray-500">No services returned from the server.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {servicesCatalog.map((s) => (
                      <label
                        key={s.id}
                        className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-800"
                      >
                        <input
                          type="checkbox"
                          checked={selectedServiceIds.includes(s.id)}
                          onChange={() => toggleService(s.id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600"
                        />
                        {s.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center">
          <input
            id="agree-terms"
            name="agree-terms"
            type="checkbox"
            required
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
            I agree to the{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </Link>
          </label>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </div>
      </form>
    </div>
  );
}
