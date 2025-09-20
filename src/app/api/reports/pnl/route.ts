import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { authOptions } from '@/lib/auth';
import { canAccess } from '@/lib/auth-utils';
import connectDB from '@/lib/mongodb';
import { Transaction, Expense } from '@/models';
import { ProfitCalculator } from '@/lib/profit-calculator';
import { z } from 'zod';

const pnlQuerySchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  period: z.enum(['daily', 'weekly', 'monthly']).optional().default('monthly'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !canAccess(session.user.role, ['READ'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const validation = pnlQuerySchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { from: startDate, to: endDate, period } = validation.data;

    await connectDB();

    const [transactions, expenses] = await Promise.all([
      Transaction.find({ 
        date: { $gte: startDate, $lte: endDate },
        deletedAt: { $exists: false }
      }).lean(),
      Expense.find({ 
        date: { $gte: startDate, $lte: endDate },
        deletedAt: { $exists: false }
      }).lean(),
    ]);

    const overallPnL = ProfitCalculator.calculatePeriodProfit(
      transactions,
      expenses,
      startDate,
      endDate
    );

    const periodBreakdown = generatePeriodBreakdown(
      transactions,
      expenses,
      startDate,
      endDate,
      period
    );

    const expensesByCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      data: {
        period: {
          startDate,
          endDate,
          periodType: period,
        },
        overall: overallPnL,
        breakdown: periodBreakdown,
        expensesByCategory,
      },
    });

  } catch (error) {
    console.error('P&L report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate P&L report' },
      { status: 500 }
    );
  }
}

function generatePeriodBreakdown(
  transactions: any[],
  expenses: any[],
  startDate: Date,
  endDate: Date,
  period: 'daily' | 'weekly' | 'monthly'
) {
  const periods: Array<{
    period: string;
    startDate: Date;
    endDate: Date;
    revenue: number;
    costs: number;
    expenses: number;
    netProfit: number;
    transactionCount: { in: number; out: number };
  }> = [];

  let currentDate = new Date(startDate);
  let iterationCount = 0;
  const maxIterations = period === 'daily' ? 366 : period === 'weekly' ? 53 : 24; // Safety limit
  
  while (currentDate <= endDate && iterationCount < maxIterations) {
    let periodEnd: Date;
    let periodLabel: string;

    switch (period) {
      case 'daily':
        periodEnd = new Date(currentDate);
        periodEnd.setDate(periodEnd.getDate() + 1);
        periodLabel = currentDate.toISOString().split('T')[0];
        currentDate = new Date(periodEnd);
        break;
      case 'weekly':
        periodEnd = new Date(currentDate);
        periodEnd.setDate(periodEnd.getDate() + 7);
        periodLabel = `Week of ${currentDate.toISOString().split('T')[0]}`;
        currentDate = new Date(periodEnd);
        break;
      case 'monthly':
        periodEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        periodLabel = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        currentDate = new Date(periodEnd);
        break;
    }

    if (periodEnd > endDate) {
      periodEnd = new Date(endDate);
    }

    const periodPnL = ProfitCalculator.calculatePeriodProfit(
      transactions,
      expenses,
      new Date(currentDate.getTime() - (periodEnd.getTime() - currentDate.getTime())),
      periodEnd
    );

    periods.push({
      period: periodLabel,
      startDate: new Date(currentDate.getTime() - (periodEnd.getTime() - currentDate.getTime())),
      endDate: new Date(periodEnd),
      ...periodPnL,
    });

    iterationCount++;
  }

  return periods;
}