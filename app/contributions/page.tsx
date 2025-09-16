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
      console.log('Submitting contribution:', newContribution) // Debug log
      
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
      
      // Reset form and close dialog
      setNewContribution({
        memberId: "",
        amount: "",
        type: "MONTHLY",
        method: "BANK_TRANSFER",
        description: "",
        dueDate: ""
      })
      setIsAddDialogOpen(false)
      
      // Refresh contributions list
      fetchContributions()
    } catch (error: any) {
      console.error('Error adding contribution:', error)
      toast.error(error.message || "Failed to add contribution")
    } finally {
      setIsAddingContribution(false)
    }
  }

  // Helper functions
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

  // Load data on component mount and filter changes
  useEffect(() => {
    fetchContributions()
    fetchMembers()
  }, [])

  useEffect(() => {
    fetchContributions(1)
  }, [statusFilter, typeFilter])
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contributions</h1>
            <p className="text-muted-foreground">
              Track and manage member contributions and payments.
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Record Contribution
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleAddContribution}>
                <DialogHeader>
                  <DialogTitle>Record New Contribution</DialogTitle>
                  <DialogDescription>
                    Record a new contribution payment from a member.
                  </DialogDescription>
                </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="member">Member</Label>
                  <Select value={newContribution.memberId} onValueChange={(value) => setNewContribution(prev => ({ ...prev, memberId: value }))}>
                    <SelectTrigger>
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
                    <Label htmlFor="amount">Amount</Label>
                    <Input 
                      id="amount" 
                      type="number" 
                      placeholder="150.00"
                      value={newContribution.amount}
                      onChange={(e) => setNewContribution(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Contribution Type</Label>
                    <Select value={newContribution.type} onValueChange={(value) => setNewContribution(prev => ({ ...prev, type: value as any }))}>
                      <SelectTrigger>
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
                    <Label htmlFor="method">Payment Method</Label>
                    <Select value={newContribution.method} onValueChange={(value) => setNewContribution(prev => ({ ...prev, method: value as any }))}>
                      <SelectTrigger>
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
                    <Label htmlFor="date">Date</Label>
                    <Input 
                      id="date" 
                      type="date"
                      value={newContribution.dueDate}
                      onChange={(e) => setNewContribution(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reference">Description</Label>
                  <Input 
                    id="reference" 
                    placeholder="Optional description"
                    value={newContribution.description}
                    onChange={(e) => setNewContribution(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isAddingContribution}>
                  {isAddingContribution ? "Recording..." : "Record Contribution"}
                </Button>
              </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.count} contributions recorded
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contributors</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
              <p className="text-xs text-muted-foreground">
                Registered members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contributions.length > 0 
                  ? Math.round((contributions.filter(c => c.status === 'COMPLETED').length / contributions.length) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Payment completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
              <Clock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contributions.filter(c => c.status === 'OVERDUE').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contributions Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Contributions</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search contributions..." className="pl-10 w-64" />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contributions.map((contribution) => (
                        <TableRow key={contribution.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={contribution.member.avatar || ""} alt={`${contribution.member.firstName} ${contribution.member.lastName}`} />
                                <AvatarFallback>
                                  {getInitials(contribution.member.firstName, contribution.member.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium">{contribution.member.firstName} {contribution.member.lastName}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {contribution.amount}
                          </TableCell>
                          <TableCell>{contribution.type}</TableCell>
                          <TableCell>{contribution.method}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-2 text-muted-foreground" />
                              {new Date(contribution.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {contribution.status === "COMPLETED" && (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                  <Badge variant="default">Completed</Badge>
                                </>
                              )}
                              {contribution.status === "PENDING" && (
                                <>
                                  <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                                  <Badge variant="secondary">Pending</Badge>
                                </>
                              )}
                              {contribution.status === "OVERDUE" && (
                                <>
                                  <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                  <Badge variant="destructive">Overdue</Badge>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {contribution.reference}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}