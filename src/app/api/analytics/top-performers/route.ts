import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Transaction, Expense, Vehicle } from '@/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'profit'; // profit, margin, revenue
    const period = searchParams.get('period') || 'all'; // all, month, year

    // Get date range based on period
    let dateFilter = {};
    if (period !== 'all') {
      const now = new Date();
      let startDate: Date;

      if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1);
      } else {
        startDate = new Date(0); // All time
      }

      dateFilter = { date: { $gte: startDate } };
    }
    // For 'all' period, we don't apply any date filter

    // Get all sold vehicles in the period
    const soldTransactions = await Transaction.find({
      direction: 'OUT',
      deletedAt: { $exists: false },
      ...dateFilter
    }).populate('vehicleId').populate('counterpartyId');

    const performanceData = [];

    for (const sale of soldTransactions) {
      if (!sale.vehicleId) continue;

      const vehicleId = sale.vehicleId._id.toString();

      // Get purchase transaction
      const purchase = await Transaction.findOne({
        vehicleId,
        direction: 'IN',
        deletedAt: { $exists: false }
      });

      // Get expenses
      const expenses = await Expense.find({
        vehicleId,
        deletedAt: { $exists: false }
      });

      const purchasePrice = purchase?.totalPrice || 0;
      const salePrice = sale.totalPrice;
      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const grossProfit = salePrice - purchasePrice - totalExpenses;
      const profitMargin = salePrice > 0 ? (grossProfit / salePrice) * 100 : 0;

      // Calculate days to sell
      const daysToSell = purchase && sale.date && purchase.date
        ? Math.ceil((sale.date.getTime() - purchase.date.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      performanceData.push({
        vehicleId,
        vehicle: sale.vehicleId,
        customer: sale.counterpartyId,
        purchasePrice,
        salePrice,
        totalExpenses,
        grossProfit,
        profitMargin: Math.round(profitMargin * 100) / 100,
        purchaseDate: purchase?.date,
        saleDate: sale.date,
        daysToSell,
        transactionId: sale._id
      });
    }

    // Sort based on criteria
    let sortedData;
    switch (sortBy) {
      case 'margin':
        sortedData = performanceData.sort((a, b) => b.profitMargin - a.profitMargin);
        break;
      case 'revenue':
        sortedData = performanceData.sort((a, b) => b.salePrice - a.salePrice);
        break;
      case 'speed':
        sortedData = performanceData
          .filter(item => item.daysToSell > 0)
          .sort((a, b) => a.daysToSell - b.daysToSell);
        break;
      default: // profit
        sortedData = performanceData.sort((a, b) => b.grossProfit - a.grossProfit);
    }

    // Calculate summary stats
    const summary = {
      totalVehicles: performanceData.length,
      totalRevenue: performanceData.reduce((sum, item) => sum + item.salePrice, 0),
      totalProfit: performanceData.reduce((sum, item) => sum + item.grossProfit, 0),
      averageProfit: performanceData.length > 0
        ? performanceData.reduce((sum, item) => sum + item.grossProfit, 0) / performanceData.length
        : 0,
      averageMargin: performanceData.length > 0
        ? performanceData.reduce((sum, item) => sum + item.profitMargin, 0) / performanceData.length
        : 0,
      averageDaysToSell: performanceData.filter(item => item.daysToSell > 0).length > 0
        ? performanceData.filter(item => item.daysToSell > 0).reduce((sum, item) => sum + item.daysToSell, 0) / performanceData.filter(item => item.daysToSell > 0).length
        : 0
    };

    return NextResponse.json({
      summary,
      topPerformers: sortedData.slice(0, limit),
      sortBy,
      period,
      total: performanceData.length
    });

  } catch (error) {
    console.error('Error fetching top performers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top performers' },
      { status: 500 }
    );
  }
}