'use client'

import { useState, useEffect } from 'react'

export interface DashboardStats {
  totalMembers: number
  activeMembers: number
  totalContributions: {
    amount: number
    count: number
  }
  monthlyContributions: {
    amount: number
    count: number
    growth: number
  }
  totalLoans: {
    amount: number
    count: number
  }
  activeLoans: number
  totalSavings: {
    amount: number
    count: number
  }
}

export interface DashboardCharts {
  monthlyTrends: Array<{
    month: string
    income: number
    expenses: number
  }>
  contributionBreakdown: Array<{
    status: string
    amount: number
    count: number
  }>
  loanBreakdown: Array<{
    status: string
    amount: number
    count: number
  }>
}

export interface RecentTransaction {
  id: string
  type: string
  category: string
  amount: number
  description: string
  method: string
  status: string
  date: string
  member?: {
    firstName: string
    lastName: string
    avatar?: string
  }
}

export interface DashboardData {
  stats: DashboardStats
  charts: DashboardCharts
  recentTransactions: RecentTransaction[]
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching dashboard:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  return {
    data,
    isLoading,
    error,
    refetch: fetchDashboard
  }
}