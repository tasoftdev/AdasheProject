"use client"

import { useEffect, useState } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  PiggyBank,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Target,
  Gift,
  Loader2,
} from "lucide-react"
import { SavingsRowSkeleton } from "@/components/ui/skeletons"
import { toast } from "sonner"

// Types
interface SavingsAccount {
  id: string
  member: string
  avatar: string | null
  initials: string
  accountType: string
  balance: string
  interestRate: string
  lastDeposit: string | null
  monthlyTarget: string
  progress: number
  status: string
  memberId: string
  savingId: string
}

interface SavingsTransaction {
  id: string
  member: string
  avatar: string | null
  initials: string
  type: string
  amount: string
  date: string
  account: string
  balance: string
  description?: string
  method: string
  reference: string
}

interface SavingsStats {
  title: string
  value: string
  change: string
  trend: string
  description: string
}

interface Member {
  id: string
  firstName: string
  lastName: string
  memberCode: string
}

export default function SavingsPage() {
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([])
  const [recentTransactions, setRecentTransactions] = useState<SavingsTransaction[]>([])
  const [savingsStats, setSavingsStats] = useState<SavingsStats[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [depositDialogOpen, setDepositDialogOpen] = useState(false)
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false)

  // Form states
  const [depositForm, setDepositForm] = useState({
    memberId: '',
    savingId: '',
    amount: '',
    method: 'CASH' as const,
    date: new Date().toISOString().split('T')[0]
  })

  const [withdrawalForm, setWithdrawalForm] = useState({
    memberId: '',
    savingId: '',
    amount: '',
    purpose: ''
  })

  const [memberSavingsAccounts, setMemberSavingsAccounts] = useState<any[]>([])

  // Interest calculator state
  const [interestCalculator, setInterestCalculator] = useState({
    principal: '',
    rate: '',
    time: '',
    compoundFrequency: 'monthly'
  })
  const [calculationResults, setCalculationResults] = useState({
    principal: 0,
    interestEarned: 0,
    finalAmount: 0,
    calculated: false
  })

  // Search state for accounts
  const [searchQuery, setSearchQuery] = useState('')

  // Filter accounts based on search query
  const filteredSavingsAccounts = savingsAccounts.filter(account =>
    account.member.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.accountType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    fetchData()
    fetchMembers()
  }, [])

  const calculateInterest = () => {
    const principal = parseFloat(interestCalculator.principal)
    const annualRate = parseFloat(interestCalculator.rate) / 100
    const timeInMonths = parseInt(interestCalculator.time)
    
    if (isNaN(principal) || isNaN(annualRate) || isNaN(timeInMonths) || principal <= 0 || annualRate < 0 || timeInMonths <= 0) {
      toast.error('Please enter valid positive numbers for all fields')
      return
    }

    let finalAmount = 0
    let interestEarned = 0

    // Calculate based on compounding frequency
    switch (interestCalculator.compoundFrequency) {
      case 'monthly':
        const monthlyRate = annualRate / 12
        finalAmount = principal * Math.pow(1 + monthlyRate, timeInMonths)
        break
      case 'quarterly':
        const quarterlyRate = annualRate / 4
        const quarters = timeInMonths / 3
        finalAmount = principal * Math.pow(1 + quarterlyRate, quarters)
        break
      case 'annually':
        const years = timeInMonths / 12
        finalAmount = principal * Math.pow(1 + annualRate, years)
        break
      default:
        // Simple interest fallback
        finalAmount = principal * (1 + (annualRate * timeInMonths / 12))
    }

    interestEarned = finalAmount - principal

    setCalculationResults({
      principal,
      interestEarned,
      finalAmount,
      calculated: true
    })

    toast.success('Interest calculated successfully!')
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const [accountsResponse, transactionsResponse, statsResponse] = await Promise.all([
        fetch('/api/savings/accounts'),
        fetch('/api/savings/transactions?limit=10'),
        fetch('/api/savings/stats')
      ])

      if (!accountsResponse.ok || !transactionsResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch data')
      }

      const [accounts, transactions, stats] = await Promise.all([
        accountsResponse.json(),
        transactionsResponse.json(),
        statsResponse.json()
      ])

      setSavingsAccounts(accounts)
      setRecentTransactions(transactions)
      setSavingsStats(stats)
    } catch (error) {
      console.error('Error fetching savings data:', error)
      toast.error('Failed to load savings data')
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members?limit=100') // Get more members for selection
      if (!response.ok) throw new Error('Failed to fetch members')
      const data = await response.json()
      // Handle both paginated and direct array responses
      const membersData = Array.isArray(data) ? data : data.members || []
      setMembers(membersData)
    } catch (error) {
      console.error('Error fetching members:', error)
      toast.error('Failed to load members')
      setMembers([]) // Ensure it's always an array
    }
  }

  const fetchMemberSavingsAccounts = async (memberId: string) => {
    try {
      const response = await fetch(`/api/savings/member-accounts?memberId=${memberId}`)
      if (!response.ok) throw new Error('Failed to fetch member savings accounts')
      const accounts = await response.json()
      // Ensure it's always an array
      setMemberSavingsAccounts(Array.isArray(accounts) ? accounts : [])
    } catch (error) {
      console.error('Error fetching member savings accounts:', error)
      toast.error('Failed to load member savings accounts')
      setMemberSavingsAccounts([])
    }
  }

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/savings/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          savingId: depositForm.savingId,
          type: 'DEPOSIT',
          amount: parseFloat(depositForm.amount),
          method: depositForm.method,
          date: depositForm.date
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to record deposit')
      }

      toast.success('Deposit recorded successfully')
      setDepositDialogOpen(false)
      setDepositForm({
        memberId: '',
        savingId: '',
        amount: '',
        method: 'CASH',
        date: new Date().toISOString().split('T')[0]
      })
      fetchData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to record deposit')
    }
  }

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/savings/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          savingId: withdrawalForm.savingId,
          type: 'WITHDRAWAL',
          amount: parseFloat(withdrawalForm.amount),
          method: 'CASH',
          description: withdrawalForm.purpose
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process withdrawal')
      }

      toast.success('Withdrawal processed successfully')
      setWithdrawalDialogOpen(false)
      setWithdrawalForm({
        memberId: '',
        savingId: '',
        amount: '',
        purpose: ''
      })
      fetchData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to process withdrawal')
    }
  }
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Savings Management</h1>
            <p className="text-muted-foreground">
              Track member savings, deposits, withdrawals, and interest calculations.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <ArrowDownRight className="w-4 h-4 mr-2" />
                  Record Withdrawal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleWithdrawalSubmit}>
                  <DialogHeader>
                    <DialogTitle>Record Withdrawal</DialogTitle>
                    <DialogDescription>
                      Process a withdrawal from a member's savings account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="member">Member</Label>
                      <Select
                        value={withdrawalForm.memberId}
                        onValueChange={(value) => {
                          setWithdrawalForm({ ...withdrawalForm, memberId: value, savingId: '' })
                          if (value) fetchMemberSavingsAccounts(value)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(members) && members.length > 0 ? (
                            members.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.firstName} {member.lastName} ({member.memberCode})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>
                              No members available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="account">Savings Account</Label>
                        <Select
                          value={withdrawalForm.savingId}
                          onValueChange={(value) => setWithdrawalForm({ ...withdrawalForm, savingId: value })}
                          disabled={!withdrawalForm.memberId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            {memberSavingsAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.accountType} (₦{account.balance.toFixed(2)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="100.00"
                          value={withdrawalForm.amount}
                          onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="purpose">Purpose</Label>
                      <Input
                        id="purpose"
                        placeholder="Emergency medical expenses"
                        value={withdrawalForm.purpose}
                        onChange={(e) => setWithdrawalForm({ ...withdrawalForm, purpose: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setWithdrawalDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!withdrawalForm.savingId || !withdrawalForm.amount || !withdrawalForm.purpose}>
                      Process Withdrawal
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Record Deposit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleDepositSubmit}>
                  <DialogHeader>
                    <DialogTitle>Record Savings Deposit</DialogTitle>
                    <DialogDescription>
                      Record a new deposit to a member's savings account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="member">Member</Label>
                      <Select
                        value={depositForm.memberId}
                        onValueChange={(value) => {
                          setDepositForm({ ...depositForm, memberId: value, savingId: '' })
                          if (value) fetchMemberSavingsAccounts(value)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(members) && members.length > 0 ? (
                            members.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.firstName} {member.lastName} ({member.memberCode})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>
                              No members available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="account">Savings Account</Label>
                        <Select
                          value={depositForm.savingId}
                          onValueChange={(value) => setDepositForm({ ...depositForm, savingId: value })}
                          disabled={!depositForm.memberId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            {memberSavingsAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.accountType} (₦{account.balance.toFixed(2)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="150.00"
                          value={depositForm.amount}
                          onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="method">Payment Method</Label>
                        <Select
                          value={depositForm.method}
                          onValueChange={(value: any) => setDepositForm({ ...depositForm, method: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CASH">Cash</SelectItem>
                            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                            <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                            <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                            <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={depositForm.date}
                          onChange={(e) => setDepositForm({ ...depositForm, date: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDepositDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!depositForm.savingId || !depositForm.amount}>
                      Record Deposit
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="w-20 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="w-28 h-3 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))
          ) : savingsStats.length > 0 ? (
            savingsStats.map((stat, index) => {
              const iconMap = [PiggyBank, ArrowUpRight, Percent, Target]
              const Icon = iconMap[index] || PiggyBank
              
              return (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      {stat.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>
                        {stat.change}
                      </span>
                      <span className="ml-1">from last period</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <PiggyBank className="w-12 h-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No savings statistics available yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start recording deposits to see statistics.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Savings Overview Chart Placeholder */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Savings Growth Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Savings growth chart coming soon</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track monthly deposits and balance trends
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Savers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="w-5 h-5 mr-2" />
                Top Savers This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div>
                      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                      <div className="flex-1 space-y-1">
                        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="w-10 h-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : savingsAccounts.length > 0 ? (
                <div className="space-y-4">
                  {savingsAccounts.slice(0, 3).map((account, index) => (
                    <div key={account.id} className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={account.avatar || undefined} alt={account.member} />
                        <AvatarFallback>{account.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{account.member}</p>
                        <p className="text-xs text-muted-foreground">{account.balance}</p>
                      </div>
                      <Badge variant="outline">{account.progress}%</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No savers yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start recording deposits to see top savers.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="accounts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="accounts">Savings Accounts</TabsTrigger>
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
            <TabsTrigger value="interest">Interest Calculator</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Member Savings Accounts</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search accounts..." 
                        className="pl-10 w-64" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredSavingsAccounts.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Member</TableHead>
                          <TableHead>Account Type</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Interest Rate</TableHead>
                          <TableHead>Monthly Target</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead>Last Deposit</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSavingsAccounts.map((account) => (
                          <TableRow key={account.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={account.avatar || undefined} alt={account.member} />
                                  <AvatarFallback>{account.initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{account.member}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {account.id}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{account.accountType}</TableCell>
                            <TableCell className="font-medium">
                              {account.balance}
                            </TableCell>
                            <TableCell>{account.interestRate}</TableCell>
                            <TableCell>{account.monthlyTarget}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full" 
                                    style={{ width: `${Math.min(account.progress, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {account.progress}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {account.lastDeposit ? (
                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-2 text-muted-foreground" />
                                  {new Date(account.lastDeposit).toLocaleDateString()}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">No deposits yet</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <PiggyBank className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      {searchQuery ? `No accounts found for "${searchQuery}"` : "No savings accounts found."}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchQuery ? "Try a different search term." : "Create member savings accounts to start tracking."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Savings Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : recentTransactions.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Member</TableHead>
                          <TableHead>Transaction Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Account</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>New Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={transaction.avatar || undefined} alt={transaction.member} />
                                  <AvatarFallback>{transaction.initials}</AvatarFallback>
                                </Avatar>
                                <div className="font-medium">{transaction.member}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {transaction.type === "deposit" && (
                                  <>
                                    <ArrowUpRight className="h-4 w-4 mr-2 text-green-500" />
                                    <Badge variant="default">Deposit</Badge>
                                  </>
                                )}
                                {transaction.type === "withdrawal" && (
                                  <>
                                    <ArrowDownRight className="h-4 w-4 mr-2 text-red-500" />
                                    <Badge variant="destructive">Withdrawal</Badge>
                                  </>
                                )}
                                {transaction.type === "interest" && (
                                  <>
                                    <Percent className="h-4 w-4 mr-2 text-blue-500" />
                                    <Badge variant="secondary">Interest</Badge>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {transaction.type === "withdrawal" ? "-" : "+"}{transaction.amount}
                            </TableCell>
                            <TableCell>{transaction.account}</TableCell>
                            <TableCell>
                              {new Date(transaction.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-medium">
                              {transaction.balance}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ArrowUpRight className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No transactions found.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start recording deposits and withdrawals to see transaction history.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interest" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Interest Calculator</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Calculate compound interest on savings deposits
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="principal">Principal Amount (₦)</Label>
                      <Input
                        id="principal"
                        type="number"
                        step="0.01"
                        placeholder="1000.00"
                        value={interestCalculator.principal}
                        onChange={(e) => setInterestCalculator({
                          ...interestCalculator,
                          principal: e.target.value
                        })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="rate">Annual Interest Rate (%)</Label>
                      <Input
                        id="rate"
                        type="number"
                        step="0.1"
                        placeholder="5.5"
                        value={interestCalculator.rate}
                        onChange={(e) => setInterestCalculator({
                          ...interestCalculator,
                          rate: e.target.value
                        })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="time">Time Period (months)</Label>
                      <Input
                        id="time"
                        type="number"
                        placeholder="12"
                        value={interestCalculator.time}
                        onChange={(e) => setInterestCalculator({
                          ...interestCalculator,
                          time: e.target.value
                        })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="compound">Compounding Frequency</Label>
                      <Select
                        value={interestCalculator.compoundFrequency}
                        onValueChange={(value) => setInterestCalculator({
                          ...interestCalculator,
                          compoundFrequency: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={calculateInterest}
                      disabled={!interestCalculator.principal || !interestCalculator.rate || !interestCalculator.time}
                    >
                      Calculate Interest
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">Calculation Results</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Principal Amount:</span>
                          <span className="font-medium">
                            ₦{calculationResults.calculated ? calculationResults.principal.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Interest Earned:</span>
                          <span className="font-medium text-green-600">
                            ₦{calculationResults.calculated ? calculationResults.interestEarned.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Final Amount:</span>
                          <span className="font-medium">
                            ₦{calculationResults.calculated ? calculationResults.finalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                          </span>
                        </div>
                        {calculationResults.calculated && (
                          <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded">
                            <p className="text-sm text-green-700">
                              <strong>Effective Rate:</strong> {((calculationResults.finalAmount / calculationResults.principal - 1) * 100).toFixed(2)}% over {interestCalculator.time} months
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        This calculation shows compound interest based on the selected frequency.
                        Actual rates may vary based on cooperative policies and account terms.
                      </p>
                      {calculationResults.calculated && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">
                            <strong>Formula:</strong> A = P(1 + r/n)^(nt)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Where A = final amount, P = principal, r = annual rate, n = compounding frequency, t = time
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}