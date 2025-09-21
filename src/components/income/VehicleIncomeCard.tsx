'use client';

import { TrendingUp, DollarSign } from 'lucide-react';
import IncomeDisplay from './IncomeDisplay';

interface VehicleIncomeCardProps {
  vehicleId: string;
  ownershipStatus: string;
}

export default function VehicleIncomeCard({ vehicleId, ownershipStatus }: VehicleIncomeCardProps) {
  // Only show profit/loss for sold vehicles
  if (ownershipStatus !== 'Sold') {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profit/Loss Analysis</h2>
      </div>

      <div className="space-y-4">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Financial Performance</span>
          <div className="mt-2">
            <IncomeDisplay
              vehicleId={vehicleId}
              direction="OUT"
              showDetailed={true}
              className="text-base"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <DollarSign className="h-3 w-3" />
            <span>Profit = Sale Price - Purchase Price - Total Expenses</span>
          </div>
        </div>
      </div>
    </div>
  );
}