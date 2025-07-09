'use client'

import { PublicRoute } from '@/components/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  
  const { resetPassword } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const success = await resetPassword(email)
    
    if (success) {
      setEmailSent(true)
      toast({
        title: "Reset email sent!",
        description: "Check your inbox for password reset instructions.",
      })
    } else {
      toast({
        title: "Error sending email",
        description: "Please check your email address and try again.",
        variant: "destructive"
      })
    }
    
    setIsLoading(false)
  }

  if (emailSent) {
    return (
      <PublicRoute>
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <Card className="shadow-elegant text-center">
              <CardContent className="p-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                
                <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
                <p className="text-muted-foreground mb-6">
                  We've sent password reset instructions to{' '}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
                
                <div className="space-y-4">
                  <Button asChild className="w-full">
                    <Link href="/auth/login">
                      Back to Login
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setEmailSent(false)}
                    className="w-full"
                  >
                    Try Different Email
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground mt-6">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </PublicRoute>
    )
  }

  return (
    <PublicRoute>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Back Button */}
          <Link href="/auth/login" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>

          <Card className="shadow-elegant">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center mb-4">
                <span className="text-white font-bold text-xl">W</span>
              </div>
              <CardTitle className="text-2xl">Forgot Password?</CardTitle>
              <p className="text-muted-foreground">
                No worries! Enter your email and we'll send you reset instructions.
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We'll send reset instructions to this email address.
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !email}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                </Button>
              </form>
              
              <div className="text-center text-sm text-muted-foreground mt-6">
                Remember your password?{' '}
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PublicRoute>
  )
}