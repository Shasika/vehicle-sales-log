import { 
  TrendingUp, 
  TrendingDown, 
  Car, 
  CreditCard,
  DollarSign,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import connectDB from '@/lib/mongodb';
import { Transaction, Expense, Vehicle, Person } from '@/models';
import { formatCurrencyWithRs } from '@/lib/currency';

async function getDashboardStats() {
  await connectDB();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    currentMonthTransactions,
    lastMonthTransactions,
    currentMonthExpenses,
    totalVehicles,
    inStockVehicles,
    totalPersons,
  ] = await Promise.all([
    Transaction.find({
      date: { $gte: startOfMonth },
      deletedAt: { $exists: false },
    }).lean(),
    Transaction.find({
      date: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      deletedAt: { $exists: false },
    }).lean(),
    Expense.find({
      date: { $gte: startOfMonth },
      deletedAt: { $exists: false },
    }).lean(),
    Vehicle.countDocuments({ deletedAt: { $exists: false } }),
    Vehicle.countDocuments({ 
      ownershipStatus: 'InStock',
      deletedAt: { $exists: false },
    }),
    Person.countDocuments({ deletedAt: { $exists: false } }),
  ]);

  const currentRevenue = currentMonthTransactions
    .filter(t => t.direction === 'OUT')
    .reduce((sum, t) => sum + t.totalPrice, 0);
    
  const currentCosts = currentMonthTransactions
    .filter(t => t.direction === 'IN')
    .reduce((sum, t) => sum + t.totalPrice, 0);
    
  const currentExpenses = currentMonthExpenses
    .reduce((sum, e) => sum + e.amount, 0);

  const lastRevenue = lastMonthTransactions
    .filter(t => t.direction === 'OUT')
    .reduce((sum, t) => sum + t.totalPrice, 0);

  const revenueChange = lastRevenue > 0
    ? ((currentRevenue - lastRevenue) / lastRevenue) * 100
    : null;

  const netProfit = currentRevenue - currentCosts - currentExpenses;

  return {
    currentRevenue,
    revenueChange,
    netProfit,
    currentExpenses,
    totalVehicles,
    inStockVehicles,
    totalPersons,
    totalSales: currentMonthTransactions.filter(t => t.direction === 'OUT').length,
    totalPurchases: currentMonthTransactions.filter(t => t.direction === 'IN').length,
  };
}

export default async function DashboardStats() {
  const stats = await getDashboardStats();

  const financialStats = [
    {
      title: 'Revenue',
      subtitle: 'This Month',
      value: formatCurrencyWithRs(stats.currentRevenue),
      change: stats.revenueChange,
      icon: DollarSign,
      color: 'blue',
    },
    {
      title: 'Net Profit',
      subtitle: 'Current Period',
      value: formatCurrencyWithRs(stats.netProfit),
      change: null,
      icon: TrendingUp,
      color: 'green',
    },
    {
      title: 'Expenses',
      subtitle: 'This Month',
      value: formatCurrencyWithRs(stats.currentExpenses),
      change: null,
      icon: CreditCard,
      color: 'orange',
    },
  ];

  const businessStats = [
    {
      title: 'Vehicle Stock',
      subtitle: `${stats.inStockVehicles} available of ${stats.totalVehicles} total`,
      value: `${stats.inStockVehicles}`,
      change: null,
      icon: Car,
      color: 'purple',
    },
    {
      title: 'Sales Activity',
      subtitle: `${stats.totalSales} sales, ${stats.totalPurchases} purchases`,
      value: `${stats.totalSales}`,
      change: null,
      icon: TrendingUp,
      color: 'indigo',
    },
    {
      title: 'Customers',
      subtitle: 'Total registered',
      value: stats.totalPersons.toString(),
      change: null,
      icon: Users,
      color: 'pink',
    },
  ];

  const StatCard = ({ stat, isFinancial = false }: { stat: any, isFinancial?: boolean }) => {
    const Icon = stat.icon;
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200 text-blue-600',
      green: 'bg-green-50 border-green-200 text-green-600',
      orange: 'bg-orange-50 border-orange-200 text-orange-600',
      purple: 'bg-purple-50 border-purple-200 text-purple-600',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
      pink: 'bg-pink-50 border-pink-200 text-pink-600',
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-md ${colorClasses[stat.color as keyof typeof colorClasses] || colorClasses.blue}`}>
            <Icon className="h-4 w-4" />
          </div>
          {stat.change !== null && stat.change !== undefined && !isNaN(stat.change) && (
            <div className="flex items-center">
              {stat.change >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={`text-xs font-semibold ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(stat.change).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
          <p className="text-xl font-bold text-gray-900 mb-1">{stat.value}</p>
          <p className="text-xs text-gray-500">{stat.subtitle}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div>
        <div className="flex items-center mb-3">
          <DollarSign className="h-4 w-4 text-green-600 mr-2" />
          <h2 className="text-base font-semibold text-gray-900">Financial Overview</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {financialStats.map((stat) => (
            <StatCard key={stat.title} stat={stat} isFinancial={true} />
          ))}
        </div>
      </div>

      {/* Business Metrics */}
      <div>
        <div className="flex items-center mb-3">
          <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
          <h2 className="text-base font-semibold text-gray-900">Business Metrics</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {businessStats.map((stat) => (
            <StatCard key={stat.title} stat={stat} />
          ))}
        </div>
      </div>
    </div>
  );
}