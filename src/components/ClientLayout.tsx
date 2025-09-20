'use client';

import Link from 'next/link';
import { AuthProvider, useSession } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SimpleThemeToggle } from '@/components/ui/ThemeToggle';

function NavigationContent({ children }: { children: React.ReactNode }) {
  const { data: session, status, signOut } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirect to login if not authenticated (except on login page)
  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/auth/login') {
      router.push('/auth/login');
    }
  }, [status, router, pathname]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Helper function to get navigation link classes
  const getNavLinkClasses = (href: string, isMobile = false) => {
    const isActive = pathname === href;

    if (isMobile) {
      return `mobile-nav-link flex flex-col items-center justify-center p-1.5 min-w-0 flex-1 transition-colors ${
        isActive
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
      }`;
    }

    return `nav-link flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;
  };

  // Helper function to get icon classes
  const getIconClasses = (href: string, isMobile = false) => {
    const isActive = pathname === href;
    const baseClasses = isMobile ? 'h-5 w-5' : 'mr-2 h-4 w-4';

    return `${baseClasses} ${
      isActive
        ? 'text-blue-600 dark:text-blue-400'
        : 'text-gray-500 dark:text-gray-400'
    }`;
  };

  // Helper function to get text classes for mobile
  const getMobileTextClasses = (href: string) => {
    const isActive = pathname === href;
    return `text-xs font-bold mt-1 truncate ${
      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
    }`;
  };

  // If on login page, always show content without navigation
  if (pathname === '/auth/login') {
    return <>{children}</>;
  }

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  // Show redirecting message if not authenticated and not on login page
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Fixed navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-full 2xl:max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/" className="flex items-center space-x-1 sm:space-x-2 group">
                <div className="relative">
                  <svg className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 group-hover:text-blue-700 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                  </svg>
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="hidden md:block">
                  <div className="flex flex-col">
                    <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">Vehicle Sales Log</span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 -mt-1 hidden sm:block">Business Management</span>
                  </div>
                </div>
                <span className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400 block md:hidden">VSL</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <Link href="/" className={getNavLinkClasses('/')}>
                <svg className={getIconClasses('/')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Dashboard</span>
              </Link>

              <Link href="/vehicles" className={getNavLinkClasses('/vehicles')}>
                <svg className={getIconClasses('/vehicles')} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
                <span>Vehicles</span>
              </Link>

              <Link href="/transactions" className={getNavLinkClasses('/transactions')}>
                <svg className={getIconClasses('/transactions')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Transactions</span>
              </Link>

              <Link href="/persons" className={getNavLinkClasses('/persons')}>
                <svg className={getIconClasses('/persons')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>People</span>
              </Link>

              <Link href="/expenses" className={getNavLinkClasses('/expenses')}>
                <svg className={getIconClasses('/expenses')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Expenses</span>
              </Link>

              <Link href="/reports" className={getNavLinkClasses('/reports')}>
                <svg className={getIconClasses('/reports')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Reports</span>
              </Link>
            </div>

            {/* User section */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <SimpleThemeToggle size="sm" />
              <div className="hidden lg:flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-2 py-1.5">
                  <div className="relative">
                    <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-tight">{session?.user?.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{session?.user?.role}</span>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 px-2 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>

              <button
                onClick={toggleMobileMenu}
                className="lg:hidden inline-flex items-center justify-center p-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed top-14 sm:top-16 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${getNavLinkClasses('/')} w-full justify-start`}
            >
              <svg className={getIconClasses('/')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Dashboard</span>
            </Link>

            <Link
              href="/vehicles"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${getNavLinkClasses('/vehicles')} w-full justify-start`}
            >
              <svg className={getIconClasses('/vehicles')} fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
              <span>Vehicles</span>
            </Link>

            <Link
              href="/transactions"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${getNavLinkClasses('/transactions')} w-full justify-start`}
            >
              <svg className={getIconClasses('/transactions')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Transactions</span>
            </Link>

            <Link
              href="/persons"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${getNavLinkClasses('/persons')} w-full justify-start`}
            >
              <svg className={getIconClasses('/persons')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>People</span>
            </Link>

            <Link
              href="/expenses"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${getNavLinkClasses('/expenses')} w-full justify-start`}
            >
              <svg className={getIconClasses('/expenses')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Expenses</span>
            </Link>

            <Link
              href="/reports"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${getNavLinkClasses('/reports')} w-full justify-start`}
            >
              <svg className={getIconClasses('/reports')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Reports</span>
            </Link>

            {/* Mobile User Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="flex items-center px-3 py-2">
                <div className="relative mr-3">
                  <svg className="h-8 w-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">{session?.user?.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{session?.user?.role}</div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-14 sm:h-16"></div>

      {/* Main Content */}
      <main className="mx-auto max-w-full px-2 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8 xl:px-12">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg z-40 sm:hidden">
        <div className="w-full h-16 bg-white dark:bg-gray-900 relative shadow-2xl">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-10 bg-gray-50 dark:bg-gray-800 rounded-b-full"></div>
          <div className="flex justify-around items-center h-full pt-3 relative">
            <Link href="/" className={getNavLinkClasses('/', true)}>
              <svg className={getIconClasses('/', true)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className={getMobileTextClasses('/')}>Home</span>
            </Link>

            <Link href="/vehicles" className={getNavLinkClasses('/vehicles', true)}>
              <svg className={getIconClasses('/vehicles', true)} fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
              <span className={getMobileTextClasses('/vehicles')}>Vehicles</span>
            </Link>

            <Link href="/add" className="flex flex-col items-center justify-center p-1.5 -mt-8 relative z-30">
              <div className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-xl transition-colors border-4 border-white dark:border-gray-900 relative z-30">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </Link>

            <Link href="/transactions" className={getNavLinkClasses('/transactions', true)}>
              <svg className={getIconClasses('/transactions', true)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className={getMobileTextClasses('/transactions')}>Transactions</span>
            </Link>

            <Link href="/reports" className={getNavLinkClasses('/reports', true)}>
              <svg className={getIconClasses('/reports', true)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className={getMobileTextClasses('/reports')}>Reports</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NavigationContent>
        {children}
      </NavigationContent>
    </AuthProvider>
  );
}