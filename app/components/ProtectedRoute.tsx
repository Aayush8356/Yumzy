'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'user' | 'admin'
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo)
        return
      }

      if (requiredRole && user?.role !== requiredRole) {
        router.push('/unauthorized')
        return
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router, redirectTo])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}

// Public route component (redirects authenticated users)
export function PublicRoute({ 
  children, 
  redirectTo 
}: { 
  children: React.ReactNode
  redirectTo?: string 
}) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Determine redirect based on user role if not explicitly specified
      const destination = redirectTo || (user?.role === 'admin' ? '/admin' : '/dashboard')
      router.push(destination)
    }
  }, [isLoading, isAuthenticated, user, router, redirectTo])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return <>{children}</>
}