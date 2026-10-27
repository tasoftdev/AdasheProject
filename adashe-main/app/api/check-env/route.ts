import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Checking environment variables...')
    
    return NextResponse.json({
      status: 'success',
      environment: {
        DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Missing',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
        PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY ? 'Set' : 'Missing',
        PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY ? 'Set' : 'Missing',
        NODE_ENV: process.env.NODE_ENV || 'Not set'
      }
    })

  } catch (error) {
    console.error('Environment check failed:', error)
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}