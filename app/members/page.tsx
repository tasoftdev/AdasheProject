"use client"

import { useState, useEffect, useRef } from "react"
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
  Users,
  UserMinus,
  Eye,
  Settings,
  MessageCircle,
  Globe,
  Lock,
  ArrowRight,
  Group,
  UserCheck,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Video,
  PhoneCall,
  Info,
  Search as SearchIcon,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

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

interface Group {
  id: string
  name: string
  description: string
  avatar?: string
  coverImage?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  memberCount: number
  isPublic: boolean
  tags: string[]
  members: GroupMember[]
}

interface GroupMember {
  id: string
  groupId: string
  memberId: string
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER'
  joinedAt: string
  member: Member
}

interface ChatMessage {
  id: string
  senderId: string
  receiverId?: string
  groupId?: string
  content: string
  timestamp: string
  type: 'text' | 'image' | 'file'
  status: 'sent' | 'delivered' | 'read'
  sender: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
}

interface ChatConversation {
  id: string
  type: 'direct' | 'group'
  name: string
  avatar?: string
  lastMessage?: string
  lastMessageTime: string
  unreadCount: number
  members?: Member[]
  isOnline?: boolean
  lastSeen?: string
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
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [groupsLoading, setGroupsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false)
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [activeTab, setActiveTab] = useState<'members' | 'groups' | 'chat'>('members')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // Chat states
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    isPublic: true,
    tags: [] as string[]
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

  // Fetch groups
  const fetchGroups = async () => {
    try {
      setGroupsLoading(true)
      // Mock groups data
      const mockGroups: Group[] = [
        {
          id: "1",
          name: "Finance Management",
          description: "A group dedicated to discussing financial strategies and investment opportunities.",
          avatar: "/group-avatar.png",
          coverImage: "/group-cover.jpg",
          createdBy: "user-1",
          createdAt: new Date('2024-01-15').toISOString(),
          updatedAt: new Date().toISOString(),
          memberCount: 47,
          isPublic: true,
          tags: ["finance", "investment", "savings"],
          members: []
        },
        {
          id: "2",
          name: "Agricultural Co-op",
          description: "Group for farmers and agricultural enthusiasts to share knowledge and resources.",
          createdBy: "user-2",
          createdAt: new Date('2024-02-01').toISOString(),
          updatedAt: new Date().toISOString(),
          memberCount: 23,
          isPublic: false,
          tags: ["agriculture", "farming", "cooperative"],
          members: []
        }
      ]
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setGroups(mockGroups)
    } catch (error) {
      console.error('Error fetching groups:', error)
      toast.error("Failed to load groups")
    } finally {
      setGroupsLoading(false)
    }
  }

  // Fetch conversations for chat
  const fetchConversations = async () => {
    try {
      setIsChatLoading(true)
      // Mock conversations data
      const mockConversations: ChatConversation[] = [
        {
          id: "1",
          type: 'direct',
          name: "John Doe",
          avatar: "/avatar1.png",
          lastMessage: "Hey, are we still meeting tomorrow?",
          lastMessageTime: new Date().toISOString(),
          unreadCount: 2,
          isOnline: true
        },
        {
          id: "2",
          type: 'direct',
          name: "Jane Smith",
          avatar: "/avatar2.png",
          lastMessage: "Thanks for the help with the project!",
          lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
          unreadCount: 0,
          isOnline: false,
          lastSeen: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: "3",
          type: 'group',
          name: "Finance Management",
          avatar: "/group-avatar.png",
          lastMessage: "Sarah: The monthly report is ready for review",
          lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
          unreadCount: 5,
          members: []
        },
        {
          id: "4",
          type: 'group',
          name: "Agricultural Co-op",
          avatar: "/group-avatar2.png",
          lastMessage: "Mike: New farming techniques discussion",
          lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
          unreadCount: 0,
          members: []
        }
      ]
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setConversations(mockConversations)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      toast.error("Failed to load conversations")
    } finally {
      setIsChatLoading(false)
    }
  }

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      setIsChatLoading(true)
      // Mock messages data
      const mockMessages: ChatMessage[] = [
        {
          id: "1",
          senderId: "2",
          content: "Hey there! How are you doing?",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'text',
          status: 'read',
          sender: {
            id: "2",
            firstName: "Jane",
            lastName: "Smith",
            avatar: "/avatar2.png"
          }
        },
        {
          id: "2",
          senderId: "1", // current user
          content: "I'm doing great! Just finished the project documentation.",
          timestamp: new Date(Date.now() - 3500000).toISOString(),
          type: 'text',
          status: 'read',
          sender: {
            id: "1",
            firstName: "You",
            lastName: "",
            avatar: "/avatar1.png"
          }
        },
        {
          id: "3",
          senderId: "2",
          content: "That's awesome! Can you share it with the team?",
          timestamp: new Date(Date.now() - 3400000).toISOString(),
          type: 'text',
          status: 'read',
          sender: {
            id: "2",
            firstName: "Jane",
            lastName: "Smith",
            avatar: "/avatar2.png"
          }
        },
        {
          id: "4",
          senderId: "1",
          content: "Sure, I'll upload it to the shared drive and send the link in the group chat.",
          timestamp: new Date(Date.now() - 3300000).toISOString(),
          type: 'text',
          status: 'read',
          sender: {
            id: "1",
            firstName: "You",
            lastName: "",
            avatar: "/avatar1.png"
          }
        },
        {
          id: "5",
          senderId: "2",
          content: "Perfect! Thanks a lot! 😊",
          timestamp: new Date(Date.now() - 3200000).toISOString(),
          type: 'text',
          status: 'read',
          sender: {
            id: "2",
            firstName: "Jane",
            lastName: "Smith",
            avatar: "/avatar2.png"
          }
        }
      ]
      
      await new Promise(resolve => setTimeout(resolve, 500))
      setMessages(mockMessages)
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error("Failed to load messages")
    } finally {
      setIsChatLoading(false)
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const messageData = {
      id: Date.now().toString(),
      senderId: "1", // current user ID
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text' as const,
      status: 'sent' as const,
      sender: {
        id: "1",
        firstName: "You",
        lastName: "",
        avatar: "/avatar1.png"
      }
    }

    // Optimistically add message to UI
    setMessages(prev => [...prev, messageData])
    setNewMessage("")

    try {
      // In real implementation, you would send to your API
      // await fetch('/api/chat/messages', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     conversationId: selectedConversation.id,
      //     content: newMessage,
      //     type: 'text'
      //   })
      // })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Update message status to delivered
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageData.id 
            ? { ...msg, status: 'delivered' as const }
            : msg
        )
      )
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error("Failed to send message")
    }
  }

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
          occupation: newMember.role
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create member')
      }

      const createdMember = await response.json()
      toast.success("Member added successfully!")
      
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
      fetchMembers()
    } catch (error: any) {
      console.error('Error adding member:', error)
      toast.error(error.message || "Failed to add member")
    } finally {
      setIsAddingMember(false)
    }
  }

  // Add new group
  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newGroupData: Group = {
        id: Date.now().toString(),
        ...newGroup,
        createdBy: "current-user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        memberCount: 0,
        tags: newGroup.tags,
        members: [],
        avatar: "",
        coverImage: ""
      }

      setGroups(prev => [newGroupData, ...prev])
      toast.success("Group created successfully!")
      
      setNewGroup({
        name: "",
        description: "",
        isPublic: true,
        tags: []
      })
      setIsAddGroupDialogOpen(false)
    } catch (error: any) {
      console.error('Error adding group:', error)
      toast.error("Failed to create group")
    }
  }

  // Add member to group
  const handleAddToGroup = async (memberId: string, groupId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success("Member added to group successfully!")
    } catch (error) {
      console.error('Error adding member to group:', error)
      toast.error("Failed to add member to group")
    }
  }

  // Remove member from group
  const handleRemoveFromGroup = async (memberId: string, groupId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success("Member removed from group successfully!")
    } catch (error) {
      console.error('Error removing member from group:', error)
      toast.error("Failed to remove member from group")
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

  const getGroupInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isToday = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchMembers()
    fetchGroups()
    fetchConversations()
  }, [])

  // Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchMembers(1, searchTerm, statusFilter)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, statusFilter])

  // Handle conversation selection
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  // Handle Enter key for sending messages
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Member Management
                </h1>
                <p className="text-base sm:text-lg text-gray-600 font-medium mt-1">
                  Manage your cooperative members, groups, and communications.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Dialog open={isAddGroupDialogOpen} onOpenChange={setIsAddGroupDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
                  <Group className="w-4 h-4 mr-2" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <form onSubmit={handleAddGroup}>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-800">Create New Group</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Create a new group for your cooperative members.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="group-name" className="font-medium text-gray-700">Group Name</Label>
                      <Input
                        id="group-name"
                        placeholder="Finance Management Group"
                        value={newGroup.name}
                        onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                        className="bg-white/50 border-gray-200"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="group-description" className="font-medium text-gray-700">Description</Label>
                      <Textarea
                        id="group-description"
                        placeholder="Describe the purpose of this group..."
                        value={newGroup.description}
                        onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                        className="bg-white/50 border-gray-200 min-h-[100px]"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="group-privacy" className="font-medium text-gray-700">Privacy</Label>
                        <Select
                          value={newGroup.isPublic ? "public" : "private"}
                          onValueChange={(value) => setNewGroup({...newGroup, isPublic: value === "public"})}
                        >
                          <SelectTrigger className="bg-white/50 border-gray-200">
                            <SelectValue placeholder="Select privacy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="group-tags" className="font-medium text-gray-700">Tags</Label>
                        <Input
                          id="group-tags"
                          placeholder="finance, investment"
                          value={newGroup.tags.join(', ')}
                          onChange={(e) => setNewGroup({...newGroup, tags: e.target.value.split(',').map(tag => tag.trim())})}
                          className="bg-white/50 border-gray-200"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddGroupDialogOpen(false)}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl"
                    >
                      Create Group
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <form onSubmit={handleAddMember}>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-800">Add New Member</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Fill in the member details to add them to your cooperative.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="firstName" className="font-medium text-gray-700">First Name</Label>
                        <Input 
                          id="firstName" 
                          placeholder="John" 
                          value={newMember.firstName}
                          onChange={(e) => setNewMember({...newMember, firstName: e.target.value})}
                          className="bg-white/50 border-gray-200"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="lastName" className="font-medium text-gray-700">Last Name</Label>
                        <Input 
                          id="lastName" 
                          placeholder="Doe" 
                          value={newMember.lastName}
                          onChange={(e) => setNewMember({...newMember, lastName: e.target.value})}
                          className="bg-white/50 border-gray-200"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email" className="font-medium text-gray-700">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="john.doe@example.com" 
                          value={newMember.email}
                          onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                          className="bg-white/50 border-gray-200"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="username" className="font-medium text-gray-700">Username</Label>
                        <Input 
                          id="username" 
                          placeholder="johndoe" 
                          value={newMember.username}
                          onChange={(e) => setNewMember({...newMember, username: e.target.value})}
                          className="bg-white/50 border-gray-200"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="password" className="font-medium text-gray-700">Password</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          placeholder="********" 
                          value={newMember.password}
                          onChange={(e) => setNewMember({...newMember, password: e.target.value})}
                          className="bg-white/50 border-gray-200"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone" className="font-medium text-gray-700">Phone Number</Label>
                        <Input 
                          id="phone" 
                          type="tel" 
                          placeholder="+234 XXX XXX XXXX" 
                          value={newMember.phone}
                          onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                          className="bg-white/50 border-gray-200"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="role" className="font-medium text-gray-700">Role</Label>
                        <Select 
                          value={newMember.role}
                          onValueChange={(value) => setNewMember({...newMember, role: value})}
                        >
                          <SelectTrigger className="bg-white/50 border-gray-200">
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
                        <Label htmlFor="dateOfBirth" className="font-medium text-gray-700">Date of Birth</Label>
                        <Input 
                          id="dateOfBirth" 
                          type="date" 
                          value={newMember.dateOfBirth}
                          onChange={(e) => setNewMember({...newMember, dateOfBirth: e.target.value})}
                          className="bg-white/50 border-gray-200"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address" className="font-medium text-gray-700">Address</Label>
                      <Textarea 
                        id="address" 
                        placeholder="123 Main St, City, State" 
                        value={newMember.address}
                        onChange={(e) => setNewMember({...newMember, address: e.target.value})}
                        className="bg-white/50 border-gray-200"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isAddingMember}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl"
                    >
                      {isAddingMember ? "Adding..." : "Add Member"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'members'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Members ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'groups'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Group className="w-4 h-4 mr-2" />
              Groups ({groups.length})
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'chat'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Messages
              {conversations.some(c => c.unreadCount > 0) && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {conversations.reduce((acc, conv) => acc + conv.unreadCount, 0)}
                </Badge>
              )}
            </button>
          </nav>
        </div>

        {/* Members Tab */}
        {activeTab === 'members' && (
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Member Directory
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search members..." 
                      className="pl-10 w-48 bg-white/50 border-gray-200 focus:border-blue-500 transition-all duration-200"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] bg-white/50 border-gray-200">
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
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <MemberRowSkeleton key={i} />
                  ))}
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
                  <p className="text-gray-600 font-medium">No members found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {searchTerm || statusFilter !== 'ALL' ? "Try adjusting your search or filter settings" : "Get started by adding your first member"}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent bg-gray-50/50">
                        <TableHead className="font-semibold text-gray-700">Member</TableHead>
                        <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                        <TableHead className="font-semibold text-gray-700">Role</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Join Date</TableHead>
                        <TableHead className="font-semibold text-gray-700">Groups</TableHead>
                        <TableHead className="font-semibold text-gray-700 w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-9 w-9 border border-gray-200">
                                <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 font-medium">
                                  {getInitials(member.firstName, member.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-gray-900">{member.firstName} {member.lastName}</div>
                                <div className="text-sm text-gray-500 font-mono">{member.memberCode}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="h-3 w-3 mr-2 text-gray-400" />
                                {member.email}
                              </div>
                              {member.phone && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="h-3 w-3 mr-2 text-gray-400" />
                                  {member.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                              {getRoleDisplay(member.user.role)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getStatusVariant(member.status)}
                              className={member.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : 
                                       member.status === 'INACTIVE' ? 'bg-gray-100 text-gray-700 border-gray-200' : 
                                       'bg-red-100 text-red-700 border-red-200'}
                            >
                              {member.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                              {new Date(member.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {groups.slice(0, 2).map(group => (
                                <Badge key={group.id} variant="outline" className="text-xs bg-gray-50 text-gray-600">
                                  {group.name}
                                </Badge>
                              ))}
                              {groups.length > 2 && (
                                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                                  +{groups.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
                                <DropdownMenuLabel className="font-semibold">Member Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setSelectedMember(member)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setActiveTab('chat')
                                  // In real implementation, you would create or select a conversation with this member
                                }}>
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  Send Message
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="font-semibold">Group Management</DropdownMenuLabel>
                                {groups.map(group => (
                                  <DropdownMenuItem key={group.id} onClick={() => handleAddToGroup(member.id, group.id)}>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add to {group.name}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => toggleMemberStatus(member.id, member.status)}
                                >
                                  <UserMinus className="h-4 w-4 mr-2" />
                                  {member.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} Member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <div className="grid gap-6">
            {/* Groups Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groupsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg animate-pulse">
                    <div className="h-32 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                    </CardContent>
                  </Card>
                ))
              ) : groups.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Group className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
                  <p className="text-gray-600 font-medium">No groups found</p>
                  <p className="text-sm text-gray-500 mt-1">Create your first group to get started</p>
                </div>
              ) : (
                groups.map((group) => (
                  <Card key={group.id} className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative rounded-t-lg">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute bottom-4 left-4 flex items-end space-x-3">
                        <Avatar className="w-12 h-12 border-2 border-white">
                          <AvatarFallback className="text-sm bg-gradient-to-r from-blue-600 to-purple-700 text-white font-bold">
                            {getGroupInitials(group.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-white">
                          <h3 className="font-bold text-lg">{group.name}</h3>
                          <p className="text-blue-100 text-sm">{group.memberCount} members</p>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge variant="outline" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                          {group.isPublic ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                          {group.isPublic ? 'Public' : 'Private'}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {group.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-blue-50 text-blue-600">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Created {formatDate(group.createdAt)}</span>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedGroup(group)}
                            className="border-gray-300 hover:bg-gray-50"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-gray-300 hover:bg-gray-50"
                          >
                            <Settings className="w-3 h-3 mr-1" />
                            Manage
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
    {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">          
            <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-teal-500"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-gray-800">Messages</CardTitle>
                  <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search conversations..." 
                    className="pl-10 bg-white/50 border-gray-200"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {isChatLoading ? (
                    <div className="space-y-4 p-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-3 animate-pulse">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {conversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`flex items-center space-x-3 p-4 cursor-pointer transition-colors duration-200 ${
                            selectedConversation?.id === conversation.id
                              ? 'bg-blue-50 border-r-2 border-blue-500'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedConversation(conversation)}
                        >
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-to-r from-green-100 to-teal-100 text-green-600">
                                {getInitials(conversation.name, '')}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.isOnline && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900 truncate">{conversation.name}</h4>
                              <span className="text-xs text-gray-500">
                                {isToday(conversation.lastMessageTime) 
                                  ? formatTime(conversation.lastMessageTime)
                                  : new Date(conversation.lastMessageTime).toLocaleDateString()
                                }
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl flex flex-col">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              {selectedConversation ? (
                <>
                  <div className="border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600">
                            {getInitials(selectedConversation.name, '')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">{selectedConversation.name}</h3>
                          <div className="flex items-center space-x-1">
                            {selectedConversation.isOnline ? (
                              <>
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-gray-500">Online</span>
                              </>
                            ) : (
                              <span className="text-xs text-gray-500">
                                Last seen {formatTime(selectedConversation.lastSeen!)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                          <Video className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                          <PhoneCall className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                          <Info className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    {isChatLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} animate-pulse`}>
                            <div className="flex space-x-2 max-w-xs">
                              {i % 2 === 0 && <div className="w-8 h-8 bg-gray-200 rounded-full"></div>}
                              <div className="space-y-2">
                                <div className="h-3 bg-gray-200 rounded w-32"></div>
                                <div className="h-2 bg-gray-200 rounded w-24"></div>
                              </div>
                              {i % 2 !== 0 && <div className="w-8 h-8 bg-gray-200 rounded-full"></div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderId === "1" ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex space-x-2 max-w-xs lg:max-w-md ${message.senderId === "1" ? 'flex-row-reverse' : ''}`}>
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarFallback className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600">
                                  {getInitials(message.sender.firstName, message.sender.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`space-y-1 ${message.senderId === "1" ? 'text-right' : ''}`}>
                                <div
                                  className={`rounded-lg px-3 py-2 ${
                                    message.senderId === "1"
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-gray-100 text-gray-900'
                                  }`}
                                >
                                  <p className="text-sm">{message.content}</p>
                                </div>
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <span>{formatTime(message.timestamp)}</span>
                                  {message.senderId === "1" && (
                                    <>
                                      {message.status === 'sent' && <span>✓</span>}
                                      {message.status === 'delivered' && <span>✓✓</span>}
                                      {message.status === 'read' && <span className="text-blue-500">✓✓</span>}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t border-gray-200 p-4">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                        <Smile className="w-4 h-4" />
                      </Button>
                      <div className="flex-1 relative">
                        <Textarea
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="min-h-[40px] max-h-[120px] resize-none bg-white/50 border-gray-200 pr-12"
                          rows={1}
                        />
                      </div>
                      <Button 
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">No conversation selected</h3>
                  <p className="text-gray-600 text-center mb-6">
                    Select a conversation from the list to start messaging
                  </p>
                  <Button 
                    onClick={() => {
                      // In real implementation, this would open a new conversation modal
                      toast.info("Start a new conversation from the members list")
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start New Chat
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  )
}