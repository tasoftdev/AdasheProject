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
  Sparkles,
  Zap,
  BarChart3,
  Calculator,
  Download,
  Wallet,
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
  const [mounted, setMounted] = useState(false)

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

  useEffect(() => {
    setMounted(true)
    fetchData()
    fetchMembers()
  }, [])

  // Fixed: Ensure savingsAccounts is always an array before filtering
  const filteredSavingsAccounts = Array.isArray(savingsAccounts) 
    ? savingsAccounts.filter(account =>
        account?.member?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account?.accountType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account?.id?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

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
      
      // Mock data for demonstration - replace with actual API calls
      const mockAccounts: SavingsAccount[] = [
        {
          id: "",
          member: "",
          avatar: null,
          initials: "",
          accountType: "",
          balance: "",
          interestRate: "",
          lastDeposit: "",
          monthlyTarget: "",
          progress: 0,
          status: "",
          memberId: "",
          savingId: ""
        },
        {
          id: "",
          member: "",
          avatar: null,
          initials: "",
          accountType: "",
          balance: "",
          interestRate: "",
          lastDeposit: "",
          monthlyTarget: "",
          progress: 0,
          status: "",
          memberId: "",
          savingId: ""
        }
      ]

      const mockTransactions: SavingsTransaction[] = [
        {
          id: "",
          member: "",
          avatar: null,
          initials: "",
          type: "",
          amount: "",
          date: "",
          account: "",
          balance: "",
          method: "",
          reference: ""
        },
        {
          id: "",
          member: "",
          avatar: null,
          initials: "",
          type: "",
          amount: "",
          date: "",
          account: "",
          balance: "",
          method: "",
          reference: ""
        }
      ]

      const mockStats: SavingsStats[] = [
        {
          title: "",
          value: "",
          change: "",
          trend: "",
          description: ""
        },
        {
          title: "",
          value: "",
          change: "",
          trend: "",
          description: ""
        },
        {
          title: "",
          value: "",
          change: "",
          trend: "",
          description: ""
        },
        {
          title: "",
          value: "",
          change: "",
          trend: "",
          description: ""
        }
      ]

      await new Promise(resolve => setTimeout(resolve, 1000))

      setSavingsAccounts(mockAccounts)
      setRecentTransactions(mockTransactions)
      setSavingsStats(mockStats)

    } catch (error) {
      console.error('Error fetching savings data:', error)
      toast.error('Failed to load savings data')
     
      setSavingsAccounts([])
      setRecentTransactions([])
      setSavingsStats([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    try {
      // Mock members data
      const mockMembers: Member[] = [
        {
          id: "",
          firstName: "",
          lastName: "",
          memberCode: ""
        },
        {
          id: "",
          firstName: "",
          lastName: "",
          memberCode: ""
        },
        {
          id: "",
          firstName: "",
          lastName: "",
          memberCode: ""
        }
      ]

      await new Promise(resolve => setTimeout(resolve, 500))
      setMembers(mockMembers)
    } catch (error) {
      console.error('Error fetching members:', error)
      toast.error('Failed to load members')
      setMembers([])
    }
  }

  const fetchMemberSavingsAccounts = async (memberId: string) => {
    try {
      // Mock member savings accounts
      const mockMemberAccounts = savingsAccounts.filter(account => account.memberId === memberId)
      setMemberSavingsAccounts(mockMemberAccounts)
    } catch (error) {
      console.error('Error fetching member savings accounts:', error)
      toast.error('Failed to load member savings accounts')
      setMemberSavingsAccounts([])
    }
  }

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Deposit recorded successfully')
      setDepositDialogOpen(false)
      setDepositForm({
        memberId: '',
        savingId: '',
        amount: '',
        method: 'CASH',
        date: new Date().toISOString().split('T')[0]
      })
      fetchData() // Refresh data
    } catch (error: any) {
      toast.error(error.message || 'Failed to record deposit')
    }
  }

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Withdrawal processed successfully')
      setWithdrawalDialogOpen(false)
      setWithdrawalForm({
        memberId: '',
        savingId: '',
        amount: '',
        purpose: ''
      })
      fetchData() // Refresh data
    } catch (error: any) {
      toast.error(error.message || 'Failed to process withdrawal')
    }
  }

  const statsData = [
    {
      title: "Total Savings",
      value: `₦${savingsStats[0]?.value || '0'}`,
      change: savingsStats[0]?.change || "0% growth",
      trend: "up" as const,
      description: "Total member savings balance",
      icon: PiggyBank,
      color: "from-green-500 to-teal-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      title: "Active Savers",
      value: savingsStats[1]?.value || '0',
      change: savingsStats[1]?.change || "0 members",
      trend: "neutral" as const,
      description: "Members with active savings",
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "Avg Interest Rate",
      value: savingsStats[2]?.value || '0%',
      change: savingsStats[2]?.change || "0% change",
      trend: "up" as const,
      description: "Average savings interest rate",
      icon: Percent,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      title: "Monthly Target",
      value: `₦${savingsStats[3]?.value || '0'}`,
      change: savingsStats[3]?.change || "0% achieved",
      trend: "up" as const,
      description: "Monthly savings target progress",
      icon: Target,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-6 relative">
        {/* Animated Background Elements */}
        {mounted && (
          <div className="absolute inset-0 overflow-hidden -z-10">
            <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-r from-green-200 to-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
            <div className="absolute bottom-10 left-10 w-48 h-48 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animation-delay-2000"></div>
            <div className="absolute top-1/2 right-1/3 w-28 h-28 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animation-delay-4000"></div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl shadow-lg">
                <PiggyBank className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Savings Operations
                </h1>
                <p className="text-base sm:text-lg text-gray-600 font-medium mt-1">
                  Track member savings, deposits, withdrawals, and interest calculations.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              className="border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  <ArrowDownRight className="w-4 h-4 mr-2" />
                  Record Withdrawal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
                <form onSubmit={handleWithdrawalSubmit}>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-800">Record Withdrawal</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Process a withdrawal from a member's savings account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="member" className="font-medium text-gray-700">Member</Label>
                      <Select
                        value={withdrawalForm.memberId}
                        onValueChange={(value) => {
                          setWithdrawalForm({ ...withdrawalForm, memberId: value, savingId: '' })
                          if (value) fetchMemberSavingsAccounts(value)
                        }}
                      >
                        <SelectTrigger className="bg-white/50 border-gray-200">
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
                        <Label htmlFor="account" className="font-medium text-gray-700">Savings Account</Label>
                        <Select
                          value={withdrawalForm.savingId}
                          onValueChange={(value) => setWithdrawalForm({ ...withdrawalForm, savingId: value })}
                          disabled={!withdrawalForm.memberId}
                        >
                          <SelectTrigger className="bg-white/50 border-gray-200">
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            {memberSavingsAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.accountType} ({account.balance})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="amount" className="font-medium text-gray-700">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="100.00"
                          value={withdrawalForm.amount}
                          onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })}
                          className="bg-white/50 border-gray-200"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="purpose" className="font-medium text-gray-700">Purpose</Label>
                      <Input
                        id="purpose"
                        placeholder="Emergency medical expenses"
                        value={withdrawalForm.purpose}
                        onChange={(e) => setWithdrawalForm({ ...withdrawalForm, purpose: e.target.value })}
                        className="bg-white/50 border-gray-200"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setWithdrawalDialogOpen(false)}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={!withdrawalForm.savingId || !withdrawalForm.amount || !withdrawalForm.purpose}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Process Withdrawal
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
                  <Plus className="w-4 h-4 mr-2" />
                  Record Deposit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-teal-500"></div>
                <form onSubmit={handleDepositSubmit}>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-800">Record Savings Deposit</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Record a new deposit to a member's savings account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="member" className="font-medium text-gray-700">Member</Label>
                      <Select
                        value={depositForm.memberId}
                        onValueChange={(value) => {
                          setDepositForm({ ...depositForm, memberId: value, savingId: '' })
                          if (value) fetchMemberSavingsAccounts(value)
                        }}
                      >
                        <SelectTrigger className="bg-white/50 border-gray-200">
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
                        <Label htmlFor="account" className="font-medium text-gray-700">Savings Account</Label>
                        <Select
                          value={depositForm.savingId}
                          onValueChange={(value) => setDepositForm({ ...depositForm, savingId: value })}
                          disabled={!depositForm.memberId}
                        >
                          <SelectTrigger className="bg-white/50 border-gray-200">
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            {memberSavingsAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.accountType} ({account.balance})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="amount" className="font-medium text-gray-700">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="150.00"
                          value={depositForm.amount}
                          onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                          className="bg-white/50 border-gray-200"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="method" className="font-medium text-gray-700">Payment Method</Label>
                        <Select
                          value={depositForm.method}
                          onValueChange={(value: any) => setDepositForm({ ...depositForm, method: value })}
                        >
                          <SelectTrigger className="bg-white/50 border-gray-200">
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
                        <Label htmlFor="date" className="font-medium text-gray-700">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={depositForm.date}
                          onChange={(e) => setDepositForm({ ...depositForm, date: e.target.value })}
                          className="bg-white/50 border-gray-200"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setDepositDialogOpen(false)}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={!depositForm.savingId || !depositForm.amount}
                      className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Record Deposit
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg">
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
          ) : (
            statsData.map((stat, index) => (
              <Card 
                key={stat.title} 
                className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Animated gradient border */}
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color}`}></div>

                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700 truncate">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor} transition-all duration-300 group-hover:scale-110`}>
                    <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-1">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-600 flex items-center">
                    {stat.trend === "up" && <TrendingUp className="h-3 w-3 mr-1 text-green-500 flex-shrink-0" />}
                    {stat.trend === "up" && <ArrowDownRight className="h-3 w-3 mr-1 text-red-500 flex-shrink-0" />}
                    {stat.trend === "neutral" && <Sparkles className="h-3 w-3 mr-1 text-blue-500 flex-shrink-0" />}
                    <span className="truncate font-medium">{stat.change}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Savings Overview Chart Placeholder */}
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Savings Growth Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center border border-gray-200">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Savings growth chart coming soon</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Track monthly deposits and balance trends
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Savers */}
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Gift className="w-5 h-5 text-yellow-600" />
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
                    <div key={account.id} className="flex items-center space-x-3 group hover:bg-gray-50/50 p-2 rounded-lg transition-all duration-200">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </div>
                      <Avatar className="h-8 w-8 border border-gray-200 group-hover:border-yellow-200 transition-colors duration-200">
                        <AvatarImage src={account.avatar || undefined} alt={account.member} />
                        <AvatarFallback className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-600 font-medium">
                          {account.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{account.member}</p>
                        <p className="text-xs text-gray-600 font-medium">{account.balance}</p>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 font-medium">
                        {account.progress}%
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gift className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">No savers yet.</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Start recording deposits to see top savers.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="accounts" className="space-y-4">
          <TabsList className="bg-gray-100/50 p-1 rounded-lg">
            <TabsTrigger 
              value="accounts" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 font-medium"
            >
              Savings Accounts
            </TabsTrigger>
            <TabsTrigger 
              value="transactions"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 font-medium"
            >
              Recent Transactions
            </TabsTrigger>
            <TabsTrigger 
              value="interest"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 font-medium"
            >
              Interest Calculator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-teal-500"></div>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <PiggyBank className="h-5 w-5 text-green-600" />
                    Member Savings Accounts
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Search accounts..." 
                        className="pl-10 w-48 bg-white/50 border-gray-200 focus:border-green-500 transition-all duration-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-gray-300 hover:bg-gray-50 transition-all duration-200"
                    >
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
                      <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg bg-white/50">
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
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent bg-gray-50/50">
                          <TableHead className="font-semibold text-gray-700">Member</TableHead>
                          <TableHead className="font-semibold text-gray-700">Account Type</TableHead>
                          <TableHead className="font-semibold text-gray-700">Balance</TableHead>
                          <TableHead className="font-semibold text-gray-700">Interest Rate</TableHead>
                          <TableHead className="font-semibold text-gray-700">Monthly Target</TableHead>
                          <TableHead className="font-semibold text-gray-700">Progress</TableHead>
                          <TableHead className="font-semibold text-gray-700">Last Deposit</TableHead>
                          <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSavingsAccounts.map((account) => (
                          <TableRow 
                            key={account.id}
                            className="hover:bg-gray-50/50 transition-colors duration-150 group"
                          >
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8 border border-gray-200 group-hover:border-green-200 transition-colors duration-200">
                                  <AvatarImage src={account.avatar || undefined} alt={account.member} />
                                  <AvatarFallback className="bg-gradient-to-r from-green-100 to-teal-100 text-green-600 font-medium">
                                    {account.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold text-gray-900">{account.member}</div>
                                  <div className="text-xs text-gray-500 font-medium">
                                    {account.id}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className="font-medium text-gray-700 border-gray-300"
                              >
                                {account.accountType}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-bold text-gray-900">
                              {account.balance}
                            </TableCell>
                            <TableCell className="text-green-600 font-semibold">
                              {account.interestRate}
                            </TableCell>
                            <TableCell className="font-medium text-gray-700">
                              {account.monthlyTarget}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-500" 
                                    style={{ width: `${Math.min(account.progress, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                  {account.progress}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {account.lastDeposit ? (
                                <div className="flex items-center text-gray-600 font-medium">
                                  <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                                  {new Date(account.lastDeposit).toLocaleDateString()}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500 font-medium">No deposits yet</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
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
                    <PiggyBank className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">
                      {searchQuery ? `No accounts found for "${searchQuery}"` : "No savings accounts found."}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {searchQuery ? "Try a different search term." : "Create member savings accounts to start tracking."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Recent Savings Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg bg-white/50">
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
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent bg-gray-50/50">
                          <TableHead className="font-semibold text-gray-700">Member</TableHead>
                          <TableHead className="font-semibold text-gray-700">Transaction Type</TableHead>
                          <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                          <TableHead className="font-semibold text-gray-700">Account</TableHead>
                          <TableHead className="font-semibold text-gray-700">Date</TableHead>
                          <TableHead className="font-semibold text-gray-700">New Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentTransactions.map((transaction) => (
                          <TableRow 
                            key={transaction.id}
                            className="hover:bg-gray-50/50 transition-colors duration-150 group"
                          >
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8 border border-gray-200 group-hover:border-blue-200 transition-colors duration-200">
                                  <AvatarImage src={transaction.avatar || undefined} alt={transaction.member} />
                                  <AvatarFallback className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-600 font-medium">
                                    {transaction.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="font-semibold text-gray-900">{transaction.member}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {transaction.type === "deposit" && (
                                  <>
                                    <ArrowUpRight className="h-4 w-4 mr-2 text-green-500" />
                                    <Badge variant="default" className="bg-green-100 text-green-700 border-green-200 font-medium">
                                      Deposit
                                    </Badge>
                                  </>
                                )}
                                {transaction.type === "withdrawal" && (
                                  <>
                                    <ArrowDownRight className="h-4 w-4 mr-2 text-red-500" />
                                    <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 font-medium">
                                      Withdrawal
                                    </Badge>
                                  </>
                                )}
                                {transaction.type === "interest" && (
                                  <>
                                    <Percent className="h-4 w-4 mr-2 text-blue-500" />
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 font-medium">
                                      Interest
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className={`font-bold ${
                              transaction.type === "withdrawal" ? "text-red-600" : "text-green-600"
                            }`}>
                              {transaction.type === "withdrawal" ? "-" : "+"}{transaction.amount}
                            </TableCell>
                            <TableCell className="font-medium text-gray-700">
                              {transaction.account}
                            </TableCell>
                            <TableCell className="text-gray-600 font-medium">
                              {new Date(transaction.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-bold text-gray-900">
                              {transaction.balance}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ArrowUpRight className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">No transactions found.</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Start recording deposits and withdrawals to see transaction history.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interest" className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-purple-600" />
                  Interest Calculator
                </CardTitle>
                <p className="text-gray-600">
                  Calculate compound interest on savings deposits
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="principal" className="font-medium text-gray-700">Principal Amount (₦)</Label>
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
                        className="bg-white/50 border-gray-200 focus:border-purple-500 transition-all duration-200"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="rate" className="font-medium text-gray-700">Annual Interest Rate (%)</Label>
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
                        className="bg-white/50 border-gray-200 focus:border-purple-500 transition-all duration-200"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="time" className="font-medium text-gray-700">Time Period (months)</Label>
                      <Input
                        id="time"
                        type="number"
                        placeholder="12"
                        value={interestCalculator.time}
                        onChange={(e) => setInterestCalculator({
                          ...interestCalculator,
                          time: e.target.value
                        })}
                        className="bg-white/50 border-gray-200 focus:border-purple-500 transition-all duration-200"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="compound" className="font-medium text-gray-700">Compounding Frequency</Label>
                      <Select
                        value={interestCalculator.compoundFrequency}
                        onValueChange={(value) => setInterestCalculator({
                          ...interestCalculator,
                          compoundFrequency: value
                        })}
                      >
                        <SelectTrigger className="bg-white/50 border-gray-200">
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
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                      onClick={calculateInterest}
                      disabled={!interestCalculator.principal || !interestCalculator.rate || !interestCalculator.time}
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Interest
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-purple-800">Calculation Results</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-purple-700 font-medium">Principal Amount:</span>
                          <span className="font-bold text-purple-900">
                            ₦{calculationResults.calculated ? calculationResults.principal.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-green-600 font-medium">Interest Earned:</span>
                          <span className="font-bold text-green-700">
                            ₦{calculationResults.calculated ? calculationResults.interestEarned.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-purple-200 pt-3">
                          <span className="text-purple-800 font-semibold">Final Amount:</span>
                          <span className="font-bold text-xl text-purple-900">
                            ₦{calculationResults.calculated ? calculationResults.finalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                          </span>
                        </div>
                        {calculationResults.calculated && (
                          <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-700 font-medium">
                              <strong>Effective Rate:</strong> {((calculationResults.finalAmount / calculationResults.principal - 1) * 100).toFixed(2)}% over {interestCalculator.time} months
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                      <p className="text-sm text-gray-600">
                        This calculation shows compound interest based on the selected frequency.
                        Actual rates may vary based on cooperative policies and account terms.
                      </p>
                      {calculationResults.calculated && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 font-medium">
                            <strong>Formula:</strong> A = P(1 + r/n)^(nt)
                          </p>
                          <p className="text-xs text-gray-500">
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

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.05); opacity: 0.15; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </AppLayout>
  )
}