'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Car,
  Users,
  DollarSign,
  Calendar,
  AlertTriangle,
  Eye,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Clock,
  BarChart3,
  PieChart,
  Target,
  Zap
} from 'lucide-react';
import { formatCurrencyWithRs } from '@/lib/currency';

interface DashboardStats {
  vehicles: {
    total: number;
    inStock: number;
    sold: number;
    booked: number;
    notOwned: number;
  };
  transactions: {
    total: number;
    thisMonth: number;
    thisMonthRevenue: number;
    avgSalePrice: number;
    recentTransactions: any[];
  };
  persons: {
    total: number;
    customers: number;
    dealers: number;
    companies: number;
  };
  expenses: {
    total: number;
    thisMonth: number;
    categories: Record<string, number>;
  };
}

export default function DashboardPage() {
  const [greeting, setGreeting] = useState('Welcome');
  const [currentDate, setCurrentDate] = useState('');
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    vehicles: { total: 0, inStock: 0, sold: 0, booked: 0, notOwned: 0 },
    transactions: { total: 0, thisMonth: 0, thisMonthRevenue: 0, avgSalePrice: 0, recentTransactions: [] },
    persons: { total: 0, customers: 0, dealers: 0, companies: 0 },
    expenses: { total: 0, thisMonth: 0, categories: {} }
  });

  useEffect(() => {
    setMounted(true);
    const currentHour = new Date().getHours();
    const greetingText = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
    setGreeting(greetingText);

    const dateText = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setCurrentDate(dateText);

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [vehiclesRes, transactionsRes, personsRes, expensesRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/transactions'),
        fetch('/api/persons'),
        fetch('/api/expenses')
      ]);

      const vehicles = vehiclesRes.ok ? (await vehiclesRes.json())?.data || [] : [];
      const transactions = transactionsRes.ok ? (await transactionsRes.json())?.data || [] : [];
      const persons = personsRes.ok ? (await personsRes.json())?.data || [] : [];
      const expenses = expensesRes.ok ? (await expensesRes.json())?.data || [] : [];

      // Calculate vehicle stats
      const vehicleStats = {
        total: vehicles.length,
        inStock: vehicles.filter((v: any) => v.ownershipStatus === 'InStock').length,
        sold: vehicles.filter((v: any) => v.ownershipStatus === 'Sold').length,
        booked: vehicles.filter((v: any) => v.ownershipStatus === 'Booked').length,
        notOwned: vehicles.filter((v: any) => v.ownershipStatus === 'NotOwned').length,
      };

      // Calculate transaction stats
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthTransactions = transactions.filter((t: any) => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
      });

      const thisMonthRevenue = thisMonthTransactions
        .filter((t: any) => t.direction === 'OUT')
        .reduce((sum: number, t: any) => sum + (t.basePrice || 0), 0);

      const avgSalePrice = thisMonthTransactions.length > 0
        ? thisMonthRevenue / thisMonthTransactions.filter((t: any) => t.direction === 'OUT').length
        : 0;

      const transactionStats = {
        total: transactions.length,
        thisMonth: thisMonthTransactions.length,
        thisMonthRevenue,
        avgSalePrice,
        recentTransactions: transactions
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
      };

      // Calculate person stats
      const personStats = {
        total: persons.length,
        customers: persons.filter((p: any) => p.type === 'Individual').length,
        dealers: persons.filter((p: any) => p.type === 'Dealer').length,
        companies: persons.filter((p: any) => p.type === 'Company').length,
      };

      // Calculate expense stats
      const thisMonthExpenses = expenses.filter((e: any) => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      });

      const thisMonthExpenseCategories = thisMonthExpenses.reduce((acc: Record<string, number>, e: any) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {});

      // For display purposes, show recent expenses if no expenses this month
      const recentExpenseCategories = expenses.reduce((acc: Record<string, number>, e: any) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {});

      const expenseStats = {
        total: expenses.reduce((sum: number, e: any) => sum + e.amount, 0),
        thisMonth: thisMonthExpenses.reduce((sum: number, e: any) => sum + e.amount, 0),
        categories: Object.keys(thisMonthExpenseCategories).length > 0 ? thisMonthExpenseCategories : recentExpenseCategories
      };

      setStats({
        vehicles: vehicleStats,
        transactions: transactionStats,
        persons: personStats,
        expenses: expenseStats
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const profitMargin = stats.transactions.thisMonthRevenue - stats.expenses.thisMonth;
  const profitPercentage = stats.transactions.thisMonthRevenue > 0
    ? ((profitMargin / stats.transactions.thisMonthRevenue) * 100).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div className="max-w-full 2xl:max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full 2xl:max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-8">
      {/* Header Section */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
              {mounted ? greeting : 'Welcome'}, Welcome! 👋
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Here&apos;s your business performance overview and key insights.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="text-left sm:text-right">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {mounted ? currentDate : ''}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Business Dashboard
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-sm font-medium">
              <Activity className="h-4 w-4" />
              Live Data
            </div>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 lg:p-6 border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-green-700 dark:text-green-300">This Month Revenue</h3>
              <p className="text-xl lg:text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                {formatCurrencyWithRs(stats.transactions.thisMonthRevenue)}
              </p>
              <div className="flex items-center mt-2 text-xs text-green-600 dark:text-green-400">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Profit: {profitPercentage}%
              </div>
            </div>
            <div className="p-3 bg-green-200 dark:bg-green-800 rounded-xl">
              <DollarSign className="h-6 w-6 text-green-700 dark:text-green-300" />
            </div>
          </div>
        </div>

        {/* Vehicle Inventory */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 lg:p-6 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">Vehicle Inventory</h3>
              <p className="text-xl lg:text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                {stats.vehicles.total}
              </p>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                {stats.vehicles.inStock} available
              </div>
            </div>
            <div className="p-3 bg-blue-200 dark:bg-blue-800 rounded-xl">
              <Car className="h-6 w-6 text-blue-700 dark:text-blue-300" />
            </div>
          </div>
        </div>

        {/* Active Customers */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-4 lg:p-6 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Customers</h3>
              <p className="text-xl lg:text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                {stats.persons.total}
              </p>
              <div className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                {stats.persons.customers} individuals
              </div>
            </div>
            <div className="p-3 bg-purple-200 dark:bg-purple-800 rounded-xl">
              <Users className="h-6 w-6 text-purple-700 dark:text-purple-300" />
            </div>
          </div>
        </div>

        {/* Monthly Transactions */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4 lg:p-6 border border-orange-200 dark:border-orange-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-orange-700 dark:text-orange-300">This Month Deals</h3>
              <p className="text-xl lg:text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                {stats.transactions.thisMonth}
              </p>
              <div className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                Avg: {formatCurrencyWithRs(stats.transactions.avgSalePrice)}
              </div>
            </div>
            <div className="p-3 bg-orange-200 dark:bg-orange-800 rounded-xl">
              <BarChart3 className="h-6 w-6 text-orange-700 dark:text-orange-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">

        {/* Vehicle Status Overview */}
        <div className="xl:col-span-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 lg:p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Vehicle Status</h3>
              <Link href="/vehicles" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                View All <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">In Stock</span>
                </div>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">{stats.vehicles.inStock}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Booked</span>
                </div>
                <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{stats.vehicles.booked}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sold</span>
                </div>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">{stats.vehicles.sold}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Not Owned</span>
                </div>
                <span className="text-lg font-bold text-gray-600 dark:text-gray-300">{stats.vehicles.notOwned}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="xl:col-span-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Transactions</h3>
              <Link href="/transactions" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                View All <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-3">
              {stats.transactions.recentTransactions.length > 0 ? (
                stats.transactions.recentTransactions.map((transaction: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        transaction.direction === 'OUT'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}>
                        {transaction.direction === 'OUT' ? '↗' : '↙'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {transaction.direction === 'OUT' ? 'Vehicle Sale' : 'Vehicle Purchase'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${
                      transaction.direction === 'OUT' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {formatCurrencyWithRs(transaction.basePrice)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No recent transactions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 lg:mt-8">

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 lg:p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/vehicles" className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors group">
              <div className="flex items-center gap-3">
                <Car className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-200"> Add Vehicle </span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-blue-600 dark:text-blue-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
            <Link href="/transactions" className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors group">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-300" />
                <span className="text-sm font-medium text-green-700 dark:text-green-200">Record Sale</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>

            <Link href="/persons" className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors group">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-200">Add Customer</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-purple-600 dark:text-purple-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>

            <Link href="/expenses" className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors group">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-200">Add Expense</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-orange-600 dark:text-orange-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 lg:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {stats.expenses.thisMonth > 0 ? 'Monthly Expenses' : 'Recent Expenses'}
            </h3>
            <Link href="/expenses" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
              Details <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {formatCurrencyWithRs(stats.expenses.thisMonth > 0 ? stats.expenses.thisMonth : Object.values(stats.expenses.categories).reduce((sum: number, amount: any) => sum + amount, 0))}
          </div>
          <div className="space-y-2">
            {Object.entries(stats.expenses.categories).slice(0, 4).map(([category, amount]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">{category}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrencyWithRs(amount as number)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Business Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 lg:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <Target className="h-5 w-5 text-indigo-700 dark:text-indigo-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Performance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Monthly Profit</span>
              <span className={`text-sm font-medium ${profitMargin >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrencyWithRs(profitMargin)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Profit Margin</span>
              <span className={`text-sm font-medium ${parseFloat(profitPercentage) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {profitPercentage}%
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Avg Deal Size</span>
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
                {formatCurrencyWithRs(stats.transactions.avgSalePrice)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="block lg:hidden mt-8">
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="text-center">
            <Zap className="h-12 w-12 mx-auto mb-3 text-white/90" />
            <h3 className="text-lg font-semibold mb-2">Growing Strong! 📈</h3>
            <p className="text-sm text-white/90 mb-4">
              Your business is performing well this month. Keep up the excellent work!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/vehicles">
                <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm w-full sm:w-auto">
                  Manage Inventory
                </button>
              </Link>
              <Link href="/transactions">
                <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm w-full sm:w-auto">
                  View Transactions
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}