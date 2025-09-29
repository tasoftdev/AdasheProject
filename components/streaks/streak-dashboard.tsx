'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Flame, 
  Trophy, 
  Target, 
  Calendar, 
  TrendingUp, 
  Award, 
  Star, 
  Crown,
  DollarSign,
  PiggyBank,
  CreditCard,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Streak {
  id: string;
  type: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  isActive: boolean;
  totalPoints: number;
  level: number;
  member: {
    firstName: string;
    lastName: string;
    memberCode: string;
    avatar?: string;
  };
  activities: Array<{
    id: string;
    activityDate: string;
    points: number;
    description: string;
    amount?: number;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    badgeIcon: string;
    pointsAwarded: number;
    achievedAt: string;
  }>;
}

interface LeaderboardEntry {
  id: string;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  rank: number;
  member: {
    firstName: string;
    lastName: string;
    memberCode: string;
    avatar?: string;
  };
}

export default function StreakDashboard() {
  const { data: session } = useSession();
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStreakType, setSelectedStreakType] = useState('ALL');
  const [stats, setStats] = useState({
    totalStreaks: 0,
    activeStreaks: 0,
    totalPoints: 0,
    longestStreak: 0,
    currentActiveStreaks: 0
  });

  useEffect(() => {
    fetchStreakData();
    fetchLeaderboard();
  }, [selectedStreakType]);

  const fetchStreakData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStreakType && selectedStreakType !== 'ALL') {
        params.append('type', selectedStreakType);
      }

      const response = await fetch(`/api/streaks?${params}`);
      if (!response.ok) throw new Error('Failed to fetch streaks');
      
      const data = await response.json();
      setStreaks(data.streaks);
      setStats(data.stats);
    } catch (error: any) {
      console.error('Error fetching streaks:', error);
      toast.error('Failed to load streak data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedStreakType && selectedStreakType !== 'ALL') {
        params.append('type', selectedStreakType);
      }
      params.append('limit', '10');

      const response = await fetch(`/api/streaks/leaderboard?${params}`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      
      const data = await response.json();
      setLeaderboard(data.leaderboard);
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
    }
  };

  const getStreakIcon = (type: string) => {
    const icons: Record<string, any> = {
      LOGIN: Clock,
      CONTRIBUTION: DollarSign,
      SAVINGS: PiggyBank,
      LOAN_PAYMENT: CreditCard,
      MEETING_ATTENDANCE: Users,
      PROFILE_UPDATE: CheckCircle,
      TRANSACTION: TrendingUp,
      COMMUNITY_ENGAGEMENT: Crown
    };
    return icons[type] || Flame;
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 90) return 'text-purple-600 bg-purple-100';
    if (streak >= 30) return 'text-blue-600 bg-blue-100';
    if (streak >= 14) return 'text-green-600 bg-green-100';
    if (streak >= 7) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getLevelProgress = (level: number, totalPoints: number) => {
    const levelThresholds = [0, 20, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
    const currentThreshold = levelThresholds[level - 1] || 0;
    const nextThreshold = levelThresholds[level] || 10000;
    const progress = ((totalPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const formatStreakType = (type: string) => {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className=\"flex justify-center items-center h-64\">
        <div className=\"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600\"></div>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen bg-gray-50 lg:bg-white\">
      <div className=\"container mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6 max-w-7xl\">
        {/* Header */}
        <div className=\"flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0\">
          <div>
            <h1 className=\"text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center\">
              <Flame className=\"h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mr-2 sm:mr-3 text-orange-500\" />
              Streak Dashboard
            </h1>
            <p className=\"text-gray-600 text-sm sm:text-base mt-1\">Track your consistency and achievements</p>
          </div>
          <div className=\"flex items-center space-x-2\">
            <select
              value={selectedStreakType}
              onChange={(e) => setSelectedStreakType(e.target.value)}
              className=\"px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent\"
            >
              <option value=\"ALL\">All Streaks</option>
              <option value=\"LOGIN\">Login</option>
              <option value=\"CONTRIBUTION\">Contribution</option>
              <option value=\"SAVINGS\">Savings</option>
              <option value=\"LOAN_PAYMENT\">Loan Payment</option>
              <option value=\"MEETING_ATTENDANCE\">Meeting Attendance</option>
              <option value=\"PROFILE_UPDATE\">Profile Update</option>
              <option value=\"TRANSACTION\">Transaction</option>
              <option value=\"COMMUNITY_ENGAGEMENT\">Community</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className=\"grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6\">
          <Card className=\"border-0 sm:border shadow-sm\">
            <CardContent className=\"p-3 sm:p-4\">
              <div className=\"flex items-center\">
                <Trophy className=\"h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-yellow-600 flex-shrink-0\" />
                <div className=\"ml-2 sm:ml-3 lg:ml-4 min-w-0\">
                  <p className=\"text-[10px] sm:text-xs lg:text-sm font-medium text-gray-600 truncate\">Total Points</p>
                  <p className=\"text-sm sm:text-lg lg:text-2xl font-bold text-gray-900\">{stats.totalPoints.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className=\"border-0 sm:border shadow-sm\">
            <CardContent className=\"p-3 sm:p-4\">
              <div className=\"flex items-center\">
                <Flame className=\"h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-orange-600 flex-shrink-0\" />
                <div className=\"ml-2 sm:ml-3 lg:ml-4 min-w-0\">
                  <p className=\"text-[10px] sm:text-xs lg:text-sm font-medium text-gray-600 truncate\">Active Streaks</p>
                  <p className=\"text-sm sm:text-lg lg:text-2xl font-bold text-gray-900\">{stats.activeStreaks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className=\"border-0 sm:border shadow-sm\">
            <CardContent className=\"p-3 sm:p-4\">
              <div className=\"flex items-center\">
                <Target className=\"h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0\" />
                <div className=\"ml-2 sm:ml-3 lg:ml-4 min-w-0\">
                  <p className=\"text-[10px] sm:text-xs lg:text-sm font-medium text-gray-600 truncate\">Longest Streak</p>
                  <p className=\"text-sm sm:text-lg lg:text-2xl font-bold text-gray-900\">{stats.longestStreak}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className=\"border-0 sm:border shadow-sm\">
            <CardContent className=\"p-3 sm:p-4\">
              <div className=\"flex items-center\">
                <TrendingUp className=\"h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-600 flex-shrink-0\" />
                <div className=\"ml-2 sm:ml-3 lg:ml-4 min-w-0\">
                  <p className=\"text-[10px] sm:text-xs lg:text-sm font-medium text-gray-600 truncate\">Current Active</p>
                  <p className=\"text-sm sm:text-lg lg:text-2xl font-bold text-gray-900\">{stats.currentActiveStreaks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className=\"col-span-2 lg:col-span-1 border-0 sm:border shadow-sm\">
            <CardContent className=\"p-3 sm:p-4\">
              <div className=\"flex items-center\">
                <Award className=\"h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-purple-600 flex-shrink-0\" />
                <div className=\"ml-2 sm:ml-3 lg:ml-4 min-w-0\">
                  <p className=\"text-[10px] sm:text-xs lg:text-sm font-medium text-gray-600 truncate\">Total Streaks</p>
                  <p className=\"text-sm sm:text-lg lg:text-2xl font-bold text-gray-900\">{stats.totalStreaks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className=\"space-y-4\">
          {/* Mobile-friendly tabs */}
          <div className=\"overflow-x-auto\">
            <TabsList className=\"inline-flex h-9 sm:h-10 items-center justify-start w-max sm:w-full rounded-md bg-muted p-1 text-muted-foreground\">
              <TabsTrigger value=\"overview\" className=\"text-xs sm:text-sm px-2 sm:px-3 py-1.5 whitespace-nowrap\">
                <TrendingUp className=\"h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2\" />
                Overview
              </TabsTrigger>
              <TabsTrigger value=\"streaks\" className=\"text-xs sm:text-sm px-2 sm:px-3 py-1.5 whitespace-nowrap\">
                <Flame className=\"h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2\" />
                My Streaks
              </TabsTrigger>
              <TabsTrigger value=\"leaderboard\" className=\"text-xs sm:text-sm px-2 sm:px-3 py-1.5 whitespace-nowrap\">
                <Trophy className=\"h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2\" />
                Leaderboard
              </TabsTrigger>
              <TabsTrigger value=\"achievements\" className=\"text-xs sm:text-sm px-2 sm:px-3 py-1.5 whitespace-nowrap\">
                <Award className=\"h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2\" />
                Achievements
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value=\"overview\" className=\"space-y-4\">
            {/* Overview Cards */}
            <div className=\"grid gap-4 lg:grid-cols-2\">
              <Card className=\"border-0 sm:border shadow-sm\">
                <CardHeader className=\"pb-3 sm:pb-6\">
                  <CardTitle className=\"text-base sm:text-lg flex items-center\">
                    <Flame className=\"h-4 w-4 sm:h-5 sm:w-5 mr-2 text-orange-500\" />
                    Current Streaks
                  </CardTitle>
                </CardHeader>
                <CardContent className=\"pt-0\">
                  <div className=\"space-y-3\">
                    {streaks.filter(s => s.isActive && s.currentStreak > 0).slice(0, 4).map((streak) => {
                      const IconComponent = getStreakIcon(streak.type);
                      return (
                        <div key={streak.id} className=\"flex items-center justify-between p-3 bg-gray-50 rounded-lg\">
                          <div className=\"flex items-center space-x-3\">
                            <div className={`p-2 rounded-full ${getStreakColor(streak.currentStreak)}`}>
                              <IconComponent className=\"h-4 w-4\" />
                            </div>
                            <div>
                              <p className=\"font-medium text-sm\">{formatStreakType(streak.type)}</p>
                              <p className=\"text-xs text-gray-600\">{streak.currentStreak} day streak</p>
                            </div>
                          </div>
                          <Badge className=\"text-xs\">{streak.currentStreak}🔥</Badge>
                        </div>
                      );
                    })}
                    {streaks.filter(s => s.isActive && s.currentStreak > 0).length === 0 && (
                      <p className=\"text-center text-gray-500 py-8\">No active streaks yet. Start your first streak today!</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className=\"border-0 sm:border shadow-sm\">
                <CardHeader className=\"pb-3 sm:pb-6\">
                  <CardTitle className=\"text-base sm:text-lg flex items-center\">
                    <Award className=\"h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-500\" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className=\"pt-0\">
                  <div className=\"space-y-3\">
                    {streaks.flatMap(s => s.achievements).sort((a, b) => 
                      new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime()
                    ).slice(0, 4).map((achievement) => (
                      <div key={achievement.id} className=\"flex items-center space-x-3 p-3 bg-gray-50 rounded-lg\">
                        <div className=\"text-2xl\">{achievement.badgeIcon}</div>
                        <div className=\"flex-1\">
                          <p className=\"font-medium text-sm\">{achievement.title}</p>
                          <p className=\"text-xs text-gray-600\">{achievement.description}</p>
                        </div>
                        <Badge variant=\"outline\" className=\"text-xs\">+{achievement.pointsAwarded} pts</Badge>
                      </div>
                    ))}
                    {streaks.flatMap(s => s.achievements).length === 0 && (
                      <p className=\"text-center text-gray-500 py-8\">No achievements yet. Keep building your streaks!</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value=\"streaks\" className=\"space-y-4\">
            <div className=\"grid gap-4 lg:grid-cols-2\">
              {streaks.map((streak) => {
                const IconComponent = getStreakIcon(streak.type);
                const levelProgress = getLevelProgress(streak.level, streak.totalPoints);
                
                return (
                  <Card key={streak.id} className=\"border-0 sm:border shadow-sm\">
                    <CardHeader className=\"pb-3 sm:pb-6\">
                      <div className=\"flex items-center justify-between\">
                        <CardTitle className=\"text-base sm:text-lg flex items-center\">
                          <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 ${streak.isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                          {formatStreakType(streak.type)}
                        </CardTitle>
                        <Badge className={`text-xs ${streak.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {streak.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className=\"pt-0\">
                      <div className=\"space-y-4\">
                        {/* Streak Stats */}
                        <div className=\"grid grid-cols-3 gap-4 text-center\">
                          <div>
                            <p className=\"text-lg sm:text-xl font-bold text-orange-600\">{streak.currentStreak}</p>
                            <p className=\"text-xs text-gray-600\">Current</p>
                          </div>
                          <div>
                            <p className=\"text-lg sm:text-xl font-bold text-blue-600\">{streak.longestStreak}</p>
                            <p className=\"text-xs text-gray-600\">Longest</p>
                          </div>
                          <div>
                            <p className=\"text-lg sm:text-xl font-bold text-purple-600\">{streak.totalPoints}</p>
                            <p className=\"text-xs text-gray-600\">Points</p>
                          </div>
                        </div>

                        {/* Level Progress */}
                        <div className=\"space-y-2\">
                          <div className=\"flex justify-between items-center\">
                            <p className=\"text-sm font-medium\">Level {streak.level}</p>
                            <p className=\"text-xs text-gray-600\">{Math.round(levelProgress)}%</p>
                          </div>
                          <Progress value={levelProgress} className=\"h-2\" />
                        </div>

                        {/* Recent Activities */}
                        {streak.activities.length > 0 && (
                          <div className=\"space-y-2\">
                            <p className=\"text-sm font-medium\">Recent Activities</p>
                            <div className=\"space-y-1\">
                              {streak.activities.slice(0, 3).map((activity) => (
                                <div key={activity.id} className=\"flex justify-between items-center text-xs\">
                                  <span className=\"text-gray-600\">{activity.description}</span>
                                  <span className=\"font-medium\">+{activity.points} pts</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {streaks.length === 0 && (
              <Card className=\"border-0 sm:border shadow-sm\">
                <CardContent className=\"text-center py-12\">
                  <Flame className=\"h-12 w-12 mx-auto mb-4 text-gray-400\" />
                  <p className=\"text-lg font-medium mb-2\">No streaks yet</p>
                  <p className=\"text-gray-600\">Start your first streak by logging in daily or making contributions!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value=\"leaderboard\" className=\"space-y-4\">
            <Card className=\"border-0 sm:border shadow-sm\">
              <CardHeader className=\"pb-3 sm:pb-6\">
                <CardTitle className=\"text-base sm:text-lg flex items-center\">
                  <Trophy className=\"h-4 w-4 sm:h-5 sm:w-5 mr-2 text-yellow-500\" />
                  Top Performers
                </CardTitle>
                <CardDescription>See how you rank against other members</CardDescription>
              </CardHeader>
              <CardContent className=\"pt-0\">
                <div className=\"space-y-3\">
                  {leaderboard.map((entry, index) => (
                    <div key={entry.id} className={`flex items-center space-x-3 p-3 rounded-lg ${
                      index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50'
                    }`}>
                      <div className=\"flex items-center space-x-3\">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-500 text-white' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {index < 3 ? (
                            index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
                          ) : (
                            entry.rank
                          )}
                        </div>
                        <Avatar className=\"h-8 w-8\">
                          <AvatarImage src={entry.member.avatar} />
                          <AvatarFallback className=\"text-xs\">
                            {entry.member.firstName[0]}{entry.member.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className=\"font-medium text-sm\">{entry.member.firstName} {entry.member.lastName}</p>
                          <p className=\"text-xs text-gray-600\">{entry.member.memberCode}</p>
                        </div>
                      </div>
                      <div className=\"flex-1 text-right\">
                        <div className=\"flex justify-end space-x-4 text-xs\">
                          <div>
                            <p className=\"font-medium\">{entry.totalPoints}</p>
                            <p className=\"text-gray-600\">Points</p>
                          </div>
                          <div>
                            <p className=\"font-medium\">{entry.currentStreak}</p>
                            <p className=\"text-gray-600\">Current</p>
                          </div>
                          <div>
                            <p className=\"font-medium\">{entry.longestStreak}</p>
                            <p className=\"text-gray-600\">Longest</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {leaderboard.length === 0 && (
                    <p className=\"text-center text-gray-500 py-8\">No leaderboard data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value=\"achievements\" className=\"space-y-4\">
            <div className=\"grid gap-4 sm:grid-cols-2 lg:grid-cols-3\">
              {streaks.flatMap(s => s.achievements).sort((a, b) => 
                new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime()
              ).map((achievement) => (
                <Card key={achievement.id} className=\"border-0 sm:border shadow-sm\">
                  <CardContent className=\"p-4 text-center\">
                    <div className=\"text-4xl mb-3\">{achievement.badgeIcon}</div>
                    <h3 className=\"font-semibold text-sm mb-2\">{achievement.title}</h3>
                    <p className=\"text-xs text-gray-600 mb-3\">{achievement.description}</p>
                    <div className=\"flex justify-between items-center text-xs\">
                      <Badge variant=\"outline\">+{achievement.pointsAwarded} pts</Badge>
                      <span className=\"text-gray-500\">
                        {new Date(achievement.achievedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {streaks.flatMap(s => s.achievements).length === 0 && (
              <Card className=\"border-0 sm:border shadow-sm\">
                <CardContent className=\"text-center py-12\">
                  <Award className=\"h-12 w-12 mx-auto mb-4 text-gray-400\" />
                  <p className=\"text-lg font-medium mb-2\">No achievements yet</p>
                  <p className=\"text-gray-600\">Keep building your streaks to unlock achievements!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}