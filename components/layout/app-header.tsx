"use client"

import { Bell, Menu, Search, LogOut, User, Settings, Sparkles, Zap, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSidebar } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { NotificationBadge } from "@/components/notifications/notification-center"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function AppHeader() {
  const { toggleSidebar } = useSidebar()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    setMounted(true)
   
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }))
    }
    
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/auth/signin')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  if (status === 'unauthenticated') {
    return (
      <header className="border-b border-white/20 bg-white/80 backdrop-blur-sm shadow-lg relative z-50">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="font-bold text-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Adashe
            </div>
          </div>
          <Button 
            onClick={() => router.push('/auth/signin')}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Sign In
          </Button>
        </div>
      </header>
    )
  }

  if (status === 'loading') {
    return (
      <header className="border-b border-white/20 bg-white/80 backdrop-blur-sm shadow-lg relative z-50">
        <div className="flex h-16 items-center px-4 sm:px-6">
          <div className="animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 h-8 w-8 rounded-lg"></div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b border-white/20 bg-white/80 backdrop-blur-sm shadow-lg relative z-50">
      {mounted && (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animation-delay-2000"></div>
        </div>
      )}

      <div className="flex h-16 items-center px-4 sm:px-6 gap-4">
        {/* Mobile sidebar toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="md:hidden hover:bg-white/50 transition-all duration-200"
        >
          <Menu className="h-5 w-5 text-gray-700" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        {/* Search bar */}
        <div className="flex-1 flex items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search members, transactions..."
              className="pl-10 bg-white/50 border-gray-200 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Time display */}
        {mounted && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">{currentTime}</span>
          </div>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-white/50 transition-all duration-200 group"
              >
                <div className="relative">
                  <Bell className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
                  <NotificationBadge />
                </div>
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-80 bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <DropdownMenuLabel className="flex items-center gap-2 text-gray-800">
                <Zap className="h-4 w-4 text-blue-600" />
                Notifications
                <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-700">
                  3 new
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem className="hover:bg-blue-50/50 transition-colors duration-150 cursor-pointer focus:bg-blue-50/50">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm font-semibold text-gray-800">Payment Reminder</p>
                  </div>
                  <p className="text-xs text-gray-600">
                    Monthly contribution due for 5 members
                  </p>
                  <span className="text-xs text-gray-500 mt-1">2 hours ago</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-orange-50/50 transition-colors duration-150 cursor-pointer focus:bg-orange-50/50">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <p className="text-sm font-semibold text-gray-800">Loan Application</p>
                  </div>
                  <p className="text-xs text-gray-600">
                    New loan request from Mary Johnson
                  </p>
                  <span className="text-xs text-gray-500 mt-1">5 hours ago</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-purple-50/50 transition-colors duration-150 cursor-pointer focus:bg-purple-50/50">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <p className="text-sm font-semibold text-gray-800">System Update</p>
                  </div>
                  <p className="text-xs text-gray-600">
                    Monthly financial report is ready
                  </p>
                  <span className="text-xs text-gray-500 mt-1">1 day ago</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem 
                className="justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 font-medium cursor-pointer"
                onClick={() => router.push('/notifications')}
              >
                View All Notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-full hover:bg-white/50 transition-all duration-200 group border-2 border-transparent hover:border-blue-200"
              >
                <Avatar className="h-9 w-9 group-hover:scale-105 transition-transform duration-200">
                  <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                    {session?.user?.name ? getInitials(session.user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-64 bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-teal-500"></div>
              <DropdownMenuLabel className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-gray-200">
                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg">
                      {session?.user?.name ? getInitials(session.user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {session?.user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-600 truncate">{session?.user?.email}</p>
                    <Badge 
                      variant="secondary" 
                      className="text-xs w-fit mt-1 bg-gradient-to-r from-green-100 to-teal-100 text-green-700 border-green-200 font-medium"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {(session?.user as any)?.role || "Member"}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem 
                onClick={() => router.push('/profile')}
                className="hover:bg-blue-50/50 transition-colors duration-150 cursor-pointer focus:bg-blue-50/50"
              >
                <User className="mr-3 h-4 w-4 text-blue-600" />
                <span className="text-gray-700 font-medium">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push('/settings')}
                className="hover:bg-purple-50/50 transition-colors duration-150 cursor-pointer focus:bg-purple-50/50"
              >
                <Settings className="mr-3 h-4 w-4 text-purple-600" />
                <span className="text-gray-700 font-medium">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="hover:bg-red-50/50 transition-colors duration-150 cursor-pointer focus:bg-red-50/50 text-red-600 hover:text-red-700"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span className="font-medium">Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
          
      `}</style>
    </header>
  )
}