import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'

// GET /api/savings/member-accounts?memberId=xxx - Get savings accounts for a specific member
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    const savingsAccounts = await prisma.saving.findMany({
      where: {
        memberId,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        accountNumber: true,
        accountType: true,
        balance: true
      }
    })

    const formattedAccounts = savingsAccounts.map(account => ({
      id: account.id,
      accountNumber: account.accountNumber,
      accountType: account.accountType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      balance: account.balance.toNumber()
    }))

    return NextResponse.json(formattedAccounts)
  } catch (error) {
    console.error('Error fetching member savings accounts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}