"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Data definitions
const monthlyData = [
  { month: 'Jan', contributions: 8400, savings: 12000, loans: 5600 },
  { month: 'Feb', contributions: 9200, savings: 14500, loans: 6800 },
  { month: 'Mar', contributions: 8800, savings: 16200, loans: 7200 },
  { month: 'Apr', contributions: 9600, savings: 18000, loans: 8100 },
  { month: 'May', contributions: 10200, savings: 19800, loans: 7800 },
  { month: 'Jun', contributions: 11000, savings: 21500, loans: 9200 },
  { month: 'Jul', contributions: 10800, savings: 23200, loans: 8900 },
  { month: 'Aug', contributions: 11500, savings: 25100, loans: 9600 },
  { month: 'Sep', contributions: 12200, savings: 27000, loans: 10200 },
  { month: 'Oct', contributions: 11800, savings: 28800, loans: 9800 },
  { month: 'Nov', contributions: 12600, savings: 30500, loans: 10800 },
  { month: 'Dec', contributions: 13200, savings: 32400, loans: 11200 }
]

const portfolioData = [
  { name: 'Savings', value: 45231, color: 'bg-blue-500', percentage: 47 },
  { name: 'Active Loans', value: 28450, color: 'bg-green-500', percentage: 30 },
  { name: 'Emergency Fund', value: 12800, color: 'bg-yellow-500', percentage: 13 },
  { name: 'Investment Fund', value: 8650, color: 'bg-purple-500', percentage: 10 }
]

const transactionVolumeData = [
  { date: '12/01', transactions: 45, amount: 8420 },
  { date: '12/02', transactions: 52, amount: 9650 },
  { date: '12/03', transactions: 48, amount: 8890 },
  { date: '12/04', transactions: 61, amount: 11250 },
  { date: '12/05', transactions: 55, amount: 10180 },
  { date: '12/06', transactions: 49, amount: 9420 },
  { date: '12/07', transactions: 58, amount: 12100 },
  { date: '12/08', transactions: 64, amount: 11800 },
  { date: '12/09', transactions: 52, amount: 9950 },
  { date: '12/10', transactions: 59, amount: 10850 },
  { date: '12/11', transactions: 66, amount: 12450 },
  { date: '12/12', transactions: 71, amount: 13200 },
  { date: '12/13', transactions: 68, amount: 12800 },
  { date: '12/14', transactions: 73, amount: 13850 },
  { date: '12/15', transactions: 76, amount: 14200 }
]

export function MonthlyTrendsChart({ data }: { data?: Array<{month: string, income: number, expenses: number}> }) {
  // Check if we have real data
  const hasRealData = data && data.length > 0
  
  if (!hasRealData) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Monthly Progress</span>
          <span>Last 6 months</span>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p>No transaction data available yet.</p>
          <p className="text-sm">Start making contributions and loans to see trends.</p>
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => Math.max(d.income || 0, d.expenses || 0)))

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Monthly Progress</span>
        <span>Last 6 months</span>
      </div>
      <div className="space-y-3">
        {data.slice(-6).map((item) => (
          <div key={item.month} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{new Date(item.month).toLocaleDateString('en-US', { month: 'short' })}</span>
              <span>₦{item.income.toLocaleString()}</span>
            </div>
            <div className="space-y-1">
              <Progress 
                value={(item.income / maxValue) * 100} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Income: ₦{item.income.toLocaleString()}</span>
                <span>Expenses: ₦{item.expenses.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PortfolioDistributionChart({ data }: { data?: Array<{status: string, amount: number, count: number}> }) {
  // Check if we have real data
  const hasRealData = data && data.length > 0
  
  if (!hasRealData) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-muted-foreground">
          <p>No contribution data available yet.</p>
          <p className="text-sm">Start making contributions to see the distribution.</p>
        </div>
      </div>
    )
  }

  // Process real data
  const total = data.reduce((sum, item) => sum + item.amount, 0)
  const chartData = data.map(item => ({
    name: item.status,
    value: item.amount,
    color: getStatusColor(item.status),
    percentage: total > 0 ? Math.round((item.amount / total) * 100) : 0
  }))

  function getStatusColor(status: string): string {
    switch (status.toUpperCase()) {
      case 'COMPLETED': return 'bg-green-500'
      case 'PENDING': return 'bg-yellow-500'
      case 'FAILED': return 'bg-red-500'
      default: return 'bg-blue-500'
    }
  }
  return (
    <div className="space-y-4">
      {/* Visual representation */}
      <div className="flex h-6 rounded-lg overflow-hidden border">
        {chartData.map((item) => (
          <div
            key={item.name}
            className={item.color}
            style={{ width: `${item.percentage}%` }}
          />
        ))}
      </div>
      
      {/* Legend and values */}
      <div className="space-y-3">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-sm ${item.color}`} />
              <span className="text-sm font-medium">{item.name}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">₦{item.value.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{item.percentage}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TransactionVolumeChart({ data }: { data?: any[] }) {
  // Check if we have real data
  const hasRealData = data && data.length > 0
  
  if (!hasRealData) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-muted-foreground">
          <p>No transaction volume data available yet.</p>
          <p className="text-sm">Transaction activity will be shown here.</p>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Daily Transactions</span>
          <span>Last 8 days</span>
        </div>
      </div>
    )
  }

  // For now, use dummy data since we need to aggregate transaction data by day
  const maxTransactions = Math.max(...transactionVolumeData.map(d => d.transactions))
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-8 gap-2 h-32 items-end">
        {transactionVolumeData.slice(-8).map((data, index) => (
          <div key={data.date} className="flex flex-col items-center space-y-1">
            <div 
              className="w-full bg-blue-500 rounded-t-sm min-h-[4px]"
              style={{ height: `${(data.transactions / maxTransactions) * 100}%` }}
            />
            <span className="text-xs text-muted-foreground rotate-45 origin-bottom-left">
              {data.date}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Daily Transactions</span>
        <span>Last 8 days</span>
      </div>
    </div>
  )
}

export function SavingsGrowthChart({ data }: { data?: any[] }) {
  // Check if we have real data
  const hasRealData = data && data.length > 0
  
  if (!hasRealData) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-muted-foreground">
          <p>No savings data available yet.</p>
          <p className="text-sm">Savings growth will be shown here.</p>
        </div>
      </div>
    )
  }

  const savingsGrowthData = monthlyData.map(item => ({
    month: item.month,
    totalSavings: item.savings,
    monthlyDeposits: item.contributions * 0.4,
  }))
  
  const maxSavings = Math.max(...savingsGrowthData.map(d => d.totalSavings))
  const maxDeposits = Math.max(...savingsGrowthData.map(d => d.monthlyDeposits))
  
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {savingsGrowthData.slice(-6).map((data, index) => (
          <div key={data.month} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{data.month}</span>
              <span>₦{data.totalSavings.toLocaleString()}</span>
            </div>
            <div className="space-y-1">
              <Progress 
                value={(data.totalSavings / maxSavings) * 100} 
                className="h-3 bg-green-100"
              />
              <Progress 
                value={(data.monthlyDeposits / maxDeposits) * 100} 
                className="h-1"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Total: ₦{data.totalSavings.toLocaleString()}</span>
                <span>Deposits: ₦{data.monthlyDeposits.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}