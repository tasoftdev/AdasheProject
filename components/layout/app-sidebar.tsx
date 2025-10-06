"use client"

import {
  Bell,
  BookOpen,
  CreditCard,
  DollarSign,
  Home,
  PiggyBank,
  Settings,
  Users,
  Receipt,
  TrendingUp,
  LogOut,
  Flame,
  Sparkles,
  Zap,
  Target,
  Crown,
  Shield,
  BarChart3,
  Wallet,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    color: "from-blue-500 to-cyan-500",
    description: "Overview and analytics"
  },
  {
    title: "Members",
    url: "/members",
    icon: Users,
    color: "from-green-500 to-teal-500",
    description: "Member management"
  },
  {
    title: "Contributions",
    url: "/contributions",
    icon: PiggyBank,
    color: "from-purple-500 to-pink-500",
    description: "Manage contributions"
  },
  {
    title: "Loans",
    url: "/loans",
    icon: CreditCard,
    color: "from-orange-500 to-red-500",
    description: "Loan applications"
  },
  {
    title: "Savings",
    url: "/savings",
    icon: DollarSign,
    color: "from-emerald-500 to-green-500",
    description: "Savings operations"
  },
  {
    title: "Reports",
    url: "/reports",
    icon: TrendingUp,
    color: "from-indigo-500 to-purple-500",
    description: "Financial reports"
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: Receipt,
    color: "from-amber-500 to-yellow-500",
    description: "Transaction history"
  },
  {
    title: "Payouts",
    url: "/payouts",
    icon: Wallet,
    color: "from-cyan-500 to-blue-500",
    description: "Manage payouts"
  },
  {
    title: "Streaks",
    url: "/streaks",
    icon: Flame,
    color: "from-red-500 to-pink-500",
    description: "Contribution streaks"
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
    color: "from-violet-500 to-purple-500",
    description: "Alerts and notifications"
  },
]

const settingsItems = [
  {
    title: "Profile",
    url: "/profile",
    icon: Users,
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    color: "from-gray-500 to-slate-500"
  },
]

export function AppSidebar() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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

  const getRoleBadgeVariant = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return { 
          variant: "default" as const, 
          class: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
          icon: Crown 
        }
      case 'MANAGER':
        return { 
          variant: "default" as const, 
          class: "bg-gradient-to-r from-purple-500 to-indigo-500 text-white",
          icon: Shield 
        }
      default:
        return { 
          variant: "outline" as const, 
          class: "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200",
          icon: Users 
        }
    }
  }
  const getFilteredMenuItems = () => {
    const userRole = (session?.user as any)?.role as string
    
    if (userRole === 'ADMIN' || userRole === 'MANAGER') {
      return menuItems
    }
    
    return menuItems.filter(item => 
      ['Dashboard', 'Contributions', 'Savings', 'Transactions', 'Notifications', 'Payouts'].includes(item.title)
    )
  }

  const isActivePath = (url: string) => {
    return pathname === url || pathname.startsWith(url + '/')
  }

  const roleBadge = getRoleBadgeVariant((session?.user as any)?.role)
  const RoleIcon = roleBadge.icon

  return (
    <Sidebar className="bg-white/80 backdrop-blur-sm border-r border-white/20 shadow-xl relative overflow-hidden">
    
      {mounted && (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
          <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animation-delay-2000"></div>
        </div>
      )}

      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"></div>

      <SidebarHeader className="p-6 pb-4">
        <div className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Adashe
            </h2>
            <p className="text-sm text-gray-600 font-medium">Cooperative Management</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-6">
            <Zap className="w-3 h-3 text-blue-500" />
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {getFilteredMenuItems().map((item) => {
                const isActive = isActivePath(item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`group relative overflow-hidden transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 text-blue-700 font-semibold' 
                          : 'hover:bg-white/60 hover:shadow-md border-l-4 border-transparent'
                      }`}
                    >
                      <Link href={item.url} className="flex items-center space-x-3 p-5 rounded-lg">
                        <div className={`p-2 rounded-lg transition-all duration-200 group-hover:scale-110 ${
                          isActive 
                            ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                            : 'bg-gray-100 text-gray-600 group-hover:bg-white group-hover:shadow-sm'
                        }`}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-medium transition-colors duration-200 ${
                            isActive ? 'text-blue-900' : 'text-gray-700 group-hover:text-gray-900'
                          }`}>
                            {item.title}
                          </span>
                          <p className="text-xs text-gray-500 truncate">
                            {item.description}
                          </p>
                        </div>

                        {isActive && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => {
                const isActive = isActivePath(item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`group relative overflow-hidden transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-gray-500 text-gray-700 font-semibold' 
                          : 'hover:bg-white/60 hover:shadow-md border-l-4 border-transparent'
                      }`}
                    >
                      <Link href={item.url} className="flex items-center space-x-3 p-3 rounded-lg">
                        <div className={`p-2 rounded-lg transition-all duration-200 group-hover:scale-110 ${
                          isActive 
                            ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                            : 'bg-gray-100 text-gray-600 group-hover:bg-white group-hover:shadow-sm'
                        }`}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className={`text-sm font-medium transition-colors duration-200 ${
                          isActive ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                        }`}>
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        </SidebarContent>

       

      <SidebarFooter className="p-4 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
        <div className="space-y-4">
          {session?.user && (
            <div className="flex items-center space-x-3 group p-3 rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 hover:from-blue-50 hover:to-cyan-50 transition-all duration-200 border border-gray-200/50 hover:border-blue-200/50">
              <Avatar className="w-12 h-12 border-2 border-white shadow-lg group-hover:border-blue-200 transition-colors duration-200">
                <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg">
                  {session.user.name ? getInitials(session.user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-900 transition-colors duration-200">
                  {session.user.name || "User"}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant={roleBadge.variant}
                    className={`text-xs font-medium ${roleBadge.class} flex items-center gap-1`}
                  >
                    <RoleIcon className="w-3 h-3" />
                    {(session.user as any)?.role || "Member"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 truncate mt-1">{session.user.email}</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50/50 transition-all duration-200 font-medium py-3 rounded-lg border border-transparent hover:border-red-200/50"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign out
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
          </Button>
          
        </div>
      </SidebarFooter>

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
    </Sidebar>
  )
}