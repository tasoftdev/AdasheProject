"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import AppLayout from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Settings,
  Building2,
  Users,
  DollarSign,
  Bell,
  Shield,
  Palette,
  Download,
  Upload,
  Save,
  User,
  Mail,
  Phone,
} from "lucide-react"

// Types
interface OrganizationSettings {
  name: string
  email: string
  phone: string
  address: string
  website: string
  registrationNumber: string
  establishedDate: string
}

interface FinancialSettings {
  currency: string
  timezone: string
  fiscalYearStart: string
  defaultInterestRate: number
  lateFee: number
  processingFee: number
  autoInterestCalculation: boolean
  latePenalties: boolean
  minLoanAmount: number
  maxLoanAmount: number
  minLoanTerm: number
  maxLoanTerm: number
  guarantorRequired: boolean
  maxGuarantors: number
}

interface SystemSettings {
  language: string
  dateFormat: string
  numberFormat: string
  sessionTimeout: number
  maxSessions: number
  passwordMinLength: number
  passwordExpiry: number
  requireUppercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  twoFactorAuth: boolean
  autoBackup: boolean
  backupFrequency: string
  dataRetention: number
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  paymentReminders: boolean
  loanNotifications: boolean
  monthlyReports: boolean
  overdueAlerts: boolean
  systemAlerts: boolean
  reminderDays: number[]
}

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  title: string
  role: string
  avatar?: string
  joinDate: string
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Settings state
  const [organizationSettings, setOrganizationSettings] = useState<OrganizationSettings | null>(null)
  const [financialSettings, setFinancialSettings] = useState<FinancialSettings | null>(null)
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAllSettings()
    }
  }, [status])

  const fetchAllSettings = async () => {
    try {
      setLoading(true)
      const [cooperativeRes, profileRes] = await Promise.all([
        fetch('/api/settings/cooperative'),
        fetch('/api/settings/profile')
      ])

      if (cooperativeRes.ok) {
        const cooperativeData = await cooperativeRes.json()
        setOrganizationSettings(cooperativeData.organization)
        setFinancialSettings(cooperativeData.financial)
        setSystemSettings(cooperativeData.system)
        setNotificationSettings(cooperativeData.notifications)
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setUserProfile(profileData)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (section: string, data: any) => {
    try {
      setSaving(true)
      const response = await fetch('/api/settings/cooperative', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, data })
      })

      const result = await response.json()
      
      if (response.ok) {
        toast.success(`${section} settings updated successfully`)
      } else {
        console.error('API Error:', result)
        toast.error(result.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const saveProfile = async (profileData: Partial<UserProfile>) => {
    try {
      setSaving(true)
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        toast.success('Profile updated successfully')
        fetchAllSettings() // Refresh data
      } else {
        throw new Error('Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/settings/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (response.ok) {
        toast.success('Password updated successfully')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update password')
      }
    } catch (error) {
      console.error('Error updating password:', error)
      toast.error('Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <AppLayout>
        <div className="space-y-6 p-6">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="border rounded-lg">
            <div className="p-4 border-b">
              <div className="flex space-x-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
            <div className="p-6 space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      <div className="h-9 w-full bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                      <div className="h-9 w-full bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Please log in to access settings.</p>
        </div>
      </AppLayout>
    )
  }
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your cooperative settings and preferences.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Settings
            </Button>
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    Cooperative Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="coop-name">Cooperative Name</Label>
                    <Input 
                      id="coop-name" 
                      value={organizationSettings?.name || ''} 
                      onChange={(e) => setOrganizationSettings(prev => 
                        prev ? {...prev, name: e.target.value} : null
                      )}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="registration">Registration Number</Label>
                    <Input 
                      id="registration" 
                      value={organizationSettings?.registrationNumber || ''}
                      onChange={(e) => setOrganizationSettings(prev => 
                        prev ? {...prev, registrationNumber: e.target.value} : null
                      )}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea 
                      id="address" 
                      value={organizationSettings?.address || ''}
                      onChange={(e) => setOrganizationSettings(prev => 
                        prev ? {...prev, address: e.target.value} : null
                      )}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={organizationSettings?.phone || ''}
                      onChange={(e) => setOrganizationSettings(prev => 
                        prev ? {...prev, phone: e.target.value} : null
                      )}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={organizationSettings?.email || ''}
                      onChange={(e) => setOrganizationSettings(prev => 
                        prev ? {...prev, email: e.target.value} : null
                      )}
                    />
                  </div>
                  <Button 
                    onClick={() => organizationSettings && saveSettings('organization', organizationSettings)}
                    disabled={saving}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Organization Info'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="w-5 h-5 mr-2" />
                    System Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <select
                      value={systemSettings?.language || 'en'}
                      onChange={(e) => setSystemSettings(prev => 
                        prev ? {...prev, language: e.target.value} : null
                      )}
                      className="border rounded-lg px-3 py-2"
                    >
                      <option value="ngn">Nigerian Naira (NGN)</option>
                      <option value="usd">US Dollar (USD)</option>
                      <option value="eur">Euro (EUR)</option>
                      <option value="gbp">British Pound (GBP)</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      value={financialSettings?.timezone || 'Africa/Lagos'}
                      onChange={(e) => setFinancialSettings(prev => 
                        prev ? {...prev, timezone: e.target.value} : null
                      )}
                      className="border rounded-lg px-3 py-2"
                    >
                      <option value="Africa/Lagos">West Africa Time (WAT)</option>
                      <option value="UTC">UTC (GMT+0)</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="language">Language</Label>
                    <select
                      value={systemSettings?.language || 'en'}
                      onChange={(e) => setSystemSettings(prev => 
                        prev ? {...prev, language: e.target.value} : null
                      )}
                      className="border rounded-lg px-3 py-2"
                    >
                      <option value="en">English</option>
                      <option value="yo">Yoruba</option>
                      <option value="ig">Igbo</option>
                      <option value="ha">Hausa</option>
                    </select>
                  </div>
                  <Button 
                    onClick={() => {
                      if (systemSettings && financialSettings) {
                        saveSettings('system', systemSettings)
                        saveSettings('financial', { timezone: financialSettings.timezone })
                      }
                    }}
                    disabled={saving}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save System Preferences'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Financial Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="min-contribution">Minimum Monthly Contribution</Label>
                      <Input id="min-contribution" type="number" defaultValue="100" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="max-contribution">Maximum Monthly Contribution</Label>
                      <Input id="max-contribution" type="number" defaultValue="1000" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="savings-rate">Savings Interest Rate (%)</Label>
                      <Input id="savings-rate" type="number" defaultValue="5.5" step="0.1" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="loan-rate">Default Loan Interest Rate (%)</Label>
                      <Input id="loan-rate" type="number" defaultValue="12.0" step="0.1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="late-fee">Late Payment Fee</Label>
                      <Input id="late-fee" type="number" defaultValue="25" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="processing-fee">Loan Processing Fee</Label>
                      <Input id="processing-fee" type="number" defaultValue="50" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-interest">Automatic Interest Calculation</Label>
                    <Switch id="auto-interest" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="late-penalties">Late Payment Penalties</Label>
                    <Switch id="late-penalties" defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Loan Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="min-loan">Minimum Loan Amount</Label>
                      <Input id="min-loan" type="number" defaultValue="500" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="max-loan">Maximum Loan Amount</Label>
                      <Input id="max-loan" type="number" defaultValue="50000" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="min-term">Minimum Loan Term (months)</Label>
                      <Input id="min-term" type="number" defaultValue="6" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="max-term">Maximum Loan Term (months)</Label>
                      <Input id="max-term" type="number" defaultValue="36" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="guarantor-req">Guarantor Requirement</Label>
                    <Select defaultValue="required">
                      <SelectTrigger>
                        <SelectValue placeholder="Select requirement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="required">Always Required</SelectItem>
                        <SelectItem value="optional">Optional</SelectItem>
                        <SelectItem value="amount-based">Based on Loan Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-approval">Automatic Approval for Small Loans</Label>
                    <Switch id="auto-approval" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Member Management Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="membership-fee">Membership Registration Fee</Label>
                      <Input id="membership-fee" type="number" defaultValue="100" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="share-value">Share Value</Label>
                      <Input id="share-value" type="number" defaultValue="10" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="min-shares">Minimum Shares Required</Label>
                      <Input id="min-shares" type="number" defaultValue="10" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-member-id">Auto-generate Member IDs</Label>
                      <Switch id="auto-member-id" defaultChecked />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="grace-period">Payment Grace Period (days)</Label>
                      <Input id="grace-period" type="number" defaultValue="5" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="inactive-period">Mark Inactive After (days)</Label>
                      <Input id="inactive-period" type="number" defaultValue="90" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="kyc-required">KYC Verification Required</Label>
                      <Switch id="kyc-required" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="photo-required">Photo ID Required</Label>
                      <Switch id="photo-required" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Email Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="payment-reminders">Payment Reminders</Label>
                        <p className="text-sm text-muted-foreground">Send reminders for upcoming payments</p>
                      </div>
                      <Switch id="payment-reminders" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="loan-notifications">Loan Notifications</Label>
                        <p className="text-sm text-muted-foreground">Notifications for loan applications and approvals</p>
                      </div>
                      <Switch id="loan-notifications" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="monthly-reports">Monthly Reports</Label>
                        <p className="text-sm text-muted-foreground">Automated monthly financial reports</p>
                      </div>
                      <Switch id="monthly-reports" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">SMS Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sms-payments">Payment Confirmations</Label>
                        <p className="text-sm text-muted-foreground">SMS confirmations for successful payments</p>
                      </div>
                      <Switch id="sms-payments" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sms-overdue">Overdue Alerts</Label>
                        <p className="text-sm text-muted-foreground">SMS alerts for overdue payments</p>
                      </div>
                      <Switch id="sms-overdue" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Notification Timing</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="reminder-days">Reminder Days Before Due Date</Label>
                      <Input id="reminder-days" type="number" defaultValue="3" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="overdue-days">Overdue Alert After (days)</Label>
                      <Input id="overdue-days" type="number" defaultValue="1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Password Policy</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="min-password">Minimum Password Length</Label>
                      <Input id="min-password" type="number" defaultValue="8" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                      <Input id="password-expiry" type="number" defaultValue="90" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="require-uppercase">Require Uppercase Letters</Label>
                      <Switch id="require-uppercase" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="require-numbers">Require Numbers</Label>
                      <Switch id="require-numbers" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="require-special">Require Special Characters</Label>
                      <Switch id="require-special" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Session Management</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                      <Input id="session-timeout" type="number" defaultValue="30" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="max-sessions">Maximum Concurrent Sessions</Label>
                      <Input id="max-sessions" type="number" defaultValue="3" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <Switch id="two-factor" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Data Protection</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="encrypt-data">Encrypt Sensitive Data</Label>
                      <Switch id="encrypt-data" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="audit-log">Enable Audit Logging</Label>
                      <Switch id="audit-log" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="backup-encryption">Encrypt Backups</Label>
                      <Switch id="backup-encryption" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={userProfile?.avatar || session?.user?.image} alt="Profile" />
                    <AvatarFallback>
                      {userProfile?.firstName?.[0] || session?.user?.name?.[0] || 'U'}
                      {userProfile?.lastName?.[0] || session?.user?.name?.split(' ')[1]?.[0] || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Recommended: Square image, at least 200x200px
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input 
                        id="first-name" 
                        value={userProfile?.firstName || ''} 
                        onChange={(e) => setUserProfile(prev => 
                          prev ? {...prev, firstName: e.target.value} : null
                        )}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input 
                        id="last-name" 
                        value={userProfile?.lastName || ''} 
                        onChange={(e) => setUserProfile(prev => 
                          prev ? {...prev, lastName: e.target.value} : null
                        )}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input 
                        id="title" 
                        value={userProfile?.title || ''} 
                        onChange={(e) => setUserProfile(prev => 
                          prev ? {...prev, title: e.target.value} : null
                        )}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="profile-email">Email Address</Label>
                      <Input 
                        id="profile-email" 
                        type="email" 
                        value={userProfile?.email || ''} 
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="profile-phone">Phone Number</Label>
                      <Input 
                        id="profile-phone" 
                        value={userProfile?.phone || ''} 
                        onChange={(e) => setUserProfile(prev => 
                          prev ? {...prev, phone: e.target.value} : null
                        )}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Input 
                        value={userProfile?.role || 'Member'} 
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Contact admin to change role</p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => userProfile && saveProfile({
                    firstName: userProfile.firstName,
                    lastName: userProfile.lastName,
                    title: userProfile.title,
                    phone: userProfile.phone
                  })}
                  disabled={saving}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>

                <div className="space-y-4">
                  <h4 className="font-medium">Change Password</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="grid gap-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input 
                        id="current-password" 
                        type="password" 
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({
                          ...prev, 
                          currentPassword: e.target.value
                        }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input 
                        id="new-password" 
                        type="password" 
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({
                          ...prev, 
                          newPassword: e.target.value
                        }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input 
                        id="confirm-password" 
                        type="password" 
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({
                          ...prev, 
                          confirmPassword: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                  <Button onClick={changePassword} disabled={saving}>
                    {saving ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}