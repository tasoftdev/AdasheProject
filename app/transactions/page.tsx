"use client"

import { useEffect, useState } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  FileText,
  TrendingUp,
  CreditCard,
  PiggyBank,
  Users,
  Sparkles,
  Zap,
  BarChart3,
  Target,
  Wallet,
} from "lucide-react"
import { TransactionRowSkeleton } from "@/components/ui/skeletons"

const getInitials = (name: string | undefined | null): string => {
  if (!name || typeof name !== 'string') {
    return '??'
  }
  
  const nameParts = name.trim().split(' ')
  if (nameParts.length === 0) return '??'
  
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase()
  }
  
  return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
}

// Types
interface Transaction {
  id: string
  date: string
  type: string
  category: string
  member: string
  avatar?: string
  initials: string
  amount: string
  status: string
  reference: string
  description: string
  balance: string
}

interface TransactionStats {
  title: string
  value: string
  change: string
  icon: any
  description: string
  color: string
  bgColor: string
  iconColor: string
}

interface TransactionType {
  label: string
  value: string
  count: number
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionStats, setTransactionStats] = useState<TransactionStats[]>([])
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([])
  const [summaryData, setSummaryData] = useState({
    today: { count: 0, inflow: 0, outflow: 0, netFlow: 0 },
    week: { count: 0, inflow: 0, outflow: 0, netFlow: 0 },
    month: { count: 0, inflow: 0, outflow: 0, netFlow: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchTransactionData()
  }, [selectedType, selectedStatus])

  const fetchTransactionData = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (selectedType !== "all") params.append("type", selectedType)
      if (selectedStatus !== "all") params.append("status", selectedStatus)
      if (searchTerm) params.append("search", searchTerm)
      params.append("limit", "50")
      const [transactionsResponse, summaryResponse] = await Promise.all([
        fetch(`/api/reports/transactions?${params}`),
        fetch('/api/transactions/summary')
      ])
      
      if (!transactionsResponse.ok || !summaryResponse.ok) {
        throw new Error('Failed to fetch transaction data')
      }
      
      const transactionData = await transactionsResponse.json()
      const summaryData = await summaryResponse.json()
      
      setSummaryData(summaryData)
      
      const transformedTransactions = transactionData.transactions?.map((tx: any) => ({
        id: tx.id,
        date: new Date(tx.date).toLocaleString(),
        type: tx.type,
        category: tx.category || tx.type,
        member: tx.memberName || 'Unknown Member', 
        initials: getInitials(tx.memberName), 
        amount: tx.amount,
        status: tx.status || 'completed',
        reference: tx.reference || tx.id,
        description: tx.description || `${tx.type} transaction`,
        balance: tx.balance || '₦0.00'
      })) || []

      setTransactions(transformedTransactions)
      
      const totalTransactions = transformedTransactions.length
      const totalVolume = transformedTransactions.reduce((sum: number, tx: any) => {
        const amount = parseFloat(tx.amount.replace(/[₦,]/g, '')) || 0
        return sum + amount
      }, 0)
      const successRate = transformedTransactions.filter((tx: any) => tx.status === 'completed').length / totalTransactions * 100
      const avgTransaction = totalVolume / totalTransactions

      const stats = [
        {
          title: "Total Transactions",
          value: totalTransactions.toLocaleString(),
          change: "+0%",
          icon: RefreshCw,
          description: "Current period",
          color: "from-blue-500 to-cyan-500",
          bgColor: "bg-blue-50",
          iconColor: "text-blue-600"
        },
        {
          title: "Transaction Volume",
          value: new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
          }).format(totalVolume),
          change: "+0%",
          icon: DollarSign,
          description: "Total value",
          color: "from-green-500 to-teal-500",
          bgColor: "bg-green-50",
          iconColor: "text-green-600"
        },
        {
          title: "Success Rate",
          value: `${successRate.toFixed(1)}%`,
          change: "+0%",
          icon: TrendingUp,
          description: "Successful transactions",
          color: "from-purple-500 to-pink-500",
          bgColor: "bg-purple-50",
          iconColor: "text-purple-600"
        },
        {
          title: "Average Transaction",
          value: new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
          }).format(avgTransaction || 0),
          change: "+0%",
          icon: FileText,
          description: "Average amount",
          color: "from-orange-500 to-red-500",
          bgColor: "bg-orange-50",
          iconColor: "text-orange-600"
        }
      ]

      setTransactionStats(stats)

      const typeCount = transformedTransactions.reduce((acc: any, tx: any) => {
        acc[tx.type] = (acc[tx.type] || 0) + 1
        return acc
      }, {})

      const types = [
        { label: "All Transactions", value: "all", count: totalTransactions },
        ...Object.entries(typeCount).map(([type, count]) => ({
          label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
          value: type,
          count: count as number
        }))
      ]

      setTransactionTypes(types)
      
    } catch (error) {
      console.error('Error fetching transaction data:', error)
      toast.error('Failed to load transaction data')
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(transaction =>
    transaction.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleExport = () => {
    toast.info('Export functionality will be implemented soon')
  }

  return (
    <AppLayout>
      <div className="space-y-6 relative">
        {mounted && (
          <div className="absolute inset-0 overflow-hidden -z-10">
            <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
            <div className="absolute bottom-10 left-10 w-48 h-48 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animation-delay-2000"></div>
            <div className="absolute top-1/2 right-1/3 w-28 h-28 bg-gradient-to-r from-green-200 to-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animation-delay-4000"></div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg">
                <RefreshCw className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  Transaction History
                </h1>
                <p className="text-base sm:text-lg text-gray-600 font-medium mt-1">
                  View and manage all financial transactions across the cooperative.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => fetchTransactionData()}
              className="border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              <Filter className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={handleExport}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
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
              ))}
            </div>
            <Card className="bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardHeader>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50/50">
                        <th className="p-4 text-left">Transaction</th>
                        <th className="p-4 text-left">Member</th>
                        <th className="p-4 text-left">Type</th>
                        <th className="p-4 text-left">Amount</th>
                        <th className="p-4 text-left">Status</th>
                        <th className="p-4 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <TransactionRowSkeleton key={i} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {transactionStats.map((stat) => (
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
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500 flex-shrink-0" />
                      <span className="truncate font-medium">{stat.change}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-4">
              {/* Transaction Categories */}
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-teal-500"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <Target className="h-5 w-5 text-green-600" />
                    Transaction Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transactionTypes.map((type) => (
                      <div 
                        key={type.value} 
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                          selectedType === type.value 
                            ? 'bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 shadow-sm' 
                            : 'hover:bg-gray-50/50 border border-transparent hover:border-gray-200'
                        }`}
                        onClick={() => setSelectedType(type.value)}
                      >
                        <div className="flex items-center space-x-3">
                          {type.value === "contribution" && <Users className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform duration-200" />}
                          {type.value === "loan_payment" && <CreditCard className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform duration-200" />}
                          {type.value === "savings_deposit" && <PiggyBank className="h-4 w-4 text-purple-500 group-hover:scale-110 transition-transform duration-200" />}
                          {type.value === "loan_disbursement" && <ArrowDownRight className="h-4 w-4 text-orange-500 group-hover:scale-110 transition-transform duration-200" />}
                          {type.value === "withdrawal" && <ArrowUpRight className="h-4 w-4 text-red-500 group-hover:scale-110 transition-transform duration-200" />}
                          {type.value === "interest" && <DollarSign className="h-4 w-4 text-yellow-500 group-hover:scale-110 transition-transform duration-200" />}
                          {type.value === "all" && <RefreshCw className="h-4 w-4 text-gray-500 group-hover:scale-110 transition-transform duration-200" />}
                          <span className={`text-sm font-medium transition-colors duration-200 ${
                            selectedType === type.value ? 'text-green-700' : 'text-gray-700 group-hover:text-gray-900'
                          }`}>
                            {type.label}
                          </span>
                        </div>
                        <Badge 
                          variant={selectedType === type.value ? "default" : "secondary"}
                          className={selectedType === type.value 
                            ? "bg-gradient-to-r from-green-500 to-teal-500 text-white" 
                            : "bg-gray-100 text-gray-700"
                          }
                        >
                          {type.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Transaction Volume Chart Placeholder */}
              <Card className="lg:col-span-3 bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Transaction Volume Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center border border-gray-200">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                      <p className="text-gray-600 font-medium">Transaction volume chart coming soon</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Daily, weekly, and monthly transaction trends
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    All Transactions
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Search transactions..." 
                        className="pl-10 w-48 bg-white/50 border-gray-200 focus:border-purple-500 transition-all duration-200"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                    </div>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-40 bg-white/50 border-gray-200">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="contribution">Contributions</SelectItem>
                        <SelectItem value="loan_payment">Loan Payments</SelectItem>
                        <SelectItem value="savings_deposit">Savings</SelectItem>
                        <SelectItem value="withdrawal">Withdrawals</SelectItem>
                        <SelectItem value="loan_disbursement">Loan Disbursements</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-32 bg-white/50 border-gray-200">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="list" className="space-y-4">
                  <TabsList className="bg-gray-100/50 p-1 rounded-lg">
                    <TabsTrigger 
                      value="list" 
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 font-medium"
                    >
                      Transaction List
                    </TabsTrigger>
                    <TabsTrigger 
                      value="summary"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 font-medium"
                    >
                      Daily Summary
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="list" className="space-y-4">
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent bg-gray-50/50">
                            <TableHead className="font-semibold text-gray-700">Transaction ID</TableHead>
                            <TableHead className="font-semibold text-gray-700">Date & Time</TableHead>
                            <TableHead className="font-semibold text-gray-700">Member</TableHead>
                            <TableHead className="font-semibold text-gray-700">Type</TableHead>
                            <TableHead className="font-semibold text-gray-700">Category</TableHead>
                            <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                            <TableHead className="font-semibold text-gray-700">Status</TableHead>
                            <TableHead className="font-semibold text-gray-700">Reference</TableHead>
                            <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((transaction) => (
                            <TableRow 
                              key={transaction.id}
                              className="hover:bg-gray-50/50 transition-colors duration-150 group"
                            >
                              <TableCell className="font-medium text-gray-900">
                                {transaction.id}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center text-gray-600 font-medium">
                                  <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                                  <div>
                                    <div className="text-sm font-medium">
                                      {new Date(transaction.date).toLocaleDateString()}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(transaction.date).toLocaleTimeString()}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-8 w-8 border border-gray-200 group-hover:border-purple-200 transition-colors duration-200">
                                    <AvatarImage src={transaction.avatar} alt={transaction.member} />
                                    <AvatarFallback className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 font-medium">
                                      {transaction.initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="font-semibold text-gray-900">{transaction.member}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  {transaction.type === "Contribution" && (
                                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                                  )}
                                  {transaction.type === "Loan Disbursement" && (
                                    <ArrowDownRight className="h-4 w-4 mr-2 text-orange-500" />
                                  )}
                                  {transaction.type === "Savings Deposit" && (
                                    <PiggyBank className="h-4 w-4 mr-2 text-purple-500" />
                                  )}
                                  {transaction.type === "Loan Payment" && (
                                    <CreditCard className="h-4 w-4 mr-2 text-green-500" />
                                  )}
                                  {transaction.type === "Withdrawal" && (
                                    <ArrowUpRight className="h-4 w-4 mr-2 text-red-500" />
                                  )}
                                  {transaction.type === "Interest Credit" && (
                                    <DollarSign className="h-4 w-4 mr-2 text-yellow-500" />
                                  )}
                                  {transaction.type === "Fee Payment" && (
                                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                  )}
                                  <span className="text-sm font-medium text-gray-700">{transaction.type}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-gray-600 font-medium">
                                {transaction.category}
                              </TableCell>
                              <TableCell className="font-bold">
                                <span className={
                                  transaction.type === "Withdrawal" || transaction.type === "Loan Disbursement"
                                    ? "text-red-600" 
                                    : "text-green-600"
                                }>
                                  {transaction.type === "Withdrawal" || transaction.type === "Loan Disbursement" ? "-" : "+"}
                                  {transaction.amount}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    transaction.status === "completed"
                                      ? "default"
                                      : transaction.status === "pending"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                  className="font-medium"
                                >
                                  {transaction.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-gray-500 font-medium">
                                {transaction.reference}
                              </TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                                  <FileText className="h-3 w-3 mr-1" />
                                  Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={9} className="text-center py-8">
                                <div className="flex flex-col items-center justify-center">
                                  <Search className="w-12 h-12 text-gray-400 mb-2" />
                                  <p className="text-gray-600 font-medium">No transactions found</p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    No transactions match your current filters
                                  </p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  <TabsContent value="summary" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-semibold text-blue-800 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Today's Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700 font-medium">Total Transactions:</span>
                            <span className="font-bold text-blue-900">{summaryData.today.count}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-600 font-medium">Total Inflow:</span>
                            <span className="font-bold text-green-700">
                              +{new Intl.NumberFormat('en-NG', {
                                style: 'currency',
                                currency: 'NGN'
                              }).format(summaryData.today.inflow)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-red-600 font-medium">Total Outflow:</span>
                            <span className="font-bold text-red-700">
                              -{new Intl.NumberFormat('en-NG', {
                                style: 'currency',
                                currency: 'NGN'
                              }).format(summaryData.today.outflow)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center border-t border-blue-200 pt-3">
                            <span className="text-blue-800 font-semibold">Net Flow:</span>
                            <span className={`font-bold text-lg ${
                              summaryData.today.netFlow >= 0 ? "text-green-600" : "text-red-600"
                            }`}>
                              {summaryData.today.netFlow >= 0 ? "+" : ""}
                              {new Intl.NumberFormat('en-NG', {
                                style: 'currency',
                                currency: 'NGN'
                              }).format(summaryData.today.netFlow)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-semibold text-purple-800 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            This Week
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-purple-700 font-medium">Total Transactions:</span>
                            <span className="font-bold text-purple-900">{summaryData.week.count}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-600 font-medium">Total Inflow:</span>
                            <span className="font-bold text-green-700">
                              +{new Intl.NumberFormat('en-NG', {
                                style: 'currency',
                                currency: 'NGN'
                              }).format(summaryData.week.inflow)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-red-600 font-medium">Total Outflow:</span>
                            <span className="font-bold text-red-700">
                              -{new Intl.NumberFormat('en-NG', {
                                style: 'currency',
                                currency: 'NGN'
                              }).format(summaryData.week.outflow)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center border-t border-purple-200 pt-3">
                            <span className="text-purple-800 font-semibold">Net Flow:</span>
                            <span className={`font-bold text-lg ${
                              summaryData.week.netFlow >= 0 ? "text-green-600" : "text-red-600"
                            }`}>
                              {summaryData.week.netFlow >= 0 ? "+" : ""}
                              {new Intl.NumberFormat('en-NG', {
                                style: 'currency',
                                currency: 'NGN'
                              }).format(summaryData.week.netFlow)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-semibold text-orange-800 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            This Month
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-orange-700 font-medium">Total Transactions:</span>
                            <span className="font-bold text-orange-900">{summaryData.month.count}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-600 font-medium">Total Inflow:</span>
                            <span className="font-bold text-green-700">
                              +{new Intl.NumberFormat('en-NG', {
                                style: 'currency',
                                currency: 'NGN'
                              }).format(summaryData.month.inflow)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-red-600 font-medium">Total Outflow:</span>
                            <span className="font-bold text-red-700">
                              -{new Intl.NumberFormat('en-NG', {
                                style: 'currency',
                                currency: 'NGN'
                              }).format(summaryData.month.outflow)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center border-t border-orange-200 pt-3">
                            <span className="text-orange-800 font-semibold">Net Flow:</span>
                            <span className={`font-bold text-lg ${
                              summaryData.month.netFlow >= 0 ? "text-green-600" : "text-red-600"
                            }`}>
                              {summaryData.month.netFlow >= 0 ? "+" : ""}
                              {new Intl.NumberFormat('en-NG', {
                                style: 'currency',
                                currency: 'NGN'
                              }).format(summaryData.month.netFlow)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}
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