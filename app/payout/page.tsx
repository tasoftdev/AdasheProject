'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, CheckCircle, XCircle, Clock, DollarSign, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

const payoutSchema = z.object({
  memberId: z.string().min(1, 'Member is required'),
  type: z.string().min(1, 'Type is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.string().min(1, 'Amount is required'),
  description: z.string().min(1, 'Description is required'),
  reason: z.string().optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  scheduledDate: z.string().optional(),
  notes: z.string().optional()
});

type PayoutFormData = z.infer<typeof payoutSchema>;

interface Payout {
  id: string;
  type: string;
  category: string;
  amount: number;
  description: string;
  status: string;
  requestDate: string;
  member: {
    firstName: string;
    lastName: string;
    memberCode: string;
    email: string;
  };
  approvals: Array<{
    level: number;
    status: string;
    approvedBy: string;
    approvedAt: string;
  }>;
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  memberCode: string;
  email: string;
}

export default function PayoutDashboard() {
  const { data: session } = useSession();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    startDate: '',
    endDate: ''
  });

  const form = useForm<PayoutFormData>({
    resolver: zodResolver(payoutSchema),
    defaultValues: {
      memberId: '',
      type: '',
      category: '',
      amount: '',
      description: '',
      reason: '',
      paymentMethod: 'BANK_TRANSFER',
      bankName: '',
      accountName: '',
      accountNumber: '',
      scheduledDate: '',
      notes: ''
    }
  });

  const payoutTypes = [
    { value: 'DIVIDEND', label: 'Dividend' },
    { value: 'REFUND', label: 'Refund' },
    { value: 'LOAN_DISBURSEMENT', label: 'Loan Disbursement' },
    { value: 'SAVINGS_WITHDRAWAL', label: 'Savings Withdrawal' },
    { value: 'EMERGENCY_ASSISTANCE', label: 'Emergency Assistance' },
    { value: 'WELFARE_PAYMENT', label: 'Welfare Payment' },
    { value: 'BONUS', label: 'Bonus' },
    { value: 'COMMISSION', label: 'Commission' },
    { value: 'EXPENSE_REIMBURSEMENT', label: 'Expense Reimbursement' },
    { value: 'OTHER', label: 'Other' }
  ];

  const payoutCategories = [
    { value: 'MEMBER_BENEFIT', label: 'Member Benefit' },
    { value: 'OPERATIONAL', label: 'Operational' },
    { value: 'EMERGENCY', label: 'Emergency' },
    { value: 'STATUTORY', label: 'Statutory' },
    { value: 'VOLUNTARY', label: 'Voluntary' }
  ];

  const paymentMethods = [
    { value: 'CASH', label: 'Cash' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'MOBILE_MONEY', label: 'Mobile Money' },
    { value: 'CREDIT_CARD', label: 'Credit Card' },
    { value: 'DEBIT_CARD', label: 'Debit Card' },
    { value: 'CHEQUE', label: 'Cheque' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    ...payoutTypes
  ];

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
    FAILED: 'bg-red-100 text-red-800',
    ON_HOLD: 'bg-orange-100 text-orange-800'
  };

  useEffect(() => {
    fetchPayouts();
    fetchMembers();
    fetchTemplates();
  }, [filters]);

  const fetchPayouts = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/payouts?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setPayouts(data.payouts);
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
      toast.error('Failed to fetch payouts');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members');
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/payouts/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const onSubmit = async (data: PayoutFormData) => {
    try {
      const response = await fetch('/api/payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('Payout request created successfully');
        setShowCreateDialog(false);
        form.reset();
        fetchPayouts();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create payout request');
      }
    } catch (error) {
      console.error('Error creating payout:', error);
      toast.error('Failed to create payout request');
    }
  };

  const handlePayoutAction = async (payoutId: string, action: string, level?: number, comments?: string) => {
    try {
      const response = await fetch(`/api/payouts/${payoutId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, level, comments })
      });

      if (response.ok) {
        toast.success(`Payout ${action}d successfully`);
        fetchPayouts();
        setShowDetailsDialog(false);
      } else {
        const error = await response.json();
        toast.error(error.error || `Failed to ${action} payout`);
      }
    } catch (error) {
      console.error(`Error ${action}ing payout:`, error);
      toast.error(`Failed to ${action} payout`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'APPROVED':
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
      case 'FAILED':
        return <XCircle className="h-4 w-4" />;
      case 'PROCESSING':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const stats = {
    total: payouts.length,
    pending: payouts.filter(p => p.status === 'PENDING').length,
    approved: payouts.filter(p => p.status === 'APPROVED').length,
    completed: payouts.filter(p => p.status === 'COMPLETED').length,
    totalAmount: payouts.reduce((sum, p) => sum + p.amount, 0)
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:bg-white">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Payout Management</h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">Manage member payouts and requests</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                New Payout Request
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Payout Request</DialogTitle>
                <DialogDescription>
                  Create a new payout request for a member
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="memberId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Member</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select member" />
                              </SelectTrigger>
                              <SelectContent>
                                {members.map((member) => (
                                  <SelectItem key={member.id} value={member.id}>
                                    {member.firstName} {member.lastName} ({member.memberCode})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {payoutTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {payoutCategories.map((category) => (
                                  <SelectItem key={category.value} value={category.value}>
                                    {category.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                              {paymentMethods.map((method) => (
                                <SelectItem key={method.value} value={method.value}>
                                  {method.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="accountName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="w-full sm:w-auto">Create Payout Request</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card className="border-0 sm:border shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0" />
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                  <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-600 truncate">Total Payouts</p>
                  <p className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 sm:border shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-yellow-600 flex-shrink-0" />
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                  <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-600 truncate">Pending</p>
                  <p className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 sm:border shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-600 flex-shrink-0" />
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                  <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-600 truncate">Approved</p>
                  <p className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 sm:border shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0" />
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                  <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-600 truncate">Completed</p>
                  <p className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 lg:col-span-1 border-0 sm:border shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-600 flex-shrink-0" />
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                  <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-600 truncate">Total Amount</p>
                  <p className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900 truncate">₦{stats.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-4 sm:mb-6 border-0 sm:border shadow-sm">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                placeholder="Start Date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
              <Input
                type="date"
                placeholder="End Date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payout Requests</CardTitle>
            <CardDescription>
              All payout requests with their current status
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="block sm:hidden">
              <div className="space-y-3 p-4">
                {payouts.map((payout) => (
                  <Card key={payout.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {payout.member.firstName} {payout.member.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{payout.member.memberCode}</p>
                        </div>
                        <Badge className={statusColors[payout.status as keyof typeof statusColors]}>
                          <div className="flex items-center">
                            {getStatusIcon(payout.status)}
                            <span className="ml-1 text-xs">{payout.status}</span>
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <Badge variant="outline" className="text-xs">
                            {payout.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">₦{payout.amount.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(payout.requestDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPayout(payout);
                            setShowDetailsDialog(true);
                          }}
                          className="w-full sm:w-auto"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {payout.member.firstName} {payout.member.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{payout.member.memberCode}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {payout.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>₦{payout.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[payout.status as keyof typeof statusColors]}>
                          <div className="flex items-center">
                            {getStatusIcon(payout.status)}
                            <span className="ml-1">{payout.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(payout.requestDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPayout(payout);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="w-[95vw] max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Payout Details</DialogTitle>
            </DialogHeader>
            {selectedPayout && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Basic Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Member:</span> {selectedPayout.member.firstName} {selectedPayout.member.lastName}</p>
                      <p><span className="font-medium">Type:</span> {selectedPayout.type.replace('_', ' ')}</p>
                      <p><span className="font-medium">Category:</span> {selectedPayout.category.replace('_', ' ')}</p>
                      <p><span className="font-medium">Amount:</span> ₦{selectedPayout.amount.toLocaleString()}</p>
                      <p className="flex flex-wrap items-center"><span className="font-medium">Status:</span> 
                        <Badge className={`ml-2 ${statusColors[selectedPayout.status as keyof typeof statusColors]}`}>
                          {selectedPayout.status}
                        </Badge>
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm">{selectedPayout.description}</p>
                  </div>
                </div>

                {(session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER') && 
                 selectedPayout.status === 'PENDING' && (
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      onClick={() => handlePayoutAction(selectedPayout.id, 'approve', 1)}
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handlePayoutAction(selectedPayout.id, 'reject')}
                      variant="destructive"
                      className="w-full sm:w-auto"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}

                {(session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER') && 
                 selectedPayout.status === 'APPROVED' && (
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      onClick={() => handlePayoutAction(selectedPayout.id, 'process')}
                      className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Process Payment
                    </Button>
                  </div>
                )}

                {(session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER') && 
                 selectedPayout.status === 'PROCESSING' && (
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      onClick={() => handlePayoutAction(selectedPayout.id, 'complete')}
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Completed
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}