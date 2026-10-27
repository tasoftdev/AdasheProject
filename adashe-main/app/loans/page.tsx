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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  FileText,
  MoreHorizontal,
} from "lucide-react"
import { LoanRowSkeleton } from "@/components/ui/skeletons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PaymentComponent } from "@/components/payments"
import { toast } from "sonner"

// Helper function to get user initials
function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

// TypeScript interfaces
interface Loan {
  id: string
  member: {
    id: string
    firstName: string
    lastName: string
    memberCode: string
    avatar?: string | null
  }
  amount: number
  interestRate: number
  term: number
  purpose: string
  status: "PENDING" | "APPROVED" | "ACTIVE" | "COMPLETED" | "REJECTED" | "DEFAULTED"
  appliedDate: string
  approvedDate?: string | null
  startDate?: string | null
  endDate?: string | null
  monthlyPayment?: number | null
  totalPaid: number
  balance: number
  collateral?: string | null
  guarantor?: string | null
  createdAt: string
}

interface Member {
  id: string
  firstName: string
  lastName: string
  memberCode: string
  avatar?: string | null
}

interface LoansResponse {
  loans: Loan[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface NewLoan {
  memberId: string
  amount: string
  interestRate: string
  term: string
  purpose: string
  collateral: string
  guarantor: string
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOutstanding: 0,
    monthlyCollections: 0,
    overdueAmount: 0,
    approvalRate: 0,
    totalLoans: 0,
    pendingCount: 0,
    overdueCount: 0
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAddingLoan, setIsAddingLoan] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const [newLoan, setNewLoan] = useState<NewLoan>({
    memberId: "",
    amount: "",
    interestRate: "12",
    term: "12",
    purpose: "",
    collateral: "",
    guarantor: ""
  })

  // Fetch loans from API
  const fetchLoans = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        status: statusFilter !== "ALL" ? statusFilter : ""
      })

      const response = await fetch(`/api/loans?${queryParams}`)
      if (!response.ok) throw new Error("Failed to fetch loans")

      const data: LoansResponse = await response.json()
      setLoans(data.loans)
      setPagination(data.pagination)
      
      // Calculate stats
      const totalOutstanding = data.loans
        .filter(loan => loan.status === "ACTIVE")
        .reduce((sum, loan) => sum + loan.balance, 0)
      
      const monthlyCollections = data.loans
        .filter(loan => loan.status === "ACTIVE")
        .reduce((sum, loan) => sum + (loan.monthlyPayment || 0), 0)
      
      const overdueAmount = data.loans
        .filter(loan => loan.status === "DEFAULTED")
        .reduce((sum, loan) => sum + loan.balance, 0)
      
      const totalLoans = data.loans.length
      const approvedLoans = data.loans.filter(loan => 
        loan.status === "APPROVED" || loan.status === "ACTIVE" || loan.status === "COMPLETED"
      ).length
      const approvalRate = totalLoans > 0 ? (approvedLoans / totalLoans) * 100 : 0
      
      const pendingCount = data.loans.filter(loan => loan.status === "PENDING").length
      const overdueCount = data.loans.filter(loan => loan.status === "DEFAULTED").length

      setStats({
        totalOutstanding,
        monthlyCollections,
        overdueAmount,
        approvalRate,
        totalLoans,
        pendingCount,
        overdueCount
      })
    } catch (error) {
      console.error("Error fetching loans:", error)
      toast.error("Failed to fetch loans")
    } finally {
      setLoading(false)
    }
  }

  // Fetch members for loan form
  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members')
      if (!response.ok) throw new Error("Failed to fetch members")
      
      const data = await response.json()
      console.log('Fetched members for loans:', data.members)
      setMembers(data.members || [])
    } catch (error) {
      console.error("Error fetching members:", error)
    }
  }

  // Handle adding a new loan
  const handleAddLoan = async () => {
    if (!newLoan.memberId || !newLoan.amount || !newLoan.purpose) {
      toast.error("Please fill in all required fields")
      return
    }

    console.log('Submitting loan with data:', newLoan)

    setIsAddingLoan(true)
    try {
      const loanData = {
        memberId: newLoan.memberId,
        amount: newLoan.amount,
        interestRate: newLoan.interestRate,
        term: newLoan.term,
        purpose: newLoan.purpose,
        collateral: newLoan.collateral || null,
        guarantor: newLoan.guarantor || null,
      }
      
      console.log('Sending loan data to API:', loanData)

      const response = await fetch("/api/loans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loanData),
      })

      if (!response.ok) {
        throw new Error("Failed to create loan")
      }

      const data = await response.json()
      toast.success("Loan application submitted successfully!")
      
      // Reset form and close dialog
      setNewLoan({
        memberId: "",
        amount: "",
        interestRate: "12",
        term: "12",
        purpose: "",
        collateral: "",
        guarantor: ""
      })
      setIsAddDialogOpen(false)
      
      // Refresh loans list
      fetchLoans()
    } catch (error) {
      console.error("Error creating loan:", error)
      toast.error("Failed to submit loan application")
    } finally {
      setIsAddingLoan(false)
    }
  }

  // Handle loan status update (approve/reject)
  const handleLoanStatusUpdate = async (loanId: string, status: "APPROVED" | "REJECTED") => {
    try {
      const response = await fetch("/api/loans", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: loanId,
          status: status,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update loan status")
      }

      const action = status === "APPROVED" ? "approved" : "rejected"
      toast.success(`Loan ${action} successfully!`)
      
      // Refresh loans list
      fetchLoans()
    } catch (error) {
      console.error("Error updating loan status:", error)
      toast.error("Failed to update loan status")
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchLoans()
    fetchMembers()
  }, [pagination.page, searchTerm, statusFilter])

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Handle status filter
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Define loan stats for cards
  const loanStats = [
    {
      title: "Total Outstanding",
      value: `₦${stats.totalOutstanding.toLocaleString()}`,
      count: `${loans.filter(l => l.status === "ACTIVE").length} active loans`,
      icon: DollarSign,
      color: "text-blue-600"
    },
    {
      title: "Monthly Collections",
      value: `₦${stats.monthlyCollections.toLocaleString()}`,
      count: "Expected this month",
      icon: CreditCard,
      color: "text-green-600"
    },
    {
      title: "Overdue Amount",
      value: `₦${stats.overdueAmount.toLocaleString()}`,
      count: `${stats.overdueCount} overdue loans`,
      icon: AlertTriangle,
      color: "text-red-600"
    },
    {
      title: "Approval Rate",
      value: `${stats.approvalRate.toFixed(1)}%`,
      count: `${stats.totalLoans} total applications`,
      icon: CheckCircle,
      color: "text-purple-600"
    }
]

return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Loans</h1>
            <p className="text-muted-foreground">
              Manage loan applications, disbursements, and repayments.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <PaymentComponent
              defaultData={{
                type: 'loan_repayment',
                amount: 15000
              }}
              onSuccess={(payment) => {
                toast.success(`Loan repayment of ₦${payment.amount.toLocaleString()} completed!`)
                fetchLoans()
              }}
              onError={(error) => {
                toast.error(`Payment failed: ${error}`)
              }}
              trigger={
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Make Repayment
                </Button>
              }
            />
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Loan Application
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Loan Application</DialogTitle>
                <DialogDescription>
                  Fill in the loan application details for review and approval.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="applicant">Applicant</Label>
                  <Select 
                    value={newLoan.memberId} 
                    onValueChange={(value) => setNewLoan(prev => ({ ...prev, memberId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={member.avatar || ""} alt={`${member.firstName} ${member.lastName}`} />
                              <AvatarFallback>{getInitials(member.firstName, member.lastName)}</AvatarFallback>
                            </Avatar>
                            <span>{member.firstName} {member.lastName}</span>
                            <span className="text-muted-foreground">({member.memberCode})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="loanAmount">Loan Amount (₦)</Label>
                    <Input 
                      id="loanAmount" 
                      type="number" 
                      placeholder="5000" 
                      value={newLoan.amount}
                      onChange={(e) => setNewLoan(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input 
                      id="interestRate" 
                      type="number" 
                      placeholder="12" 
                      step="0.1" 
                      value={newLoan.interestRate}
                      onChange={(e) => setNewLoan(prev => ({ ...prev, interestRate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="loanTerm">Loan Term (months)</Label>
                    <Select 
                      value={newLoan.term} 
                      onValueChange={(value) => setNewLoan(prev => ({ ...prev, term: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="18">18 months</SelectItem>
                        <SelectItem value="24">24 months</SelectItem>
                        <SelectItem value="36">36 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="guarantor">Guarantor</Label>
                    <Input 
                      id="guarantor" 
                      placeholder="Optional"
                      value={newLoan.guarantor}
                      onChange={(e) => setNewLoan(prev => ({ ...prev, guarantor: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="purpose">Purpose of Loan</Label>
                  <Textarea 
                    id="purpose" 
                    placeholder="Describe the purpose of the loan..."
                    className="min-h-[100px]"
                    value={newLoan.purpose}
                    onChange={(e) => setNewLoan(prev => ({ ...prev, purpose: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="collateral">Collateral Description</Label>
                  <Textarea 
                    id="collateral" 
                    placeholder="Optional - describe any collateral offered..."
                    className="min-h-[80px]"
                    value={newLoan.collateral}
                    onChange={(e) => setNewLoan(prev => ({ ...prev, collateral: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isAddingLoan}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  onClick={handleAddLoan}
                  disabled={isAddingLoan}
                >
                  {isAddingLoan ? "Submitting..." : "Submit Application"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loanStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loans Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Loan Portfolio</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search loans..." 
                    className="pl-10 w-64" 
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="DEFAULTED">Defaulted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All Loans</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Loan ID</TableHead>
                        <TableHead>Borrower</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Monthly Payment</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Next Payment</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <LoanRowSkeleton key={i} />
                        ))
                      ) : loans.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No loans found. Create the first loan application.
                          </TableCell>
                        </TableRow>
                      ) : (
                        loans.map((loan) => (
                          <TableRow key={loan.id}>
                            <TableCell className="font-medium">#{loan.id.slice(-8)}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={loan.member.avatar || ""} alt={`${loan.member.firstName} ${loan.member.lastName}`} />
                                  <AvatarFallback>{getInitials(loan.member.firstName, loan.member.lastName)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{loan.member.firstName} {loan.member.lastName}</div>
                                  <div className="text-sm text-muted-foreground">{loan.member.memberCode}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              ₦{loan.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>{loan.purpose}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {loan.status === "ACTIVE" && (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                    <Badge variant="default">Active</Badge>
                                  </>
                                )}
                                {loan.status === "PENDING" && (
                                  <>
                                    <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                                    <Badge variant="secondary">Pending</Badge>
                                  </>
                                )}
                                {loan.status === "DEFAULTED" && (
                                  <>
                                    <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                                    <Badge variant="destructive">Overdue</Badge>
                                  </>
                                )}
                                {loan.status === "COMPLETED" && (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                    <Badge variant="outline">Completed</Badge>
                                  </>
                                )}
                                {loan.status === "APPROVED" && (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                                    <Badge variant="secondary">Approved</Badge>
                                  </>
                                )}
                                {loan.status === "REJECTED" && (
                                  <>
                                    <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                                    <Badge variant="destructive">Rejected</Badge>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {loan.monthlyPayment ? `₦${loan.monthlyPayment.toLocaleString()}` : "N/A"}
                            </TableCell>
                            <TableCell className="font-medium">
                              ₦{loan.balance.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {loan.startDate && loan.status === "ACTIVE" && (
                                <div className="flex items-center text-sm">
                                  <Calendar className="h-3 w-3 mr-2 text-muted-foreground" />
                                  {new Date(loan.startDate).toLocaleDateString()}
                                </div>
                              )}
                              {loan.status === "COMPLETED" && (
                                <span className="text-muted-foreground text-sm">Completed</span>
                              )}
                              {loan.status === "PENDING" && (
                                <span className="text-muted-foreground text-sm">Pending approval</span>
                              )}
                              {loan.status === "REJECTED" && (
                                <span className="text-muted-foreground text-sm">Rejected</span>
                              )}
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
                                  <DropdownMenuItem>View details</DropdownMenuItem>
                                  <DropdownMenuItem>Payment history</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Record payment</DropdownMenuItem>
                                  <DropdownMenuItem>Generate schedule</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {loan.status === "PENDING" && (
                                    <>
                                      <DropdownMenuItem 
                                        className="text-green-600"
                                        onClick={() => handleLoanStatusUpdate(loan.id, "APPROVED")}
                                      >
                                        Approve loan
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="text-red-600"
                                        onClick={() => handleLoanStatusUpdate(loan.id, "REJECTED")}
                                      >
                                        Reject loan
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {loan.status === "DEFAULTED" && (
                                    <DropdownMenuItem className="text-red-600">
                                      Send reminder
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
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
      </div>
    </AppLayout>
  )
}
