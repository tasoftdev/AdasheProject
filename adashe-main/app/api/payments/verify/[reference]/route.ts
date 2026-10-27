import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { paystack } from '@/lib/paystack'

// GET /api/payments/verify/[reference] - Verify payment
export async function GET(
  request: NextRequest,
  { params }: { params: { reference: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reference } = params

    // Find payment in database
    const payment = await prisma.payment.findUnique({
      where: { reference },
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
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // If already verified, return current status
    if (payment.status === 'COMPLETED') {
      return NextResponse.json({
        payment,
        status: 'success',
        message: 'Payment already verified'
      })
    }

    // Verify with Paystack
    const verification = await paystack.verifyPayment(reference)

    if (!verification.status) {
      return NextResponse.json(
        { error: verification.message || 'Payment verification failed' },
        { status: 400 }
      )
    }

    const { data } = verification

    // Update payment status based on Paystack response
    let updateData: any = {
      status: data.status === 'success' ? 'COMPLETED' : 'FAILED',
      gatewayResponse: data.gateway_response,
      channel: data.channel,
      verifiedAt: new Date(),
      fees: data.fees ? data.fees / 100 : null, // Convert from kobo to naira
      authorization: data.authorization ? JSON.stringify(data.authorization) : null,
      customer: data.customer ? JSON.stringify(data.customer) : null
    }

    if (data.status === 'success') {
      updateData.paidAt = new Date(data.paid_at)
      updateData.processedAt = new Date()
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: updateData,
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
    })

    // Process payment if successful
    if (data.status === 'success') {
      await processSuccessfulPayment(updatedPayment)
    }

    return NextResponse.json({
      payment: updatedPayment,
      verification,
      status: data.status === 'success' ? 'success' : 'failed',
      message: data.status === 'success' ? 'Payment verified successfully' : 'Payment failed'
    })

  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment verification failed' },
      { status: 500 }
    )
  }
}

// Process successful payment by creating related transactions
async function processSuccessfulPayment(payment: any) {
  try {
    // Create payment transaction record
    await prisma.paymentTransaction.create({
      data: {
        paymentId: payment.id,
        transactionType: payment.category || payment.type,
        amount: payment.amount,
        status: 'COMPLETED',
        processedAt: new Date()
      }
    })

    // Process based on payment type
    switch (payment.type) {
      case 'CONTRIBUTION':
        await processContributionPayment(payment)
        break
      case 'SAVINGS_DEPOSIT':
        await processSavingsDeposit(payment)
        break
      case 'LOAN_REPAYMENT':
        await processLoanRepayment(payment)
        break
      case 'REGISTRATION_FEE':
        await processRegistrationFee(payment)
        break
      default:
        // Create general transaction record
        await prisma.transaction.create({
          data: {
            memberId: payment.memberId,
            type: 'INCOME',
            category: payment.category || payment.type,
            amount: payment.amount,
            description: payment.description,
            method: 'CREDIT_CARD', // Assuming card payment via Paystack
            reference: payment.reference,
            status: 'COMPLETED'
          }
        })
    }

    // Record streak activity for member engagement
    if (payment.memberId) {
      await recordStreakActivity(payment)
    }

  } catch (error) {
    console.error('Error processing successful payment:', error)
    // Don't throw error to avoid affecting payment verification response
  }
}

async function processContributionPayment(payment: any) {
  await prisma.contribution.create({
    data: {
      memberId: payment.memberId!,
      amount: payment.amount,
      type: 'MONTHLY', // Default to monthly, can be customized
      status: 'COMPLETED',
      paidDate: payment.paidAt,
      method: 'CREDIT_CARD',
      reference: payment.reference,
      description: payment.description
    }
  })
}

async function processSavingsDeposit(payment: any) {
  // Find or create default savings account
  let savingsAccount = await prisma.saving.findFirst({
    where: {
      memberId: payment.memberId!,
      status: 'ACTIVE',
      accountType: 'REGULAR'
    }
  })

  if (!savingsAccount) {
    const accountNumber = `SAV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    savingsAccount = await prisma.saving.create({
      data: {
        memberId: payment.memberId!,
        accountNumber,
        accountType: 'REGULAR',
        balance: 0,
        interestRate: 5.0 // Default rate
      }
    })
  }

  // Create savings transaction
  await prisma.savingTransaction.create({
    data: {
      savingId: savingsAccount.id,
      type: 'DEPOSIT',
      amount: payment.amount,
      balance: savingsAccount.balance.add(payment.amount),
      method: 'CREDIT_CARD',
      reference: payment.reference,
      description: payment.description,
      status: 'COMPLETED'
    }
  })

  // Update savings balance
  await prisma.saving.update({
    where: { id: savingsAccount.id },
    data: {
      balance: {
        increment: payment.amount
      }
    }
  })
}

async function processLoanRepayment(payment: any) {
  // Find active loan for member
  const activeLoan = await prisma.loan.findFirst({
    where: {
      memberId: payment.memberId!,
      status: 'ACTIVE'
    }
  })

  if (activeLoan) {
    // Create loan payment record
    await prisma.loanPayment.create({
      data: {
        loanId: activeLoan.id,
        amount: payment.amount,
        principal: payment.amount, // Simplified - should calculate interest/principal split
        interest: 0,
        paymentDate: payment.paidAt,
        method: 'CREDIT_CARD',
        reference: payment.reference,
        status: 'COMPLETED'
      }
    })

    // Update loan balance
    const newBalance = activeLoan.balance.subtract(payment.amount)
    await prisma.loan.update({
      where: { id: activeLoan.id },
      data: {
        balance: newBalance,
        totalPaid: {
          increment: payment.amount
        },
        status: newBalance.lte(0) ? 'COMPLETED' : 'ACTIVE'
      }
    })
  }
}

async function processRegistrationFee(payment: any) {
  // Update member status or create transaction record
  await prisma.transaction.create({
    data: {
      memberId: payment.memberId,
      type: 'INCOME',
      category: 'REGISTRATION_FEE',
      amount: payment.amount,
      description: payment.description,
      method: 'CREDIT_CARD',
      reference: payment.reference,
      status: 'COMPLETED'
    }
  })
}

async function recordStreakActivity(payment: any) {
  try {
    // Determine streak type based on payment type
    let streakType: string
    switch (payment.type) {
      case 'CONTRIBUTION':
        streakType = 'CONTRIBUTION'
        break
      case 'SAVINGS_DEPOSIT':
        streakType = 'SAVINGS'
        break
      default:
        streakType = 'TRANSACTION'
    }

    // Find or create streak
    let streak = await prisma.memberStreak.findUnique({
      where: {
        memberId_type: {
          memberId: payment.memberId!,
          type: streakType as any
        }
      }
    })

    if (!streak) {
      streak = await prisma.memberStreak.create({
        data: {
          memberId: payment.memberId!,
          type: streakType as any,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: new Date(),
          startDate: new Date(),
          totalPoints: 10 // Default points
        }
      })
    } else {
      // Update streak logic here
      const today = new Date()
      const lastActivity = streak.lastActivityDate
      
      if (lastActivity) {
        const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === 1) {
          // Continue streak
          await prisma.memberStreak.update({
            where: { id: streak.id },
            data: {
              currentStreak: { increment: 1 },
              longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1),
              lastActivityDate: today,
              totalPoints: { increment: 10 }
            }
          })
        } else if (daysDiff > 1) {
          // Reset streak
          await prisma.memberStreak.update({
            where: { id: streak.id },
            data: {
              currentStreak: 1,
              lastActivityDate: today,
              startDate: today,
              totalPoints: { increment: 10 }
            }
          })
        }
        // Same day - no change to streak count but add points
        else if (daysDiff === 0) {
          await prisma.memberStreak.update({
            where: { id: streak.id },
            data: {
              lastActivityDate: today,
              totalPoints: { increment: 5 } // Less points for same day
            }
          })
        }
      }
    }

    // Create streak activity record
    await prisma.streakActivity.create({
      data: {
        streakId: streak.id,
        memberId: payment.memberId!,
        activityType: streakType as any,
        activityDate: new Date(),
        points: 10,
        description: `Payment: ${payment.description}`,
        amount: payment.amount,
        reference: payment.reference
      }
    })

  } catch (error) {
    console.error('Error recording streak activity:', error)
    // Don't throw to avoid affecting main payment processing
  }
}