import { NextRequest, NextResponse } from 'next/server';

// Temporary NextAuth compatibility layer
export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);

  if (pathname.includes('/session')) {
    // Return mock session for now
    return NextResponse.json({
      user: {
        id: 'demo-user',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'Admin'
      }
    });
  }

  return NextResponse.json({ message: 'NextAuth placeholder' });
}

export async function POST(request: NextRequest) {
  const { pathname } = new URL(request.url);

  if (pathname.includes('/session')) {
    return NextResponse.json({
      user: {
        id: 'demo-user',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'Admin'
      }
    });
  }

  return NextResponse.json({ message: 'NextAuth placeholder' });
}