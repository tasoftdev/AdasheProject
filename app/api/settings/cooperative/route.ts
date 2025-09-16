import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET /api/settings/cooperative - Get cooperative settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create cooperative settings
    let settings = await prisma.cooperativeSettings.findFirst()
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.cooperativeSettings.create({
        data: {} // Uses default values from schema
      })
    }

    const response = {
      organization: {
        name: settings.organizationName,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        website: settings.website,
        registrationNumber: settings.registrationNumber,
        establishedDate: settings.establishedDate?.toISOString().split('T')[0],
        description: settings.description
      },
      financial: {
        currency: settings.currency,
        minimumSavingsBalance: settings.minimumSavingsBalance,
        monthlyContribution: settings.monthlyContribution,
        loanInterestRate: settings.loanInterestRate,
        maxLoanAmount: settings.maxLoanAmount,
        loanTerm: settings.loanTerm,
        lateFeeAmount: settings.lateFeeAmount,
        withdrawalFee: settings.withdrawalFee
      },
      system: {
        allowAutoLoans: settings.allowAutoLoans,
        requireLoanGuarantors: settings.requireLoanGuarantors,
        maxGuarantors: settings.maxGuarantors,
        autoCalculateInterest: settings.autoCalculateInterest,
        allowEarlyLoanPayment: settings.allowEarlyLoanPayment,
        enableMemberSelfService: settings.enableMemberSelfService,
        maxSavingsWithdrawal: settings.maxSavingsWithdrawal
      },
      notifications: {
        emailNotifications: settings.emailNotifications,
        smsNotifications: settings.smsNotifications,
        reminderDaysBefore: settings.reminderDaysBefore,
        notifyLoanDue: settings.notifyLoanDue,
        notifyPaymentReceived: settings.notifyPaymentReceived,
        notifyContributionDue: settings.notifyContributionDue
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching cooperative settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT /api/settings/cooperative - Update cooperative settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to update settings (admin/manager only)
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
      select: { role: true }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { section, data } = body

    // Validate the section
    const validSections = ['organization', 'financial', 'system', 'notifications']
    if (!validSections.includes(section)) {
      return NextResponse.json(
        { error: 'Invalid settings section' },
        { status: 400 }
      )
    }

    // Get or create cooperative settings
    let settings = await prisma.cooperativeSettings.findFirst()
    
    if (!settings) {
      settings = await prisma.cooperativeSettings.create({
        data: {} // Uses default values from schema
      })
    }

    // Prepare update data based on section
    let updateData: any = {}

    switch (section) {
      case 'organization':
        updateData = {
          organizationName: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          website: data.website,
          registrationNumber: data.registrationNumber,
          establishedDate: data.establishedDate ? new Date(data.establishedDate) : null,
          description: data.description
        }
        break

      case 'financial':
        updateData = {
          currency: data.currency,
          minimumSavingsBalance: data.minimumSavingsBalance,
          monthlyContribution: data.monthlyContribution,
          loanInterestRate: data.loanInterestRate,
          maxLoanAmount: data.maxLoanAmount,
          loanTerm: data.loanTerm,
          lateFeeAmount: data.lateFeeAmount,
          withdrawalFee: data.withdrawalFee
        }
        break

      case 'system':
        updateData = {
          allowAutoLoans: data.allowAutoLoans,
          requireLoanGuarantors: data.requireLoanGuarantors,
          maxGuarantors: data.maxGuarantors,
          autoCalculateInterest: data.autoCalculateInterest,
          allowEarlyLoanPayment: data.allowEarlyLoanPayment,
          enableMemberSelfService: data.enableMemberSelfService,
          maxSavingsWithdrawal: data.maxSavingsWithdrawal
        }
        break

      case 'notifications':
        updateData = {
          emailNotifications: data.emailNotifications,
          smsNotifications: data.smsNotifications,
          reminderDaysBefore: data.reminderDaysBefore,
          notifyLoanDue: data.notifyLoanDue,
          notifyPaymentReceived: data.notifyPaymentReceived,
          notifyContributionDue: data.notifyContributionDue
        }
        break
    }

    // Update settings in database
    const updatedSettings = await prisma.cooperativeSettings.update({
      where: { id: settings.id },
      data: updateData
    })

    return NextResponse.json({ 
      success: true, 
      message: `${section} settings updated successfully`,
      updatedAt: updatedSettings.updatedAt
    })
  } catch (error) {
    console.error('Error updating cooperative settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}