import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Person } from '@/models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    
    const person = await Person.findById(id).lean();

    if (!person || person.deletedAt) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: person });
  } catch (error) {
    console.error('Error fetching person:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    // Handle empty string values for unique fields - convert to null or undefined
    const updateData = { ...body, updatedAt: new Date() };

    // Convert empty strings to null for unique fields to avoid duplicate key errors
    if (updateData.nicOrPassport === '') {
      updateData.nicOrPassport = null;
    }
    if (updateData.email === '') {
      updateData.email = null;
    }
    if (updateData.companyRegNo === '') {
      updateData.companyRegNo = null;
    }

    const person = await Person.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: person });
  } catch (error: any) {
    console.error('Error updating person:', error);
    if (error.code === 11000) {
      // Handle duplicate key errors specifically
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json({
        error: `A person with this ${field} already exists`
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    
    const person = await Person.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    );

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Person deleted successfully' });
  } catch (error) {
    console.error('Error deleting person:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}