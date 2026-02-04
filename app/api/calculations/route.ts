import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();

    console.log('GET /api/calculations - userId:', userId);

    if (!userId) {
      console.log('No userId, returning empty array');
      return NextResponse.json([]);
    }

    const calculations = await prisma.calculation.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    console.log('Found calculations:', calculations.length);

    return NextResponse.json(calculations);
  } catch (error) {
    console.error('GET /api/calculations error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch calculations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    console.log('POST /api/calculations - userId:', userId);

    if (!userId) {
      console.log('No userId, returning 401');
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);

    const { expression, result } = body;

    if (!expression || !result) {
      return NextResponse.json(
        { error: 'Missing expression or result' },
        { status: 400 }
      );
    }

    const calculation = await prisma.calculation.create({
      data: {
        expression,
        result,
        userId,
      },
    });

    console.log('Created calculation:', calculation.id);

    return NextResponse.json(calculation);
  } catch (error) {
    console.error('POST /api/calculations error:', error);
    return NextResponse.json(
      {
        error: 'Failed to save calculation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();

    console.log('DELETE /api/calculations - userId:', userId);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await prisma.calculation.deleteMany({
      where: {
        userId: userId,
      },
    });

    console.log('Deleted calculations:', result.count);

    return NextResponse.json({ success: true, deleted: result.count });
  } catch (error) {
    console.error('DELETE /api/calculations error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete calculations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
