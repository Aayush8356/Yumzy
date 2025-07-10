'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogIn, User, Mail } from 'lucide-react'

export function QuickLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated, user, logout } = useAuth()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    const success = await login({ email, password })
    
    if (success) {
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      })
    } else {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive"
      })
    }
    
    setIsLoading(false)
  }

  const handleLogout = async () => {
    await logout()
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    })
  }

  if (isAuthenticated && user) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Welcome, {user.name}!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            {user.email}
          </div>
          <p className="text-sm text-green-600">
            You're now logged in and can see the premium menu below!
          </p>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="w-full"
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogIn className="w-5 h-5" />
          Quick Demo Login
        </CardTitle>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Try these demo credentials or use any email/password:
          </p>
          <div className="p-3 bg-muted rounded-lg text-xs space-y-1">
            <div><strong>Demo User:</strong> demo@yumzy.com</div>
            <div><strong>Admin:</strong> guptaaayush537@gmail.com</div>
            <div><strong>Password:</strong> Any password works</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="space-y-2">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login to View Menu'}
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmail('demo@yumzy.com')
                  setPassword('demo')
                }}
                className="text-xs"
              >
                Fill Demo User
              </Button>
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmail('guptaaayush537@gmail.com')
                  setPassword('admin')
                }}
                className="text-xs"
              >
                Fill Admin
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Use any email and password to login and see the premium menu
          </p>
        </form>
      </CardContent>
    </Card>
  )
}