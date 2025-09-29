'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Flame,
  Trophy,
  Target,
  TrendingUp,
  Award,
  Star,
  ArrowRight,
  Coins,
} from "lucide-react"
import { useStreaks } from "@/hooks/useStreaks"
import Link from "next/link"

export function StreakSummary() {
  const { data, isLoading, error } = useStreaks()

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-0 sm:border shadow-sm">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-8 w-8 rounded-full mx-auto mb-2" />
                  <Skeleton className="h-4 w-12 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 sm:border shadow-sm">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>

        <Card className="border-0 sm:border shadow-sm">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !data) {
    return null // Gracefully hide if streak data unavailable
  }

  const streakTypes = [
    { key: 'login', label: 'Login', icon: Target, color: 'text-blue-600' },
    { key: 'contribution', label: 'Contribution', icon: Coins, color: 'text-green-600' },
    { key: 'savings', label: 'Savings', icon: TrendingUp, color: 'text-purple-600' },
    { key: 'general', label: 'Activity', icon: Star, color: 'text-orange-600' },
  ] as const

  const totalCurrentStreak = Object.values(data.currentStreaks).reduce((sum, streak) => sum + streak, 0)
  const levelProgress = ((data.totalPoints % 100) / 100) * 100

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Your Streaks</h2>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/streaks">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Current Streaks */}
        <Card className="border-0 sm:border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="h-4 w-4 text-orange-500" />
              Current Streaks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {streakTypes.map(({ key, label, icon: Icon, color }) => (
                <div key={key} className="text-center">
                  <Icon className={`h-6 w-6 mx-auto mb-2 ${color}`} />
                  <div className="text-xl font-bold">
                    {data.currentStreaks[key]}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {label}
                  </div>
                </div>
              ))}
            </div>
            
            {totalCurrentStreak > 0 && (
              <div className="mt-4 pt-4 border-t text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {totalCurrentStreak}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Active Streaks
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Level & Points */}
        <Card className="border-0 sm:border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Level & Points
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {data.level}
              </div>
              <div className="text-sm text-muted-foreground">
                Current Level
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Level {data.level + 1}</span>
                <span>{data.totalPoints % 100}/100</span>
              </div>
              <Progress value={levelProgress} className="h-2" />
              <div className="text-xs text-muted-foreground text-center">
                {data.pointsToNextLevel} points to next level
              </div>
            </div>

            <div className="pt-2 border-t text-center">
              <div className="text-lg font-semibold">
                {data.totalPoints.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Total Points Earned
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Achievements & Leaderboard */}
        <Card className="border-0 sm:border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-4 w-4 text-blue-500" />
              Achievements & Rank
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recent Achievements */}
            {data.recentAchievements.length > 0 ? (
              <div className="space-y-3">
                <div className="text-sm font-medium">Recent Achievements</div>
                {data.recentAchievements.slice(0, 2).map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Award className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {achievement.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        +{achievement.points} pts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Award className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <div className="text-sm text-muted-foreground">
                  Keep using the platform to unlock achievements!
                </div>
              </div>
            )}

            {/* Leaderboard Position */}
            {data.leaderboardPosition.weekly > 0 && (
              <div className="pt-3 border-t">
                <div className="text-sm font-medium mb-2">This Week</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Rank #{data.leaderboardPosition.weekly}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Weekly
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}