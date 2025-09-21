import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Transaction, Expense, Vehicle } from '@/models';

// Income calculation utility functions
async function calculateVehicleIncome(vehicleId: string) {
  // Get purchase transaction (IN)
  const purchaseTransaction = await Transaction.findOne({
    vehicleId,
    direction: 'IN',
    deletedAt: { $exists: false }
  });

  // Get sale transaction (OUT)
  const saleTransaction = await Transaction.findOne({
    vehicleId,
    direction: 'OUT',
    deletedAt: { $exists: false }
  });

  // Get all expenses for this vehicle
  const expenses = await Expense.find({
    vehicleId,
    deletedAt: { $exists: false }
  });

  const purchasePrice = purchaseTransaction?.totalPrice || 0;
  const salePrice = saleTransaction?.totalPrice || 0;
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const grossProfit = salePrice - purchasePrice - totalExpenses;
  const profitMargin = salePrice > 0 ? (grossProfit / salePrice) * 100 : 0;

  return {
    vehicleId,
    purchasePrice,
    salePrice,
    totalExpenses,
    grossProfit,
    profitMargin: Math.round(profitMargin * 100) / 100,
    isSold: !!saleTransaction,
    purchaseDate: purchaseTransaction?.date,
    saleDate: saleTransaction?.date
  };
}

async function calculatePeriodIncome(startDate: Date, endDate: Date) {
  // Get all sale transactions in period
  const saleTransactions = await Transaction.find({
    direction: 'OUT',
    date: { $gte: startDate, $lte: endDate },
    deletedAt: { $exists: false }
  }).populate('vehicleId');

  const incomeData = [];
  let totalRevenue = 0;
  let totalProfit = 0;

  for (const sale of saleTransactions) {
    const vehicleIncome = await calculateVehicleIncome(sale.vehicleId.toString());
    incomeData.push(vehicleIncome);
    totalRevenue += vehicleIncome.salePrice;
    totalProfit += vehicleIncome.grossProfit;
  }

  return {
    period: { startDate, endDate },
    totalRevenue,
    totalProfit,
    averageProfit: incomeData.length > 0 ? totalProfit / incomeData.length : 0,
    totalSales: incomeData.length,
    averageProfitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
    vehicles: incomeData
  };
}

async function calculateAllSalesIncome() {
  // Get all sale transactions without date filtering
  const allSaleTransactions = await Transaction.find({
    direction: 'OUT',
    deletedAt: { $exists: false }
  }).populate('vehicleId');

  const incomeData = [];
  let totalRevenue = 0;
  let totalProfit = 0;

  for (const sale of allSaleTransactions) {
    if (!sale.vehicleId) continue;
    const vehicleIncome = await calculateVehicleIncome(sale.vehicleId._id.toString());
    incomeData.push(vehicleIncome);
    totalRevenue += vehicleIncome.salePrice;
    totalProfit += vehicleIncome.grossProfit;
  }

  return {
    period: { all: true },
    totalRevenue,
    totalProfit,
    averageProfit: incomeData.length > 0 ? totalProfit / incomeData.length : 0,
    totalSales: incomeData.length,
    averageProfitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
    vehicles: incomeData
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const period = searchParams.get('period');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const customerId = searchParams.get('customerId');

    // Single vehicle income
    if (vehicleId) {
      const income = await calculateVehicleIncome(vehicleId);
      return NextResponse.json(income);
    }

    // Period-based income
    if (period || (startDate && endDate)) {
      let start: Date, end: Date;

      if (period) {
        const now = new Date();
        switch (period) {
          case 'today':
            start = new Date(now.setHours(0, 0, 0, 0));
            end = new Date(now.setHours(23, 59, 59, 999));
            break;
          case 'week':
            start = new Date(now.setDate(now.getDate() - 7));
            end = new Date();
            break;
          case 'month':
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
          case 'year':
            start = new Date(now.getFullYear(), 0, 1);
            end = new Date(now.getFullYear(), 11, 31);
            break;
          case 'all':
            // For "all" period, we'll calculate income for all sales without date filtering
            const allSalesIncome = await calculateAllSalesIncome();
            return NextResponse.json(allSalesIncome);
          default:
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date();
        }
      } else {
        start = new Date(startDate!);
        end = new Date(endDate!);
      }

      const income = await calculatePeriodIncome(start, end);
      return NextResponse.json(income);
    }

    // Customer-specific income
    if (customerId) {
      const customerSales = await Transaction.find({
        counterpartyId: customerId,
        direction: 'OUT',
        deletedAt: { $exists: false }
      }).populate('vehicleId');

      const customerIncome = [];
      let totalCustomerRevenue = 0;
      let totalCustomerProfit = 0;

      for (const sale of customerSales) {
        const vehicleIncome = await calculateVehicleIncome(sale.vehicleId._id.toString());
        customerIncome.push({
          ...vehicleIncome,
          saleDate: sale.date,
          transactionId: sale._id
        });
        totalCustomerRevenue += vehicleIncome.salePrice;
        totalCustomerProfit += vehicleIncome.grossProfit;
      }

      return NextResponse.json({
        customerId,
        totalRevenue: totalCustomerRevenue,
        totalProfit: totalCustomerProfit,
        totalSales: customerIncome.length,
        averageProfit: customerIncome.length > 0 ? totalCustomerProfit / customerIncome.length : 0,
        vehicles: customerIncome
      });
    }

    // Default: Current month income
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const income = await calculatePeriodIncome(startOfMonth, endOfMonth);
    return NextResponse.json(income);

  } catch (error) {
    console.error('Error calculating income:', error);
    return NextResponse.json(
      { error: 'Failed to calculate income' },
      { status: 500 }
    );
  }
}