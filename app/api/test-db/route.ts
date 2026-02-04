import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();

    await prisma.$connect();
    const count = await prisma.calculation.count();

    return NextResponse.json({
      status: 'Database connected!',
      totalCalculations: count,
      currentUserId: userId || 'Not logged in',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'Database connection failed',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
