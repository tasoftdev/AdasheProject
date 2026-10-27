'use client'

import { useEffect, useState } from 'react'
import AppLayout from "@/components/layout/app-layout"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { Bell, Sparkles, Filter, Settings, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function Notifications() {
  const [mounted, setMounted] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  const filters = [
    { id: 'all', label: 'All Notifications', count: 12 },
    { id: 'unread', label: 'Unread', count: 5 },
    { id: 'financial', label: 'Financial', count: 8 },
    { id: 'system', label: 'System', count: 3 },
    { id: 'members', label: 'Members', count: 4 },
  ]

  return (
    <AppLayout>
      <div className="space-y-6 relative">
        {/* Animated Background Elements */}
        {mounted && (
          <div className="absolute inset-0 overflow-hidden -z-10">
            <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
            <div className="absolute bottom-10 left-10 w-48 h-48 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animation-delay-2000"></div>
            <div className="absolute top-1/2 right-1/3 w-28 h-28 bg-gradient-to-r from-orange-200 to-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animation-delay-4000"></div>
          </div>
        )}

        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                  <Bell className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                    Notifications
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 font-medium mt-1">
                    Stay up to date with all cooperative activities and important alerts.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button 
                size="sm"
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">24</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bell className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Unread</p>
                    <p className="text-2xl font-bold text-orange-600">5</p>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Sparkles className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Financial</p>
                    <p className="text-2xl font-bold text-green-600">8</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System</p>
                    <p className="text-2xl font-bold text-purple-600">3</p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Settings className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filter Tabs */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="font-semibold text-gray-700">Filter by:</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <Button
                    key={filter.id}
                    variant={activeFilter === filter.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(filter.id)}
                    className={`
                      relative transition-all duration-200 font-medium
                      ${activeFilter === filter.id 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                        : 'border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                      }
                    `}
                  >
                    {filter.label}
                    <Badge 
                      variant="secondary"
                      className={`
                        ml-2 text-xs font-semibold
                        ${activeFilter === filter.id 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-100 text-gray-600'
                        }
                      `}
                    >
                      {filter.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Center */}
        <div className="relative">
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-cyan-500"></div>
            <NotificationCenter />
          </Card>
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
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </AppLayout>
  )
}