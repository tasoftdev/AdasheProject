'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PaymentComponent, PayoutComponent, PaymentDashboard } from '@/components/payments'
import { toast } from 'sonner'
import {
  CreditCard,
  Send,
  Banknote,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react'

export default function PaymentsTestPage() {
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalPayouts: 0,
    pendingPayouts: 0,
    completedTransactions: 0
  })

  const handlePaymentSuccess = (payment: any) => {
    toast.success(`Payment of ₦${payment.amount.toLocaleString()} completed successfully!`)
    // Update stats or refresh data here
  }

  const handlePaymentError = (error: string) => {
    toast.error(`Payment failed: ${error}`)
  }

  const handlePayoutSuccess = (payout: any) => {
    toast.success(`Payout request for ₦${payout.amount.toLocaleString()} submitted successfully!`)
    // Update stats or refresh data here
  }

  const handlePayoutError = (error: string) => {
    toast.error(`Payout request failed: ${error}`)
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Payment System Test</h1>
          <p className="text-muted-foreground">
            Test the complete Paystack integration for payments and payouts
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.totalPayments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
              <ArrowDownLeft className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.totalPayouts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600">+8%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingPayouts}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTransactions}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="test">Test Components</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Dashboard</CardTitle>
              <CardDescription>
                Overview of all payment and payout activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentDashboard 
                onSuccess={(data) => {
                  toast.success('Dashboard updated successfully')
                }}
                onError={(error) => {
                  toast.error(`Dashboard error: ${error}`)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Make Payment
                </CardTitle>
                <CardDescription>
                  Test payment functionality with Paystack integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      <DollarSign className="h-3 w-3 mr-1" />
                      Contributions
                    </Badge>
                    <Badge variant="outline">
                      <Banknote className="h-3 w-3 mr-1" />
                      Loan Repayment
                    </Badge>
                    <Badge variant="outline">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Savings Deposit
                    </Badge>
                  </div>
                  
                  <PaymentComponent
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    trigger={
                      <Button className="w-full">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Open Payment Modal
                      </Button>
                    }
                  />

                  <div className="text-sm text-muted-foreground">
                    <p>• Test with any amount</p>
                    <p>• Uses Paystack test environment</p>
                    <p>• Real-time payment verification</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Features</CardTitle>
                <CardDescription>
                  Available payment options and integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Paystack Gateway Integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Multiple Payment Types</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Real-time Verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Secure Webhook Handling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Transaction History</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Mobile Responsive</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Request Payout
                </CardTitle>
                <CardDescription>
                  Test payout request functionality with bank verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Bank Verification</Badge>
                    <Badge variant="outline">Approval Workflow</Badge>
                    <Badge variant="outline">Paystack Transfer</Badge>
                  </div>
                  
                  <PayoutComponent
                    onSuccess={handlePayoutSuccess}
                    onError={handlePayoutError}
                    trigger={
                      <Button className="w-full">
                        <Send className="h-4 w-4 mr-2" />
                        Open Payout Modal
                      </Button>
                    }
                  />

                  <div className="text-sm text-muted-foreground">
                    <p>• Real bank account verification</p>
                    <p>• Multi-level approval system</p>
                    <p>• Automatic transfer processing</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payout Features</CardTitle>
                <CardDescription>
                  Complete payout management system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Nigerian Bank Integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Account Name Verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Approval Workflow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Automated Transfers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Status Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Transaction Logging</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Component Testing</CardTitle>
                <CardDescription>
                  Test individual payment components with different configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Payment Component Tests */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Payment Components</h3>
                    
                    <PaymentComponent
                      defaultData={{
                        type: 'contribution',
                        amount: 5000
                      }}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      trigger={
                        <Button variant="outline" className="w-full">
                          Test: Pre-filled Contribution
                        </Button>
                      }
                    />

                    <PaymentComponent
                      defaultData={{
                        type: 'loan_repayment',
                        amount: 15000
                      }}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      trigger={
                        <Button variant="outline" className="w-full">
                          Test: Loan Repayment
                        </Button>
                      }
                    />

                    <PaymentComponent
                      defaultData={{
                        type: 'savings_deposit',
                        amount: 25000
                      }}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      trigger={
                        <Button variant="outline" className="w-full">
                          Test: Savings Deposit
                        </Button>
                      }
                    />
                  </div>

                  {/* Payout Component Tests */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Payout Components</h3>
                    
                    <PayoutComponent
                      defaultData={{
                        amount: 10000,
                        description: 'Emergency withdrawal'
                      }}
                      onSuccess={handlePayoutSuccess}
                      onError={handlePayoutError}
                      trigger={
                        <Button variant="outline" className="w-full">
                          Test: Emergency Payout
                        </Button>
                      }
                    />

                    <PayoutComponent
                      defaultData={{
                        amount: 50000,
                        description: 'Dividend payment',
                        reason: 'Annual dividend distribution'
                      }}
                      onSuccess={handlePayoutSuccess}
                      onError={handlePayoutError}
                      trigger={
                        <Button variant="outline" className="w-full">
                          Test: Dividend Payout
                        </Button>
                      }
                    />

                    <Button 
                      variant="secondary" 
                      className="w-full"
                      onClick={() => {
                        toast.info('Testing payment system components...')
                      }}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Run All Tests
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Endpoints Status</CardTitle>
                <CardDescription>
                  Verify all payment and payout API endpoints are working
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Payment APIs</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">GET</Badge>
                        <span>/api/payments</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">POST</Badge>
                        <span>/api/payments</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">GET</Badge>
                        <span>/api/payments/verify/[reference]</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">POST</Badge>
                        <span>/api/payments/webhook</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Payout APIs</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">GET</Badge>
                        <span>/api/payouts/requests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">POST</Badge>
                        <span>/api/payouts/requests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">GET</Badge>
                        <span>/api/payouts/requests/[id]</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">POST</Badge>
                        <span>/api/paystack</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}