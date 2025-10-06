'use client'

import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
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
  Plus,
  FileText,
  Zap,
  Target,
  Calendar,
  Sparkles,
} from "lucide-react"
import { 
  MonthlyTrendsChart, 
  PortfolioDistributionChart, 
  TransactionVolumeChart,
  SavingsGrowthChart 
} from "@/components/charts"
import { StreakSummary } from "@/components/streaks/streak-summary"
import { useDashboard } from "@/hooks/useDashboard"

function DashboardContent() {
  const { data, isLoading, error, refetch } = useDashboard()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Loading skeleton for stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20 bg-gray-200/50" />
                <Skeleton className="h-4 w-4 bg-gray-200/50" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1 bg-gray-200/50" />
                <Skeleton className="h-3 w-12 bg-gray-200/50" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading skeleton for charts */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-gray-200/50" />
            </CardHeader>
            <CardContent className="pl-2">
              <Skeleton className="h-64 w-full bg-gray-200/50" />
            </CardContent>
          </Card>
          <Card className="col-span-3 bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-24 bg-gray-200/50" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full bg-gray-200/50" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-8 text-center bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-500"></div>
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button 
          onClick={refetch} 
          variant="outline"
          className="border-gray-300 hover:bg-gray-50 transition-all duration-200"
        >
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
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "Total Savings",
      value: `₦${data.stats.totalSavings.amount.toLocaleString()}`,
      change: `${data.stats.totalSavings.count} accounts`,
      trend: "up" as const,
      icon: PiggyBank,
      color: "from-green-500 to-teal-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      title: "Active Loans",
      value: `₦${data.stats.totalLoans.amount.toLocaleString()}`,
      change: `${data.stats.activeLoans} active`,
      trend: data.stats.activeLoans > 0 ? "neutral" : "down" as const,
      icon: CreditCard,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      title: "Monthly Contributions",
      value: `₦${data.stats.monthlyContributions.amount.toLocaleString()}`,
      change: `${data.stats.monthlyContributions.growth > 0 ? '+' : ''}${data.stats.monthlyContributions.growth.toFixed(1)}%`,
      trend: data.stats.monthlyContributions.growth > 0 ? "up" : "down" as const,
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
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
    <div className="space-y-6 relative">
      {/* Animated Background Elements */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-slow"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-slow animation-delay-2000"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-r from-green-200 to-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-slow animation-delay-4000"></div>
        </div>
      )}

      {/* Header */}
      <div className="space-y-3 sm:space-y-4 relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-base sm:text-lg text-gray-600 font-medium">
              Welcome back! Here's what's happening with your cooperative.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
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
                {stat.trend === "up" && <ArrowUpRight className="h-3 w-3 mr-1 text-green-500 flex-shrink-0" />}
                {stat.trend === "down" && <ArrowDownRight className="h-3 w-3 mr-1 text-red-500 flex-shrink-0" />}
                {stat.trend === "neutral" && <Sparkles className="h-3 w-3 mr-1 text-blue-500 flex-shrink-0" />}
                <span className="truncate font-medium">{stat.change}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Streak Summary */}
      <StreakSummary />

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Monthly Trends
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2 pt-0">
            <div className="h-64 sm:h-80">
              <MonthlyTrendsChart data={data?.charts?.monthlyTrends || []} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3 bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <PieChart className="h-5 w-5 text-purple-600" />
              Portfolio Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64 sm:h-80">
              <PortfolioDistributionChart data={data?.charts?.contributionBreakdown || []} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Volume and Savings Growth */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-teal-500"></div>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <Target className="h-5 w-5 text-green-600" />
              Transaction Volume
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64 sm:h-80">
              <TransactionVolumeChart data={data?.recentTransactions || []} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Savings Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64 sm:h-80">
              <SavingsGrowthChart data={[]} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions and Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <Zap className="h-5 w-5 text-blue-600" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Mobile: Card layout */}
            <div className="space-y-3 sm:hidden">
              {recentTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="bg-white/50 backdrop-blur-sm rounded-xl p-4 space-y-3 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{transaction.name}</p>
                      <p className="text-xs text-gray-600 font-medium">{transaction.type}</p>
                    </div>
                    <Badge
                      variant={
                        transaction.status === "COMPLETED" ? "default" :
                        transaction.status === "PENDING" ? "secondary" : "destructive"
                      }
                      className="text-xs font-medium"
                    >
                      {transaction.status.toLowerCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-gray-900">
                      ₦{transaction.amount.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{transaction.date}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop: Table layout */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-gray-700">Member</TableHead>
                    <TableHead className="font-semibold text-gray-700">Type</TableHead>
                    <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((transaction) => (
                    <TableRow 
                      key={transaction.id}
                      className="hover:bg-gray-50/50 transition-colors duration-150"
                    >
                      <TableCell className="font-medium text-gray-900">
                        {transaction.name}
                      </TableCell>
                      <TableCell className="text-gray-700">{transaction.type}</TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        ₦{transaction.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.status === "COMPLETED" ? "default" :
                            transaction.status === "PENDING" ? "secondary" : "destructive"
                          }
                          className="font-medium"
                        >
                          {transaction.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600 font-medium">
                        {transaction.date}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-3 bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <Sparkles className="h-5 w-5 text-green-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <Link href="/members">
              <Button className="w-full justify-start py-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 border-0">
                <Users className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Add New Member</div>
                  <div className="text-sm opacity-90 font-normal">Register new cooperative member</div>
                </div>
              </Button>
            </Link>

            <Link href="/contributions">
              <Button className="w-full justify-start py-6 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 border-0">
                <DollarSign className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Record Contribution</div>
                  <div className="text-sm opacity-90 font-normal">Process member payments</div>
                </div>
              </Button>
            </Link>

            <Link href="/loans">
              <Button className="w-full justify-start py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 border-0">
                <CreditCard className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Process Loan</div>
                  <div className="text-sm opacity-90 font-normal">Manage loan applications</div>
                </div>
              </Button>
            </Link>

            <Link href="/reports">
              <Button className="w-full justify-start py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 border-0">
                <FileText className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Generate Report</div>
                  <div className="text-sm opacity-90 font-normal">Create financial reports</div>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <AppLayout>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      }>
        <DashboardContent />
      </Suspense>

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.05); opacity: 0.2; }
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