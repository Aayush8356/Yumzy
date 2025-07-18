'use client'

import { PublicRoute } from '@/components/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const success = await login(formData)
    
    if (success) {
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      })
      
      // Check if admin user and redirect directly to admin panel
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser)
          if (user.role === 'admin') {
            router.push('/admin')
            setIsLoading(false)
            return
          }
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      }
      
      // Non-admin users go to homepage  
      router.push('/')
    } else {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive"
      })
    }
    
    setIsLoading(false)
  }

  const handleDemoLogin = async () => {
    setFormData({
      email: 'demo@yumzy.com',
      password: 'demo123'
    })
    
    setIsLoading(true)
    const success = await login({
      email: 'demo@yumzy.com',
      password: 'demo123'
    })
    
    if (success) {
      toast({
        title: "Demo login successful!",
        description: "Welcome to the demo account.",
      })
      
      // Check if admin user and redirect directly to admin panel
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser)
          if (user.role === 'admin') {
            router.push('/admin')
            setIsLoading(false)
            return
          }
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      }
      
      // Non-admin users go to homepage  
      router.push('/')
    }
    
    setIsLoading(false)
  }

  return (
    <PublicRoute>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-sm sm:text-base">Back to Home</span>
          </Link>

          <Card className="shadow-elegant">
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-gradient-hero rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-white font-bold text-lg sm:text-xl">Y</span>
              </div>
              <CardTitle className="text-xl sm:text-2xl">Welcome Back</CardTitle>
              <p className="text-muted-foreground text-sm sm:text-base">
                Sign in to your account to continue ordering
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {/* Demo Login */}
              <Button 
                onClick={handleDemoLogin}
                variant="outline" 
                className="w-full h-10 sm:h-12 text-sm sm:text-base"
                disabled={isLoading}
              >
                Try Demo Account
              </Button>
              
              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                  Or continue with email
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-10 sm:h-12 text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 h-10 sm:h-12 text-sm sm:text-base"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <label className="flex items-center space-x-2 text-xs sm:text-sm">
                    <input type="checkbox" className="rounded border border-input" />
                    <span>Remember me</span>
                  </label>
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-xs sm:text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
              
              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/auth/register" className="text-primary hover:underline font-medium">
                  Sign up here
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PublicRoute>
  )
}