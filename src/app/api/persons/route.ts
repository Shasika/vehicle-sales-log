import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { authOptions } from '@/lib/auth';
import { canAccess } from '@/lib/auth-utils';
import connectDB from '@/lib/mongodb';
import { Person } from '@/models';
import { personSchema, searchSchema } from '@/lib/validations';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !canAccess(session.user.role, ['READ'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const validation = searchSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { q, page, limit, sortBy = 'updatedAt', sortOrder } = validation.data;

    await connectDB();

    let query: any = { deletedAt: { $exists: false } };

    if (q) {
      query.$or = [
        { fullName: new RegExp(q, 'i') },
        { businessName: new RegExp(q, 'i') },
        { phone: { $in: [new RegExp(q, 'i')] } },
        { email: new RegExp(q, 'i') },
        { nicOrPassport: new RegExp(q, 'i') },
        { companyRegNo: new RegExp(q, 'i') },
      ];
    }

    const skip = (page - 1) * limit;
    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [persons, total] = await Promise.all([
      Person.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name')
        .lean(),
      Person.countDocuments(query),
    ]);

    return NextResponse.json({
      data: persons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Persons GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch persons' },
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
    const validation = personSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid person data', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    if (validation.data.nicOrPassport) {
      const existingPerson = await Person.findOne({
        nicOrPassport: validation.data.nicOrPassport,
        deletedAt: { $exists: false },
      });

      if (existingPerson) {
        return NextResponse.json(
          { error: 'Person with this NIC/Passport already exists' },
          { status: 409 }
        );
      }
    }

    if (validation.data.companyRegNo) {
      const existingCompany = await Person.findOne({
        companyRegNo: validation.data.companyRegNo,
        deletedAt: { $exists: false },
      });

      if (existingCompany) {
        return NextResponse.json(
          { error: 'Company with this registration number already exists' },
          { status: 409 }
        );
      }
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    
    const person = new Person({
      ...validation.data,
      createdBy: userId,
      updatedBy: userId,
    });

    await person.save();
    await person.populate('createdBy updatedBy', 'name');

    return NextResponse.json({
      data: person,
      message: 'Person created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Persons POST error:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create person' },
      { status: 500 }
    );
  }
}