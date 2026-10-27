import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { paystack } from '@/lib/paystack'

// GET /api/paystack/banks - Get list of banks
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country') || 'nigeria'

    const banksResponse = await paystack.getBanks(country)

    return NextResponse.json(banksResponse)

  } catch (error) {
    console.error('Error fetching banks:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch banks' },
      { status: 500 }
    )
  }
}

// POST /api/paystack/resolve-account - Resolve bank account
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { account_number, bank_code } = body

    if (!account_number || !bank_code) {
      return NextResponse.json(
        { error: 'Account number and bank code are required' },
        { status: 400 }
      )
    }

    const accountResponse = await paystack.resolveBankAccount(account_number, bank_code)

    return NextResponse.json(accountResponse)

  } catch (error) {
    console.error('Error resolving account:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to resolve account' },
      { status: 500 }
    )
  }
}