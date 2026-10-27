"use client"

import { useEffect, useState } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MonthlyTrendsChart, 
  PortfolioDistributionChart, 
  TransactionVolumeChart,
  SavingsGrowthChart 
} from "@/components/charts"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  PieChart,
  BarChart3,
  FileText,
  Calendar,
} from "lucide-react"
import { toast } from "sonner"

// Types
interface MonthlyReport {
  month: string
  totalContributions: string
  totalLoans: string
  totalSavings: string
  activeMembers: number
  status: string
  contributionsCount: number
  loansCount: number
  date: string
}

interface Transaction {
  id: string
  date: string
  type: string
  member: string
  amount: string
  category: string
  status: string
  reference: string
}

interface FinancialSummary {
  title: string
  value: string
  change: string
  trend: string
  description: string
}

interface MemberSummary {
  statistics: Array<{
    title: string
    value: string | number
    icon: string
    color: string
  }>
  insights: string[]
  details: any
}

export default function ReportsPage() {
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary[]>([])
  const [memberSummary, setMemberSummary] = useState<MemberSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('current-month')

  useEffect(() => {
    fetchAllData()
  }, [selectedPeriod])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [financialRes, monthlyRes, transactionsRes, memberRes] = await Promise.all([
        fetch(`/api/reports/financial-summary?period=${selectedPeriod}`),
        fetch('/api/reports/monthly?months=6'),
        fetch('/api/reports/transactions?limit=20'),
        fetch('/api/reports/member-summary')
      ])

      if (!financialRes.ok || !monthlyRes.ok || !transactionsRes.ok || !memberRes.ok) {
        throw new Error('Failed to fetch reports data')
      }

      const [financial, monthly, transactionsData, member] = await Promise.all([
        financialRes.json(),
        monthlyRes.json(),
        transactionsRes.json(),
        memberRes.json()
      ])

      setFinancialSummary(financial)
      setMonthlyReports(monthly)
      setTransactions(transactionsData.transactions || transactionsData)
      setMemberSummary(member)
    } catch (error) {
      console.error('Error fetching reports data:', error)
      toast.error('Failed to load reports data')
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = () => {
    // Implement report export functionality
    toast.info('Export functionality will be implemented soon')
  }
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
            <p className="text-muted-foreground">
              Transparent financial reporting and insights for your cooperative.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-40"
            >
              <option value="current-month">Current Month</option>
              <option value="last-month">Last Month</option>
              <option value="last-3-months">Last 3 Months</option>
              <option value="last-6-months">Last 6 Months</option>
              <option value="current-year">Current Year</option>
            </select>
            <Button onClick={handleExportReport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {/* Stats skeleton */}
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
            {/* Charts skeleton */}
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-6">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
                  <div className="h-64 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Financial Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {financialSummary.map((item) => (
                <Card key={item.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {item.title}
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{item.value}</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      {item.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span
                        className={
                          item.trend === "up" ? "text-green-500" : "text-red-500"
                        }
                      >
                        {item.change}
                      </span>
                      <span className="ml-1">from last period</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Monthly Performance Chart Placeholder */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Monthly Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyTrendsChart />
            </CardContent>
          </Card>

          {/* Portfolio Distribution Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Portfolio Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PortfolioDistributionChart />
            </CardContent>
          </Card>
        </div>

        {/* Additional Analytics Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Volume Trends</CardTitle>
              <p className="text-sm text-muted-foreground">
                Daily transaction activity over the last 15 days
              </p>
            </CardHeader>
            <CardContent>
              <TransactionVolumeChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Savings Growth Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">
                Total savings and monthly deposits trend
              </p>
            </CardHeader>
            <CardContent>
              <SavingsGrowthChart />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="monthly" className="space-y-4">
          <TabsList>
            <TabsTrigger value="monthly">Monthly Reports</TabsTrigger>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
            <TabsTrigger value="member-summary">Member Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Financial Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Total Contributions</TableHead>
                        <TableHead>Loans Disbursed</TableHead>
                        <TableHead>Total Savings</TableHead>
                        <TableHead>Active Members</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyReports.map((report, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              {report.month}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {report.totalContributions}
                          </TableCell>
                          <TableCell className="font-medium">
                            {report.totalLoans}
                          </TableCell>
                          <TableCell className="font-medium">
                            {report.totalSavings}
                          </TableCell>
                          <TableCell>{report.activeMembers}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                report.status === "current" ? "default" : "outline"
                              }
                            >
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <FileText className="w-4 h-4 mr-2" />
                              View Report
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {transaction.id}
                          </TableCell>
                          <TableCell>
                            {new Date(transaction.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{transaction.type}</TableCell>
                          <TableCell>{transaction.member}</TableCell>
                          <TableCell className="font-medium">
                            {transaction.amount}
                          </TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                transaction.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {transaction.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="member-summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Member Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {memberSummary ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-3">
                      {memberSummary.statistics.map((stat, index) => (
                        <div key={index} className="text-center p-6 border rounded-lg">
                          <Users className={`w-8 h-8 mx-auto mb-2 ${stat.color || 'text-blue-500'}`} />
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <div className="text-sm text-muted-foreground">{stat.title}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Key Insights</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {memberSummary.insights.map((insight, index) => (
                          <li key={index}>• {insight}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    No member summary data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
          </div>
        )}
      </div>
    </AppLayout>
  )
}