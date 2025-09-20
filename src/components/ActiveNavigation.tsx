'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ActiveNavigation() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => {
    return mounted && pathname === path;
  };

  const getDesktopLinkClasses = (path: string) => {
    const baseClasses = "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200";
    if (isActive(path)) {
      return `${baseClasses} bg-blue-100 text-blue-700`;
    }
    return `${baseClasses} text-gray-600 hover:text-gray-900 hover:bg-gray-100`;
  };

  const getMobileLinkClasses = (path: string) => {
    const baseClasses = "flex flex-col items-center justify-center p-1.5 min-w-0 flex-1 transition-colors";
    if (isActive(path)) {
      return `${baseClasses} text-blue-600`;
    }
    return `${baseClasses} text-gray-600 hover:text-gray-900`;
  };

  const getMobileIconClasses = (path: string) => {
    if (isActive(path)) {
      return "h-5 w-5 text-blue-600";
    }
    return "h-5 w-5 text-gray-500";
  };

  const getMobileTextClasses = (path: string) => {
    if (isActive(path)) {
      return "text-xs font-bold mt-1 truncate text-blue-600";
    }
    return "text-xs font-bold mt-1 truncate text-gray-600";
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center space-x-1">
        <Link href="/" className={getDesktopLinkClasses('/')}>
          <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Dashboard</span>
        </Link>

        <Link href="/vehicles" className={getDesktopLinkClasses('/vehicles')}>
          <svg className="mr-2 h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
          <span>Vehicles</span>
        </Link>

        <Link href="/transactions" className={getDesktopLinkClasses('/transactions')}>
          <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Transactions</span>
        </Link>

        <Link href="/persons" className={getDesktopLinkClasses('/persons')}>
          <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>People</span>
        </Link>

        <Link href="/expenses" className={getDesktopLinkClasses('/expenses')}>
          <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Expenses</span>
        </Link>

        <Link href="/reports" className={getDesktopLinkClasses('/reports')}>
          <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Reports</span>
        </Link>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-40 sm:hidden">
        <div className="w-full h-16 bg-white relative shadow-2xl">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-10 bg-gray-50 rounded-b-full"></div>
          <div className="flex justify-around items-center h-full pt-3 relative">
            <Link href="/" className={getMobileLinkClasses('/')}>
              <svg className={getMobileIconClasses('/')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className={getMobileTextClasses('/')}>Home</span>
            </Link>

            <Link href="/vehicles" className={getMobileLinkClasses('/vehicles')}>
              <svg className={getMobileIconClasses('/vehicles')} fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
              <span className={getMobileTextClasses('/vehicles')}>Vehicles</span>
            </Link>

            <Link href="/add" className="flex flex-col items-center justify-center p-1.5 -mt-8 relative z-30">
              <div className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-xl transition-colors border-4 border-white relative z-30">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </Link>

            <Link href="/transactions" className={getMobileLinkClasses('/transactions')}>
              <svg className={getMobileIconClasses('/transactions')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className={getMobileTextClasses('/transactions')}>Transactions</span>
            </Link>

            <Link href="/reports" className={getMobileLinkClasses('/reports')}>
              <svg className={getMobileIconClasses('/reports')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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