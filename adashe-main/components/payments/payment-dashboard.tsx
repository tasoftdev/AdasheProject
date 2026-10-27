'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { PaymentComponent } from './payment-component'
import { PayoutComponent } from './payout-component'
import { toast } from 'sonner'
import { 
  CreditCard, 
  Send, 
  ArrowUpRight, 
  ArrowDownLeft,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'

interface Payment {
  id: string
  reference: string
  amount: number
  type: string
  status: string
  paymentMethod: string
  createdAt: string
  member?: {
    firstName: string
    lastName: string
    memberCode: string
  }
}

interface PayoutRequest {
  id: string
  reference: string
  amount: number
  status: string
  description: string
  bankName: string
  accountName: string
  accountNumber: string
  requestDate: string
  member?: {
    firstName: string
    lastName: string
    memberCode: string
  }
}

interface PaymentDashboardProps {
  memberId?: string
  showActions?: boolean
}

export function PaymentDashboard({ memberId, showActions = true }: PaymentDashboardProps) {
  const { data: session } = useSession()
  const [payments, setPayments] = useState<Payment[]>([])
  const [payouts, setPayouts] = useState<PayoutRequest[]>([])
  const [isLoadingPayments, setIsLoadingPayments] = useState(true)
  const [isLoadingPayouts, setIsLoadingPayouts] = useState(true)

  useEffect(() => {
    fetchPayments()
    fetchPayouts()
  }, [memberId])

  const fetchPayments = async () => {
    try {
      setIsLoadingPayments(true)
      const url = memberId ? `/api/payments?memberId=${memberId}` : '/api/payments'
      const response = await fetch(url)
      const result = await response.json()
      
      if (response.ok) {
        setPayments(result.payments || [])
      } else {
        throw new Error(result.error || 'Failed to fetch payments')
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error('Failed to load payments')
    } finally {
      setIsLoadingPayments(false)
    }
  }

  const fetchPayouts = async () => {
    try {
      setIsLoadingPayouts(true)
      const url = memberId ? `/api/payouts/requests?memberId=${memberId}` : '/api/payouts/requests'
      const response = await fetch(url)
      const result = await response.json()
      
      if (response.ok) {
        setPayouts(result.payouts || [])
      } else {
        throw new Error(result.error || 'Failed to fetch payouts')
      }
    } catch (error) {
      console.error('Error fetching payouts:', error)
      toast.error('Failed to load payouts')
    } finally {
      setIsLoadingPayouts(false)
    }
  }

  const handlePaymentSuccess = (payment: any) => {
    toast.success('Payment completed successfully!')
    fetchPayments() // Refresh payments list
  }

  const handlePayoutSuccess = (payout: any) => {
    toast.success('Payout request submitted successfully!')
    fetchPayouts() // Refresh payouts list
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'FAILED':
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />
      case 'FAILED':
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      {showActions && (
        <div className="flex flex-col sm:flex-row gap-4">
          <PaymentComponent 
            onSuccess={handlePaymentSuccess}
            trigger={
              <Button className="flex-1">
                <CreditCard className="h-4 w-4 mr-2" />
                Make Payment
              </Button>
            }
          />
          <PayoutComponent 
            onSuccess={handlePayoutSuccess}
            trigger={
              <Button variant="outline" className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Request Payout
              </Button>
            }
          />
          <Button 
            variant="outline" 
            onClick={() => {
              fetchPayments()
              fetchPayouts()
            }}
            className="sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-green-600" />
              Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingPayments ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  ))}
                </>
              ) : payments.length > 0 ? (
                payments.slice(0, 5).map((payment, index) => (
                  <div key={payment.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{formatCurrency(payment.amount)}</span>
                          <Badge className={getStatusColor(payment.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(payment.status)}
                              <span>{payment.status}</span>
                            </div>
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>{payment.type} • {payment.paymentMethod}</p>
                          {payment.member && (
                            <p>{payment.member.firstName} {payment.member.lastName} ({payment.member.memberCode})</p>
                          )}
                          <p>{new Date(payment.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No payments found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payouts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownLeft className="h-5 w-5 text-blue-600" />
              Recent Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingPayouts ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  ))}
                </>
              ) : payouts.length > 0 ? (
                payouts.slice(0, 5).map((payout, index) => (
                  <div key={payout.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{formatCurrency(payout.amount)}</span>
                          <Badge className={getStatusColor(payout.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(payout.status)}
                              <span>{payout.status}</span>
                            </div>
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>{payout.description}</p>
                          <p>{payout.bankName} • {payout.accountName}</p>
                          {payout.member && (
                            <p>{payout.member.firstName} {payout.member.lastName} ({payout.member.memberCode})</p>
                          )}
                          <p>{new Date(payout.requestDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Send className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No payout requests found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}