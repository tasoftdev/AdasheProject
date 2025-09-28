'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Phone, Mail, MapPin, Briefcase, Heart, Shield, Upload, Eye, CheckCircle, XCircle, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

const profileSchema = z.object({
  // Personal Information
  middleName: z.string().optional(),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  nationality: z.string().optional(),
  stateOfOrigin: z.string().optional(),
  localGovernment: z.string().optional(),
  religion: z.string().optional(),
  bloodGroup: z.string().optional(),

  // Contact Information
  alternatePhone: z.string().optional(),
  alternateEmail: z.string().email().optional().or(z.literal('')),
  residentialAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),

  // Professional Information
  employer: z.string().optional(),
  jobTitle: z.string().optional(),
  workAddress: z.string().optional(),
  workPhone: z.string().optional(),
  workEmail: z.string().email().optional().or(z.literal('')),
  monthlyIncome: z.string().optional(),
  yearsOfExperience: z.string().optional(),

  // Emergency Contact
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactEmail: z.string().email().optional().or(z.literal('')),
  emergencyContactRelation: z.string().optional(),
  emergencyContactAddress: z.string().optional(),

  // Next of Kin
  nextOfKinName: z.string().optional(),
  nextOfKinPhone: z.string().optional(),
  nextOfKinEmail: z.string().email().optional().or(z.literal('')),
  nextOfKinRelation: z.string().optional(),
  nextOfKinAddress: z.string().optional(),
  nextOfKinDateOfBirth: z.string().optional(),

  // Banking Information
  bankName: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankBranch: z.string().optional(),
  bankSortCode: z.string().optional(),
  bvn: z.string().optional(),

  // Preferences
  preferredCommunication: z.string().optional()
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface Profile {
  id: string;
  member: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    memberCode: string;
    dateOfBirth: string;
    address: string;
    occupation: string;
    status: string;
    joinDate: string;
    avatar: string;
  };
  documents: Array<{
    id: string;
    type: string;
    fileName: string;
    fileUrl: string;
    status: string;
    uploadedAt: string;
    verifiedAt: string;
    expiryDate: string;
  }>;
  [key: string]: any;
}

interface ProfileManagementProps {
  memberId: string;
  isOwnProfile?: boolean;
}

export default function ProfileManagement({ memberId, isOwnProfile = false }: ProfileManagementProps) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  });

  const genderOptions = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'];
  const maritalStatusOptions = ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED'];
  const communicationOptions = ['EMAIL', 'SMS', 'PHONE', 'WHATSAPP', 'IN_PERSON'];
  const documentTypes = [
    'NATIONAL_ID',
    'DRIVERS_LICENSE',
    'PASSPORT',
    'VOTERS_CARD',
    'BIRTH_CERTIFICATE',
    'UTILITY_BILL',
    'BANK_STATEMENT',
    'EMPLOYMENT_LETTER',
    'SALARY_SLIP',
    'TAX_CERTIFICATE',
    'BVN_SLIP',
    'PASSPORT_PHOTO',
    'SIGNATURE_SPECIMEN',
    'OTHER'
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
    'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  useEffect(() => {
    fetchProfile();
  }, [memberId]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profiles/${memberId}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        
        // Populate form with existing data
        const formData: any = {};
        Object.keys(profileSchema.shape).forEach(key => {
          if (data[key] !== null && data[key] !== undefined) {
            formData[key] = data[key]?.toString() || '';
          }
        });
        form.reset(formData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const response = await fetch(`/api/profiles/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('Profile updated successfully');
        fetchProfile();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleDocumentUpload = async (file: File, type: string) => {
    setUploadingDoc(true);
    try {
      // In a real app, you would upload to a cloud storage service
      // For now, we'll simulate the upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await fetch(`/api/profiles/${memberId}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          fileName: file.name,
          fileUrl: `/uploads/${file.name}`, // Simulated URL
          fileSize: file.size,
          mimeType: file.type
        })
      });

      if (response.ok) {
        toast.success('Document uploaded successfully');
        fetchProfile();
        setShowUploadDialog(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const verifyDocument = async (documentId: string, status: string) => {
    try {
      const response = await fetch(`/api/profiles/${memberId}/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          notes: status === 'VERIFIED' ? 'Document verified by admin' : 'Document requires attention'
        })
      });

      if (response.ok) {
        toast.success(`Document ${status.toLowerCase()} successfully`);
        fetchProfile();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update document status');
      }
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Failed to update document status');
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompletionPercentage = () => {
    if (!profile) return 0;
    
    const fields = [
      'middleName', 'gender', 'maritalStatus', 'nationality', 'stateOfOrigin',
      'alternatePhone', 'residentialAddress', 'city', 'state',
      'employer', 'jobTitle', 'monthlyIncome',
      'emergencyContactName', 'emergencyContactPhone',
      'nextOfKinName', 'nextOfKinPhone',
      'bankName', 'bankAccountName', 'bankAccountNumber'
    ];
    
    const completedFields = fields.filter(field => 
      profile[field] && profile[field].toString().trim() !== ''
    ).length;
    
    return Math.round((completedFields / fields.length) * 100);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-center text-red-500">Profile not found</div>;
  }

  const completionPercentage = getCompletionPercentage();

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Profile Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {isOwnProfile ? 'Manage your profile information' : `Manage ${profile.member.firstName}'s profile`}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-left sm:text-right">
            <p className="text-sm text-gray-600">Profile Completion</p>
            <div className="flex items-center space-x-2">
              <div className="w-20 sm:w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{completionPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Member Overview Card */}
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 mx-auto sm:mx-0">
              <AvatarImage src={profile.member.avatar} />
              <AvatarFallback>
                {profile.member.firstName[0]}{profile.member.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold">
                {profile.member.firstName} {profile.middleName} {profile.member.lastName}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">Member Code: {profile.member.memberCode}</p>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2">
                <div className="flex items-center justify-center sm:justify-start text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-1" />
                  <span className="truncate">{profile.member.email}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-1" />
                  {profile.member.phone}
                </div>
                <Badge className={profile.member.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {profile.member.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1">
          <TabsTrigger value="personal" className="text-xs sm:text-sm">Personal</TabsTrigger>
          <TabsTrigger value="contact" className="text-xs sm:text-sm">Contact</TabsTrigger>
          <TabsTrigger value="professional" className="text-xs sm:text-sm">Work</TabsTrigger>
          <TabsTrigger value="emergency" className="text-xs sm:text-sm">Emergency</TabsTrigger>
          <TabsTrigger value="banking" className="text-xs sm:text-sm">Banking</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs sm:text-sm">Documents</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="middleName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Middle Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                {genderOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option.replace('_', ' ')}
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
                      name="maritalStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marital Status</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select marital status" />
                              </SelectTrigger>
                              <SelectContent>
                                {maritalStatusOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
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
                      name="bloodGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Blood Group</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select blood group" />
                              </SelectTrigger>
                              <SelectContent>
                                {bloodGroups.map((group) => (
                                  <SelectItem key={group} value={group}>
                                    {group}
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
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nationality</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Nigerian" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stateOfOrigin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State of Origin</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                              <SelectContent>
                                {nigerianStates.map((state) => (
                                  <SelectItem key={state} value={state}>
                                    {state}
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
                      name="localGovernment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Local Government</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="religion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Religion</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="preferredCommunication"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Communication</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select communication method" />
                              </SelectTrigger>
                              <SelectContent>
                                {communicationOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option.replace('_', ' ')}
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <MapPin className="h-5 w-5 mr-2" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="alternatePhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alternate Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="alternateEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alternate Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="residentialAddress"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Residential Address</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="permanentAddress"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Permanent Address</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                              <SelectContent>
                                {nigerianStates.map((state) => (
                                  <SelectItem key={state} value={state}>
                                    {state}
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
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nigeria" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="professional" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="employer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employer</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="jobTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="workPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="workEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="monthlyIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Income (₦)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="yearsOfExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="workAddress"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Work Address</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="emergency" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <Heart className="h-5 w-5 mr-2" />
                    Emergency Contact & Next of Kin
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-4">Emergency Contact</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="emergencyContactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyContactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyContactRelation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Spouse, Parent, Sibling" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyContactAddress"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-4">Next of Kin</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nextOfKinName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="nextOfKinPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="nextOfKinEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="nextOfKinRelation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Spouse, Child, Parent" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="nextOfKinDateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="nextOfKinAddress"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="banking" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <Shield className="h-5 w-5 mr-2" />
                    Banking Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      name="bankAccountName"
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
                      name="bankAccountNumber"
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
                    <FormField
                      control={form.control}
                      name="bankBranch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Branch</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bankSortCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sort Code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bvn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>BVN</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex items-center text-lg sm:text-xl">
                      <FileText className="h-5 w-5 mr-2" />
                      Documents
                    </div>
                    <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                      <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Document
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-md mx-auto">
                        <DialogHeader>
                          <DialogTitle>Upload Document</DialogTitle>
                          <DialogDescription>
                            Upload a new document for verification
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Document Type</label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select document type" />
                              </SelectTrigger>
                              <SelectContent>
                                {documentTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type.replace('_', ' ')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">File</label>
                            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" />
                          </div>
                          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                            <Button variant="outline" onClick={() => setShowUploadDialog(false)} className="w-full sm:w-auto">
                              Cancel
                            </Button>
                            <Button disabled={uploadingDoc} className="w-full sm:w-auto">
                              {uploadingDoc ? 'Uploading...' : 'Upload'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profile.documents && profile.documents.length > 0 ? (
                      profile.documents.map((doc) => (
                        <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg space-y-3 sm:space-y-0">
                          <div className="flex items-start sm:items-center space-x-3">
                            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 flex-shrink-0 mt-1 sm:mt-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm sm:text-base truncate">{doc.fileName}</p>
                              <p className="text-xs sm:text-sm text-gray-600">{doc.type.replace('_', ' ')}</p>
                              <p className="text-xs text-gray-500">
                                Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                            <Badge className={getDocumentStatusColor(doc.status)}>
                              {doc.status}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              {(session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER') && 
                               doc.status === 'PENDING' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => verifyDocument(doc.id, 'VERIFIED')}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => verifyDocument(doc.id, 'REJECTED')}
                                    variant="destructive"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No documents uploaded yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Save Button - Shows on all tabs except documents */}
            {activeTab !== 'documents' && (
              <div className="flex justify-center sm:justify-end mt-6">
                <Button type="submit" size="lg" className="w-full sm:w-auto">
                  Save Profile
                </Button>
              </div>
            )}
          </form>
        </Form>
      </Tabs>
    </div>
  );
}