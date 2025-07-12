'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordContent() {
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const urlToken = searchParams?.get('token')
    if (urlToken) {
      setToken(urlToken)
    } else {
      setMessage('Invalid reset link. Please request a new password reset.')
    }
  }, [searchParams])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    if (!token) {
      setMessage('Invalid reset token. Please request a new password reset.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setMessage('Password reset successfully! You can now log in with your new password.')
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setMessage(data.message || 'Failed to reset password. Please try again.')
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (!token && !message) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🍕 Yumzy
          </h1>
          <p className="text-gray-600 mb-8">Delicious Food Delivered</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg px-8 py-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Reset Your Password
            </h2>
            <p className="mt-2 text-gray-600">
              Enter your new password below
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="rounded-full bg-green-100 p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Password Reset Successfully! ✅
              </h3>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <Link
                href="/login"
                className="inline-block bg-rose-600 text-white py-2 px-6 rounded-md hover:bg-rose-700 transition duration-200 font-medium"
              >
                Continue to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {message && !success && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-600">{message}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your new password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your new password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full bg-rose-600 text-white py-3 px-4 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <p>
                Remember your password?{' '}
                <Link href="/login" className="text-rose-600 hover:text-rose-700 font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}