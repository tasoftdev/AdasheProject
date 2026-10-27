'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function PaymentDebugPage() {
  const [amount, setAmount] = useState(1000)
  const [email, setEmail] = useState('test@example.com')
  const [isLoading, setIsLoading] = useState(false)

  const testPayment = async () => {
    setIsLoading(true)
    
    try {
      console.log('Testing payment with:', { amount, email })
      
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount,
          email: email,
          description: 'Test payment',
          type: 'CONTRIBUTION',
          category: 'test',
          callback_url: `${window.location.origin}/payments/callback`,
          metadata: {
            test: true
          }
        })
      })

      const result = await response.json()
      console.log('API Response:', result)
      
      if (!response.ok) {
        throw new Error(result.error || 'Payment initialization failed')
      }

      toast.success('Payment initialized successfully!')
      console.log('Payment data from API:', result)

    } catch (error) {
      console.error('Payment test error:', error)
      toast.error(error instanceof Error ? error.message : 'Test failed')
    } finally {
      setIsLoading(false)
    }
  }

  const testConfig = async () => {
    try {
      const response = await fetch('/api/config')
      const result = await response.json()
      console.log('Configuration:', result)
      toast.success('Check console for configuration details')
    } catch (error) {
      console.error('Config test error:', error)
      toast.error('Configuration test failed')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Payment System Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label>Amount (₦):</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              min="1"
              step="0.01"
            />
          </div>
          
          <div>
            <label>Email:</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={testPayment} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testing...' : 'Test Payment API'}
            </Button>
            
            <Button 
              onClick={testConfig} 
              variant="outline"
              className="w-full"
            >
              Test Configuration
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>This page helps debug payment issues:</p>
            <ul className="list-disc ml-4">
              <li>Test API endpoint directly</li>
              <li>Check Paystack configuration</li>
              <li>View console logs for errors</li>
            </ul>
            <p className="mt-2">Open browser console (F12) to see detailed logs.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}