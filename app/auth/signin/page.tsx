'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
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
import { Loader2, Eye, EyeOff, Users, Shield, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await signIn('credentials', {
        email,
        password,
        redirect: true,
        callbackUrl: '/dashboard',
      })
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
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
              <Users className="h-8 w-8 text-blue-600" />
              <TrendingUp className="h-8 w-8 text-green-600" />
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Welcome to Adashe
          </h2>
          <p className="text-gray-600 text-lg font-medium">Cooperative Management System</p>
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
              Efficient
            </span>
          </div>
        </div>

        {/* Enhanced Card with Glass Effect */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl relative overflow-hidden">
          {/* Card Accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"></div>
          
          {/* Floating Card Elements */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-purple-400 rounded-full opacity-20 animate-ping animation-delay-1000"></div>

          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">Sign In</CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className="animate-in fade-in duration-300">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 bg-white/50 border-gray-200 focus:border-blue-500 transition-all duration-200"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    ✉️
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="text-center text-sm text-gray-600 pt-2">
                Don't have an account?{' '}
                <Link
                  href="/auth/signup"
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200 underline-offset-4 hover:underline"
                >
                  Sign up now
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