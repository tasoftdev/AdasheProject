import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

// GET /api/payouts/[id] - Get specific payout details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payout = await prisma.payout.findUnique({
      where: { id: params.id },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            memberCode: true,
            email: true,
            phone: true
          }
        },
        approvals: {
          orderBy: { level: 'asc' }
        }
      }
    });

    if (!payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }

    // Check if user can view this payout
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      const member = await prisma.member.findUnique({
        where: { userId: session.user.id }
      });
      
      if (!member || member.id !== payout.memberId) {
        return NextResponse.json(
          { error: 'You can only view your own payouts' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(payout);

  } catch (error) {
    console.error('Error fetching payout:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payout' },
      { status: 500 }
    );
  }
}

// PUT /api/payouts/[id] - Update payout (approve, reject, process)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins and managers can update payouts
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, comments, level } = body;

    const payout = await prisma.payout.findUnique({
      where: { id: params.id },
      include: { approvals: true }
    });

    if (!payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }

    let updatedPayout;

    switch (action) {
      case 'approve':
        if (!level) {
          return NextResponse.json(
            { error: 'Approval level is required' },
            { status: 400 }
          );
        }

        // Update the specific approval level
        await prisma.payoutApproval.update({
          where: {
            payoutId_level: {
              payoutId: params.id,
              level: parseInt(level)
            }
          },
          data: {
            status: 'APPROVED',
            approvedBy: session.user.id,
            comments,
            approvedAt: new Date()
          }
        });

        // Check if all required approvals are completed
        const approvals = await prisma.payoutApproval.findMany({
          where: { payoutId: params.id }
        });

        const allApproved = approvals.every(a => a.status === 'APPROVED');
        
        if (allApproved) {
          updatedPayout = await prisma.payout.update({
            where: { id: params.id },
            data: {
              status: 'APPROVED',
              approvedBy: session.user.id,
              approvedDate: new Date()
            },
            include: {
              member: {
                select: {
                  firstName: true,
                  lastName: true,
                  memberCode: true,
                  email: true
                }
              },
              approvals: true
            }
          });
        } else {
          // Just return updated payout without status change
          updatedPayout = await prisma.payout.findUnique({
            where: { id: params.id },
            include: {
              member: {
                select: {
                  firstName: true,
                  lastName: true,
                  memberCode: true,
                  email: true
                }
              },
              approvals: true
            }
          });
        }
        break;

      case 'reject':
        await prisma.payoutApproval.updateMany({
          where: { payoutId: params.id },
          data: {
            status: 'REJECTED',
            approvedBy: session.user.id,
            comments,
            approvedAt: new Date()
          }
        });

        updatedPayout = await prisma.payout.update({
          where: { id: params.id },
          data: {
            status: 'REJECTED',
            approvedBy: session.user.id,
            approvedDate: new Date()
          },
          include: {
            member: {
              select: {
                firstName: true,
                lastName: true,
                memberCode: true,
                email: true
              }
            },
            approvals: true
          }
        });
        break;

      case 'process':
        if (payout.status !== 'APPROVED') {
          return NextResponse.json(
            { error: 'Payout must be approved before processing' },
            { status: 400 }
          );
        }

        updatedPayout = await prisma.payout.update({
          where: { id: params.id },
          data: {
            status: 'PROCESSING',
            processedBy: session.user.id,
            processedDate: new Date()
          },
          include: {
            member: {
              select: {
                firstName: true,
                lastName: true,
                memberCode: true,
                email: true
              }
            },
            approvals: true
          }
        });
        break;

      case 'complete':
        updatedPayout = await prisma.payout.update({
          where: { id: params.id },
          data: {
            status: 'COMPLETED',
            processedDate: new Date()
          },
          include: {
            member: {
              select: {
                firstName: true,
                lastName: true,
                memberCode: true,
                email: true
              }
            },
            approvals: true
          }
        });
        break;

      case 'cancel':
        updatedPayout = await prisma.payout.update({
          where: { id: params.id },
          data: {
            status: 'CANCELLED'
          },
          include: {
            member: {
              select: {
                firstName: true,
                lastName: true,
                memberCode: true,
                email: true
              }
            },
            approvals: true
          }
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json(updatedPayout);

  } catch (error) {
    console.error('Error updating payout:', error);
    return NextResponse.json(
      { error: 'Failed to update payout' },
      { status: 500 }
    );
  }
}

// DELETE /api/payouts/[id] - Delete payout (only if pending)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payout = await prisma.payout.findUnique({
      where: { id: params.id }
    });

    if (!payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }

    // Only allow deletion of pending payouts
    if (payout.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only delete pending payouts' },
        { status: 400 }
      );
    }

    // Check permissions
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER' && payout.requestedBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await prisma.payout.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Payout deleted successfully' });

  } catch (error) {
    console.error('Error deleting payout:', error);
    return NextResponse.json(
      { error: 'Failed to delete payout' },
      { status: 500 }
    );
  }
}