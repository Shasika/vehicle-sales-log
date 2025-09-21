'use client';

import { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import { TrendingUp, TrendingDown, DollarSign, Car, Users, Receipt, BarChart3, Calendar, Download, Target } from 'lucide-react';
import Button from '@/components/ui/Button';
import DatePicker from '@/components/ui/DatePicker';
import { formatCurrencyWithRs } from '@/lib/currency';
import IncomeAnalytics from './IncomeAnalytics';

interface ReportData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  vehiclesSold: number;
  vehiclesPurchased: number;
  monthlyData: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
  topPerformers: Array<{
    vehicle: string;
    profit: number;
  }>;
}

export default function ReportsDashboard() {
  const [reportData, setReportData] = useState<ReportData>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    vehiclesSold: 0,
    vehiclesPurchased: 0,
    monthlyData: [],
    categoryBreakdown: [],
    topPerformers: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    from: subMonths(new Date(), 6),
    to: new Date(),
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Fetch P&L data
      const pnlResponse = await fetch(`/api/reports/pnl?from=${format(dateRange.from, 'yyyy-MM-dd')}&to=${format(dateRange.to, 'yyyy-MM-dd')}`);
      const pnlData = pnlResponse.ok ? await pnlResponse.json() : null;

      // Fetch profit per vehicle data
      const profitResponse = await fetch(`/api/reports/profit-per-vehicle?from=${format(dateRange.from, 'yyyy-MM-dd')}&to=${format(dateRange.to, 'yyyy-MM-dd')}`);
      const profitData = profitResponse.ok ? await profitResponse.json() : null;

      // Extract the actual data from API responses
      const pnlOverall = pnlData?.data?.overall || {};
      const pnlBreakdown = pnlData?.data?.breakdown || [];
      const expensesByCategory = pnlData?.data?.expensesByCategory || {};
      const profitVehicles = profitData?.data || [];

      // Convert expenses by category object to array
      const categoryBreakdown = Object.entries(expensesByCategory).map(([category, amount]) => ({
        category,
        amount: amount as number,
        count: 1, // We don't have count info, so default to 1
      }));

      // Convert monthly breakdown to expected format
      const monthlyData = pnlBreakdown.map((period: any) => ({
        month: period.period,
        revenue: period.revenue,
        expenses: period.expenses,
        profit: period.netProfit,
      }));

      // Convert profit data to top performers format
      const topPerformers = profitVehicles
        .filter((item: any) => item.totalProfit > 0)
        .sort((a: any, b: any) => b.totalProfit - a.totalProfit)
        .slice(0, 5)
        .map((item: any) => ({
          vehicle: `${item.vehicle.make} ${item.vehicle.vehicleModel} (${item.vehicle.registrationNumber})`,
          profit: item.totalProfit,
        }));

      // Aggregate the data
      setReportData({
        totalRevenue: pnlOverall?.revenue || 0,
        totalExpenses: (pnlOverall?.costs || 0) + (pnlOverall?.expenses || 0),
        netProfit: pnlOverall?.netProfit || 0,
        vehiclesSold: pnlOverall?.transactionCount?.out || 0,
        vehiclesPurchased: pnlOverall?.transactionCount?.in || 0,
        monthlyData,
        categoryBreakdown,
        topPerformers,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };


  const getProfitTrend = () => {
    if (reportData.monthlyData.length < 2) return null;
    const current = reportData.monthlyData[reportData.monthlyData.length - 1]?.profit || 0;
    const previous = reportData.monthlyData[reportData.monthlyData.length - 2]?.profit || 0;
    const change = current - previous;
    const percentage = previous !== 0 ? (change / Math.abs(previous)) * 100 : 0;
    
    return {
      change,
      percentage,
      isPositive: change >= 0,
    };
  };

  const exportReport = async (exportFormat: 'csv' | 'pdf' | 'html') => {
    try {
      const response = await fetch(`/api/reports/export?format=${exportFormat}&from=${format(dateRange.from, 'yyyy-MM-dd')}&to=${format(dateRange.to, 'yyyy-MM-dd')}`);
      if (response.ok) {
        // Handle all formats as downloads now that PDF is properly generated
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vehicle-sales-report-${format(dateRange.from, 'yyyy-MM-dd')}-to-${format(dateRange.to, 'yyyy-MM-dd')}.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Export failed:', response.status, response.statusText);
        alert('Export failed. Please try again.');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Export failed. Please try again.');
    }
  };

  const profitTrend = getProfitTrend();

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-1" />
            P&L Overview
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'income'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Target className="h-4 w-4 inline mr-1" />
            Income Analytics
          </button>
        </nav>
      </div>

      {/* Income Analytics Tab */}
      {activeTab === 'income' && (
        <IncomeAnalytics />
      )}

      {/* P&L Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Date Range and Export Controls */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <DatePicker
            label="From"
            value={dateRange.from}
            onChange={(value) => setDateRange({ ...dateRange, from: value || new Date() })}
          />
          <DatePicker
            label="To"
            value={dateRange.to}
            onChange={(value) => setDateRange({ ...dateRange, to: value || new Date() })}
          />
        </div>

        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => exportReport('csv')}>
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="h-4 w-4 mr-1" />
            Export PDF
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportReport('html')}>
            <Download className="h-4 w-4 mr-1" />
            Export HTML
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrencyWithRs(reportData.totalRevenue)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrencyWithRs(reportData.totalExpenses)}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Profit</p>
              <p className={`text-2xl font-bold ${reportData.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrencyWithRs(reportData.netProfit)}
              </p>
              {profitTrend && (
                <div className={`flex items-center mt-1 text-sm ${profitTrend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {profitTrend.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(profitTrend.percentage).toFixed(1)}% vs last month
                </div>
              )}
            </div>
            <DollarSign className={`h-8 w-8 ${reportData.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vehicles Traded</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {reportData.vehiclesSold + reportData.vehiclesPurchased}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {reportData.vehiclesSold} sold • {reportData.vehiclesPurchased} bought
              </p>
            </div>
            <Car className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300" />
            Monthly Performance
          </h3>

          <div className="space-y-4">
            {reportData.monthlyData.slice(-6).map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{month.month}</span>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${month.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrencyWithRs(month.profit)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatCurrencyWithRs(month.revenue)} revenue
                  </p>
                </div>
              </div>
            ))}

            {reportData.monthlyData.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No monthly data available</p>
            )}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Receipt className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300" />
            Expense Categories
          </h3>

          <div className="space-y-4">
            {reportData.categoryBreakdown.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{category.category}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{category.count} expenses</p>
                </div>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {formatCurrencyWithRs(category.amount)}
                </p>
              </div>
            ))}

            {reportData.categoryBreakdown.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No expense data available</p>
            )}
          </div>
        </div>

        {/* Top Performing Vehicles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Car className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300" />
            Top Performers
          </h3>

          <div className="space-y-4">
            {reportData.topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{performer.vehicle}</span>
                </div>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {formatCurrencyWithRs(performer.profit)}
                </p>
              </div>
            ))}

            {reportData.topPerformers.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No vehicle data available</p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300" />
            Quick Stats
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Average Profit per Vehicle</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {reportData.vehiclesSold > 0
                  ? formatCurrencyWithRs(reportData.netProfit / reportData.vehiclesSold)
                  : formatCurrencyWithRs(0)
                }
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {reportData.totalRevenue > 0
                  ? `${((reportData.netProfit / reportData.totalRevenue) * 100).toFixed(1)}%`
                  : '0%'
                }
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Days in Period</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {Math.ceil((new Date(dateRange.to).getTime() - new Date(dateRange.from).getTime()) / (1000 * 60 * 60 * 24))}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Daily Revenue</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrencyWithRs(
                  reportData.totalRevenue /
                  Math.max(1, Math.ceil((new Date(dateRange.to).getTime() - new Date(dateRange.from).getTime()) / (1000 * 60 * 60 * 24)))
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );
}