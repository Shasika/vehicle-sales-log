import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { authOptions } from '@/lib/auth';
import { canAccess } from '@/lib/auth-utils';
import connectDB from '@/lib/mongodb';
import { Transaction, Vehicle } from '@/models';
import { transactionSchema, transactionSearchSchema } from '@/lib/validations';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !canAccess(session.user.role, ['READ'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validation = transactionSearchSchema.safeParse(params);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const {
      page = 1,
      limit = 20,
      direction,
      vehicleId,
      counterpartyId,
      startDate,
      endDate,
      populate = ''
    } = validation.data;

    let query: any = { deletedAt: { $exists: false } };

    if (direction) query.direction = direction;
    if (vehicleId) query.vehicleId = vehicleId;
    if (counterpartyId) query.counterpartyId = counterpartyId;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    let queryBuilder = Transaction.find(query)
      .sort({ createdAt: -1, date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    if (populate.includes('vehicleId')) {
      queryBuilder = queryBuilder.populate('vehicleId', 'registrationNumber make vehicleModel');
    }
    if (populate.includes('counterpartyId')) {
      queryBuilder = queryBuilder.populate('counterpartyId', 'fullName businessName type');
    }

    const [transactions, total] = await Promise.all([
      queryBuilder.exec(),
      Transaction.countDocuments(query)
    ]);

    // Ensure proper JSON serialization of populated data
    const serializedTransactions = JSON.parse(JSON.stringify(transactions));

    return NextResponse.json({
      data: serializedTransactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Transactions GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !canAccess(session.user.role, ['WRITE'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = transactionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid transaction data', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const vehicle = await Vehicle.findById(validation.data.vehicleId);
    if (!vehicle || vehicle.deletedAt) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    const { direction, vehicleId } = validation.data;

    if (direction === 'OUT' && vehicle.ownershipStatus === 'NotOwned') {
      throw new Error('Cannot sell a vehicle that is not owned');
    }

    let previousTransactionId;
    if (direction === 'OUT') {
      const lastInTransaction = await Transaction.findOne({
        vehicleId,
        direction: 'IN',
        deletedAt: { $exists: false },
      }).sort({ date: -1 });

      if (lastInTransaction) {
        const existingOutTransaction = await Transaction.findOne({
          previousTransactionId: lastInTransaction._id,
          direction: 'OUT',
          deletedAt: { $exists: false },
        });

        if (!existingOutTransaction) {
          previousTransactionId = lastInTransaction._id;
        }
      }
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);

    const transaction = new Transaction({
      ...validation.data,
      previousTransactionId,
      createdBy: userId,
      updatedBy: userId,
    });

    await transaction.save();

    let newStatus = vehicle.ownershipStatus;
    if (direction === 'IN') {
      newStatus = 'InStock';
    } else if (direction === 'OUT') {
      newStatus = 'Sold';
    }

    await Vehicle.findByIdAndUpdate(
      vehicleId,
      {
        ownershipStatus: newStatus,
        updatedBy: userId,
      }
    );

    await transaction.populate([
      { path: 'vehicleId', select: 'registrationNumber make vehicleModel' },
      { path: 'counterpartyId', select: 'fullName businessName type' },
      { path: 'createdBy', select: 'name' },
    ]);

    return NextResponse.json({
      data: transaction,
      message: 'Transaction created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Transactions POST error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}