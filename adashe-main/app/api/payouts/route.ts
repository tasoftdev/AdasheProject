import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const memberId = searchParams.get('memberId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (status) where.status = status;
    if (type) where.type = type;
    if (memberId) where.memberId = memberId;
    
    if (startDate || endDate) {
      where.requestDate = {};
      if (startDate) where.requestDate.gte = new Date(startDate);
      if (endDate) where.requestDate.lte = new Date(endDate);
    }
    if (session.user.role !== 'ADMIN') {
      const member = await prisma.member.findUnique({
        where: { userId: session.user.id }
      });
      if (member) {
        where.memberId = member.id;
      }
    }

    const [payouts, total] = await Promise.all([
      prisma.payout.findMany({
        where,
        skip,
        take: limit,
        orderBy: { requestDate: 'desc' },
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
              memberCode: true,
              email: true
            }
          },
          approvals: {
            orderBy: { level: 'asc' }
          }
        }
      }),
      prisma.payout.count({ where })
    ]);

    return NextResponse.json({
      payouts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching payouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      memberId,
      type,
      category,
      amount,
      description,
      reason,
      paymentMethod,
      bankName,
      accountName,
      accountNumber,
      scheduledDate,
      attachments,
      notes
    } = body;

    if (!memberId || !type || !category || !amount || !description || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      const userMember = await prisma.member.findUnique({
        where: { userId: session.user.id }
      });
      
      if (!userMember || userMember.id !== memberId) {
        return NextResponse.json(
          { error: 'You can only request payouts for yourself' },
          { status: 403 }
        );
      }
    }

    
    const reference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

 
    let requiresApproval = true;
    let approvalLevel = 1;
    
    if (parseFloat(amount) > 100000) {
     
    }
    
    if (parseFloat(amount) > 500000) {
 
    }

    const payout = await prisma.payout.create({
      data: {
        memberId,
        type,
        category,
        amount: parseFloat(amount),
        description,
        reason,
        paymentMethod,
        bankName,
        accountName,
        accountNumber,
        reference,
        requestedBy: session.user.id,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        requiresApproval,
        approvalLevel,
        attachments: attachments ? JSON.stringify(attachments) : null,
        notes
      },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            memberCode: true,
            email: true
          }
        }
      }
    });

  
    if (requiresApproval) {
      for (let level = 1; level <= approvalLevel; level++) {
        await prisma.payoutApproval.create({
          data: {
            payoutId: payout.id,
            level,
            status: 'PENDING',
            approvedBy: '' 
          }
        });
      }
    }

    return NextResponse.json(payout, { status: 201 });

  } catch (error) {
    console.error('Error creating payout:', error);
    return NextResponse.json(
      { error: 'Failed to create payout' },
      { status: 500 }
    );
  }
}