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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Loader2,
} from "lucide-react"
import { MemberRowSkeleton } from "@/components/ui/skeletons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

// Types
interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  memberCode: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  createdAt: string
  address: string | null
  user: {
    email: string
    role: string
  }
  _count: {
    contributions: number
    loans: number
    savings: number
    transactions: number
  }
}

interface MembersResponse {
  members: Member[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface AddMemberForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  address: string
  username: string
  password: string
  dateOfBirth: string
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const [newMember, setNewMember] = useState<AddMemberForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "MEMBER",
    address: "",
    username: "",
    password: "",
    dateOfBirth: ""
  })

  // Fetch members
  const fetchMembers = async (page = 1, search = searchTerm, status = statusFilter) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      })
      
      if (search) params.append('search', search)
      if (status && status !== 'ALL') params.append('status', status)

      const response = await fetch(`/api/members?${params}`)
      if (!response.ok) throw new Error('Failed to fetch members')
      
      const data: MembersResponse = await response.json()
      setMembers(data.members)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching members:', error)
      toast.error("Failed to load members")
    } finally {
      setLoading(false)
    }
  }

  // Add new member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingMember(true)
    
    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newMember,
          occupation: newMember.role // Map role to occupation for now
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create member')
      }

      const createdMember = await response.json()
      toast.success("Member added successfully!")
      
      // Reset form and close dialog
      setNewMember({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "MEMBER",
        address: "",
        username: "",
        password: "",
        dateOfBirth: ""
      })
      setIsAddDialogOpen(false)
      
      // Refresh members list
      fetchMembers()
    } catch (error: any) {
      console.error('Error adding member:', error)
      toast.error(error.message || "Failed to add member")
    } finally {
      setIsAddingMember(false)
    }
  }

  // Toggle member status
  const toggleMemberStatus = async (memberId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      const response = await fetch(`/api/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update member status')
      }

      toast.success(`Member ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully!`)
      
      // Refresh members list
      fetchMembers(pagination.page)
    } catch (error: any) {
      console.error('Error updating member status:', error)
      toast.error(error.message || "Failed to update member status")
    }
  }

  // Helper functions
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default'
      case 'INACTIVE':
        return 'secondary'
      case 'SUSPENDED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getRoleDisplay = (role: string) => {
    return role.charAt(0) + role.slice(1).toLowerCase()
  }

  // Load members on component mount and when filters change
  useEffect(() => {
    fetchMembers()
  }, [])

  // Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchMembers(1, searchTerm, statusFilter)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, statusFilter])
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Members</h1>
            <p className="text-muted-foreground">
              Manage your cooperative members and their information.
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleAddMember}>
                <DialogHeader>
                  <DialogTitle>Add New Member</DialogTitle>
                  <DialogDescription>
                    Fill in the member details to add them to your cooperative.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 px-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        placeholder="John" 
                        value={newMember.firstName}
                        onChange={(e) => setNewMember({...newMember, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Doe" 
                        value={newMember.lastName}
                        onChange={(e) => setNewMember({...newMember, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="john.doe@example.com" 
                        value={newMember.email}
                        onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        placeholder="johndoe" 
                        value={newMember.username}
                        onChange={(e) => setNewMember({...newMember, username: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="********" 
                        value={newMember.password}
                        onChange={(e) => setNewMember({...newMember, password: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="+234 XXX XXX XXXX" 
                        value={newMember.phone}
                        onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Select 
                        value={newMember.role}
                        onValueChange={(value) => setNewMember({...newMember, role: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MEMBER">Member</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="ADMIN">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input 
                        id="dateOfBirth" 
                        type="date" 
                        value={newMember.dateOfBirth}
                        onChange={(e) => setNewMember({...newMember, dateOfBirth: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea 
                      id="address" 
                      placeholder="123 Main St, City, State" 
                      value={newMember.address}
                      onChange={(e) => setNewMember({...newMember, address: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isAddingMember}>
                    {isAddingMember ? "Adding..." : "Add Member"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Member Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search members..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Total Contributions</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <MemberRowSkeleton key={i} />
                    ))
                  ) : members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-muted-foreground">No members found.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>{getInitials(member.firstName, member.lastName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.firstName} {member.lastName}</div>
                              <div className="text-sm text-muted-foreground">
                                {member.memberCode}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                              {member.email}
                            </div>
                            {member.phone && (
                              <div className="flex items-center text-sm">
                                <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                                {member.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getRoleDisplay(member.user.role)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(member.status)}>
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                            {new Date(member.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₦{member._count.contributions * 500} {/* Estimated based on contribution count */}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View profile</DropdownMenuItem>
                              <DropdownMenuItem>Edit member</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Send message</DropdownMenuItem>
                              <DropdownMenuItem>View contributions</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => toggleMemberStatus(member.id, member.status)}
                              >
                                {member.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total} members
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchMembers(pagination.page - 1)}
                    disabled={pagination.page <= 1 || loading}
                  >
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchMembers(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}