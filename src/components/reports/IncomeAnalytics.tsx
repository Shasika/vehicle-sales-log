'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Target, Clock, Award } from 'lucide-react';
import Button from '@/components/ui/Button';
import { formatCurrencyWithRs } from '@/lib/currency';

interface IncomeData {
  totalRevenue: number;
  totalProfit: number;
  averageProfit: number;
  totalSales: number;
  averageProfitMargin: number;
  vehicles: Array<{
    vehicleId: string;
    vehicle: any;
    purchasePrice: number;
    salePrice: number;
    totalExpenses: number;
    grossProfit: number;
    profitMargin: number;
    daysToSell: number;
    saleDate: string;
  }>;
}

interface TopPerformer {
  vehicle: any;
  purchasePrice: number;
  salePrice: number;
  grossProfit: number;
  profitMargin: number;
  daysToSell: number;
}

interface TopPerformersData {
  summary: {
    totalVehicles: number;
    totalRevenue: number;
    totalProfit: number;
    averageProfit: number;
    averageMargin: number;
    averageDaysToSell: number;
  };
  topPerformers: TopPerformer[];
  sortBy: string;
  period: string;
}

export default function IncomeAnalytics() {
  const [incomeData, setIncomeData] = useState<IncomeData | null>(null);
  const [topPerformersData, setTopPerformersData] = useState<TopPerformersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [sortBy, setSortBy] = useState('profit');

  useEffect(() => {
    fetchIncomeData();
    fetchTopPerformers();
  }, [period, sortBy]);

  const fetchIncomeData = async () => {
    try {
      const response = await fetch(`/api/analytics/income?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setIncomeData(data);
      }
    } catch (error) {
      console.error('Error fetching income data:', error);
    }
  };

  const fetchTopPerformers = async () => {
    try {
      const response = await fetch(`/api/analytics/top-performers?period=${period}&sortBy=${sortBy}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setTopPerformersData(data);
      }
    } catch (error) {
      console.error('Error fetching top performers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          <Button
            variant={period === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPeriod('all')}
          >
            All Time
          </Button>
          <Button
            variant={period === 'month' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPeriod('month')}
          >
            This Month
          </Button>
          <Button
            variant={period === 'year' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPeriod('year')}
          >
            This Year
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'profit' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSortBy('profit')}
          >
            By Profit
          </Button>
          <Button
            variant={sortBy === 'margin' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSortBy('margin')}
          >
            By Margin
          </Button>
          <Button
            variant={sortBy === 'speed' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSortBy('speed')}
          >
            By Speed
          </Button>
        </div>
      </div>

      {/* Income Summary Cards */}
      {incomeData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-700 dark:text-green-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrencyWithRs(incomeData.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-700 dark:text-blue-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Profit</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrencyWithRs(incomeData.totalProfit)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {incomeData.averageProfitMargin.toFixed(1)}% margin
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Target className="h-6 w-6 text-purple-700 dark:text-purple-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Average Profit</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrencyWithRs(incomeData.averageProfit)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Per vehicle
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Award className="h-6 w-6 text-orange-700 dark:text-orange-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {incomeData.totalSales}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Vehicles sold
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Performers */}
      {topPerformersData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Top Performing Vehicles
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Sorted by {sortBy === 'profit' ? 'Profit' : sortBy === 'margin' ? 'Margin' : 'Sale Speed'}
            </div>
          </div>

          <div className="space-y-4">
            {topPerformersData.topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {performer.vehicle?.make} {performer.vehicle?.vehicleModel}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {performer.vehicle?.registrationNumber}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrencyWithRs(performer.grossProfit)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {performer.profitMargin.toFixed(1)}% margin
                    {performer.daysToSell > 0 && ` • ${performer.daysToSell} days`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {topPerformersData.summary.totalVehicles}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Sold</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrencyWithRs(topPerformersData.summary.averageProfit)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg Profit</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {topPerformersData.summary.averageMargin.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg Margin</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {Math.round(topPerformersData.summary.averageDaysToSell)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg Days</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}