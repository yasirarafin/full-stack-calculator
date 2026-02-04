import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    console.log('POST /api/calculations/sync - userId:', userId);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionHistory } = await request.json();

    console.log('Session history to sync:', sessionHistory?.length || 0);

    if (!Array.isArray(sessionHistory) || sessionHistory.length === 0) {
      return NextResponse.json({ synced: 0 });
    }

    // Create calculations one by one to handle potential duplicates
    let synced = 0;
    for (const calc of sessionHistory) {
      try {
        await prisma.calculation.create({
          data: {
            expression: calc.expression,
            result: calc.result,
            userId: userId,
          },
        });
        synced++;
      } catch (error) {
        console.error('Failed to sync calculation:', error);
        // Continue with next calculation
      }
    }

    console.log('Synced calculations:', synced);

    return NextResponse.json({ synced });
  } catch (error) {
    console.error('POST /api/calculations/sync error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync calculations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
