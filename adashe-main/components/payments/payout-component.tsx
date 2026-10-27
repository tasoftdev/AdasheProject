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
import { 
  Send, 
  DollarSign, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Users,
  Building2
} from 'lucide-react'

interface PayoutData {
  memberId?: string
  amount: number
  description: string
  reason?: string
  accountName: string
  accountNumber: string
  bankCode: string
  bankName: string
}

interface PayoutComponentProps {
  onSuccess?: (payout: any) => void
  onError?: (error: string) => void
  defaultData?: Partial<PayoutData>
  trigger?: React.ReactNode
}

interface Bank {
  name: string
  code: string
  slug: string
}

interface Member {
  id: string
  firstName: string
  lastName: string
  memberCode: string
  email: string
}

export function PayoutComponent({ 
  onSuccess, 
  onError, 
  defaultData = {},
  trigger 
}: PayoutComponentProps) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [banks, setBanks] = useState<Bank[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [isVerifying, setIsVerifying] = useState(false)
  const [accountDetails, setAccountDetails] = useState<any>(null)

  const [payoutData, setPayoutData] = useState<PayoutData>({
    amount: 0,
    description: '',
    accountName: '',
    accountNumber: '',
    bankCode: '',
    bankName: '',
    ...defaultData
  })

  useEffect(() => {
    if (isOpen) {
      fetchBanks()
      if (session?.user?.role !== 'MEMBER') {
        fetchMembers()
      }
    }
  }, [isOpen, session])

  const fetchBanks = async () => {
    try {
      const response = await fetch('/api/paystack?country=nigeria')
      const result = await response.json()
      
      if (response.ok && result.data) {
        setBanks(result.data)
      }
    } catch (error) {
      console.error('Error fetching banks:', error)
      toast.error('Failed to load banks')
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members?limit=100')
      const result = await response.json()
      
      if (response.ok && result.members) {
        setMembers(result.members)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      toast.error('Failed to load members')
    }
  }

  const handleInputChange = (field: keyof PayoutData, value: any) => {
    setPayoutData(prev => ({
      ...prev,
      [field]: value
    }))

    // Reset account verification when account details change
    if (field === 'accountNumber' || field === 'bankCode') {
      setAccountDetails(null)
    }
  }

  const handleBankSelect = (bankCode: string) => {
    const selectedBank = banks.find(bank => bank.code === bankCode)
    if (selectedBank) {
      setPayoutData(prev => ({
        ...prev,
        bankCode,
        bankName: selectedBank.name
      }))
    }
  }

  const verifyBankAccount = async () => {
    if (!payoutData.accountNumber || !payoutData.bankCode) {
      toast.error('Please enter account number and select bank')
      return
    }

    setIsVerifying(true)

    try {
      const response = await fetch('/api/paystack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account_number: payoutData.accountNumber,
          bank_code: payoutData.bankCode
        })
      })

      const result = await response.json()

      if (response.ok && result.data) {
        setAccountDetails(result.data)
        setPayoutData(prev => ({
          ...prev,
          accountName: result.data.account_name
        }))
        toast.success(`Account verified: ${result.data.account_name}`)
      } else {
        throw new Error(result.message || 'Account verification failed')
      }

    } catch (error) {
      console.error('Account verification error:', error)
      toast.error(error instanceof Error ? error.message : 'Account verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  const validatePayout = (): boolean => {
    if (!payoutData.amount || payoutData.amount <= 0) {
      toast.error('Please enter a valid amount')
      return false
    }
    if (!payoutData.description) {
      toast.error('Payout description is required')
      return false
    }
    if (!payoutData.accountName) {
      toast.error('Please verify account details first')
      return false
    }
    if (!payoutData.accountNumber || !payoutData.bankCode) {
      toast.error('Complete bank details are required')
      return false
    }
    return true
  }

  const submitPayout = async () => {
    if (!validatePayout()) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/payouts/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payoutData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payout request')
      }

      toast.success('Payout request submitted successfully!')
      onSuccess?.(result)
      setIsOpen(false)
      
      // Reset form
      setPayoutData({
        amount: 0,
        description: '',
        accountName: '',
        accountNumber: '',
        bankCode: '',
        bankName: ''
      })
      setAccountDetails(null)

    } catch (error) {
      console.error('Payout submission error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit payout request'
      toast.error(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const defaultTrigger = (
    <Button className="w-full sm:w-auto">
      <Send className="h-4 w-4 mr-2" />
      Request Payout
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Request Payout
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Member Selection (Admin/Manager only) */}
          {session?.user?.role !== 'MEMBER' && (
            <div className="space-y-2">
              <Label htmlFor="member">Select Member</Label>
              <Select 
                value={payoutData.memberId || ''} 
                onValueChange={(value) => handleInputChange('memberId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {member.firstName} {member.lastName} ({member.memberCode})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              value={payoutData.amount}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              placeholder="Enter amount"
              min="1"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={payoutData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter payout description"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Input
              id="reason"
              value={payoutData.reason || ''}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Additional reason for payout"
            />
          </div>

          {/* Bank Details */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="font-medium">Bank Account Details</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="bank">Bank</Label>
                <Select 
                  value={payoutData.bankCode} 
                  onValueChange={handleBankSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank.code} value={bank.code}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={payoutData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  placeholder="Enter account number"
                  maxLength={10}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={verifyBankAccount}
                disabled={!payoutData.accountNumber || !payoutData.bankCode || isVerifying}
                className="flex-1"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Account
                  </>
                )}
              </Button>
            </div>

            {accountDetails && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Account Verified</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  {accountDetails.account_name} - {payoutData.bankName}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={submitPayout}
              disabled={isLoading || !accountDetails}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Payouts are subject to approval and may take 1-3 business days
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface PayoutStatusProps {
  payout: any
}

export function PayoutStatus({ payout }: PayoutStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'REJECTED':
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
      case 'REJECTED':
      case 'FAILED':
        return <XCircle className="h-4 w-4" />
      case 'PROCESSING':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Payout Status</span>
          <Badge className={getStatusColor(payout.status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(payout.status)}
              <span>{payout.status}</span>
            </div>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Reference:</span>
          <span className="font-mono text-sm">{payout.reference}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Amount:</span>
          <span className="font-semibold">₦{payout.amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Bank:</span>
          <span>{payout.bankName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Account:</span>
          <span>{payout.accountName} ({payout.accountNumber})</span>
        </div>
        {payout.requestDate && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Requested:</span>
            <span>{new Date(payout.requestDate).toLocaleDateString()}</span>
          </div>
        )}
        {payout.completedDate && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Completed:</span>
            <span>{new Date(payout.completedDate).toLocaleDateString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}