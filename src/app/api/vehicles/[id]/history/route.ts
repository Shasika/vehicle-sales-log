import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Transaction, Vehicle } from '@/models';

interface TransactionCycle {
  cycleNumber: number;
  buyTransaction: any;
  sellTransaction: any;
  profit: number;
  duration: number; // days between buy and sell
  counterpartyBuy: string;
  counterpartySell: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();

    // Get vehicle details
    const vehicle = await Vehicle.findById(id).lean();
    if (!vehicle || vehicle.deletedAt) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Get all transactions for this vehicle, ordered by date
    const transactions = await Transaction.find({
      vehicleId: id,
      deletedAt: { $exists: false }
    })
      .populate('counterpartyId', 'fullName businessName type')
      .sort({ date: 1 })
      .lean();

    console.log(`Vehicle ID: ${id}`);
    console.log(`Found ${transactions.length} transactions for this vehicle`);
    console.log('Transactions:', transactions.map(t => ({ id: t._id, direction: t.direction, date: t.date, totalPrice: t.totalPrice })));

    // Group transactions into buy/sell cycles
    const cycles: TransactionCycle[] = [];
    let currentBuy: any = null;
    let cycleNumber = 1;

    for (const transaction of transactions) {
      if (transaction.direction === 'IN') {
        // This is a purchase
        currentBuy = transaction;
      } else if (transaction.direction === 'OUT' && currentBuy) {
        // This is a sale, complete the cycle
        const counterpartyBuy = (currentBuy.counterpartyId as any)?.fullName ||
                               (currentBuy.counterpartyId as any)?.businessName ||
                               'Unknown';
        const counterpartySell = (transaction.counterpartyId as any)?.fullName ||
                                (transaction.counterpartyId as any)?.businessName ||
                                'Unknown';

        const profit = transaction.totalPrice - currentBuy.totalPrice;
        const duration = Math.ceil(
          (new Date(transaction.date).getTime() - new Date(currentBuy.date).getTime()) /
          (1000 * 60 * 60 * 24)
        );

        cycles.push({
          cycleNumber,
          buyTransaction: currentBuy,
          sellTransaction: transaction,
          profit,
          duration,
          counterpartyBuy,
          counterpartySell,
        });

        cycleNumber++;
        currentBuy = null;
      }
    }

    // Calculate summary statistics
    const totalProfit = cycles.reduce((sum, cycle) => sum + cycle.profit, 0);
    const averageProfit = cycles.length > 0 ? totalProfit / cycles.length : 0;
    const averageDuration = cycles.length > 0
      ? cycles.reduce((sum, cycle) => sum + cycle.duration, 0) / cycles.length
      : 0;

    // Check if there's an incomplete cycle (bought but not sold)
    const hasIncompleteCycle = currentBuy !== null;

    return NextResponse.json({
      vehicle: {
        _id: vehicle._id,
        registrationNumber: vehicle.registrationNumber,
        make: vehicle.make,
        vehicleModel: vehicle.vehicleModel,
        year: vehicle.year,
        ownershipStatus: vehicle.ownershipStatus,
      },
      cycles,
      incompleteCycle: hasIncompleteCycle ? {
        buyTransaction: currentBuy,
        counterpartyBuy: currentBuy?.counterpartyId?.fullName ||
                        currentBuy?.counterpartyId?.businessName ||
                        'Unknown',
      } : null,
      summary: {
        totalCycles: cycles.length,
        totalTransactions: transactions.length,
        totalProfit,
        averageProfit,
        averageDuration: Math.round(averageDuration),
        currentStatus: vehicle.ownershipStatus,
      },
      allTransactions: transactions,
    });
  } catch (error) {
    console.error('Error fetching vehicle history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}