'use client'

import { Suspense } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users,
  DollarSign,
  PiggyBank,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { 
  MonthlyTrendsChart, 
  PortfolioDistributionChart, 
  TransactionVolumeChart,
  SavingsGrowthChart 
} from "@/components/charts"
import { useDashboard } from "@/hooks/useDashboard"

function DashboardContent() {
  const { data, isLoading, error, refetch } = useDashboard()

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Loading skeleton for stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading skeleton for charts */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="pl-2">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </Card>
    )
  }

  if (!data) return null

  const stats = [
    {
      title: "Total Members",
      value: data.stats.totalMembers.toLocaleString(),
      change: `${data.stats.activeMembers} active`,
      trend: "neutral" as const,
      icon: Users,
    },
    {
      title: "Total Savings",
      value: `₦${data.stats.totalSavings.amount.toLocaleString()}`,
      change: `${data.stats.totalSavings.count} accounts`,
      trend: "up" as const,
      icon: PiggyBank,
    },
    {
      title: "Active Loans",
      value: `₦${data.stats.totalLoans.amount.toLocaleString()}`,
      change: `${data.stats.activeLoans} active`,
      trend: data.stats.activeLoans > 0 ? "neutral" : "down" as const,
      icon: CreditCard,
    },
    {
      title: "Monthly Contributions",
      value: `₦${data.stats.monthlyContributions.amount.toLocaleString()}`,
      change: `${data.stats.monthlyContributions.growth > 0 ? '+' : ''}${data.stats.monthlyContributions.growth.toFixed(1)}%`,
      trend: data.stats.monthlyContributions.growth > 0 ? "up" : "down" as const,
      icon: TrendingUp,
    },
  ]

  const recentTransactions = data.recentTransactions.slice(0, 5).map(tx => ({
    id: tx.id,
    name: tx.member ? `${tx.member.firstName} ${tx.member.lastName}` : "System",
    type: tx.category,
    amount: tx.amount,
    status: tx.status,
    date: new Date(tx.date).toLocaleDateString(),
    method: tx.method
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your cooperative.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                {stat.trend === "up" && <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />}
                {stat.trend === "down" && <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />}
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <MonthlyTrendsChart data={data?.charts?.monthlyTrends || []} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Portfolio Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioDistributionChart data={data?.charts?.contributionBreakdown || []} />
          </CardContent>
        </Card>
      </div>

      {/* Transaction Volume and Savings Growth */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionVolumeChart data={data?.recentTransactions || []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Savings Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <SavingsGrowthChart data={[]} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.name}
                    </TableCell>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell>₦{transaction.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.status === "COMPLETED" ? "default" :
                          transaction.status === "PENDING" ? "secondary" : "destructive"
                        }
                      >
                        {transaction.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {transaction.date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">
              Add New Member
            </Button>
            <Button className="w-full" variant="outline">
              Record Contribution
            </Button>
            <Button className="w-full" variant="outline">
              Process Loan Application
            </Button>
            <Button className="w-full" variant="outline">
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <AppLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardContent />
      </Suspense>
    </AppLayout>
  )
}