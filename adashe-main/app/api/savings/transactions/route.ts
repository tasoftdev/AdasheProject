import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock data - replace with actual database query
    const transactions = [
      {
        id: "TX001",
        date: "2024-12-01",
        type: "CONTRIBUTION" as const,
        category: "Monthly Contribution",
        memberName: "John Doe",
        amount: 15000,
        status: "completed" as const,
        reference: "CON-2024-000001",
        method: "BANK_TRANSFER"
      },
      {
        id: "TX002",
        date: "2024-11-28",
        type: "WITHDRAWAL" as const,
        category: "Savings Withdrawal",
        memberName: "Jane Smith",
        amount: 50000,
        status: "completed" as const,
        reference: "WD-2024-000045",
        method: "BANK_TRANSFER"
      },
      {
        id: "TX003",
        date: "2024-11-25",
        type: "CONTRIBUTION" as const,
        category: "Special Contribution",
        memberName: "Mike Johnson",
        amount: 25000,
        status: "pending" as const,
        reference: "CON-2024-000078",
        method: "MOBILE_MONEY"
      },
      {
        id: "TX004",
        date: "2024-11-20",
        type: "INTEREST" as const,
        category: "Monthly Interest",
        memberName: "Sarah Wilson",
        amount: 1500,
        status: "completed" as const,
        reference: "INT-2024-011234",
        method: "SYSTEM"
      },
      {
        id: "TX005",
        date: "2024-11-15",
        type: "FEE" as const,
        category: "Administration Fee",
        memberName: "David Brown",
        amount: 1000,
        status: "completed" as const,
        reference: "FEE-2024-005678",
        method: "SYSTEM"
      }
    ]

    return NextResponse.json({ 
      transactions,
      total: transactions.length,
      totalAmount: transactions.reduce((sum, tx) => sum + tx.amount, 0)
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}