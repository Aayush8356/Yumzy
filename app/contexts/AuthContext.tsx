'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { User, AuthState, LoginCredentials, RegisterData } from '@/types/auth'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<boolean>
  resetPassword: (email: string) => Promise<boolean>
  checkAdminStatus: (email: string) => Promise<boolean>
  extendSession: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'LOGOUT' }

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false
      }
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false
      }
    default:
      return state
  }
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load and validate user from localStorage/token on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = localStorage.getItem('user')
        const authToken = localStorage.getItem('authToken')
        const authExpiry = localStorage.getItem('authExpiry')
        
        // Check if session has expired - be more generous with timing
        if (authExpiry && Date.now() > parseInt(authExpiry)) {
          console.log('🔒 Session expired, logging out')
          logout()
          dispatch({ type: 'SET_LOADING', payload: false })
          return
        }
        
        if (savedUser && authToken) {
          const user = JSON.parse(savedUser)
          
          // Immediately set user from localStorage to reduce flash
          dispatch({ type: 'SET_USER', payload: user })
          
          // Validate user still exists in database (with graceful handling for network issues)
          let validationSuccess = false
          let shouldLogout = false
          
          try {
            const response = await fetch('/api/auth/validate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId: user.id }),
              cache: 'no-cache'
            })
            
            const data = await response.json()
            
            if (response.ok && data.success && data.userExists) {
              // User is valid, update with fresh data from database
              const updatedUser: User = {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                phone: data.user.phone || '+1-555-0000',
                avatar: data.user.avatar || user.avatar, // Keep generated avatar if no DB avatar
                role: data.user.role,
                verified: data.user.isVerified,
                createdAt: new Date(data.user.createdAt),
                preferences: data.user.preferences || {
                  notifications: true,
                  newsletter: true,
                  dietaryRestrictions: []
                }
              }
              
              // Update localStorage with fresh data
              localStorage.setItem('user', JSON.stringify(updatedUser))
              dispatch({ type: 'SET_USER', payload: updatedUser })
              validationSuccess = true
            } else if (response.ok && data.success && !data.userExists) {
              // User explicitly doesn't exist in database - this is a real logout case
              console.log('🚨 User no longer exists in database, logging out')
              shouldLogout = true
            } else {
              // API returned error - could be server issue, treat as temporary problem
              console.warn('⚠️ Auth validation API error, maintaining session (could be temporary server issue)')
              dispatch({ type: 'SET_USER', payload: user })
              validationSuccess = true
            }
          } catch (fetchError) {
            // Network error - very common, don't logout for this
            console.warn('⚠️ Auth validation network error, maintaining session:', fetchError)
            dispatch({ type: 'SET_USER', payload: user })
            validationSuccess = true
          }
          
          if (shouldLogout) {
            // Only logout if we explicitly confirmed user doesn't exist
            console.log('🚨 Confirmed user validation failed, clearing local authentication data')
            localStorage.removeItem('user')
            localStorage.removeItem('authToken')
            localStorage.removeItem('authExpiry')
            localStorage.removeItem('cart')
            dispatch({ type: 'LOGOUT' })
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.error('Error loading/validating user:', error)
        
        // Check if we have a saved user and valid expiry - if so, keep session active
        const savedUser = localStorage.getItem('user')
        const authExpiry = localStorage.getItem('authExpiry')
        
        if (savedUser && authExpiry) {
          try {
            const user = JSON.parse(savedUser)
            const expiryTime = parseInt(authExpiry)
            
            // If session hasn't expired, keep user logged in despite errors
            if (Date.now() < expiryTime) {
              console.warn('⚠️ Auth validation error, but session still valid - maintaining login')
              dispatch({ type: 'SET_USER', payload: user })
              return
            }
          } catch (parseError) {
            console.error('Error parsing saved user data:', parseError)
          }
        }
        
        // Only clear auth data if session is actually expired or data is corrupted
        console.log('🚨 Session expired or corrupted, clearing auth data')
        localStorage.removeItem('user')
        localStorage.removeItem('authToken')
        localStorage.removeItem('authExpiry')
        localStorage.removeItem('cart')
        dispatch({ type: 'LOGOUT' })
      }
    }

    loadUser()
  }, [])

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      // Call secure authentication API
      const response = await fetch('/api/auth/secure-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Helper function to generate initials avatar
        const generateInitialsAvatar = (name: string): string => {
          const initials = name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('')
            .substring(0, 2)
          
          // Generate a consistent color based on the name
          const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
            '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
            '#3742FA', '#2F3542', '#FF3838', '#FF6348', '#1DD1A1'
          ]
          
          let hash = 0
          for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash)
          }
          const colorIndex = Math.abs(hash) % colors.length
          const backgroundColor = colors[colorIndex]
          
          // Create SVG avatar with initials
          const svg = `
            <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="50" fill="${backgroundColor}"/>
              <text x="50" y="50" font-family="Arial, sans-serif" font-size="36" font-weight="bold" 
                    fill="white" text-anchor="middle" dominant-baseline="central">${initials}</text>
            </svg>
          `
          
          return `data:image/svg+xml;base64,${btoa(svg)}`
        }

        const user: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || '+1-555-0000',
          avatar: data.user.avatar || generateInitialsAvatar(data.user.name),
          role: data.user.role,
          verified: data.user.isVerified,
          createdAt: new Date(data.user.createdAt),
          preferences: data.user.preferences || {
            notifications: true,
            newsletter: true,
            dietaryRestrictions: []
          }
        }
        
        // Store user data and token with expiry (7 days for better UX)
        const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days from now
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('authToken', data.token || 'authenticated')
        localStorage.setItem('authExpiry', expiryTime.toString())
        dispatch({ type: 'SET_USER', payload: user })
        
        // Use a global toast function if available, or log for now
        // This assumes you have a toast context available
        // Example: toast.success('Login successful!')
        
        return true
      }
      
      dispatch({ type: 'SET_LOADING', payload: false })
      return false
    } catch (error) {
      console.error('Login error:', error)
      dispatch({ type: 'SET_LOADING', payload: false })
      return false
    }
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      if (data.password !== data.confirmPassword) {
        dispatch({ type: 'SET_LOADING', payload: false })
        return false
      }

      // Call registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // For production: Don't auto-login, user needs to verify email first
        // Instead, show success message about email verification
        dispatch({ type: 'SET_LOADING', payload: false })
        return true
      }
      
      dispatch({ type: 'SET_LOADING', payload: false })
      return false
    } catch (error) {
      console.error('Registration error:', error)
      dispatch({ type: 'SET_LOADING', payload: false })
      return false
    }
  }

  const logout = () => {
    console.log('🚪 Logging out user')
    // Clear all authentication and app data
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
    localStorage.removeItem('authExpiry')
    localStorage.removeItem('cart')
    
    // Clear any other app-specific data
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('cart_') || key.startsWith('user_') || key.startsWith('auth_'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    dispatch({ type: 'LOGOUT' })
  }

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!state.user) return false
    
    try {
      const updatedUser = { ...state.user, ...data }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      dispatch({ type: 'SET_USER', payload: updatedUser })
      return true
    } catch (error) {
      console.error('Profile update error:', error)
      return false
    }
  }

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Password reset email sent to:', email)
      return true
    } catch (error) {
      console.error('Password reset error:', error)
      return false
    }
  }

  const checkAdminStatus = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/auth/check-admin?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      
      if (response.ok && data.isAdmin) {
        // Update user with admin role
        if (state.user && state.user.email === email) {
          const adminUser: User = { ...state.user, role: 'admin' };
          localStorage.setItem('user', JSON.stringify(adminUser))
          dispatch({ type: 'SET_USER', payload: adminUser })
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Admin check error:', error)
      return false
    }
  }

  const extendSession = () => {
    // Extend session by 7 days when user is actively using the app
    const currentExpiry = localStorage.getItem('authExpiry')
    if (currentExpiry && state.user) {
      const newExpiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days from now
      localStorage.setItem('authExpiry', newExpiryTime.toString())
    }
  }

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    checkAdminStatus,
    extendSession
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}