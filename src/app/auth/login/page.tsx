'use client';

import { useState } from 'react';
// Authentication will be handled directly without hooks
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Car } from 'lucide-react';
import { Button, Input } from '@/components/ui';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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
      // Demo credentials
      const DEMO_CREDENTIALS = {
        email: 'admin@example.com',
        password: 'password123'
      };

      const DEMO_USER = {
        id: 'demo-user',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'Admin'
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Validate input fields
      if (!data.email) {
        setError('Email is required');
        return;
      }
      if (!data.password) {
        setError('Password is required');
        return;
      }

      // Check credentials
      if (data.email === DEMO_CREDENTIALS.email && data.password === DEMO_CREDENTIALS.password) {
        const session = { user: DEMO_USER };
        localStorage.setItem('auth-session', JSON.stringify(session));
        // Force a page reload to trigger the auth context to pick up the new session
        window.location.href = '/';
      } else {
        // Provide specific error messages
        if (data.email !== DEMO_CREDENTIALS.email) {
          setError('Invalid email address. Please check your email.');
        } else {
          setError('Invalid password. Please check your password.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Car className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Vehicle Sales Log App
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Demo Credentials</h3>
              <div className="mt-1 text-sm text-blue-700">
                <p className="mb-1"><strong>Email:</strong> admin@example.com</p>
                <p className="mb-1"><strong>Password:</strong> password123</p>
                <p className="text-xs">These will work after MongoDB is connected and seeded.</p>
              </div>
            </div>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <Input
              {...register('email')}
              type="email"
              label="Email address"
              placeholder="Enter your email"
              error={errors.email?.message}
            />

            <Input
              {...register('password')}
              type="password"
              label="Password"
              placeholder="Enter your password"
              error={errors.password?.message}
            />
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
            >
              Sign in
            </Button>
          </div>
        </form>
        
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Setup Required</h3>
            <div className="text-xs text-gray-600 space-y-2">
              <p>1. Set up MongoDB Atlas (free)</p>
              <p>2. Update MONGODB_URI in .env file</p>
              <p>3. Run: npm run seed</p>
              <p>4. Login with demo credentials above</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}