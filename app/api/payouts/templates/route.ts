import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

// GET /api/payouts/templates - Get all payout templates
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templates = await prisma.payoutTemplate.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(templates);

  } catch (error) {
    console.error('Error fetching payout templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payout templates' },
      { status: 500 }
    );
  }
}

// POST /api/payouts/templates - Create a new payout template
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can create templates
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can create payout templates' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      type,
      category,
      description,
      defaultAmount,
      defaultMethod,
      requiresApproval,
      approvalLevels,
      allowMemberRequest,
      maxAmount,
      minAmount
    } = body;

    // Validate required fields
    if (!name || !type || !category || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const template = await prisma.payoutTemplate.create({
      data: {
        name,
        type,
        category,
        description,
        defaultAmount: defaultAmount ? parseFloat(defaultAmount) : null,
        defaultMethod,
        requiresApproval: requiresApproval ?? true,
        approvalLevels: approvalLevels || 1,
        allowMemberRequest: allowMemberRequest ?? false,
        maxAmount: maxAmount ? parseFloat(maxAmount) : null,
        minAmount: minAmount ? parseFloat(minAmount) : null
      }
    });

    return NextResponse.json(template, { status: 201 });

  } catch (error) {
    console.error('Error creating payout template:', error);
    return NextResponse.json(
      { error: 'Failed to create payout template' },
      { status: 500 }
    );
  }
}