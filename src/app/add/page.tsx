import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth-utils';
import { Car, Receipt, Users, CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import connectDB from '@/lib/mongodb';
import { Vehicle, Transaction, Person } from '@/models';

async function getQuickStats() {
  try {
    await connectDB();

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const [
      totalVehicles,
      thisMonthSales,
      totalCustomers,
      pendingTransactions
    ] = await Promise.all([
      Vehicle.countDocuments({ deletedAt: { $exists: false } }),
      Transaction.countDocuments({
        direction: 'OUT',
        createdAt: { $gte: currentMonth },
        deletedAt: { $exists: false }
      }),
      Person.countDocuments({ deletedAt: { $exists: false } }),
      Transaction.countDocuments({
        deletedAt: { $exists: false },
        // You can add more conditions here for what constitutes "pending"
      })
    ]);

    return {
      totalVehicles,
      thisMonthSales,
      totalCustomers,
      pendingTransactions
    };
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    return {
      totalVehicles: 0,
      thisMonthSales: 0,
      totalCustomers: 0,
      pendingTransactions: 0
    };
  }
}

export default async function AddPage() {
  await requireAuth();

  const stats = await getQuickStats();

  const quickActions = [
    {
      name: 'Add Vehicle',
      description: 'Register a new vehicle to your inventory',
      href: '/vehicles?modal=add',
      icon: Car,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      name: 'New Transaction',
      description: 'Record a vehicle purchase or sale',
      href: '/transactions?modal=add',
      icon: Receipt,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      name: 'Add Person',
      description: 'Add a new customer or supplier',
      href: '/persons?modal=add',
      icon: Users,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      name: 'Add Expense',
      description: 'Record a business expense',
      href: '/expenses?modal=add',
      icon: CreditCard,
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ];

  return (
    <div className="max-w-full 2xl:max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href="/"
            className="inline-flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors sm:hidden"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </div>

        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Quick Add ➕
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Choose what you'd like to add to your vehicle sales system
          </p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.name}
              href={action.href}
              className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`p-4 rounded-full text-white transition-colors ${action.color}`}>
                  <Icon className="h-8 w-8" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {action.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity or Quick Stats */}
      <div className="mt-12 mb-6 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Stats 📊
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalVehicles}</div>
            <div className="text-xs text-gray-600">Total Vehicles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.thisMonthSales}</div>
            <div className="text-xs text-gray-600">This Month Sales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalCustomers}</div>
            <div className="text-xs text-gray-600">Total Customers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.pendingTransactions}</div>
            <div className="text-xs text-gray-600">Total Transactions</div>
          </div>
        </div>
      </div>
    </div>
  );
}