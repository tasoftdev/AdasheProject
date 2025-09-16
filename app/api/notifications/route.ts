import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/notifications - Get all notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'read' | 'unread'
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status === 'read') where.read = true
    if (status === 'unread') where.read = false
    if (category) where.category = category

    // For now, we'll generate real-time notifications based on database data
    // Later you can create a proper notifications table
    const notifications = await generateNotifications()
    
    // Apply filters
    let filteredNotifications = notifications
    if (status === 'read') {
      filteredNotifications = notifications.filter(n => n.read)
    } else if (status === 'unread') {
      filteredNotifications = notifications.filter(n => !n.read)
    }
    if (category) {
      filteredNotifications = filteredNotifications.filter(n => n.category === category)
    }

    // Apply pagination
    const paginatedNotifications = filteredNotifications.slice(skip, skip + limit)
    
    return NextResponse.json({
      notifications: paginatedNotifications,
      pagination: {
        page,
        limit,
        total: filteredNotifications.length,
        totalPages: Math.ceil(filteredNotifications.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// Generate real-time notifications based on database data
async function generateNotifications() {
  const notifications = []

  try {
    // Check for overdue contributions
    const overdueContributions = await prisma.contribution.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: new Date()
        }
      },
      include: {
        member: {
          select: { firstName: true, lastName: true }
        }
      },
      take: 10
    })

    overdueContributions.forEach(contribution => {
      if (contribution.dueDate) {
        const daysPast = Math.floor((new Date().getTime() - new Date(contribution.dueDate).getTime()) / (1000 * 3600 * 24))
        notifications.push({
          id: `overdue-${contribution.id}`,
          type: 'warning' as const,
          title: 'Payment Overdue',
          message: `${contribution.member.firstName} ${contribution.member.lastName}'s contribution of ₦${contribution.amount.toLocaleString()} is ${daysPast} days overdue.`,
          timestamp: `${daysPast} days ago`,
          read: false,
          actionable: true,
          category: 'payment' as const
        })
      }
    })

    // Check for new members (last 7 days)
    const newMembers = await prisma.member.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    newMembers.forEach(member => {
      const hoursAgo = Math.floor((new Date().getTime() - new Date(member.createdAt).getTime()) / (1000 * 3600))
      notifications.push({
        id: `new-member-${member.id}`,
        type: 'success' as const,
        title: 'New Member Registration',
        message: `${member.firstName} ${member.lastName} has completed registration and joined the cooperative.`,
        timestamp: hoursAgo < 24 ? `${hoursAgo} hours ago` : `${Math.floor(hoursAgo / 24)} days ago`,
        read: false,
        actionable: true,
        category: 'member' as const
      })
    })

    // Check for pending loan applications
    const pendingLoans = await prisma.loan.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        member: {
          select: { firstName: true, lastName: true }
        }
      },
      take: 5
    })

    pendingLoans.forEach(loan => {
      const hoursAgo = Math.floor((new Date().getTime() - new Date(loan.createdAt).getTime()) / (1000 * 3600))
      notifications.push({
        id: `pending-loan-${loan.id}`,
        type: 'info' as const,
        title: 'Loan Application Pending',
        message: `${loan.member.firstName} ${loan.member.lastName} applied for a loan of ₦${loan.amount.toLocaleString()}. Review required.`,
        timestamp: hoursAgo < 24 ? `${hoursAgo} hours ago` : `${Math.floor(hoursAgo / 24)} days ago`,
        read: false,
        actionable: true,
        category: 'loan' as const
      })
    })

    // Check for recent successful transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // Last 2 days
        }
      },
      include: {
        member: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    recentTransactions.forEach(transaction => {
      if (transaction.member) {
        const hoursAgo = Math.floor((new Date().getTime() - new Date(transaction.createdAt).getTime()) / (1000 * 3600))
        notifications.push({
          id: `transaction-${transaction.id}`,
          type: 'success' as const,
          title: `${transaction.type === 'INCOME' ? 'Payment' : transaction.type === 'EXPENSE' ? 'Withdrawal' : 'Transfer'} Processed`,
          message: `${transaction.member.firstName} ${transaction.member.lastName} made a ${transaction.type.toLowerCase()} of ₦${transaction.amount.toLocaleString()}.`,
          timestamp: hoursAgo < 24 ? `${hoursAgo} hours ago` : `${Math.floor(hoursAgo / 24)} days ago`,
          read: true,
          actionable: false,
          category: 'contribution' as const
        })
      }
    })

    // Add system notifications
    const now = new Date()
    if (now.getDate() > 25) { // End of month
      notifications.push({
        id: 'monthly-report',
        type: 'warning' as const,
        title: 'Monthly Report Due',
        message: 'The monthly financial report is due soon. Please review and submit all pending documentation.',
        timestamp: '2 days ago',
        read: false,
        actionable: true,
        category: 'system' as const
      })
    }

    // Sort by newest first and limit
    return notifications
      .sort((a, b) => {
        // Parse timestamp to sort by actual time
        const timeA = parseTimeStamp(a.timestamp)
        const timeB = parseTimeStamp(b.timestamp)
        return timeA - timeB
      })
      .slice(0, 50)

  } catch (error) {
    console.error('Error generating notifications:', error)
    return []
  }
}

// Helper function to parse timestamp
function parseTimeStamp(timestamp: string): number {
  const now = Date.now()
  if (timestamp.includes('hours ago')) {
    const hours = parseInt(timestamp.split(' ')[0])
    return now - hours * 60 * 60 * 1000
  } else if (timestamp.includes('days ago')) {
    const days = parseInt(timestamp.split(' ')[0])
    return now - days * 24 * 60 * 60 * 1000
  }
  return now
}