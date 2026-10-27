// Simple API test to check Paystack configuration

export async function GET(request: Request) {
  try {
    // Check if Paystack keys are configured
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    const publicKey = process.env.PAYSTACK_PUBLIC_KEY
    
    return Response.json({
      status: 'ok',
      database: 'connected',
      paystack: {
        secretKey: secretKey ? 'configured' : 'missing',
        publicKey: publicKey ? 'configured' : 'missing',
        secretKeyPreview: secretKey ? `${secretKey.substring(0, 8)}...` : null,
        publicKeyPreview: publicKey ? `${publicKey.substring(0, 8)}...` : null
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Configuration check error:', error)
    return Response.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}