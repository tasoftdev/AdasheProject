'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Eye, EyeOff, Users, Shield, TrendingUp, UserPlus } from 'lucide-react'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    occupation: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth || null,
          address: formData.address || null,
          occupation: formData.occupation || null
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Account created successfully! Please sign in.')
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Geometric Shapes */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-green-200 to-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow animation-delay-4000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px),
                              linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}></div>
        </div>

        {/* Animated Orbs */}
        {mounted && (
          <>
            <div className="absolute top-1/4 right-1/4 w-6 h-6 bg-blue-400 rounded-full animate-bounce opacity-60"></div>
            <div className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-purple-400 rounded-full animate-bounce opacity-60 animation-delay-1000"></div>
            <div className="absolute top-2/3 right-1/3 w-5 h-5 bg-cyan-400 rounded-full animate-bounce opacity-60 animation-delay-1500"></div>
          </>
        )}
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Enhanced Header with Icons */}
        <div className="text-center relative">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4 border border-gray-100">
            <div className="flex space-x-1">
              <UserPlus className="h-8 w-8 text-blue-600" />
              <Users className="h-8 w-8 text-green-600" />
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Join Adashe
          </h2>
          <p className="text-gray-600 text-lg font-medium">Create Your Cooperative Account</p>
          <div className="mt-2 flex justify-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Shield className="h-4 w-4 mr-1 text-green-500" />
              Secure
            </span>
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1 text-blue-500" />
              Collaborative
            </span>
            <span className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-1 text-purple-500" />
              Growth
            </span>
          </div>
        </div>

        {/* Enhanced Card with Glass Effect */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl relative overflow-hidden">
          {/* Card Accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
          
          {/* Floating Card Elements */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full opacity-20 animate-ping"></div>
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-400 rounded-full opacity-20 animate-ping animation-delay-1000"></div>

          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">Create Account</CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Fill in your information to join our cooperative
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {error && (
                <Alert variant="destructive" className="animate-in fade-in duration-300">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 animate-in fade-in duration-300">
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="pl-10 bg-white/50 border-gray-200 focus:border-blue-500 transition-all duration-200"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      👤
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="pl-10 bg-white/50 border-gray-200 focus:border-blue-500 transition-all duration-200"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      👥
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="pl-10 bg-white/50 border-gray-200 focus:border-blue-500 transition-all duration-200"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    ✉️
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="pl-10 bg-white/50 border-gray-200 focus:border-blue-500 transition-all duration-200"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🆔
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+234XXXXXXXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="pl-10 bg-white/50 border-gray-200 focus:border-blue-500 transition-all duration-200"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    📞
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation" className="text-sm font-medium text-gray-700">
                  Occupation
                </Label>
                <div className="relative">
                  <Input
                    id="occupation"
                    name="occupation"
                    type="text"
                    placeholder="Your occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="pl-10 bg-white/50 border-gray-200 focus:border-blue-500 transition-all duration-200"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    💼
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="pl-10 pr-12 bg-white/50 border-gray-200 focus:border-blue-500 transition-all duration-200"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔒
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="pl-10 bg-white/50 border-gray-200 focus:border-blue-500 transition-all duration-200"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    ✅
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-4">
              <Button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-600 pt-2">
                Already have an account?{' '}
                <Link
                  href="/auth/signin"
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200 underline-offset-4 hover:underline"
                >
                  Sign in here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 0.5; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-1500 {
          animation-delay: 1.5s;
        }
      `}</style>
    </div>
  )
}