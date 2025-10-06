"use client"

import { useState, useEffect } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Download,
  BarChart3,
  Sparkles,
  Target,
  Zap,
} from "lucide-react"
import { ContributionRowSkeleton } from "@/components/ui/skeletons"
import { toast } from "sonner"

// Types
interface Contribution {
  id: string
  amount: number
  type: 'MONTHLY' | 'SPECIAL' | 'EMERGENCY' | 'PENALTY'
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED'
  method: string
  reference: string
  description: string | null
  dueDate: string | null
  paidDate: string | null
  createdAt: string
  member: {
    id: string
    firstName: string
    lastName: string
    memberCode: string
    avatar?: string | null
  }
}

interface ContributionsResponse {
  contributions: Contribution[]
  stats: {
    total: number
    count: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface Member {
  id: string
  firstName: string
  lastName: string
  memberCode: string
}

interface NewContribution {
  memberId: string
  amount: string
  type: string
  method: string
  description: string
  dueDate: string
}

export default function ContributionsPage() {
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, count: 0 })
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAddingContribution, setIsAddingContribution] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const [newContribution, setNewContribution] = useState<NewContribution>({
    memberId: "",
    amount: "",
    type: "MONTHLY",
    method: "BANK_TRANSFER",
    description: "",
    dueDate: ""
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch contributions
  const fetchContributions = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      })
      
      if (statusFilter !== 'ALL') params.append('status', statusFilter)
      if (typeFilter !== 'ALL') params.append('type', typeFilter)

      const response = await fetch(`/api/contributions?${params}`)
      if (!response.ok) throw new Error('Failed to fetch contributions')
      
      const data: ContributionsResponse = await response.json()
      setContributions(data.contributions)
      setStats(data.stats)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching contributions:', error)
      toast.error("Failed to load contributions")
    } finally {
      setLoading(false)
    }
  }

  // Fetch members for dropdown
  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members?limit=100&status=ACTIVE')
      if (!response.ok) throw new Error('Failed to fetch members')
      
      const data = await response.json()
      setMembers(data.members)
    } catch (error) {
      console.error('Error fetching members:', error)
      toast.error("Failed to load members")
    }
  }

  // Add new contribution
  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!newContribution.memberId || !newContribution.amount) {
      toast.error("Please fill in all required fields")
      return
    }
    
    setIsAddingContribution(true)
    
    try {
      console.log('Submitting contribution:', newContribution)
      
      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContribution),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create contribution')
      }

      toast.success("Contribution added successfully!")
      

      setNewContribution({
        memberId: "",
        amount: "",
        type: "MONTHLY",
        method: "BANK_TRANSFER",
        description: "",
        dueDate: ""
      })
      setIsAddDialogOpen(false)
      
      fetchContributions()
    } catch (error: any) {
      console.error('Error adding contribution:', error)
      toast.error(error.message || "Failed to add contribution")
    } finally {
      setIsAddingContribution(false)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'default'
      case 'PENDING':
        return 'secondary'
      case 'OVERDUE':
        return 'destructive'
      case 'CANCELLED':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'OVERDUE':
        return <XCircle className="h-4 w-4" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'MONTHLY':
        return 'Monthly Contribution'
      case 'SPECIAL':
        return 'Special Contribution'
      case 'EMERGENCY':
        return 'Emergency Fund'
      case 'PENALTY':
        return 'Penalty Fee'
      default:
        return type
    }
  }

  useEffect(() => {
    fetchContributions()
    fetchMembers()
  }, [])

  useEffect(() => {
    fetchContributions(1)
  }, [statusFilter, typeFilter])

  const statsData = [
    {
      title: "Total Contributions",
      value: `₦${stats.total.toLocaleString()}`,
      change: `${stats.count} contributions recorded`,
      trend: "up" as const,
      icon: DollarSign,
      color: "from-green-500 to-teal-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      title: "Active Contributors",
      value: members.length.toString(),
      change: "Registered members",
      trend: "neutral" as const,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "Collection Rate",
      value: `${contributions.length > 0 
        ? Math.round((contributions.filter(c => c.status === 'COMPLETED').length / contributions.length) * 100)
        : 0}%`,
      change: "Payment completion rate",
      trend: "up" as const,
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      title: "Overdue Payments",
      value: contributions.filter(c => c.status === 'OVERDUE').length.toString(),
      change: "Require immediate attention",
      trend: "down" as const,
      icon: Clock,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-6 relative">
        {mounted && (
          <div className="absolute inset-0 overflow-hidden -z-10">
            <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-r from-green-200 to-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
            <div className="absolute bottom-10 left-10 w-48 h-48 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animation-delay-2000"></div>
            <div className="absolute top-1/2 right-1/3 w-28 h-28 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animation-delay-4000"></div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl shadow-lg">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Contributions
                </h1>
                <p className="text-base sm:text-lg text-gray-600 font-medium mt-1">
                  Track and manage member contributions and payments.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              className="border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
                  <Plus className="w-4 h-4 mr-2" />
                  Record Contribution
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-teal-500"></div>
                <form onSubmit={handleAddContribution}>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-800">Record New Contribution</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Record a new contribution payment from a member.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="member" className="font-medium text-gray-700">Member</Label>
                      <Select value={newContribution.memberId} onValueChange={(value) => setNewContribution(prev => ({ ...prev, memberId: value }))}>
                        <SelectTrigger className="bg-white/50 border-gray-200">
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                        <SelectContent>
                          {members.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.firstName} {member.lastName} - {member.memberCode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="amount" className="font-medium text-gray-700">Amount</Label>
                        <Input 
                          id="amount" 
                          type="number" 
                          placeholder="150.00"
                          value={newContribution.amount}
                          onChange={(e) => setNewContribution(prev => ({ ...prev, amount: e.target.value }))}
                          className="bg-white/50 border-gray-200"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="type" className="font-medium text-gray-700">Type</Label>
                        <Select value={newContribution.type} onValueChange={(value) => setNewContribution(prev => ({ ...prev, type: value as any }))}>
                          <SelectTrigger className="bg-white/50 border-gray-200">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MONTHLY">Monthly Contribution</SelectItem>
                            <SelectItem value="SPECIAL">Special Contribution</SelectItem>
                            <SelectItem value="EMERGENCY">Emergency Fund</SelectItem>
                            <SelectItem value="PENALTY">Penalty Payment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="method" className="font-medium text-gray-700">Payment Method</Label>
                        <Select value={newContribution.method} onValueChange={(value) => setNewContribution(prev => ({ ...prev, method: value as any }))}>
                          <SelectTrigger className="bg-white/50 border-gray-200">
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CASH">Cash</SelectItem>
                            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                            <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                            <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                            <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="date" className="font-medium text-gray-700">Date</Label>
                        <Input 
                          id="date" 
                          type="date"
                          value={newContribution.dueDate}
                          onChange={(e) => setNewContribution(prev => ({ ...prev, dueDate: e.target.value }))}
                          className="bg-white/50 border-gray-200"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="reference" className="font-medium text-gray-700">Description</Label>
                      <Input 
                        id="reference" 
                        placeholder="Optional description"
                        value={newContribution.description}
                        onChange={(e) => setNewContribution(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-white/50 border-gray-200"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={isAddingContribution}
                      className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isAddingContribution ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Recording...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Record Contribution
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat, index) => (
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
                  {stat.trend === "up" && <TrendingUp className="h-3 w-3 mr-1 text-green-500 flex-shrink-0" />}
                  {stat.trend === "down" && <XCircle className="h-3 w-3 mr-1 text-red-500 flex-shrink-0" />}
                  {stat.trend === "neutral" && <Users className="h-3 w-3 mr-1 text-blue-500 flex-shrink-0" />}
                  <span className="truncate font-medium">{stat.change}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contributions Table */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Recent Contributions
              </CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search contributions..." 
                    className="pl-10 w-48 bg-white/50 border-gray-200 focus:border-blue-500 transition-all duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList className="bg-gray-100/50 p-1 rounded-lg">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                >
                  All
                </TabsTrigger>
                <TabsTrigger 
                  value="completed"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                >
                  Completed
                </TabsTrigger>
                <TabsTrigger 
                  value="pending"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger 
                  value="overdue"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                >
                  Overdue
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent bg-gray-50/50">
                        <TableHead className="font-semibold text-gray-700">Member</TableHead>
                        <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                        <TableHead className="font-semibold text-gray-700">Type</TableHead>
                        <TableHead className="font-semibold text-gray-700">Payment Method</TableHead>
                        <TableHead className="font-semibold text-gray-700">Date</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Reference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell colSpan={7}>
                              <div className="flex items-center space-x-4 py-4">
                                <div className="animate-pulse flex space-x-4 w-full">
                                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                                  <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        contributions.map((contribution) => (
                          <TableRow 
                            key={contribution.id}
                            className="hover:bg-gray-50/50 transition-colors duration-150 group"
                          >
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8 border border-gray-200 group-hover:border-blue-200 transition-colors duration-200">
                                  <AvatarImage src={contribution.member.avatar || ""} alt={`${contribution.member.firstName} ${contribution.member.lastName}`} />
                                  <AvatarFallback className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-600 font-medium">
                                    {getInitials(contribution.member.firstName, contribution.member.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    {contribution.member.firstName} {contribution.member.lastName}
                                  </div>
                                  <div className="text-xs text-gray-500 font-medium">
                                    {contribution.member.memberCode}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-bold text-gray-900">
                              ₦{contribution.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className="font-medium text-gray-700 border-gray-300"
                              >
                                {getTypeDisplay(contribution.type)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-700 font-medium">
                              {contribution.method.replace('_', ' ')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-gray-600 font-medium">
                                <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                                {new Date(contribution.createdAt).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {contribution.status === "COMPLETED" && (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                    <Badge variant="default" className="bg-green-100 text-green-700 border-green-200 font-medium">
                                      Completed
                                    </Badge>
                                  </>
                                )}
                                {contribution.status === "PENDING" && (
                                  <>
                                    <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200 font-medium">
                                      Pending
                                    </Badge>
                                  </>
                                )}
                                {contribution.status === "OVERDUE" && (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                    <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 font-medium">
                                      Overdue
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-500 font-medium text-sm">
                              {contribution.reference}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Stats Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-200/50 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-700 mb-1">
                {contributions.filter(c => c.status === 'COMPLETED').length}
              </div>
              <div className="text-sm font-medium text-green-600">Successful Payments</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200/50 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {contributions.filter(c => c.status === 'PENDING').length}
              </div>
              <div className="text-sm font-medium text-blue-600">Pending Approval</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-200/50 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-700 mb-1">
                {contributions.filter(c => c.status === 'OVERDUE').length}
              </div>
              <div className="text-sm font-medium text-orange-600">Needs Attention</div>
            </CardContent>
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