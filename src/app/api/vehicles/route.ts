import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { authOptions } from '@/lib/auth';
import { canAccess } from '@/lib/auth-utils';
import connectDB from '@/lib/mongodb';
import { Vehicle } from '@/models';
import { vehicleSchema, vehicleSearchSchema } from '@/lib/validations';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !canAccess(session.user.role, ['READ'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const validation = vehicleSearchSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { 
      q, page, limit, sortBy = 'updatedAt', sortOrder,
      make, model, year, status, minYear, maxYear 
    } = validation.data;

    await connectDB();

    let query: any = { deletedAt: { $exists: false } };

    if (q) {
      if (/^[A-Z0-9-]+$/.test(q.toUpperCase())) {
        query.registrationNumber = new RegExp(q, 'i');
      } else {
        query.$or = [
          { make: new RegExp(q, 'i') },
          { vehicleModel: new RegExp(q, 'i') },
          { tags: { $in: [new RegExp(q, 'i')] } },
        ];
      }
    }

    if (make) query.make = new RegExp(make, 'i');
    if (model) query.vehicleModel = new RegExp(model, 'i');
    if (year) query.year = year;
    if (status) {
      if (Array.isArray(status)) {
        query.ownershipStatus = { $in: status };
      } else {
        query.ownershipStatus = status;
      }
    }
    if (minYear) query.year = { ...query.year, $gte: minYear };
    if (maxYear) query.year = { ...query.year, $lte: maxYear };

    const skip = (page - 1) * limit;
    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [vehicles, total] = await Promise.all([
      Vehicle.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name')
        .lean(),
      Vehicle.countDocuments(query),
    ]);

    return NextResponse.json({
      data: vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Vehicles GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
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
    const validation = vehicleSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid vehicle data', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const existingVehicle = await Vehicle.findOne({
      registrationNumber: validation.data.registrationNumber.toUpperCase(),
      deletedAt: { $exists: false },
    });

    if (existingVehicle) {
      // If vehicle exists and is sold, allow "reactivation" by updating it
      if (existingVehicle.ownershipStatus === 'Sold') {
        const userId = new mongoose.Types.ObjectId(session.user.id);

        // Update the existing vehicle with new information and set status to InStock
        const updatedVehicle = await Vehicle.findByIdAndUpdate(
          existingVehicle._id,
          {
            ...validation.data,
            registrationNumber: validation.data.registrationNumber.toUpperCase(),
            ownershipStatus: 'InStock', // Reactivate the vehicle
            updatedBy: userId,
          },
          { new: true }
        );

        return NextResponse.json({
          data: updatedVehicle,
          message: 'Vehicle reactivated successfully',
          reactivated: true,
        }, { status: 200 });
      } else {
        // Vehicle exists and is not sold (InStock, Booked, etc.)
        return NextResponse.json(
          {
            error: 'Vehicle with this registration number already exists and is currently active',
            currentStatus: existingVehicle.ownershipStatus
          },
          { status: 409 }
        );
      }
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    
    const vehicle = new Vehicle({
      ...validation.data,
      registrationNumber: validation.data.registrationNumber.toUpperCase(),
      createdBy: userId,
      updatedBy: userId,
    });

    await vehicle.save();
    await vehicle.populate('createdBy updatedBy', 'name');

    return NextResponse.json({
      data: vehicle,
      message: 'Vehicle created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Vehicles POST error:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create vehicle' },
      { status: 500 }
    );
  }
}