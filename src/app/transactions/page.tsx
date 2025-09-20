import { Suspense } from 'react';
import { getServerSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import TransactionsList from '@/components/transactions/TransactionsList';
import AddTransactionButton from '@/components/transactions/AddTransactionButton';

export default async function TransactionsPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="max-w-full 2xl:max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Transactions 💳
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Track and manage all your vehicle purchases and sales transactions.
              </p>
            </div>
            <div className="flex-shrink-0">
              <AddTransactionButton />
            </div>
          </div>
        </div>

        {/* Content Section */}

        <Suspense fallback={
          <div className="space-y-4 sm:space-y-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm animate-pulse">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="h-4 bg-gray-200 rounded w-3/4 sm:w-48"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 sm:w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 sm:w-40"></div>
                  </div>
                  <div className="flex flex-col sm:items-end space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        }>
          <TransactionsList />
        </Suspense>
    </div>
  );
}