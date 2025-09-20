import { Suspense } from 'react';
import { getServerSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import ReportsDashboard from '@/components/reports/ReportsDashboard';

export default async function ReportsPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="max-w-full 2xl:max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Reports & Analytics 📊
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Comprehensive business performance and financial insights for your vehicle sales.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                <span>Live Data</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Dashboard */}
        <ReportsDashboard />
    </div>
  );
}