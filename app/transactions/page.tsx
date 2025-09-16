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
} from "lucide-react"
import { TransactionRowSkeleton } from "@/components/ui/skeletons"

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

  useEffect(() => {
    fetchTransactionData()
  }, [selectedType, selectedStatus])

  const fetchTransactionData = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (selectedType !== "all") params.append("type", selectedType)
      if (selectedStatus !== "all") params.append("status", selectedStatus)
      if (searchTerm) params.append("search", searchTerm)
      params.append("limit", "50")

      // Fetch both transactions and summary data in parallel
      const [transactionsResponse, summaryResponse] = await Promise.all([
        fetch(`/api/reports/transactions?${params}`),
        fetch('/api/transactions/summary')
      ])
      
      if (!transactionsResponse.ok || !summaryResponse.ok) {
        throw new Error('Failed to fetch transaction data')
      }
      
      const transactionData = await transactionsResponse.json()
      const summaryData = await summaryResponse.json()
      
      // Update summary state
      setSummaryData(summaryData)
      
      // Transform data to match UI expectations
      const transformedTransactions = transactionData.transactions?.map((tx: any) => ({
        id: tx.id,
        date: new Date(tx.date).toLocaleString(),
        type: tx.type,
        category: tx.category || tx.type,
        member: tx.memberName,
        initials: tx.memberName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        amount: tx.amount,
        status: tx.status || 'completed',
        reference: tx.reference || tx.id,
        description: tx.description || `${tx.type} transaction`,
        balance: tx.balance || '₦0.00'
      })) || []

      setTransactions(transformedTransactions)
      
      // Generate statistics from real data
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
          description: "Current period"
        },
        {
          title: "Transaction Volume",
          value: new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
          }).format(totalVolume),
          change: "+0%",
          icon: DollarSign,
          description: "Total value"
        },
        {
          title: "Success Rate",
          value: `${successRate.toFixed(1)}%`,
          change: "+0%",
          icon: TrendingUp,
          description: "Successful transactions"
        },
        {
          title: "Average Transaction",
          value: new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
          }).format(avgTransaction || 0),
          change: "+0%",
          icon: FileText,
          description: "Average amount"
        }
      ]

      setTransactionStats(stats)

      // Generate transaction types from real data
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
            <p className="text-muted-foreground">
              View and manage all financial transactions across the cooperative.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => fetchTransactionData()}>
              <Filter className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div className="border rounded-lg">
              <div className="p-4 border-b">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
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
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {transactionStats.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500">{stat.change}</span> {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Transaction Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactionTypes.map((type) => (
                  <div 
                    key={type.value} 
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedType === type.value ? 'bg-primary/10 border border-primary' : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedType(type.value)}
                  >
                    <div className="flex items-center space-x-2">
                      {type.value === "contribution" && <Users className="h-4 w-4 text-blue-500" />}
                      {type.value === "loan_payment" && <CreditCard className="h-4 w-4 text-green-500" />}
                      {type.value === "savings_deposit" && <PiggyBank className="h-4 w-4 text-purple-500" />}
                      {type.value === "loan_disbursement" && <ArrowDownRight className="h-4 w-4 text-orange-500" />}
                      {type.value === "withdrawal" && <ArrowUpRight className="h-4 w-4 text-red-500" />}
                      {type.value === "interest" && <DollarSign className="h-4 w-4 text-yellow-500" />}
                      {type.value === "all" && <RefreshCw className="h-4 w-4 text-gray-500" />}
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                    <Badge variant={selectedType === type.value ? "default" : "secondary"}>{type.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transaction Volume Chart Placeholder */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Transaction Volume Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Transaction volume chart coming soon</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Daily, weekly, and monthly transaction trends
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Transactions Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Transactions</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search transactions..." 
                    className="pl-10 w-64" 
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm w-40"
                >
                  <option value="all">All Types</option>
                  <option value="contribution">Contributions</option>
                  <option value="loan_payment">Loan Payments</option>
                  <option value="savings_deposit">Savings</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="loan_disbursement">Loan Disbursements</option>
                </select>
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm w-32"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="list" className="space-y-4">
              <TabsList>
                <TabsTrigger value="list">Transaction List</TabsTrigger>
                <TabsTrigger value="summary">Daily Summary</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {transaction.id}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-2 text-muted-foreground" />
                              <div>
                                <div className="text-sm font-medium">
                                  {new Date(transaction.date).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(transaction.date).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={transaction.avatar} alt={transaction.member} />
                                <AvatarFallback>{transaction.initials}</AvatarFallback>
                              </Avatar>
                              <div className="font-medium">{transaction.member}</div>
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
                              <span className="text-sm">{transaction.type}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {transaction.category}
                          </TableCell>
                          <TableCell className="font-medium">
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
                            >
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {transaction.reference}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <FileText className="h-3 w-3 mr-1" />
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No transactions found matching your criteria
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Today's Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Transactions:</span>
                          <span className="font-medium">{summaryData.today.count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Inflow:</span>
                          <span className="font-medium text-green-600">
                            +{new Intl.NumberFormat('en-NG', {
                              style: 'currency',
                              currency: 'NGN'
                            }).format(summaryData.today.inflow)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Outflow:</span>
                          <span className="font-medium text-red-600">
                            -{new Intl.NumberFormat('en-NG', {
                              style: 'currency',
                              currency: 'NGN'
                            }).format(summaryData.today.outflow)}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Net Flow:</span>
                          <span className={summaryData.today.netFlow >= 0 ? "text-green-600" : "text-red-600"}>
                            {summaryData.today.netFlow >= 0 ? "+" : ""}
                            {new Intl.NumberFormat('en-NG', {
                              style: 'currency',
                              currency: 'NGN'
                            }).format(summaryData.today.netFlow)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">This Week</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Transactions:</span>
                          <span className="font-medium">{summaryData.week.count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Inflow:</span>
                          <span className="font-medium text-green-600">
                            +{new Intl.NumberFormat('en-NG', {
                              style: 'currency',
                              currency: 'NGN'
                            }).format(summaryData.week.inflow)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Outflow:</span>
                          <span className="font-medium text-red-600">
                            -{new Intl.NumberFormat('en-NG', {
                              style: 'currency',
                              currency: 'NGN'
                            }).format(summaryData.week.outflow)}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Net Flow:</span>
                          <span className={summaryData.week.netFlow >= 0 ? "text-green-600" : "text-red-600"}>
                            {summaryData.week.netFlow >= 0 ? "+" : ""}
                            {new Intl.NumberFormat('en-NG', {
                              style: 'currency',
                              currency: 'NGN'
                            }).format(summaryData.week.netFlow)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Transactions:</span>
                          <span className="font-medium">{summaryData.month.count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Inflow:</span>
                          <span className="font-medium text-green-600">
                            +{new Intl.NumberFormat('en-NG', {
                              style: 'currency',
                              currency: 'NGN'
                            }).format(summaryData.month.inflow)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Outflow:</span>
                          <span className="font-medium text-red-600">
                            -{new Intl.NumberFormat('en-NG', {
                              style: 'currency',
                              currency: 'NGN'
                            }).format(summaryData.month.outflow)}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Net Flow:</span>
                          <span className={summaryData.month.netFlow >= 0 ? "text-green-600" : "text-red-600"}>
                            {summaryData.month.netFlow >= 0 ? "+" : ""}
                            {new Intl.NumberFormat('en-NG', {
                              style: 'currency',
                              currency: 'NGN'
                            }).format(summaryData.month.netFlow)}
                          </span>
                        </div>
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
    </AppLayout>
  )
}