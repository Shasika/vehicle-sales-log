'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrencyWithRs } from '@/lib/currency';

interface IncomeDisplayProps {
  vehicleId?: string;
  transactionId?: string;
  direction?: 'IN' | 'OUT';
  showDetailed?: boolean;
  className?: string;
}

interface IncomeData {
  grossProfit: number;
  profitMargin: number;
  salePrice: number;
  purchasePrice: number;
  totalExpenses: number;
}

export default function IncomeDisplay({
  vehicleId,
  transactionId,
  direction,
  showDetailed = false,
  className = ""
}: IncomeDisplayProps) {
  const [incomeData, setIncomeData] = useState<IncomeData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicleId && direction === 'OUT') {
      fetchIncomeData();
    }
  }, [vehicleId, direction]);

  const fetchIncomeData = async () => {
    if (!vehicleId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/income?vehicleId=${vehicleId}`);
      if (response.ok) {
        const data = await response.json();
        setIncomeData(data);
      }
    } catch (error) {
      console.error('Error fetching income data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Only show for OUT (sale) transactions
  if (direction !== 'OUT' || !vehicleId) {
    return <div className={className}>-</div>;
  }

  if (loading) {
    return (
      <div className={className}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </div>
    );
  }

  if (!incomeData) {
    return <div className={className}>-</div>;
  }

  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'text-green-600 dark:text-green-400';
    if (profit < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getProfitIcon = (profit: number) => {
    if (profit > 0) return <TrendingUp className="h-3 w-3" />;
    if (profit < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  if (showDetailed) {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className={`flex items-center space-x-1 ${getProfitColor(incomeData.grossProfit)}`}>
          {getProfitIcon(incomeData.grossProfit)}
          <span className="font-medium">
            {formatCurrencyWithRs(incomeData.grossProfit)}
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {incomeData.profitMargin.toFixed(1)}% margin
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Sale: {formatCurrencyWithRs(incomeData.salePrice)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Cost: {formatCurrencyWithRs(incomeData.purchasePrice + incomeData.totalExpenses)}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-1 ${getProfitColor(incomeData.grossProfit)} ${className}`}>
      {getProfitIcon(incomeData.grossProfit)}
      <span className="font-medium">
        {formatCurrencyWithRs(incomeData.grossProfit)}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        ({incomeData.profitMargin.toFixed(1)}%)
      </span>
    </div>
  );
}