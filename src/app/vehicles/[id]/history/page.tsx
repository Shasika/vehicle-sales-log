'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  User,
  Clock,
  BarChart3,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatCurrencyWithRs } from '@/lib/currency';

interface TransactionCycle {
  cycleNumber: number;
  buyTransaction: any;
  sellTransaction: any;
  profit: number;
  duration: number;
  counterpartyBuy: string;
  counterpartySell: string;
}

interface VehicleHistoryData {
  vehicle: {
    _id: string;
    registrationNumber: string;
    make: string;
    vehicleModel: string;
    year: number;
    ownershipStatus: string;
  };
  cycles: TransactionCycle[];
  incompleteCycle: {
    buyTransaction: any;
    counterpartyBuy: string;
  } | null;
  summary: {
    totalCycles: number;
    totalTransactions: number;
    totalProfit: number;
    averageProfit: number;
    averageDuration: number;
    currentStatus: string;
  };
  allTransactions: any[];
}

export default function VehicleHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<VehicleHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/vehicles/${params.id}/history`);
        if (!response.ok) {
          throw new Error('Failed to fetch vehicle history');
        }
        const historyData = await response.json();
        setData(historyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">Error: {error || 'Failed to load data'}</p>
          <Link href="/vehicles" className="text-blue-600 dark:text-blue-400 hover:underline mt-4 inline-block">
            Back to Vehicles
          </Link>
        </div>
      </div>
    );
  }

  const { vehicle, cycles, incompleteCycle, summary } = data;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href={`/vehicles/${vehicle._id}`}
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vehicle Details
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Transaction History
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
              {vehicle.registrationNumber} • {vehicle.make} {vehicle.vehicleModel} ({vehicle.year})
            </p>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
              vehicle.ownershipStatus === 'InStock' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700' :
              vehicle.ownershipStatus === 'Sold' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700' :
              vehicle.ownershipStatus === 'Booked' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700' :
              'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600'
            }`}>
              {vehicle.ownershipStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Cycles</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{summary.totalCycles}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Profit</p>
                <p className={`text-2xl font-bold ${summary.totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrencyWithRs(summary.totalProfit)}
                </p>
              </div>
              <DollarSign className={`h-8 w-8 ${summary.totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Profit/Cycle</p>
                <p className={`text-2xl font-bold ${summary.averageProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrencyWithRs(summary.averageProfit)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Hold Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {summary.averageDuration} {summary.averageDuration === 1 ? 'day' : 'days'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Incomplete Cycle Alert */}
      {incompleteCycle && (
        <Card className="mb-8 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-200">Current Ownership</h3>
                <p className="text-blue-700 dark:text-blue-300 mt-1">
                  Vehicle purchased from <strong>{incompleteCycle.counterpartyBuy}</strong> on{' '}
                  {format(new Date(incompleteCycle.buyTransaction.date), 'MMM dd, yyyy')} for{' '}
                  <strong>{formatCurrencyWithRs(incompleteCycle.buyTransaction.totalPrice)}</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction Cycles */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Buy/Sell Cycles</h2>

        {cycles.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Activity className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Complete Cycles</h3>
              <p className="text-gray-600 dark:text-gray-300">This vehicle hasn't completed any full buy/sell cycles yet.</p>
            </CardContent>
          </Card>
        ) : (
          cycles.map((cycle) => (
            <Card key={cycle.cycleNumber} className="overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Cycle #{cycle.cycleNumber}
                  </CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-300">Profit</p>
                      <p className={`font-bold ${cycle.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {cycle.profit >= 0 ? '+' : ''}{formatCurrencyWithRs(cycle.profit)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-300">Duration</p>
                      <p className="font-bold text-gray-900 dark:text-gray-100">
                        {cycle.duration} {cycle.duration === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Buy Transaction */}
                  <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
                    <div className="flex items-center space-x-2 mb-3">
                      <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <h4 className="font-semibold text-red-900 dark:text-red-200">Purchase</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Date:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {format(new Date(cycle.buyTransaction.date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">From:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{cycle.counterpartyBuy}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Amount:</span>
                        <span className="font-bold text-red-600 dark:text-red-400">
                          {formatCurrencyWithRs(cycle.buyTransaction.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sell Transaction */}
                  <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                    <div className="flex items-center space-x-2 mb-3">
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <h4 className="font-semibold text-green-900 dark:text-green-200">Sale</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Date:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {format(new Date(cycle.sellTransaction.date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">To:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{cycle.counterpartySell}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Amount:</span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {formatCurrencyWithRs(cycle.sellTransaction.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}