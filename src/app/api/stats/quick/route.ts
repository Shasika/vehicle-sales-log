import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Vehicle, Transaction, Person } from '@/models';

export async function GET() {
  try {
    await connectDB();

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const [
      totalVehicles,
      thisMonthSales,
      totalCustomers,
      pendingTransactions
    ] = await Promise.all([
      Vehicle.countDocuments({ deletedAt: { $exists: false } }),
      Transaction.countDocuments({
        direction: 'OUT',
        createdAt: { $gte: currentMonth },
        deletedAt: { $exists: false }
      }),
      Person.countDocuments({ deletedAt: { $exists: false } }),
      Transaction.countDocuments({
        deletedAt: { $exists: false },
        // You can add more conditions here for what constitutes "pending"
      })
    ]);

    return NextResponse.json({
      totalVehicles,
      thisMonthSales,
      totalCustomers,
      pendingTransactions
    });
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    return NextResponse.json(
      {
        totalVehicles: 0,
        thisMonthSales: 0,
        totalCustomers: 0,
        pendingTransactions: 0
      },
      { status: 500 }
    );
  }
}