import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { authOptions } from '@/lib/auth';
import { canAccess } from '@/lib/auth-utils';
import connectDB from '@/lib/mongodb';
import { Transaction, Expense, Vehicle } from '@/models';
import { ProfitCalculator } from '@/lib/profit-calculator';
import { z } from 'zod';

const profitPerVehicleQuerySchema = z.object({
  vehicleId: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !canAccess(session.user.role, ['READ'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validation = profitPerVehicleQuerySchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { vehicleId, from: startDate, to: endDate } = validation.data;

    await connectDB();

    let query = {};
    if (vehicleId) {
      query = { _id: vehicleId, deletedAt: { $exists: false } };
    } else {
      query = { deletedAt: { $exists: false } };
    }

    const vehicles = await Vehicle.find(query).select('_id registrationNumber make vehicleModel').lean();

    const vehicleIds = vehicles.map(v => v._id.toString());

    // Build date filter
    const dateFilter: any = { deletedAt: { $exists: false } };
    if (startDate && endDate) {
      dateFilter.date = { $gte: startDate, $lte: endDate };
    }

    const [transactions, expenses] = await Promise.all([
      Transaction.find({
        vehicleId: { $in: vehicleIds },
        ...dateFilter
      }).lean(),
      Expense.find({
        vehicleId: { $in: vehicleIds },
        ...dateFilter
      }).lean(),
    ]);

    const profitData = vehicles.map(vehicle => {
      const vehicleIdStr = vehicle._id.toString();
      const profitCalc = ProfitCalculator.calculateVehicleProfit(
        vehicleIdStr,
        transactions,
        expenses
      );

      return {
        vehicle: {
          id: vehicle._id,
          registrationNumber: vehicle.registrationNumber,
          make: vehicle.make,
          vehicleModel: vehicle.vehicleModel,
        },
        ...profitCalc,
      };
    });

    const totalProfit = profitData.reduce((sum, item) => sum + item.totalProfit, 0);
    const totalUnrealizedValue = profitData.reduce((sum, item) => sum + (item.unrealizedValue || 0), 0);

    return NextResponse.json({
      data: profitData,
      summary: {
        totalVehicles: vehicles.length,
        totalProfit,
        totalUnrealizedValue,
      },
    });

  } catch (error) {
    console.error('Profit per vehicle report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate profit report' },
      { status: 500 }
    );
  }
}