'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Car, Eye, EyeOff, Sun, Moon, Monitor, Shield, Users, BarChart3 } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useSignIn } from '@/lib/auth-context';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const signIn = useSignIn();

  const { theme, setTheme, actualTheme, isHydrated } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn(data);

      if (result.error) {
        setError(result.error);
      } else {
        // Use Next.js router for client-side navigation
        router.push('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Car className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-bold">Vehicle Sales Log</h1>
            </div>
            <p className="text-xl text-blue-100 leading-relaxed">
              Comprehensive vehicle sales tracking and management system for modern dealerships
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Secure & Reliable</h3>
                <p className="text-blue-100 text-sm">Enterprise-grade security for your data</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Multi-User Support</h3>
                <p className="text-blue-100 text-sm">Collaborate with your team seamlessly</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Advanced Analytics</h3>
                <p className="text-blue-100 text-sm">Insights to grow your business</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Theme Toggle */}
          <div className="flex justify-between items-center">
            <div className="lg:hidden flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">VSL</span>
            </div>

            {isHydrated && (
              <div className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                {(['light', 'dark', 'system'] as const).map((themeOption) => {
                  const Icon = themeIcons[themeOption];
                  return (
                    <button
                      key={themeOption}
                      onClick={() => setTheme(themeOption)}
                      className={`p-2 rounded-md transition-colors ${
                        theme === themeOption
                          ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                      title={`Switch to ${themeOption} theme`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Header */}
          <div className="text-center">
            <div className="lg:hidden mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome Back
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Sign in to your Vehicle Sales Log account
              </p>
            </div>
            <div className="hidden lg:block">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome Back
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Sign in to continue to Vehicle Sales Log
              </p>
            </div>
          </div>

          {/* Demo Credentials Card */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                <Shield className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Demo Credentials
                </h3>
                <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Email:</span>
                    <code className="bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded text-xs">
                      admin@example.com
                    </code>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Password:</span>
                    <code className="bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded text-xs">
                      password123
                    </code>
                  </div>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                  Ready to use after MongoDB setup and seeding
                </p>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
              </div>
            )}

            <div className="space-y-4">
              <Input
                {...register('email')}
                type="email"
                label="Email address"
                placeholder="admin@example.com"
                error={errors.email?.message}
                className="bg-white dark:bg-gray-800"
              />

              <div className="relative">
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="Enter your password"
                  error={errors.password?.message}
                  className="bg-white dark:bg-gray-800 pr-12"
                />
                <div className="absolute inset-y-0 right-0 flex items-end pr-3 pb-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-3 text-base font-medium"
              loading={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Setup Instructions */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="text-center">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                First time setup
              </h3>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
                <p className="flex items-center justify-center space-x-2">
                  <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                  <span>Set up MongoDB Atlas (free tier available)</span>
                </p>
                <p className="flex items-center justify-center space-x-2">
                  <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                  <span>Update MONGODB_URI in .env file</span>
                </p>
                <p className="flex items-center justify-center space-x-2">
                  <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                  <span>Run: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">npm run seed</code></span>
                </p>
                <p className="flex items-center justify-center space-x-2">
                  <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                  <span>Login with demo credentials above</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}