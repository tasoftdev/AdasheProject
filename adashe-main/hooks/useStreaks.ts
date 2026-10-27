'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface StreakStats {
  currentStreaks: {
    login: number
    contribution: number
    savings: number
    general: number
  }
  longestStreaks: {
    login: number
    contribution: number
    savings: number
    general: number
  }
  totalPoints: number
  level: number
  pointsToNextLevel: number
  recentAchievements: Array<{
    id: string
    title: string
    description: string
    points: number
    unlockedAt: string
    type: string
  }>
  leaderboardPosition: {
    daily: number
    weekly: number
    monthly: number
    allTime: number
  }
}

export function useStreaks() {
  const { data: session, status } = useSession()
  const [data, setData] = useState<StreakStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStreaks = async () => {
    if (!session?.user?.id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const [streaksResponse, leaderboardResponse, achievementsResponse] = await Promise.all([
        fetch('/api/streaks'),
        fetch('/api/streaks/leaderboard'),
        fetch('/api/streaks/achievements')
      ])

      if (!streaksResponse.ok) {
        throw new Error('Failed to fetch streak data')
      }

      const streaksData = await streaksResponse.json()
      const leaderboardData = leaderboardResponse.ok ? await leaderboardResponse.json() : { position: { daily: 0, weekly: 0, monthly: 0, allTime: 0 } }
      const achievementsData = achievementsResponse.ok ? await achievementsResponse.json() : { achievements: [] }

      // Calculate points to next level (every 100 points = 1 level)
      const currentLevel = Math.floor(streaksData.totalPoints / 100) + 1
      const pointsInCurrentLevel = streaksData.totalPoints % 100
      const pointsToNextLevel = 100 - pointsInCurrentLevel

      const streakStats: StreakStats = {
        currentStreaks: {
          login: streaksData.streaks?.find((s: any) => s.type === 'LOGIN')?.currentStreak || 0,
          contribution: streaksData.streaks?.find((s: any) => s.type === 'CONTRIBUTION')?.currentStreak || 0,
          savings: streaksData.streaks?.find((s: any) => s.type === 'SAVINGS')?.currentStreak || 0,
          general: streaksData.streaks?.find((s: any) => s.type === 'GENERAL')?.currentStreak || 0,
        },
        longestStreaks: {
          login: streaksData.streaks?.find((s: any) => s.type === 'LOGIN')?.longestStreak || 0,
          contribution: streaksData.streaks?.find((s: any) => s.type === 'CONTRIBUTION')?.longestStreak || 0,
          savings: streaksData.streaks?.find((s: any) => s.type === 'SAVINGS')?.longestStreak || 0,
          general: streaksData.streaks?.find((s: any) => s.type === 'GENERAL')?.longestStreak || 0,
        },
        totalPoints: streaksData.totalPoints || 0,
        level: currentLevel,
        pointsToNextLevel,
        recentAchievements: achievementsData.achievements?.slice(0, 3) || [],
        leaderboardPosition: leaderboardData.position || { daily: 0, weekly: 0, monthly: 0, allTime: 0 }
      }

      setData(streakStats)
    } catch (err) {
      console.error('Error fetching streak data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch streak data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'authenticated') {
      fetchStreaks()
    } else {
      setIsLoading(false)
    }
  }, [session, status])

  return {
    data,
    isLoading,
    error,
    refetch: fetchStreaks
  }
}