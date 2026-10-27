'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { CreditCard, DollarSign, Loader2, CheckCircle, XCircle } from 'lucide-react'

interface PaymentData {
  amount: number
  email: string
  description: string
  type: string
  category?: string
  metadata?: Record<string, any>
}

interface PaymentComponentProps {
  onSuccess?: (payment: any) => void
  onError?: (error: string) => void
  defaultData?: Partial<PaymentData>
  trigger?: React.ReactNode
}

declare global {
  interface Window {
    PaystackPop: any
  }
}

export function PaymentComponent({ 
  onSuccess, 
  onError, 
  defaultData = {},
  trigger 
}: PaymentComponentProps) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: 0,
    email: '',
    description: '',
    type: 'CONTRIBUTION',
    ...defaultData
  })

  // Update email when session loads
  useEffect(() => {
    if (session?.user?.email && !paymentData.email) {
      setPaymentData(prev => ({
        ...prev,
        email: session.user.email
      }))
    }
  }, [session?.user?.email, paymentData.email])

  const paymentTypes = [
    { value: 'CONTRIBUTION', label: 'Monthly Contribution' },
    { value: 'SAVINGS_DEPOSIT', label: 'Savings Deposit' },
    { value: 'LOAN_REPAYMENT', label: 'Loan Repayment' },
    { value: 'REGISTRATION_FEE', label: 'Registration Fee' },
    { value: 'SERVICE_FEE', label: 'Service Fee' },
    { value: 'PENALTY_PAYMENT', label: 'Penalty Payment' },
    { value: 'OTHER', label: 'Other Payment' }
  ]

  const handleInputChange = (field: keyof PaymentData, value: any) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validatePayment = (): boolean => {
    console.log('Validating payment data:', paymentData)
    
    if (!paymentData.amount || paymentData.amount <= 0) {
      console.error('Invalid amount:', paymentData.amount)
      toast.error('Please enter a valid amount')
      return false
    }
    if (!paymentData.email) {
      console.error('Missing email:', paymentData.email)
      toast.error('Email is required')
      return false
    }
    if (!paymentData.description) {
      console.error('Missing description:', paymentData.description)
      toast.error('Payment description is required')
      return false
    }
    
    console.log('Payment validation passed')
    return true
  }

  const initializePayment = async () => {
    if (!validatePayment()) return

    setIsLoading(true)

    const requestData = {
      ...paymentData,
      callback_url: `${window.location.origin}/payments/callback`,
      metadata: {
        userId: session?.user?.id,
        ...paymentData.metadata
      }
    }

    console.log('Initializing payment with data:', requestData)

    try {
      // Initialize payment with backend
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()
      console.log('Payment API response:', result)

      if (!response.ok) {
        console.error('Payment API error:', result)
        throw new Error(result.error || 'Failed to initialize payment')
      }

      // Load Paystack script if not already loaded
      if (!window.PaystackPop) {
        const script = document.createElement('script')
        script.src = 'https://js.paystack.co/v1/inline.js'
        script.onload = () => openPaystackPopup(result)
        document.head.appendChild(script)
      } else {
        openPaystackPopup(result)
      }

    } catch (error) {
      console.error('Payment initialization error:', error)
      toast.error(error instanceof Error ? error.message : 'Payment initialization failed')
      onError?.(error instanceof Error ? error.message : 'Payment initialization failed')
      setIsLoading(false)
    }
  }

  const openPaystackPopup = (paymentResult: any) => {
    const handler = window.PaystackPop.setup({
      key: paymentResult.publicKey,
      email: paymentData.email,
      amount: paymentResult.paystack.amount,
      currency: 'NGN',
      ref: paymentResult.paystack.reference,
      callback: (response: any) => {
        verifyPayment(response.reference)
      },
      onClose: () => {
        setIsLoading(false)
        toast.info('Payment cancelled')
      }
    })

    handler.openIframe()
  }

  const verifyPayment = async (reference: string) => {
    try {
      const response = await fetch(`/api/payments/verify/${reference}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Payment verification failed')
      }

      if (result.status === 'success') {
        toast.success('Payment completed successfully!')
        onSuccess?.(result.payment)
        setIsOpen(false)
        
        // Reset form
        setPaymentData({
          amount: 0,
          email: session?.user?.email || '',
          description: '',
          type: 'CONTRIBUTION'
        })
      } else {
        throw new Error(result.message || 'Payment failed')
      }

    } catch (error) {
      console.error('Payment verification error:', error)
      toast.error(error instanceof Error ? error.message : 'Payment verification failed')
      onError?.(error instanceof Error ? error.message : 'Payment verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const defaultTrigger = (
    <Button className="w-full sm:w-auto">
      <CreditCard className="h-4 w-4 mr-2" />
      Make Payment
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Make Payment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Payment Type</Label>
            <Select 
              value={paymentData.type} 
              onValueChange={(value) => handleInputChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                {paymentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              value={paymentData.amount}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              placeholder="Enter amount"
              min="1"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={paymentData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={paymentData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter payment description"
              rows={3}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={initializePayment}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay ₦{paymentData.amount.toLocaleString()}
                </>
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Secure payment powered by Paystack
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface PaymentStatusProps {
  payment: any
}

export function PaymentStatus({ payment }: PaymentStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />
      case 'FAILED':
        return <XCircle className="h-4 w-4" />
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Payment Status</span>
          <Badge className={getStatusColor(payment.status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(payment.status)}
              <span>{payment.status}</span>
            </div>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Reference:</span>
          <span className="font-mono text-sm">{payment.reference}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Amount:</span>
          <span className="font-semibold">₦{payment.amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Type:</span>
          <span>{payment.type.replace('_', ' ')}</span>
        </div>
        {payment.paidAt && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paid At:</span>
            <span>{new Date(payment.paidAt).toLocaleString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}