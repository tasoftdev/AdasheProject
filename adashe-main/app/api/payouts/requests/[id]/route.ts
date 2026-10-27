import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { paystack } from '@/lib/paystack'

// GET /api/payouts/requests/[id] - Get specific payout request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payoutRequest = await prisma.payoutRequest.findUnique({
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
    })

    if (!payoutRequest) {
      return NextResponse.json({ error: 'Payout request not found' }, { status: 404 })
    }

    // Check permissions
    if (session.user.role === 'MEMBER') {
      const userMember = await prisma.member.findUnique({
        where: { userId: session.user.id }
      })
      
      if (!userMember || payoutRequest.memberId !== userMember.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    return NextResponse.json(payoutRequest)

  } catch (error) {
    console.error('Error fetching payout request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payout request' },
      { status: 500 }
    )
  }
}

// PUT /api/payouts/requests/[id] - Update payout request (approve, reject, process)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and managers can update payout requests
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, comments, level } = body

    const payoutRequest = await prisma.payoutRequest.findUnique({
      where: { id: params.id },
      include: { 
        approvals: true,
        member: {
          select: {
            firstName: true,
            lastName: true,
            memberCode: true,
            email: true
          }
        }
      }
    })

    if (!payoutRequest) {
      return NextResponse.json({ error: 'Payout request not found' }, { status: 404 })
    }

    let updatedPayoutRequest

    switch (action) {
      case 'approve':
        if (!level) {
          return NextResponse.json(
            { error: 'Approval level is required' },
            { status: 400 }
          )
        }

        // Update the specific approval level
        await prisma.payoutApproval.update({
          where: {
            payoutRequestId_level: {
              payoutRequestId: params.id,
              level: parseInt(level)
            }
          },
          data: {
            status: 'APPROVED',
            approvedBy: session.user.id,
            comments,
            approvedAt: new Date()
          }
        })

        // Check if all required approvals are completed
        const approvals = await prisma.payoutApproval.findMany({
          where: { payoutRequestId: params.id }
        })
        
        const allApproved = approvals.every(a => a.status === 'APPROVED')
        
        if (allApproved) {
          updatedPayoutRequest = await prisma.payoutRequest.update({
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
          })
        } else {
          // Just return updated payout request
          updatedPayoutRequest = await prisma.payoutRequest.findUnique({
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
          })
        }
        break

      case 'reject':
        // Update approval or overall status
        if (level) {
          await prisma.payoutApproval.update({
            where: {
              payoutRequestId_level: {
                payoutRequestId: params.id,
                level: parseInt(level)
              }
            },
            data: {
              status: 'REJECTED',
              approvedBy: session.user.id,
              comments,
              approvedAt: new Date()
            }
          })
        }

        updatedPayoutRequest = await prisma.payoutRequest.update({
          where: { id: params.id },
          data: {
            status: 'REJECTED'
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
        })
        break

      case 'process':
        if (payoutRequest.status !== 'APPROVED') {
          return NextResponse.json(
            { error: 'Payout request must be approved before processing' },
            { status: 400 }
          )
        }

        // Process the payout with Paystack
        try {
          const transferResponse = await paystack.initiateTransfer({
            source: 'balance',
            amount: payoutRequest.amount,
            recipient: payoutRequest.recipientCode!,
            reason: payoutRequest.description,
            reference: payoutRequest.reference
          })

          updatedPayoutRequest = await prisma.payoutRequest.update({
            where: { id: params.id },
            data: {
              status: 'PROCESSING',
              processedBy: session.user.id,
              processedDate: new Date(),
              transferCode: transferResponse.data.transfer_code,
              paystackReference: transferResponse.data.reference
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
          })

        } catch (error) {
          console.error('Transfer initiation failed:', error)
          
          updatedPayoutRequest = await prisma.payoutRequest.update({
            where: { id: params.id },
            data: {
              status: 'FAILED',
              errorMessage: error instanceof Error ? error.message : 'Transfer failed',
              retryCount: { increment: 1 }
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
          })
        }
        break

      case 'complete':
        updatedPayoutRequest = await prisma.payoutRequest.update({
          where: { id: params.id },
          data: {
            status: 'COMPLETED',
            completedDate: new Date()
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
        })
        break

      case 'cancel':
        updatedPayoutRequest = await prisma.payoutRequest.update({
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
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json(updatedPayoutRequest)

  } catch (error) {
    console.error('Error updating payout request:', error)
    return NextResponse.json(
      { error: 'Failed to update payout request' },
      { status: 500 }
    )
  }
}

// DELETE /api/payouts/requests/[id] - Delete payout request (only if pending)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payoutRequest = await prisma.payoutRequest.findUnique({
      where: { id: params.id }
    })

    if (!payoutRequest) {
      return NextResponse.json({ error: 'Payout request not found' }, { status: 404 })
    }

    // Only allow deletion of pending requests
    if (payoutRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only delete pending payout requests' },
        { status: 400 }
      )
    }

    // Check permissions
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER' && payoutRequest.requestedBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    await prisma.payoutRequest.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Payout request deleted successfully' })

  } catch (error) {
    console.error('Error deleting payout request:', error)
    return NextResponse.json(
      { error: 'Failed to delete payout request' },
      { status: 500 }
    )
  }
}