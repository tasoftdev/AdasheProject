'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function SimplePaymentTestPage() {
  const [amount, setAmount] = useState(1000)
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    setLogs(prev => [...prev, logMessage])
    console.log(logMessage)
  }

  const testSimplePayment = async () => {
    setIsLoading(true)
    setLogs([])
    
    try {
      addLog('Starting payment test...')
      addLog(`Amount: ₦${amount}`)
      
      // Test basic fetch first
      addLog('Testing basic API connection...')
      const testResponse = await fetch('/api/config')
      if (!testResponse.ok) {
        throw new Error(`Config API failed: ${testResponse.status}`)
      }
      
      const configText = await testResponse.text()
      addLog(`Config response: ${configText.substring(0, 100)}...`)
      
      // Now test payment API with minimal data
      addLog('Testing payment API...')
      const paymentData = {
        amount: amount,
        email: 'test@example.com',
        description: 'Test payment',
        type: 'CONTRIBUTION'
      }
      
      addLog(`Sending data: ${JSON.stringify(paymentData)}`)
      
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      })

      addLog(`Response status: ${response.status} ${response.statusText}`)
      
      const responseText = await response.text()
      addLog(`Response text: ${responseText.substring(0, 200)}...`)
      
      if (!response.ok) {
        throw new Error(`Payment API failed: ${response.status}`)
      }

      let result
      try {
        result = JSON.parse(responseText)
        addLog('✅ JSON parsed successfully!')
        addLog(`Payment result: ${JSON.stringify(result, null, 2)}`)
      } catch (parseError) {
        addLog(`❌ JSON parse failed: ${parseError}`)
        throw new Error('Invalid JSON response')
      }

      toast.success('Payment test completed successfully!')

    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      toast.error('Payment test failed - check logs')
    } finally {
      setIsLoading(false)
    }
  }

  const testDatabase = async () => {
    setLogs([])
    
    try {
      // First check environment variables
      addLog('Checking environment variables...')
      const envResponse = await fetch('/api/check-env')
      const envText = await envResponse.text()
      addLog(`Environment check: ${envText}`)
      
      if (envResponse.ok && envText) {
        const envData = JSON.parse(envText)
        if (envData.environment.DATABASE_URL === 'Missing') {
          addLog('❌ DATABASE_URL is missing! Database connection will fail.')
          addLog('💡 Please create a .env.local file with DATABASE_URL')
          return
        }
      }
      
      addLog('Testing database connection...')
      
      // Test direct database connection
      const dbResponse = await fetch('/api/test-db')
      addLog(`Database test API: ${dbResponse.status}`)
      
      const dbText = await dbResponse.text()
      addLog(`Database response: ${dbText}`)
      
      if (dbResponse.ok && dbText) {
        const dbData = JSON.parse(dbText)
        addLog(`✅ Database connected: ${JSON.stringify(dbData, null, 2)}`)
      } else {
        addLog(`❌ Database connection failed`)
      }
      
      // Test contributions API
      addLog('Testing contributions API...')
      const contribResponse = await fetch('/api/contributions?limit=1')
      addLog(`Contributions API: ${contribResponse.status}`)
      
      const contribText = await contribResponse.text()
      addLog(`Contributions response: ${contribText.substring(0, 200)}...`)
      
      if (!contribResponse.ok) {
        addLog(`❌ Contributions API failed`)
      } else {
        try {
          const contribData = JSON.parse(contribText)
          addLog(`✅ Contributions API working: ${JSON.stringify(contribData, null, 2)}`)
        } catch (parseError) {
          addLog(`❌ Contributions API returned invalid JSON: ${parseError}`)
        }
      }

    } catch (error) {
      addLog(`❌ Database test error: ${error}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Simple Payment Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label>Amount (₦):</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              min="1"
              step="1"
            />
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={testSimplePayment} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testing...' : 'Test Simple Payment'}
            </Button>
            
            <Button 
              onClick={testDatabase} 
              variant="outline"
              className="w-full"
            >
              Test Database APIs
            </Button>
          </div>
          
          {logs.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Test Logs:</h3>
              <div className="bg-gray-100 p-3 rounded max-h-60 overflow-y-auto text-sm font-mono">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}