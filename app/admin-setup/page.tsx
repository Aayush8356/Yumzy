'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Shield, User, Mail, CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function AdminSetupPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [hasAdmin, setHasAdmin] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/admin/setup')
        const data = await response.json()
        if (response.ok) {
          setHasAdmin(data.hasAdmin)
        }
      } catch (error) {
        console.error('Failed to check admin status:', error)
        toast({
          title: "Error",
          description: "Could not verify admin status. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    checkAdminStatus()
  }, [toast])

  const handleCreateAdmin = async () => {
    if (!email || !name || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, password })
      })

      const data = await response.json()
      console.log('Admin setup response:', { status: response.status, data })

      if (response.ok) {
        toast({
          title: "Success! 🎉",
          description: data.message,
          duration: 5000,
        })
        setHasAdmin(true) // Setup is now complete
      } else {
        console.error('Admin setup failed:', data)
        throw new Error(data.error || 'An unknown error occurred.')
      }
    } catch (error) {
      console.error('Admin setup error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create admin user.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-lg">Checking system status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Shield className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Admin Setup</h1>
          <p className="text-gray-600 mt-2">Create the first admin account for Yumzy</p>
          <div className="bg-blue-50 p-3 rounded-lg mt-4">
            <p className="text-sm text-blue-800">
              🔒 <strong>Security Note:</strong> This route will be automatically disabled after the first admin is created.
            </p>
          </div>
        </div>

        {hasAdmin ? (
          <Card className="border-red-500 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5 text-red-700" />
                Setup Disabled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-900">
                An admin account already exists. For security, the setup form has been disabled.
              </p>
              <Link href="/admin">
                <Button className="w-full mt-4 gap-2 bg-red-600 hover:bg-red-700">
                  Go to Admin Login <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Create First Admin Account
              </CardTitle>
              <CardDescription>
                This will be the primary administrator account for the system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Jane Doe"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button 
                onClick={handleCreateAdmin}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Creating Account...' : 'Create Admin Account'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
