import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { paystack } from '@/lib/paystack'
import crypto from 'crypto'

// POST /api/payments/webhook - Handle Paystack webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    if (!paystack.verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)
    console.log('Webhook received:', event.event)

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data)
        break
      case 'transfer.success':
        await handleTransferSuccess(event.data)
        break
      case 'transfer.failed':
        await handleTransferFailed(event.data)
        break
      case 'transfer.reversed':
        await handleTransferReversed(event.data)
        break
      default:
        console.log('Unhandled webhook event:', event.event)
    }

    return NextResponse.json({ message: 'Webhook processed successfully' })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleChargeSuccess(data: any) {
  try {
    const { reference, status, amount, paid_at, authorization, customer } = data

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { reference }
    })

    if (!payment) {
      console.error('Payment not found for reference:', reference)
      return
    }

    // Update payment status if not already processed
    if (payment.status !== 'COMPLETED') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(paid_at),
          processedAt: new Date(),
          authorization: authorization ? JSON.stringify(authorization) : null,
          customer: customer ? JSON.stringify(customer) : null,
          gatewayResponse: data.gateway_response || 'Successful'
        }
      })

      // Process the payment (create related records)
      await processWebhookPayment(payment)
    }

  } catch (error) {
    console.error('Error handling charge success:', error)
  }
}

async function handleTransferSuccess(data: any) {
  try {
    const { reference, recipient, amount } = data

    // Find payout request
    const payoutRequest = await prisma.payoutRequest.findUnique({
      where: { reference }
    })

    if (!payoutRequest) {
      console.error('Payout request not found for reference:', reference)
      return
    }

    // Update payout status
    await prisma.payoutRequest.update({
      where: { id: payoutRequest.id },
      data: {
        status: 'COMPLETED',
        completedDate: new Date(),
        processedDate: new Date()
      }
    })

  } catch (error) {
    console.error('Error handling transfer success:', error)
  }
}

async function handleTransferFailed(data: any) {
  try {
    const { reference, failure_reason } = data

    // Find payout request
    const payoutRequest = await prisma.payoutRequest.findUnique({
      where: { reference }
    })

    if (!payoutRequest) {
      console.error('Payout request not found for reference:', reference)
      return
    }

    // Update payout status
    await prisma.payoutRequest.update({
      where: { id: payoutRequest.id },
      data: {
        status: 'FAILED',
        errorMessage: failure_reason || 'Transfer failed'
      }
    })

  } catch (error) {
    console.error('Error handling transfer failed:', error)
  }
}

async function handleTransferReversed(data: any) {
  try {
    const { reference } = data

    // Find payout request
    const payoutRequest = await prisma.payoutRequest.findUnique({
      where: { reference }
    })

    if (!payoutRequest) {
      console.error('Payout request not found for reference:', reference)
      return
    }

    // Update payout status
    await prisma.payoutRequest.update({
      where: { id: payoutRequest.id },
      data: {
        status: 'FAILED',
        errorMessage: 'Transfer was reversed'
      }
    })

  } catch (error) {
    console.error('Error handling transfer reversed:', error)
  }
}

async function processWebhookPayment(payment: any) {
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

    // Same processing logic as in verify endpoint
    switch (payment.type) {
      case 'CONTRIBUTION':
        await processContribution(payment)
        break
      case 'SAVINGS_DEPOSIT':
        await processSavingsDeposit(payment)
        break
      case 'LOAN_REPAYMENT':
        await processLoanRepayment(payment)
        break
      default:
        await createGeneralTransaction(payment)
    }

  } catch (error) {
    console.error('Error processing webhook payment:', error)
  }
}

async function processContribution(payment: any) {
  if (!payment.memberId) return

  await prisma.contribution.create({
    data: {
      memberId: payment.memberId,
      amount: payment.amount,
      type: 'MONTHLY',
      status: 'COMPLETED',
      paidDate: payment.paidAt || new Date(),
      method: 'CREDIT_CARD',
      reference: payment.reference,
      description: payment.description
    }
  })
}

async function processSavingsDeposit(payment: any) {
  if (!payment.memberId) return

  // Find or create savings account
  let savingsAccount = await prisma.saving.findFirst({
    where: {
      memberId: payment.memberId,
      status: 'ACTIVE',
      accountType: 'REGULAR'
    }
  })

  if (!savingsAccount) {
    const accountNumber = `SAV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    savingsAccount = await prisma.saving.create({
      data: {
        memberId: payment.memberId,
        accountNumber,
        accountType: 'REGULAR',
        balance: payment.amount,
        interestRate: 5.0
      }
    })
  } else {
    await prisma.saving.update({
      where: { id: savingsAccount.id },
      data: {
        balance: {
          increment: payment.amount
        }
      }
    })
  }

  // Create transaction
  await prisma.savingTransaction.create({
    data: {
      savingId: savingsAccount.id,
      type: 'DEPOSIT',
      amount: payment.amount,
      balance: savingsAccount.balance.add(payment.amount),
      method: 'CREDIT_CARD',
      reference: payment.reference,
      description: payment.description
    }
  })
}

async function processLoanRepayment(payment: any) {
  if (!payment.memberId) return

  const activeLoan = await prisma.loan.findFirst({
    where: {
      memberId: payment.memberId,
      status: 'ACTIVE'
    }
  })

  if (activeLoan) {
    await prisma.loanPayment.create({
      data: {
        loanId: activeLoan.id,
        amount: payment.amount,
        principal: payment.amount,
        interest: 0,
        paymentDate: payment.paidAt || new Date(),
        method: 'CREDIT_CARD',
        reference: payment.reference
      }
    })

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

async function createGeneralTransaction(payment: any) {
  await prisma.transaction.create({
    data: {
      memberId: payment.memberId,
      type: 'INCOME',
      category: payment.category || payment.type,
      amount: payment.amount,
      description: payment.description,
      method: 'CREDIT_CARD',
      reference: payment.reference,
      status: 'COMPLETED'
    }
  })
}