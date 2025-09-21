import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { authOptions } from '@/lib/auth';
import { canAccess } from '@/lib/auth-utils';
import connectDB from '@/lib/mongodb';
import { Expense } from '@/models';
import { expenseSchema, expenseSearchSchema } from '@/lib/validations';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !canAccess(session.user.role, ['READ'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const validation = expenseSearchSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { 
      page, limit, sortBy = 'date', sortOrder,
      vehicleId, category, startDate, endDate 
    } = validation.data;

    await connectDB();

    let query: any = { deletedAt: { $exists: false } };

    if (vehicleId) query.vehicleId = vehicleId;
    if (category) query.category = category;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const skip = (page - 1) * limit;
    const sortObj: Record<string, 1 | -1> = {};

    // For date sorting, also sort by createdAt to ensure newest entries appear first for same dates
    if (sortBy === 'date') {
      sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
      sortObj['createdAt'] = -1; // Always show newest created first for same dates
    } else {
      sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate('vehicleId', 'registrationNumber make vehicleModel')
        .populate('payeeId', 'fullName businessName type')
        .populate('createdBy', 'name')
        .lean(),
      Expense.countDocuments(query),
    ]);

    return NextResponse.json({
      data: expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Expenses GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
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
    const validation = expenseSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid expense data', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    // Handle user ID - find user by ID or use existing ObjectId from seed data
    let userId;
    if (mongoose.Types.ObjectId.isValid(session.user.id)) {
      userId = new mongoose.Types.ObjectId(session.user.id);
    } else {
      // For demo users, find existing user in database or use default admin user
      const existingUser = await mongoose.connection.collection('users').findOne({
        $or: [
          { email: session.user.email },
          { name: session.user.name }
        ]
      });

      if (existingUser) {
        userId = existingUser._id;
      } else {
        // Use the admin user from seed data as fallback
        const adminUser = await mongoose.connection.collection('users').findOne({ role: 'admin' });
        userId = adminUser ? adminUser._id : new mongoose.Types.ObjectId('68cb73deac9c4854fde43e89'); // Default admin ID from seed
      }
    }

    const expense = new Expense({
      ...validation.data,
      createdBy: userId,
      updatedBy: userId,
    });

    await expense.save();
    
    await expense.populate([
      { path: 'vehicleId', select: 'registrationNumber make vehicleModel' },
      { path: 'payeeId', select: 'fullName businessName type' },
      { path: 'createdBy', select: 'name' },
    ]);

    return NextResponse.json({
      data: expense,
      message: 'Expense created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Expenses POST error:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}