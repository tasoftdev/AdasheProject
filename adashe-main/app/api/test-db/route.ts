import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test basic database connection
    console.log('Testing database connection...')
    
    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('Raw query result:', result)

    // Test member count
    const memberCount = await prisma.member.count()
    console.log('Member count:', memberCount)

    // Test contribution count
    const contributionCount = await prisma.contribution.count()
    console.log('Contribution count:', contributionCount)

    return NextResponse.json({
      status: 'success',
      database: 'connected',
      rawQuery: result,
      counts: {
        members: memberCount,
        contributions: contributionCount
      }
    })

  } catch (error) {
    console.error('Database connection test failed:', error)
    
    return NextResponse.json({
      status: 'error',
      database: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
}